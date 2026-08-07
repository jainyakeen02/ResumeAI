import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure the OpenRouter API key and client
api_key = os.getenv("OPENROUTER_API_KEY")
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
) if api_key else None

MODEL_ID = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")

def _generate_json(prompt: str) -> dict | None:
    """Send *prompt* to OpenRouter and parse the JSON response.
    Returns ``{"error": ...}`` on any error (including missing API key)."""
    if not client:
        print("Warning: OPENROUTER_API_KEY is not set.")
        return {"error": "OPENROUTER_API_KEY is not set in environment variables."}
    try:
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "user", "content": prompt}
            ],
            # Use json_object to guarantee structured JSON output from supported models
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"OpenRouter API Error: {e}")
        return {"error": str(e)}

def generate_resume_analysis(text: str) -> dict | None:
    """Analyze a resume and return a structured JSON.
    The prompt follows the original specification.
    """
    prompt = f"""
    You are an expert AI Recruiter and ATS (Applicant Tracking System).
    Analyze the following resume text and provide a highly detailed structured evaluation.

    Resume Text:
    '''
    {text}
    '''

    You must return a raw JSON object with the following exact structure:
    {{
        "skills": ["List of unique technical and soft skills extracted, properly capitalized"],
        "action_verbs_found": ["List of strong action verbs found, like 'Engineered', 'Led'"],
        "ats_score": <An integer from 0 to 100 based on the overall quality, impact, and skill matching>,
        "category_scores": {{
            "sections": <Score out of 20 based on having standard sections like Experience, Education, Skills>,
            "skills": <Score out of 25 based on the breadth and depth of skills>,
            "impact": <Score out of 35 based on quantifiable metrics, achievements, and strong verbs>,
            "formatting": <Score out of 20 based on text structure, readability, and length>
        }},
        "feedback": [
            "A specific, actionable bullet point on what to improve.",
            "Another specific actionable bullet point."
        ],
        "ats_score_explanation": "A 2-3 sentence personalized summary explaining exactly why this resume received its score, praising its strengths and pointing out its biggest missing elements."
    }}
    """
    return _generate_json(prompt)

def analyze_skill_gap(resume_text: str, job_description_text: str) -> dict | None:
    """Compare a resume with a job description and return a skill-gap JSON."""
    prompt = f"""
    You are an expert Career Coach and Technical Recruiter.
    Compare the candidate's Resume against the provided Job Description to perform a Skill Gap Analysis.

    Resume Text:
    '''
    {resume_text}
    '''

    Job Description:
    '''
    {job_description_text}
    '''

    You must return a raw JSON object with the following exact structure:
    {{
        "match_percentage": <An integer from 0 to 100 representing how well the resume matches the JD>,
        "matching_skills": ["Skill 1", "Skill 2"],
        "missing_skills": ["Missing Skill 1", "Missing Skill 2"],
        "recommendations": [
            "Actionable advice on how to bridge a specific missing skill gap.",
            "Recommendation on how to reword the resume to better highlight existing matched skills."
        ]
    }}
    """
    return _generate_json(prompt)

def generate_interview_questions(resume_text: str, job_description_text: str) -> dict | None:
    """Generate five interview questions (technical + behavioural)."""
    prompt = f"""
    You are an Expert Technical Interviewer.
    Generate a list of 5 tailored interview questions based on the candidate's resume and the job description.
    Include a mix of technical and behavioral questions.

    Resume Text:
    '''
    {resume_text}
    '''

    Job Description:
    '''
    {job_description_text}
    '''

    You must return a raw JSON object with the following exact structure:
    {{
        "questions": [
            {{
                "type": "Technical",
                "question": "The generated question...",
                "expected_answer_hints": "Brief hints on what a good answer should include."
            }}
        ]
    }}
    """
    return _generate_json(prompt)

def chat_with_candidate(chat_history: list, latest_message: str, resume_text: str) -> dict:
    """Maintain a mock-interview conversation.
    ``chat_history`` is a list of ``{"role": "user"|"model", "parts": ["text"]}``.
    Returns ``{"response": <string>}``.
    """
    if not client:
        return {"response": "API Key not configured. Please add a valid OPENROUTER_API_KEY to your .env file."}
    
    system_instruction = f"""You are a professional AI Mock Interviewer conducting a realistic job interview.
    The candidate's resume is provided below. Your role is to:
    1. Ask one well-thought-out interview question at a time.
    2. Listen to the candidate's answer and provide brief constructive feedback.
    3. Then proceed to the next question.
    4. Be encouraging but honest and professional.
    5. Cover both technical skills from their resume and behavioural aspects.

    Candidate Resume:
    {resume_text}
    """
    try:
        # Build OpenRouter/OpenAI formatted messages
        messages = [{"role": "system", "content": system_instruction}]
        
        # Parse history which was formatted for Gemini earlier
        for msg in chat_history:
            # Gemini uses "user" and "model", OpenAI uses "user" and "assistant"
            role = "assistant" if msg.get("role") == "model" else "user"
            parts_text = msg.get("parts", [""])[0] if isinstance(msg.get("parts"), list) else msg.get("parts", "")
            messages.append({"role": role, "content": parts_text})
            
        # Add latest user message
        messages.append({"role": "user", "content": latest_message})

        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            temperature=0.8,
            max_tokens=512,
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        print(f"OpenRouter API Error (Chat): {e}")
        return {"response": f"Sorry, I encountered an error: {str(e)}"}
