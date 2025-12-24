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


model_client = OpenAIChatCompletionClient(
    model = 'gemini-2.5-flash',
    model_info=ModelInfo(vision=True, function_calling=True, json_output=True, family="unknown", structured_output=True),
    api_key=GEMINI_API_KEY,
)

Assistant = AssistantAgent(name='Assistant',description='A helpful Assistant',model_client=model_client,system_message='Generate a quiz where each line follows this character map. Use spaces for padding. Char 1: Correct Option (A/B/C/D). Char 3-30: Question (28 chars). Char 32-55: Option 1 (24 chars). Char 57-80: Option 2 (24 chars). Char 82-105: Option 3 (24 chars). Char 107-130: Option 4 (24 chars). Ensure spaces at indexes 2, 31, 56, 81, and 106. Output only the data strings.')

def parse_quiz_line(line):
    # Adjusted ranges for +10 characters per field
    correct_answer = line[0].strip()
    question       = line[2:30].strip()
    option_1       = line[31:55].strip()
    option_2       = line[56:80].strip()
    option_3       = line[81:105].strip()
    option_4       = line[106:130].strip()

    print(f"Correct: {correct_answer}")
    print(f"Question: {question}")
    print(f"Option A: {option_1}")
    print(f"Option B: {option_2}")
    print(f"Option C: {option_3}")
    print(f"Option D: {option_4}")
    
async def get_response(query:str):
    response = await Assistant.run(task=[TextMessage(content=query,source='user')])
    structured_output = response.messages[-1].content
    parse_quiz_line(structured_output)
    return structured_output

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


