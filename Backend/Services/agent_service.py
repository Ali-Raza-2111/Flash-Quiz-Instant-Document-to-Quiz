"""
Agent Service for Quiz Generation
Uses the AutoGen Assistant agent from agent.py to generate quiz questions from document chunks.
"""
import sys
import os
# Add parent directory to path to import from agent.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent import Assistant, parse_quiz_line as agent_parse_quiz_line
from autogen_agentchat.messages import TextMessage


def parse_quiz_line(line: str) -> dict:
    """
    Parse a single quiz line into structured data.
    Returns a dict with question, options, and correct answer.
    """
    try:
        if len(line) < 130:
            # Pad the line if too short
            line = line.ljust(130)
        
        correct_answer_letter = line[0].strip().upper()
        question = line[2:30].strip()
        option_a = line[31:55].strip()
        option_b = line[56:80].strip()
        option_c = line[81:105].strip()
        option_d = line[106:130].strip()
        
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

Remember to follow the exact character format specified. Generate {num_questions} lines, one per question."""

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

Generate only 1 line following the exact character format."""

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
