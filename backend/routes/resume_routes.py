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
    return jsonify({
        "total_uploads": total,
        "analyzed": analyzed,
        "pending": pending
    }), 200

@resume_bp.route("/activity", methods=["GET"])
@token_required
def get_activity(current_user):
    from datetime import datetime, timedelta
    from sqlalchemy import func

    # Get monthly upload counts for the last 6 months
    now = datetime.utcnow()
    months = []
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        count = Resume.query.filter(
            Resume.user_id == current_user.id,
            Resume.created_at >= month_start,
            Resume.created_at < month_end
        ).count()
        months.append({
            "name": month_start.strftime("%b"),
            "resumes": count
        })

    return jsonify({"activity": months}), 200