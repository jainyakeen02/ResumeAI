from app import create_app
from extensions import mail
from flask_mail import Message
import sys

app = create_app()
with app.app_context():
    print("MAIL_SERVER:", app.config.get("MAIL_SERVER"))
    print("MAIL_PORT:", app.config.get("MAIL_PORT"))
    print("MAIL_USE_TLS:", app.config.get("MAIL_USE_TLS"))
    print("MAIL_USERNAME:", app.config.get("MAIL_USERNAME"))
    print("MAIL_PASSWORD length:", len(app.config.get("MAIL_PASSWORD", "")))
    print("MAIL_DEFAULT_SENDER:", app.config.get("MAIL_DEFAULT_SENDER"))

    try:
        msg = Message(
            subject="Test OTP",
            recipients=["jainyakeen02@gmail.com"],
            body="Your test code is 123456",
            sender=app.config.get("MAIL_USERNAME")
        )
        mail.send(msg)
        print("SUCCESSFULLY SENT EMAIL VIA FLASK-MAIL!")
    except Exception as e:
        print("EXACT ERROR:", type(e).__name__, ":", str(e))
