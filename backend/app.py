import os
from flask import Flask
from flask_cors import CORS

from extensions import db
from config import Config
from routes import register_routes


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    CORS(app)
    db.init_app(app)

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Register Routes
    register_routes(app)

    # Create Database Tables
    with app.app_context():
        import models.user
        import models.resume

        db.create_all()

    return app


# Gunicorn looks for this app object
app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)