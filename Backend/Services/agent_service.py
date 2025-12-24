"""
Agent Service for Quiz and Flashcard Generation
Uses the AutoGen Assistant agent from agent.py to generate quiz questions and flashcards from document chunks.
"""
import sys
import os
# Add parent directory to path to import from agent.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent import Assistant, flashcard_Agent, parse_quiz_line as agent_parse_quiz_line
from autogen_agentchat.messages import TextMessage


def parse_quiz_line(line: str) -> dict:
    """
    Parse a single quiz line into structured data.
    Format: ANSWER|QUESTION|OPTION_A|OPTION_B|OPTION_C|OPTION_D
    """
    try:
        parts = line.split('|')
        if len(parts) < 6:
            print(f"Invalid quiz line format, expected 6 parts: {line}")
            return None
        
        correct_answer_letter = parts[0].strip().upper()
        question = parts[1].strip()
        option_a = parts[2].strip()
        option_b = parts[3].strip()
        option_c = parts[4].strip()
        option_d = parts[5].strip()
        
        # Validate we have content
        if not question or not option_a or not option_b or not option_c or not option_d:
            print(f"Empty fields in quiz line: {line}")
            return None
        
        # Map letter to index
        answer_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
        correct_index = answer_map.get(correct_answer_letter, 0)
        
        options = [option_a, option_b, option_c, option_d]
        
        return {
            "question": question,
            "options": options,
            "correctAnswer": correct_index,
            "correctAnswerText": options[correct_index] if correct_index < len(options) else options[0],
            "type": "mcq"
        }
    except Exception as e:
        print(f"Error parsing quiz line: {e}")
        return None


def parse_quiz_response(response_text: str) -> list:
    """
    Parse the full response from the agent into a list of quiz questions.
    """
    questions = []
    lines = response_text.strip().split('\n')
    
    for idx, line in enumerate(lines):
        if line.strip():  # Skip empty lines
            parsed = parse_quiz_line(line)
            if parsed:
                parsed["id"] = idx + 1
                parsed["explanation"] = f"The correct answer is {parsed['correctAnswerText']}"
                questions.append(parsed)
    
    return questions


