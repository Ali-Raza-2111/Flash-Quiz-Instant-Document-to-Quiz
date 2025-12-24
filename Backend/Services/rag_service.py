import os
import shutil
import json
import random
import asyncio
from fastapi import UploadFile, HTTPException
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo, UserMessage
from config import settings

# Initialize Hugging Face Embeddings (keep for vector store)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize ChromaDB (Persistent)
PERSIST_DIRECTORY = "./chroma_db"
vector_store = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)

# Initialize AutoGen Model Client for Gemini
model_client = OpenAIChatCompletionClient(
    model="gemini-2.0-flash-lite",
    model_info=ModelInfo(
        vision=False,
        function_calling=False,
        json_output=True,
        family="unknown",
        structured_output=False
    ),
    api_key=settings.GEMINI_API_KEY,
)

# Store chunks in memory for random selection (in addition to ChromaDB)
document_chunks = []

async def process_pdf(file: UploadFile):
    global document_chunks
    try:
        print(f"Processing file: {file.filename}")
        # Save uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"File saved to {temp_file_path}")

        # Load PDF
        loader = PyPDFLoader(temp_file_path)
        documents = loader.load()
        print(f"Loaded {len(documents)} pages")

        # Split text into smaller chunks (200-250 words ≈ 500 chars for easier processing)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(documents)
        print(f"Split into {len(chunks)} chunks")

        # Store chunks in memory for random selection
        document_chunks = [chunk.page_content for chunk in chunks]
        print(f"Stored {len(document_chunks)} chunks in memory")

        # Store in ChromaDB (keeping for potential future use)
        print("Adding to ChromaDB...")
        vector_store.add_documents(chunks)
        print("Added to ChromaDB")

        # Clean up temp file
        os.remove(temp_file_path)

        return {"message": "PDF processed and stored successfully", "chunks_count": len(chunks)}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in process_pdf: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def retrieve_documents(query: str) -> str:
    """Retrieves relevant documents from the vector store based on the query."""
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    docs = retriever.invoke(query)
    return "\n\n".join([doc.page_content for doc in docs])


def format_option(text: str, max_length: int = 100) -> str:
    """
    Format an option text to a maximum of 100 characters.
    Truncates with '...' if longer, keeps as-is if shorter.
    """
    text = text.strip()
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def format_quiz_options(options: list, max_length: int = 100) -> list:
    """
    Format all options in a quiz to have max 100 characters each.
    Returns list of formatted options.
    """
    return [format_option(opt, max_length) for opt in options]


def check_answer_similarity(user_answer: str, correct_answer: str) -> dict:
    """
    Check if user's answer is correct using direct comparison first,
    then cosine similarity as fallback.
    Returns similarity score and whether it's considered correct.
    """
    try:
        # First, do exact string match (case-insensitive)
        user_clean = user_answer.strip().lower()
        correct_clean = correct_answer.strip().lower()
        
        if user_clean == correct_clean:
            return {
                "similarity": 1.0,
                "is_correct": True
            }
        
        # Get embeddings for both answers for similarity score
        user_embedding = embeddings.embed_query(user_answer)
        correct_embedding = embeddings.embed_query(correct_answer)
        
        # Calculate cosine similarity
        import numpy as np
        user_vec = np.array(user_embedding)
        correct_vec = np.array(correct_embedding)
        
        cosine_sim = np.dot(user_vec, correct_vec) / (np.linalg.norm(user_vec) * np.linalg.norm(correct_vec))
        
        # Consider correct if similarity > 0.90 (very high for near-exact match)
        is_correct = cosine_sim > 0.90
        
        return {
            "similarity": float(cosine_sim),
            "is_correct": is_correct
        }
    except Exception as e:
        print(f"Error in similarity check: {e}")
        # Fallback to exact match on error
        return {
            "similarity": 1.0 if user_answer.strip().lower() == correct_answer.strip().lower() else 0.0,
            "is_correct": user_answer.strip().lower() == correct_answer.strip().lower()
        }


async def check_quiz_answers(answers: list) -> dict:
    """
    Check all quiz answers using cosine similarity.
    answers: list of {question_id, user_answer, correct_answer}
    """
    results = []
    correct_count = 0
    
    print(f"Checking {len(answers)} answers...")
    
    for answer in answers:
        user_ans = answer.get("user_answer", "")
        correct_ans = answer.get("correct_answer", "")
        
        print(f"Q{answer.get('question_id')}: User='{user_ans}' | Correct='{correct_ans}'")
        
        result = check_answer_similarity(user_ans, correct_ans)
        result["question_id"] = answer.get("question_id")
        result["user_answer"] = user_ans
        result["correct_answer"] = correct_ans
        results.append(result)
        
        print(f"  -> Similarity: {result['similarity']:.2f}, Correct: {result['is_correct']}")
        
        if result["is_correct"]:
            correct_count += 1
    
    print(f"Final score: {correct_count}/{len(answers)}")
    
    return {
        "results": results,
        "score": correct_count,
        "total": len(answers),
        "percentage": (correct_count / len(answers) * 100) if answers else 0
    }


