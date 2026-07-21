import os
from flask import Flask
from flask_cors import CORS
from extensions import db
from config import Config
from routes import register_routes

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app)
    db.init_app(app)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register Blueprints/Routes
    register_routes(app)

    # Create tables on startup
    with app.app_context():
        import models.user
        import models.resume
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)