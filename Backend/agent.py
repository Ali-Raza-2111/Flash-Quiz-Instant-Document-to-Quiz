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

Assistant = AssistantAgent(name='Assistant',description='A helpful Assistant',model_client=model_client,system_message='Generate a quiz where each line follows this character map. Use spaces for padding. Char 1: Correct Option (A/B/C/D). Char 3-40: Question (38 chars). Char 42-75: Option 1 (34 chars). Char 77-110: Option 2 (34 chars). Char 112-145: Option 3 (34 chars). Char 147-180: Option 4 (34 chars). Ensure spaces at indexes 2, 41, 76, 111, and 146. Output only the data strings.Strictely follows the character limits.')

def parse_quiz_line(line):
    # Adjusted ranges: Question 38 chars, Options 34 chars each
    correct_answer = line[0].strip()
    question       = line[2:40].strip()
    option_1       = line[41:75].strip()
    option_2       = line[76:110].strip()
    option_3       = line[111:145].strip()
    option_4       = line[146:180].strip()

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


