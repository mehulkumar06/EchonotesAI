import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from typing import Dict, List

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_summary(transcript: str) -> Dict[str, any]:
    """
    Generate summary and key points from transcript using GPT
    
    Args:
        transcript: The meeting transcript text
        
    Returns:
        Dictionary with 'summary' and 'key_points' (list)
    """
    try:
        prompt = f"""You are an AI assistant that analyzes meeting transcripts.

Given the following meeting transcript, provide:
1. A concise summary (2-3 sentences)
2. Key points discussed (as a list)

Transcript:
{transcript}

Respond in JSON format:
{{
  "summary": "Brief summary here",
  "key_points": ["Point 1", "Point 2", "Point 3"]
}}
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes meeting transcripts and returns structured JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        raise Exception(f"GPT summarization failed: {str(e)}")


async def extract_tasks(transcript: str) -> List[Dict[str, str]]:
    """
    Extract action items and tasks from transcript using GPT
    
    Args:
        transcript: The meeting transcript text
        
    Returns:
        List of tasks with deadlines in ISO format (YYYY-MM-DD)
    """
    try:
        prompt = f"""You are an AI assistant that extracts action items from meeting transcripts.

Given the following meeting transcript, extract all action items and tasks mentioned.

For each task, provide:
1. task: Description of the task
2. deadline: Date in YYYY-MM-DD format (if mentioned, otherwise null)

Transcript:
{transcript}

Respond in JSON format:
{{
  "tasks": [
    {{"task": "Task description", "deadline": "2026-02-14"}},
    {{"task": "Another task", "deadline": null}}
  ]
}}

If no tasks are found, return an empty tasks array.
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts tasks from meeting transcripts and returns structured JSON with ISO date format."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("tasks", [])
    
    except Exception as e:
        raise Exception(f"GPT task extraction failed: {str(e)}")


async def detect_sentiment(transcript: str) -> str:
    """
    Detect the overall tone of the meeting transcript
    
    Args:
        transcript: The meeting transcript text
        
    Returns:
        One of: Positive, Neutral, Tense, Urgent
    """
    prompt = f"""
You are an AI meeting analyst.

Analyze the OVERALL tone of this meeting transcript and classify it into EXACTLY ONE word from the list below:

Positive
Neutral
Tense
Urgent

Definitions:
- Positive → calm, productive, optimistic discussion
- Neutral → normal informational or balanced discussion
- Tense → disagreement, conflict, stress, pressure, frustration
- Urgent → deadlines, critical issues, time-sensitive actions

Rules:
- Return ONLY one word from the list
- No explanation
- No punctuation
- No extra text

Transcript:
{transcript}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        sentiment = response.choices[0].message.content.strip()

        if sentiment not in ["Positive", "Neutral", "Tense", "Urgent"]:
            return "Neutral"

        return sentiment

    except Exception:
        return "Neutral"


async def process_voice_command(command: str, transcript: str) -> str:
    """
    Process voice command using stored transcript context
    
    Args:
        command: The user's voice command
        transcript: The stored meeting transcript for context
        
    Returns:
        AI-generated response to the command
    """
    try:
        prompt = f"""You are an AI assistant helping a user interact with their meeting notes.

Meeting Transcript:
{transcript}

User Command: {command}

Provide a helpful, concise response to the user's command based on the meeting transcript.
"""
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that answers questions about meeting transcripts."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        raise Exception(f"GPT voice command processing failed: {str(e)}")


async def detect_language(transcript: str) -> str:
    """
    Detect the primary language of the meeting transcript
    
    Args:
        transcript: The meeting transcript text
        
    Returns:
        Detected language name (e.g., English, Hindi, Marathi, etc.) or 'Unknown'
    """
    prompt = f"""
Detect the primary language of the following meeting transcript.

Return ONLY the language name in English (for example: English, Hindi, Marathi, French, etc.).
No extra text.

Transcript:
{transcript}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        return response.choices[0].message.content.strip()

    except Exception:
        return "Unknown"


async def translate_text(text: str, target_language: str) -> str:
    """
    Translate text into a target language
    
    Args:
        text: The text to translate
        target_language: The target language
        
    Returns:
        Translated text
    """
    prompt = f"""
Translate the following text into {target_language}.
Keep meaning accurate and natural.
Return only translated text.

Text:
{text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
         raise Exception(f"Translation failed: {str(e)}")
