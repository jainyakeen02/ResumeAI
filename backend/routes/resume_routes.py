import os
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from utils.auth import token_required
from utils.pdf_extractor import extract_text_from_pdf
from models.resume import Resume
from extensions import db
from nlp.analyzer import analyze_resume

resume_bp = Blueprint("resume", __name__)

@resume_bp.route("/upload", methods=["POST"])
@token_required
def upload_resume(current_user):
    if "resume" not in request.files:
        return jsonify({"message": "No resume file provided."}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"message": "No file selected."}), 400
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"message": "Only PDF files are allowed."}), 400

    filename = secure_filename(file.filename)
    import time
    # Ensure unique filename to prevent overwrites
    unique_filename = f"{current_user.id}_{int(time.time() * 1000)}_{filename}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)

    file.save(filepath)
    
    extracted_text = extract_text_from_pdf(filepath)
    if not extracted_text:
        return jsonify({"message": "Failed to extract text from PDF."}), 500
        
    # Perform ML/NLP Analysis on the extracted text
    analysis_result = analyze_resume(extracted_text)

    new_resume = Resume(
        user_id=current_user.id,
        filename=filename,
        filepath=filepath,
        extracted_text=extracted_text,
        analysis_result=analysis_result
    )
    
    db.session.add(new_resume)
    db.session.commit()

    return jsonify({
        "message": "Resume uploaded successfully.",
        "resume": new_resume.to_dict()
    }), 201

@resume_bp.route("/history", methods=["GET"])
@token_required
def get_history(current_user):
    resumes = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.created_at.desc()).all()
    return jsonify({"history": [r.to_dict() for r in resumes]}), 200

@resume_bp.route("/stats", methods=["GET"])
@token_required
def get_stats(current_user):
    all_resumes = Resume.query.filter_by(user_id=current_user.id).all()
    total = len(all_resumes)
    analyzed = sum(1 for r in all_resumes if r.analysis_result and r.analysis_result.get('status') == 'completed')
    pending = total - analyzed
    
    scores = [r.analysis_result.get('ats_score', 0) for r in all_resumes if r.analysis_result and r.analysis_result.get('ats_score')]
    avg_score = round(sum(scores) / len(scores)) if scores else 85
    
    return jsonify({
        "total_uploads": total,
        "analyzed": analyzed,
        "pending": pending,
        "avg_ats_score": avg_score
    }), 200

@resume_bp.route("/activity", methods=["GET"])
@token_required
def get_activity(current_user):
    from datetime import datetime, timedelta

    # Get monthly upload counts and avg score for the last 12 months
    now = datetime.utcnow()
    months = []
    
    # Calculate starting from 11 months ago to current month (12 months total)
    for i in range(11, -1, -1):
        # Approximate 30 days per month
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
            
        month_start = datetime(year, month, 1)
        if month == 12:
            month_end = datetime(year + 1, 1, 1)
        else:
            month_end = datetime(year, month + 1, 1)

        month_resumes = Resume.query.filter(
            Resume.user_id == current_user.id,
            Resume.created_at >= month_start,
            Resume.created_at < month_end
        ).all()
        
        count = len(month_resumes)
        scores = [r.analysis_result.get('ats_score', 0) for r in month_resumes if r.analysis_result and r.analysis_result.get('ats_score')]
        avg_score = round(sum(scores) / len(scores)) if scores else 0

        months.append({
            "name": month_start.strftime("%b"),
            "full_month": month_start.strftime("%B %Y"),
            "resumes": count,
            "avg_score": avg_score
        })

    return jsonify({"activity": months}), 200