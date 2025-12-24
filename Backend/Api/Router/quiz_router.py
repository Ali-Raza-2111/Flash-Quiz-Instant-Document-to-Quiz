from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from Services.rag_service import process_pdf, generate_quiz_from_rag, generate_single_question, check_quiz_answers, get_random_chunks, retrieve_documents
from Services.agent_service import generate_quiz_with_agent, generate_single_question_with_agent, generate_flashcards_with_agent, generate_single_flashcard_with_agent, chat_with_rag_agent
import json
import re

router = APIRouter(prefix="/quiz", tags=["quiz"])


class AnswerCheck(BaseModel):
    question_id: int
    user_answer: str
    correct_answer: str


class CheckAnswersRequest(BaseModel):
    answers: List[AnswerCheck]


class ChatRequest(BaseModel):
    message: str


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    return await process_pdf(file)


@router.post("/generate-one")
async def generate_one_question(
    topic: str = Query("general", description="Topic for the question"),
    difficulty: str = Query("medium", description="Difficulty level: easy, medium, hard"),
    question_type: str = Query("mcq", description="Question type: mcq, truefalse"),
    previous_questions: Optional[str] = Query(None, description="Comma-separated previous questions to avoid")
):
    """Generate a single question at a time."""
    prev_list = previous_questions.split(",") if previous_questions else []
    result = await generate_single_question(topic, difficulty, question_type, prev_list)
    return result


@router.post("/check-answers")
async def check_answers(request: CheckAnswersRequest):
    """Check all quiz answers using cosine similarity."""
    answers_list = [
        {
            "question_id": a.question_id,
            "user_answer": a.user_answer,
            "correct_answer": a.correct_answer
        }
        for a in request.answers
    ]
    result = await check_quiz_answers(answers_list)
    return result


# Agent-based quiz generation endpoints
@router.post("/agent/generate")
async def generate_quiz_agent(
    num_questions: int = Query(5, description="Number of questions to generate")
):
    """Generate quiz using the AutoGen agent with parsed format."""
    # Get random chunks from uploaded document (small chunks ~200-250 words)
    context = get_random_chunks(min(3, num_questions))
    
    if not context or len(context) < 50:
        raise HTTPException(status_code=400, detail="No content found. Upload a PDF first.")
    
    # Limit context size for efficient processing
    if len(context) > 1500:
        context = context[:1500]
    
    result = await generate_quiz_with_agent(context, num_questions)
    return result


@router.post("/agent/generate-one")
async def generate_one_question_agent(
    previous_questions: Optional[str] = Query(None, description="Comma-separated previous questions to avoid")
):
    """Generate a single question using the AutoGen agent."""
    # Get a single random chunk
    context = get_random_chunks(1)
    
    if not context or len(context) < 50:
        raise HTTPException(status_code=400, detail="No content found. Upload a PDF first.")
    
    # Limit context size
    if len(context) > 800:
        context = context[:800]
    
    prev_list = previous_questions.split(",") if previous_questions else []
    result = await generate_single_question_with_agent(context, prev_list)
    return result


@router.post("/agent/generate-flashcards")
async def generate_flashcards_agent(
    num_flashcards: int = Query(5, description="Number of flashcards to generate")
):
    """Generate flashcards using the AutoGen flashcard agent."""
    # Get random chunks from uploaded document
    context = get_random_chunks(min(3, num_flashcards))
    
    if not context or len(context) < 50:
        raise HTTPException(status_code=400, detail="No content found. Upload a PDF first.")
    
    # Limit context size for efficient processing
    if len(context) > 1500:
        context = context[:1500]
    
    result = await generate_flashcards_with_agent(context, num_flashcards)
    return result


@router.post("/agent/generate-one-flashcard")
async def generate_one_flashcard_agent(
    previous_flashcards: Optional[str] = Query(None, description="Comma-separated previous flashcard fronts to avoid")
):
    """Generate a single flashcard using the AutoGen flashcard agent."""
    # Get a single random chunk
    context = get_random_chunks(1)
    
    if not context or len(context) < 50:
        raise HTTPException(status_code=400, detail="No content found. Upload a PDF first.")
    
    # Limit context size
    if len(context) > 800:
        context = context[:800]
    
    prev_list = previous_flashcards.split(",") if previous_flashcards else []
    result = await generate_single_flashcard_with_agent(context, prev_list)
    return result


@router.post("/generate")
async def generate_quiz(
    topic: str = Query(..., description="Topic for the quiz"), 
    num_questions: int = Query(5, description="Number of questions"),
    include_flashcards: bool = Query(False, description="Whether to generate flashcards"),
    difficulty: str = Query("medium", description="Difficulty level: easy, medium, hard"),
    question_type: str = Query("mixed", description="Question type: mixed, mcq, truefalse")
):
    response_content = await generate_quiz_from_rag(topic, num_questions, include_flashcards, difficulty, question_type)
    
    # Attempt to parse JSON from the response
    try:
        # Sometimes LLMs wrap JSON in markdown code blocks
        json_match = re.search(r"```json\s*(.*?)\s*```", response_content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_str = response_content
            
        data = json.loads(json_str)
        return data
    except json.JSONDecodeError:
        # If parsing fails, return the raw content but warn
        return {"raw_response": response_content, "message": "Failed to parse JSON from LLM response"}


@router.post("/chat")
async def chat_with_document(request: ChatRequest):
    """
    Chat with the RAG assistant about the uploaded document.
    Uses cosine similarity to find relevant context from the vector database.
    """
    if not request.message or len(request.message.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please enter a valid question.")
    
    # Retrieve relevant context from vector database using cosine similarity
    context = retrieve_documents(request.message)
    
    if not context or len(context) < 20:
        return {
            "response": "I couldn't find relevant information in the uploaded document. Please make sure you've uploaded a document first.",
            "query": request.message
        }
    
    # Limit context size for efficiency
    if len(context) > 2000:
        context = context[:2000]
    
    # Chat with RAG agent
    result = await chat_with_rag_agent(request.message, context)
    return result
