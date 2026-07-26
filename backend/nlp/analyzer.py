import re

# Comprehensive list of skills categorized for robust matching
SKILLS_DB = [
    # Programming Languages
    "python", "java", "c++", "c#", "javascript", "typescript", "ruby", "php", "go", "golang",
    "rust", "swift", "kotlin", "scala", "r", "matlab", "bash", "shell", "powershell", "html", "css", "sql",

    # Web & Frontend Frameworks
    "react", "react.js", "next.js", "angular", "vue", "vue.js", "svelte", "redux", "tailwind",
    "tailwindcss", "bootstrap", "jquery", "html5", "css3", "sass", "less", "webpack", "vite",

    # Backend & Frameworks
    "node.js", "express", "express.js", "django", "flask", "fastapi", "spring", "spring boot",
    "ruby on rails", "rails", "laravel", "asp.net", ".net", "graphql", "rest api", "grpc",

    # Databases & Caching
    "mysql", "postgresql", "postgres", "mongodb", "sqlite", "redis", "elasticsearch", "dynamodb",
    "oracle", "cassandra", "neo4j", "mariadb", "firebase", "supabase",

    # Cloud, DevOps & Infrastructure
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "gitlab ci", "github actions", "circleci", "helm",
    "nginx", "linux", "unix", "sysadmin", "cloudformation",

    # AI, Machine Learning & Data Science
    "machine learning", "deep learning", "nlp", "natural language processing", "computer vision",
    "data science", "data analytics", "pytorch", "tensorflow", "keras", "pandas", "numpy",
    "scikit-learn", "scipy", "opencv", "huggingface", "llm", "langchain", "tableau", "power bi",

    # Methodologies, Testing & Tools
    "git", "github", "gitlab", "jira", "confluence", "agile", "scrum", "kanban", "ci/cd",
    "unit testing", "jest", "cypress", "selenium", "pytest", "mocha", "system design", "microservices",

    # Leadership & Soft Skills
    "leadership", "project management", "team management", "communication", "problem solving",
    "critical thinking", "collaboration", "cross-functional leadership", "mentorship"
]

SECTION_KEYWORDS = {
    "experience": ["experience", "work history", "employment", "professional background", "work experience", "career summary"],
    "education": ["education", "academic background", "qualifications", "degree", "university", "academic history"],
    "skills": ["skills", "technical skills", "competencies", "expertise", "core skills", "proficiencies"],
    "projects": ["projects", "personal projects", "academic projects", "key projects", "key achievements"],
    "summary": ["summary", "objective", "profile", "professional summary", "about me", "executive summary"]
}

ACTION_VERBS = [
    "engineered", "spearheaded", "developed", "architected", "implemented", "optimized", "increased",
    "reduced", "streamlined", "accelerated", "designed", "built", "launched", "managed", "led",
    "transformed", "collaborated", "automated", "enhanced", "resolved", "delivered", "mentored",
    "orchestrated", "scaled", "pioneered", "refactored", "migrated", "maximized"
]