async def generate_single_question(topic: str, difficulty: str = "medium", question_type: str = "mcq", previous_questions: list = None):
    """Generate a single quiz question at a time using AutoGen model client."""
    try:
        # Get a random chunk for this question
        context = get_random_chunks(1)
        
        if not context or len(context) < 50:
            return {"error": "No content found. Upload a PDF first."}
        
        # Truncate if too long
        if len(context) > 1500:
            context = context[:1500]
        
        # Build prompt for single question
        q_type = "MCQ with 4 options" if question_type == "mcq" else "True/False" if question_type == "truefalse" else "MCQ with 4 options"
        
        # Avoid duplicate questions
        avoid_text = ""
        if previous_questions:
            avoid_text = f"Do NOT ask about: {', '.join(previous_questions[:5])}"
        
        prompt = f"""Generate exactly 1 {difficulty} {q_type} question from this text.
{avoid_text}

TEXT:
{context}

RESPOND WITH ONLY PLAIN JSON TEXT. NO MARKDOWN. NO CODE BLOCKS. NO EXPLANATION.
Just return this exact format with your content:
{{"id":1,"question":"your question here","options":["Option A","Option B","Option C","Option D"],"correctAnswer":0,"correctAnswerText":"Option A","explanation":"brief explanation","type":"mcq"}}

Rules:
- correctAnswer is the index (0-3 for MCQ, 0-1 for T/F)
- correctAnswerText is the exact text of the correct option
- Question must be directly from the provided text
- IMPORTANT: Each option must be maximum 100 characters long
- Keep options concise and clear
- For True/False: options are ["True","False"]
- OUTPUT ONLY THE JSON OBJECT, NOTHING ELSE"""

        print(f"Generating single question with AutoGen...")
        
        # Use AutoGen model client to generate response
        messages = [UserMessage(content=prompt, source="user")]
        response = await model_client.create(messages=messages)
        
        # Extract text content from response
        result = response.content.strip()
        
        # Clean markdown wrappers if LLM still adds them
        if result.startswith("```json"):
            result = result[7:]
        elif result.startswith("```"):
            result = result[3:]
        if result.endswith("```"):
            result = result[:-3]
        result = result.strip()
        
        # Parse and validate
        parsed = json.loads(result)
        
        # Format options to max 100 characters
        if 'options' in parsed:
            parsed['options'] = format_quiz_options(parsed['options'], 100)
        
        # Ensure correctAnswerText is set (after formatting)
        idx = parsed.get('correctAnswer', 0)
        opts = parsed.get('options', [])
        if opts and 0 <= idx < len(opts):
            parsed['correctAnswerText'] = opts[idx]
        
        print(f"Generated question: {parsed.get('question', '')[:50]}...")
        return parsed
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Raw result: {result[:200] if 'result' in dir() else 'N/A'}")
        return {"error": "Failed to parse question"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error generating question: {e}")
        return {"error": str(e)}


def get_random_chunks(num_chunks: int = 5) -> str:
    """Gets random chunks from the stored document chunks."""
    global document_chunks
    
    if not document_chunks:
        # Try to get chunks from ChromaDB if memory is empty
        try:
            all_docs = vector_store.get()
            if all_docs and all_docs.get('documents'):
                document_chunks = all_docs['documents']
        except Exception as e:
            print(f"Error retrieving from ChromaDB: {e}")
    
    if not document_chunks:
        return ""
    
    # Select random chunks (or all if fewer than requested)
    num_to_select = min(num_chunks, len(document_chunks))
    selected_chunks = random.sample(document_chunks, num_to_select)
    
    return "\n\n---\n\n".join(selected_chunks)

async def generate_quiz_from_rag(topic: str, num_questions: int = 5, include_flashcards: bool = False, difficulty: str = "medium", question_type: str = "mixed"):
    try:
        # Get random chunks (fewer chunks = fewer tokens)
        num_chunks = min(3, max(2, num_questions // 2))
        print(f"Getting {num_chunks} random chunks for quiz generation")
        context = get_random_chunks(num_chunks)
        print(f"Retrieved context length: {len(context)} characters")
        
        # Truncate context if too long (save tokens)
        max_context_chars = 2000
        if len(context) > max_context_chars:
            context = context[:max_context_chars] + "..."
        
        if not context or len(context) < 50:
            return json.dumps({"quiz": [], "flashcards": [], "error": "No content found. Upload a PDF first."})

        # Build compact prompt
        q_type = "MCQ(4 options)" if question_type == "mcq" else "True/False" if question_type == "truefalse" else "mixed MCQ+T/F"
        flashcard_note = "Include 5 flashcards." if include_flashcards else ""
        
        prompt = f"""Generate {num_questions} {difficulty} {q_type} questions from this text. {flashcard_note}

TEXT:
{context}

RESPOND WITH ONLY PLAIN JSON TEXT. NO MARKDOWN. NO CODE BLOCKS. NO EXPLANATION.
{{"quiz":[{{"id":1,"question":"...","options":["A","B","C","D"],"correctAnswer":0,"correctAnswerText":"A","explanation":"...","type":"mcq"}}],"flashcards":[{{"id":1,"front":"...","back":"..."}}]}}

Rules: correctAnswer=index(0-3 MCQ,0-1 T/F), correctAnswerText=exact option text, questions from text only.
OUTPUT ONLY THE JSON OBJECT, NOTHING ELSE."""

        print(f"Calling AutoGen model client...")
        
        # Use AutoGen model client
        messages = [UserMessage(content=prompt, source="user")]
        response = await model_client.create(messages=messages)
        result = response.content.strip()
        
        # Clean markdown wrappers
        if result.startswith("```json"):
            result = result[7:]
        elif result.startswith("```"):
            result = result[3:]
        if result.endswith("```"):
            result = result[:-3]
        result = result.strip()
        
        # Parse and validate
        try:
            parsed = json.loads(result)
            for q in parsed.get('quiz', []):
                idx = q.get('correctAnswer', 0)
                opts = q.get('options', [])
                if opts and 0 <= idx < len(opts):
                    q['correctAnswerText'] = opts[idx]
            print(f"Generated {len(parsed.get('quiz', []))} questions")
            return json.dumps(parsed)
        except json.JSONDecodeError as e:
            print(f"JSON error: {e}")
            return json.dumps({"quiz": [], "flashcards": [], "error": "Parse error"})

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))
