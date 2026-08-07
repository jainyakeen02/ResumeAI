from extensions import db
from datetime import datetime

class InterviewSession(db.Model):
    __tablename__ = 'interview_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey('resumes.id'), nullable=False)
    job_description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="active") # active, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with messages
    messages = db.relationship('InterviewMessage', backref='session', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "resume_id": self.resume_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "messages": [m.to_dict() for m in self.messages]
        }

class InterviewMessage(db.Model):
    __tablename__ = 'interview_messages'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('interview_sessions.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'user' or 'model'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
