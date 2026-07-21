import re

# Predefined list of common skills for text matching
SKILLS_DB = [
    "python", "java", "c++", "c#", "javascript", "typescript", "react", "angular", "vue",
    "node.js", "express", "django", "flask", "spring", "ruby on rails", "sql", "mysql",
    "postgresql", "mongodb", "aws", "azure", "gcp", "docker", "kubernetes", "machine learning",
    "deep learning", "nlp", "data science", "html", "css", "git", "linux", "agile", "scrum",
    "pytorch", "tensorflow", "keras", "pandas", "numpy", "scikit-learn", "fastapi",
    "go", "rust", "ruby", "php", "laravel", "bash", "shell"
]

def analyze_resume(text):
    if not text:
        return {
            "status": "error",
            "message": "No text provided to analyze."
        }
        
    text_lower = text.lower()
    
    # 1. Extract Emails
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    emails = re.findall(email_pattern, text)
    
    # 2. Extract Phone Numbers
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    
    # 3. Extract Skills
    found_skills = []
    for skill in SKILLS_DB:
        # Match as whole word
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Special capitalization for some skills
            if skill == "node.js": found_skills.append("Node.js")
            elif skill == "react": found_skills.append("React")
            elif skill == "aws": found_skills.append("AWS")
            elif skill == "html": found_skills.append("HTML")
            elif skill == "css": found_skills.append("CSS")
            elif skill == "sql": found_skills.append("SQL")
            else: found_skills.append(skill.title())
            
    # 4. ATS Score Calculation
    score = 0
    feedback = []
    
    if len(emails) > 0:
        score += 20
    else:
        feedback.append("Consider adding an email address for contact.")
        
    if len(phones) > 0:
        score += 20
    else:
        feedback.append("Consider adding a phone number for contact.")
        
    num_skills = len(found_skills)
    if num_skills >= 10:
        score += 40
        feedback.append("Great! You have a good number of skills listed.")
    elif num_skills >= 5:
        score += 25
        feedback.append("Consider adding a few more technical skills to improve ATS ranking.")
    else:
        score += 10
        feedback.append("Very few skills detected. Ensure you explicitly list your relevant skills.")
        
    word_count = len(text.split())
    if word_count > 300:
        score += 20
    else:
        score += 10
        feedback.append("Your resume seems a bit short. Consider adding more detailed descriptions of your experience.")
        
    return {
        "status": "completed",
        "contact_info": {
            "email": emails[0] if emails else None,
            "phone": phones[0] if phones else None
        },
        "skills": list(set(found_skills)),
        "ats_score": min(score, 100),
        "feedback": feedback
    }
