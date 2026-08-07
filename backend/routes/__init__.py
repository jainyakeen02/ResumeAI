from .auth_routes import auth_bp
from .resume_routes import resume_bp
from .interview_routes import interview_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(interview_bp, url_prefix="/api/interview")