async def generate_quiz_with_agent(context: str, num_questions: int = 5) -> dict:
    """
    Generate quiz questions using the AutoGen agent.
    
    Args:
        context: The text content to generate questions from
        num_questions: Number of questions to generate
    
    Returns:
        dict with 'quiz' list containing formatted questions
    """
    try:
        # Build the prompt with the context
        prompt = f"""Based on the following text, generate exactly {num_questions} quiz questions.
Each question should test understanding of key concepts from the text.

TEXT:
{context}

Generate {num_questions} lines in this EXACT format using | as delimiter:
ANSWER|QUESTION|OPTION_A|OPTION_B|OPTION_C|OPTION_D

Rules:
- ANSWER is A, B, C, or D (the correct option)
- QUESTION is the quiz question (max 50 chars)
- Each OPTION is max 50 chars
- Use | to separate ALL fields
- One question per line
- Output ONLY data lines, no headers or explanations

Example: A|What is the capital of France?|Paris|London|Berlin|Madrid"""

        # Run the Assistant agent (from agent.py)
        response = await Assistant.run(task=[TextMessage(content=prompt, source='user')])
        
        # Get the response content
        response_content = response.messages[-1].content
        print(f"Agent response: {response_content[:200]}...")
        
        # Parse the response into structured quiz data
        questions = parse_quiz_response(response_content)
        
        if not questions:
            return {"quiz": [], "error": "Failed to parse quiz questions from agent response"}
        
        return {
            "quiz": questions,
            "total": len(questions)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in agent quiz generation: {e}")
        return {"quiz": [], "error": str(e)}


async def generate_single_question_with_agent(context: str, previous_questions: list = None) -> dict:
    """
    Generate a single quiz question using the AutoGen agent.
    
    Args:
        context: The text content to generate question from
        previous_questions: List of previous question texts to avoid duplicates
    
    Returns:
        dict with single question data
    """
    try:
        avoid_text = ""
        if previous_questions:
            avoid_text = f"\nAvoid asking about: {', '.join(previous_questions[:5])}"
        
        prompt = f"""Based on the following text, generate exactly 1 quiz question.{avoid_text}

TEXT:
{context}

Generate 1 line in this EXACT format using | as delimiter:
ANSWER|QUESTION|OPTION_A|OPTION_B|OPTION_C|OPTION_D

Rules:
- ANSWER is A, B, C, or D (the correct option)
- QUESTION is the quiz question (max 50 chars)
- Each OPTION is max 50 chars
- Use | to separate ALL fields
- Output ONLY the data line, nothing else

Example: A|What is the capital of France?|Paris|London|Berlin|Madrid"""

        # Run the Assistant agent (from agent.py)
        response = await Assistant.run(task=[TextMessage(content=prompt, source='user')])
        response_content = response.messages[-1].content
        
        # Parse single question
        lines = response_content.strip().split('\n')
        for line in lines:
            if line.strip():
                parsed = parse_quiz_line(line)
                if parsed:
                    parsed["id"] = 1
                    parsed["explanation"] = f"The correct answer is {parsed['correctAnswerText']}"
                    return parsed
        
        return {"error": "Failed to generate question"}
        
    except Exception as e:
        print(f"Error generating single question: {e}")
        return {"error": str(e)}


# ============== FLASHCARD FUNCTIONS ==============

def parse_flashcard_line(line: str) -> dict:
    """
    Parse a single flashcard line into structured data.
    Format: FRONT|BACK
    """
    try:
        parts = line.split('|')
        if len(parts) < 2:
            print(f"Invalid flashcard format, expected 2 parts: {line}")
            return None
        
        front = parts[0].strip()
        back = parts[1].strip()
        
        # Validate we have content
        if not front or not back:
            print(f"Empty fields in flashcard line: {line}")
            return None
            
        return {
            "front": front,
            "back": back
        }
    except Exception as e:
        print(f"Error parsing flashcard line: {e}")
        return None


def parse_flashcard_response(response_text: str) -> list:
    """
    Parse the full response from the flashcard agent into a list of flashcards.
    """
    flashcards = []
    lines = response_text.strip().split('\n')
    
    for idx, line in enumerate(lines):
        if line.strip():
            parsed = parse_flashcard_line(line)
            if parsed:
                parsed["id"] = idx + 1
                flashcards.append(parsed)
    
    return flashcards


async def generate_flashcards_with_agent(context: str, num_flashcards: int = 5) -> dict:
    """
    Generate flashcards using the flashcard agent.
    
    Args:
        context: The text content to generate flashcards from
        num_flashcards: Number of flashcards to generate
    
    Returns:
        dict with 'flashcards' list containing formatted flashcards
    """
    try:
        prompt = f"""Based on the following text, generate exactly {num_flashcards} flashcards.
Each flashcard should capture a key concept, term, or fact from the text.

TEXT:
{context}

Generate {num_flashcards} lines in this EXACT format using | as delimiter:
FRONT|BACK

Rules:
- FRONT is the question or term
- BACK is the answer or definition
- Use | to separate the two fields
- One flashcard per line
- Output ONLY data lines, no headers or explanations

Example: What is photosynthesis?|The process by which plants convert sunlight into energy"""

        # Run the flashcard_Agent (from agent.py)
        response = await flashcard_Agent.run(task=[TextMessage(content=prompt, source='user')])
        
        response_content = response.messages[-1].content
        print(f"Flashcard agent response: {response_content[:200]}...")
        
        # Parse the response into structured flashcard data
        flashcards = parse_flashcard_response(response_content)
        
        if not flashcards:
            return {"flashcards": [], "error": "Failed to parse flashcards from agent response"}
        
        return {
            "flashcards": flashcards,
            "total": len(flashcards)
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error in flashcard generation: {e}")
        return {"flashcards": [], "error": str(e)}


async def generate_single_flashcard_with_agent(context: str, previous_flashcards: list = None) -> dict:
    """
    Generate a single flashcard using the flashcard agent.
    
    Args:
        context: The text content to generate flashcard from
        previous_flashcards: List of previous flashcard fronts to avoid duplicates
    
    Returns:
        dict with single flashcard data (front, back)
    """
    try:
        avoid_text = ""
        if previous_flashcards:
            avoid_text = f"\nAvoid these topics: {', '.join(previous_flashcards[:5])}"
        
        prompt = f"""Based on the following text, generate exactly 1 flashcard.
Create a key concept, term, or important fact from the text.{avoid_text}

TEXT:
{context}

Generate 1 line in this EXACT format using | as delimiter:
FRONT|BACK

Rules:
- FRONT is the question or term
- BACK is the answer or definition
- Use | to separate the two fields
- Output ONLY the data line, nothing else

Example: What is photosynthesis?|The process by which plants convert sunlight into energy"""

        # Run the flashcard_Agent (from agent.py)
        response = await flashcard_Agent.run(task=[TextMessage(content=prompt, source='user')])
        response_content = response.messages[-1].content
        
        print(f"Single flashcard response: {response_content}")
        
        # Parse single flashcard
        lines = response_content.strip().split('\n')
        for line in lines:
            if line.strip():
                parsed = parse_flashcard_line(line)
                if parsed:
                    parsed["id"] = 1
                    return parsed
        
        return {"error": "Failed to generate flashcard"}
        
    except Exception as e:
        print(f"Error generating single flashcard: {e}")
        return {"error": str(e)}
