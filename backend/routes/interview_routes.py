from flask import Blueprint, jsonify, request
from utils.auth import token_required
from models.resume import Resume
from models.interview import InterviewSession, InterviewMessage
from extensions import db
from services.llm_service import generate_interview_questions, chat_with_candidate

interview_bp = Blueprint("interview", __name__)

@interview_bp.route("/generate", methods=["POST"])
@token_required
def generate_questions(current_user):
    data = request.get_json()
    if not data or 'resume_id' not in data or 'job_description' not in data:
        return jsonify({"message": "resume_id and job_description are required."}), 400
        
    resume = Resume.query.filter_by(id=data['resume_id'], user_id=current_user.id).first()
    if not resume or not resume.extracted_text:
        return jsonify({"message": "Resume not found or unreadable."}), 404
        
    questions_data = generate_interview_questions(resume.extracted_text, data['job_description'])
    
    if not questions_data:
        return jsonify({"message": "Failed to generate questions."}), 500
        
    return jsonify({
        "message": "Questions generated successfully.",
        "data": questions_data
    }), 200

@interview_bp.route("/session/start", methods=["POST"])
@token_required
def start_session(current_user):
    data = request.get_json()
    if not data or 'resume_id' not in data:
        return jsonify({"message": "resume_id is required."}), 400
        
    # Optional JD
    job_description = data.get('job_description', '')
    
    resume = Resume.query.filter_by(id=data['resume_id'], user_id=current_user.id).first()
    if not resume:
        return jsonify({"message": "Resume not found."}), 404
        
    session = InterviewSession(
        user_id=current_user.id,
        resume_id=resume.id,
        job_description=job_description
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        "message": "Interview session started.",
        "session_id": session.id
    }), 201

@interview_bp.route("/session/<int:session_id>/chat", methods=["POST"])
@token_required
def chat(current_user, session_id):
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"message": "message is required."}), 400
        
    user_message = data['message']
    
    session = InterviewSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({"message": "Session not found."}), 404
        
    resume = Resume.query.get(session.resume_id)
    
    # Save user message
    new_user_msg = InterviewMessage(session_id=session.id, role="user", content=user_message)
    db.session.add(new_user_msg)
    
    # Build history for Gemini
    history = []
    messages = InterviewMessage.query.filter_by(session_id=session.id).order_by(InterviewMessage.created_at.asc()).all()
    for m in messages:
        # Don't add the current message to history as it hasn't been processed yet
        if m.id != new_user_msg.id:
            history.append({
                "role": m.role,
                "parts": [m.content]
            })
            
    # Call Gemini
    response_data = chat_with_candidate(history, user_message, resume.extracted_text)
    bot_reply = response_data.get("response", "Error generating response.")
    
    # Save model message
    new_model_msg = InterviewMessage(session_id=session.id, role="model", content=bot_reply)
    db.session.add(new_model_msg)
    db.session.commit()
    
    return jsonify({
        "message": "Message sent.",
        "reply": bot_reply
    }), 200
