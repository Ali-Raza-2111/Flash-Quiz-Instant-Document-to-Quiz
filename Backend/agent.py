from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.messages import TextMessage
from autogen_core.models import ModelInfo
from pydantic import BaseModel
import asyncio
from dotenv import load_dotenv
import os
load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
MODEL = os.getenv('MODEL')

model_client = OpenAIChatCompletionClient(
    model = MODEL,
    model_info=ModelInfo(vision=True, function_calling=True, json_output=True, family="unknown", structured_output=True),
    api_key=GEMINI_API_KEY,
)

Assistant = AssistantAgent(name='Assistant',description='A helpful Assistant',model_client=model_client,system_message='Generate quiz questions in this EXACT format using | as delimiter: ANSWER|QUESTION|OPTION_A|OPTION_B|OPTION_C|OPTION_D. Rules: 1) ANSWER is single letter A/B/C/D indicating correct option. 2) QUESTION is the quiz question (max 50 chars). 3) Each OPTION is max 50 chars. 4) Use | to separate ALL fields. 5) One question per line. 6) Output ONLY data lines, no headers or explanations. Example: A|What is the capital of France?|Paris|London|Berlin|Madrid')

flashcard_Agent = AssistantAgent(name='FlashcardAgent',description='A helpful Flashcard Generator',model_client=model_client,system_message='Generate flashcards in this EXACT format using | as delimiter: FRONT|BACK. Rules: 1) FRONT is the question or term (the front of the flashcard). 2) BACK is the answer or definition (the back of the flashcard). 3) Use | to separate the two fields. 4) One flashcard per line. 5) Output ONLY data lines, no headers or explanations. Example: What is photosynthesis?|The process by which plants convert sunlight into energy')

def parse_quiz_line(line):
    # Format: ANSWER|QUESTION|OPTION_A|OPTION_B|OPTION_C|OPTION_D
    parts = line.split('|')
    if len(parts) < 6:
        print(f"Invalid line format: {line}")
        return
    
    correct_answer = parts[0].strip().upper()
    question       = parts[1].strip()
    option_1       = parts[2].strip()
    option_2       = parts[3].strip()
    option_3       = parts[4].strip()
    option_4       = parts[5].strip()

    print(f"Correct: {correct_answer}")
    print(f"Question: {question}")
    print(f"Option A: {option_1}")
    print(f"Option B: {option_2}")
    print(f"Option C: {option_3}")
    print(f"Option D: {option_4}")


def get_flashcard_line(line):
    # Format: FRONT|BACK
    parts = line.split('|')
    if len(parts) < 2:
        print(f"Invalid flashcard format: {line}")
        return
    
    question = parts[0].strip()
    answer   = parts[1].strip()

    print(f"Flashcard Question: {question}")
    print(f"Flashcard Answer: {answer}")
async def get_response(query:str):
    response = await Assistant.run(task=[TextMessage(content=query,source='user')])
    structured_output = response.messages[-1].content
    parse_quiz_line(structured_output)
    return structured_output

async def get_flashcards(query:str):
    response = await flashcard_Agent.run(task=[TextMessage(content=query,source='user')])
    return response.messages[-1].content

# Only run test when executing this file directly, not when importing
if __name__ == "__main__":
    asyncio.run(get_response("""
                             Retrieval-Augmented Generation (RAG)
                    Retrieval-Augmented Generation (RAG) is an advanced framework in natural language
                    processing (NLP) that enhances large language models (LLMs) by integrating external
                    knowledge retrieval into the text generation process. Traditional language models rely
                    solely on the knowledge embedded in their parameters during training, which can become
                    outdated, incomplete, or inaccurate. RAG addresses this limitation by dynamically
                    retrieving relevant information from external data sources and using it to generate more
                    accurate, grounded, and context-aware responses.
                    The concept of RAG was formally introduced by researchers at Facebook AI (now Meta AI)
                    in 2020. In their foundational paper, Lewis et al. proposed combining a neural retriever
                    with a neural generator, allowing models to access large corpora such as Wikipedia at
                    inference time rather than memorizing all knowledge during training [1]. This hybrid
                    approach significantly improves factual accuracy and interpretability while reducing
                    hallucinations—responses that sound plausible but are factually incorrect
                             """))