def analyze_resume(text):
    if not text:
        return {
            "status": "error",
            "message": "No text provided to analyze."
        }
        
    text_lower = text.lower()
    
    # 1. Contact & Social Profiles Detection
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    linkedin_pattern = r'linkedin\.com/in/[a-zA-Z0-9_-]+'
    github_pattern = r'github\.com/[a-zA-Z0-9_-]+'
    portfolio_pattern = r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?)'

    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)
    linkedins = re.findall(linkedin_pattern, text_lower)
    githubs = re.findall(github_pattern, text_lower)
    
    contact_score = 0
    contact_feedback = []
    
    if emails:
        contact_score += 5
    else:
        contact_feedback.append("Missing email address. Include a professional email.")

    if phones:
        contact_score += 5
    else:
        contact_feedback.append("Missing phone number for direct contact.")

    if linkedins or githubs or re.search(r'\bportfolio\b|\bwebsite\b', text_lower):
        contact_score += 5
    else:
        contact_feedback.append("Consider adding links to your LinkedIn, GitHub, or portfolio website.")

    # 2. Section Headings Detection
    sections_found = []
    section_score = 0
    
    for section_name, keywords in SECTION_KEYWORDS.items():
        found = False
        for kw in keywords:
            pattern = r'(?i)\b' + re.escape(kw) + r'\b'
            if re.search(pattern, text):
                found = True
                break
        if found:
            sections_found.append(section_name)
            section_score += 4 # 5 sections max * 4 = 20 pts

    missing_sections = [s.title() for s in SECTION_KEYWORDS.keys() if s not in sections_found]
    
    # 3. Skills Extraction & Scoring
    found_skills_set = set()
    for skill in SKILLS_DB:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Format skill name nicely
            if skill in ["node.js", "express.js", "vue.js", "next.js", "react.js"]:
                formatted = skill.replace(".js", ".js").title()
            elif skill in ["aws", "html", "css", "sql", "nlp", "llm", "gcp", "k8s", "ci/cd", "r", "api"]:
                formatted = skill.upper()
            elif skill in ["c++", "c#", ".net"]:
                formatted = skill.upper() if skill != ".net" else ".NET"
            else:
                formatted = skill.title()
            found_skills_set.add(formatted)

    found_skills = sorted(list(found_skills_set))
    num_skills = len(found_skills)
    
    if num_skills >= 12:
        skills_score = 25
    elif num_skills >= 8:
        skills_score = 20
    elif num_skills >= 4:
        skills_score = 12
    else:
        skills_score = 5

    # 4. Action Verbs & Quantitative Metrics Detection
    found_action_verbs = []
    for verb in ACTION_VERBS:
        pattern = r'\b' + re.escape(verb) + r'\b'
        if re.search(pattern, text_lower):
            found_action_verbs.append(verb)

    # Check for quantitative impact (numbers, percentages, currency, metrics)
    metrics_pattern = r'(?:\b\d+%\b|\$\d+(?:\.\d+)?|\b\d+\s*(?:k|m|billion|million|\+)\b|\b\d+\+\s*(?:years|users|clients|projects)?\b)'
    metrics_found = re.findall(metrics_pattern, text_lower)

    impact_score = 0
    if len(found_action_verbs) >= 5:
        impact_score += 10
    elif len(found_action_verbs) >= 2:
        impact_score += 6
    else:
        impact_score += 2

    if len(metrics_found) >= 3:
        impact_score += 10
    elif len(metrics_found) >= 1:
        impact_score += 6
    else:
        impact_score += 2

    # 5. Length & Readability Structure Scoring
    words = text.split()
    word_count = len(words)
    
    formatting_score = 0
    if 350 <= word_count <= 1100:
        formatting_score += 20
    elif 200 <= word_count < 350 or 1100 < word_count <= 1600:
        formatting_score += 12
    else:
        formatting_score += 5

    # Final Score Calculation
    total_ats_score = contact_score + section_score + skills_score + impact_score + formatting_score
    total_ats_score = min(max(total_ats_score, 0), 100)

    # Consolidate Feedback & Recommendations
    feedback = []
    feedback.extend(contact_feedback)
    
    if missing_sections:
        feedback.append(f"Missing core section headings: {', '.join(missing_sections)}. Clear section headings improve ATS parsing.")
        
    if num_skills < 8:
        feedback.append("Include more industry-specific technical and soft skills to improve keyword matching.")
    else:
        feedback.append("Great job on highlighting a diverse set of technical skills!")

    if len(found_action_verbs) < 4:
        feedback.append("Use strong action verbs (e.g., 'Engineered', 'Spearheaded', 'Optimized', 'Delivered') to describe your contributions.")

    if len(metrics_found) < 2:
        feedback.append("Quantify your achievements with numbers, percentages, or metrics (e.g., 'Increased performance by 35%').")

    if word_count < 350:
        feedback.append("Your resume content is relatively brief. Expand on your project details and work responsibilities.")
    elif word_count > 1100:
        feedback.append("Your resume is quite long. Consider concise bullet points to keep it easily scannable.")

    return {
        "status": "completed",
        "contact_info": {
            "email": emails[0] if emails else None,
            "phone": phones[0] if phones else None,
            "linkedin": linkedins[0] if linkedins else None,
            "github": githubs[0] if githubs else None
        },
        "skills": found_skills,
        "ats_score": total_ats_score,
        "category_scores": {
            "contact": contact_score,
            "sections": section_score,
            "skills": skills_score,
            "impact": impact_score,
            "formatting": formatting_score
        },
        "metrics_found_count": len(metrics_found),
        "action_verbs_count": len(found_action_verbs),
        "word_count": word_count,
        "feedback": feedback
    }

