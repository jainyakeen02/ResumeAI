from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import random
import string
from extensions import db, mail
from models.user import User
from flask_mail import Message

auth_bp = Blueprint("auth", __name__)

# ─── In-memory OTP store ───────────────────────────────────────────
# Structure: { email: { otp: "123456", expires_at: datetime, purpose: "register"|"reset" } }
_otp_store: dict = {}


def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the given length."""
    return ''.join(random.choices(string.digits, k=length))


def _send_otp_email(to_email: str, otp: str, purpose: str):
    """Send OTP email via Flask-Mail. Raises on SMTP failure."""
    if purpose == "register":
        subject = "ResumeAI – Verify Your Email Address"
        body = f"""Hello,

Your ResumeAI email verification code is:

    ➤  {otp}

This code expires in 10 minutes. Do not share it with anyone.

If you didn't create a ResumeAI account, ignore this email.

— The ResumeAI Team
"""
    else:  # reset
        subject = "ResumeAI – Password Reset Code"
        body = f"""Hello,

Your ResumeAI password reset code is:

    ➤  {otp}

This code expires in 10 minutes. Do not share it with anyone.

If you didn't request a password reset, ignore this email.

— The ResumeAI Team
"""
    msg = Message(subject=subject, recipients=[to_email], body=body)
    mail.send(msg)


def _store_otp(email: str, otp: str, purpose: str):
    """Store OTP with 10-minute expiry."""
    _otp_store[email.lower()] = {
        "otp": otp,
        "purpose": purpose,
        "expires_at": datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
    }


def _verify_otp(email: str, otp: str, purpose: str) -> tuple[bool, str]:
    """
    Returns (True, "") on success.
    Returns (False, reason_string) on failure.
    """
    email = email.lower()
    entry = _otp_store.get(email)
    if not entry:
        return False, "No OTP was sent to this email address. Please request a new code."
    if entry["purpose"] != purpose:
        return False, "Invalid OTP purpose."
    if datetime.datetime.utcnow() > entry["expires_at"]:
        _otp_store.pop(email, None)
        return False, "OTP has expired. Please request a new code."
    if entry["otp"] != otp.strip():
        return False, "Incorrect OTP. Please try again."
    # OTP valid — consume it
    _otp_store.pop(email, None)
    return True, ""


# ══════════════════════════════════════════════════════════════════
#  REGISTRATION FLOW
# ══════════════════════════════════════════════════════════════════

@auth_bp.route("/send-register-otp", methods=["POST"])
def send_register_otp():
    """Step 1 of registration: validate fields & send OTP to email."""
    data = request.get_json()
    if not data or not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Username, email, and password are required."}), 400

    email    = data["email"].strip().lower()
    username = data["username"].strip()

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with this email already exists."}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username is already taken."}), 409

    otp = _generate_otp()
    _store_otp(email, otp, "register")

    try:
        _send_otp_email(email, otp, "register")
    except Exception as e:
        current_app.logger.error(f"Mail send error: {e}")
        return jsonify({
            "message": "Failed to send verification email. Check that your MAIL_USERNAME and MAIL_PASSWORD are set in the backend .env file."
        }), 500

    return jsonify({"message": f"Verification code sent to {email}. It expires in 10 minutes."}), 200


@auth_bp.route("/verify-register-otp", methods=["POST"])
def verify_register_otp():
    """Step 2 of registration: verify OTP and create account."""
    data = request.get_json()
    if not data or not data.get("email") or not data.get("otp") or not data.get("username") or not data.get("password"):
        return jsonify({"message": "Email, OTP, username, and password are required."}), 400

    email    = data["email"].strip().lower()
    username = data["username"].strip()
    otp      = data["otp"].strip()
    password = data["password"]

    ok, reason = _verify_otp(email, otp, "register")
    if not ok:
        return jsonify({"message": reason}), 400

    # Double-check uniqueness (race condition guard)
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with this email already exists."}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username is already taken."}), 409

    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Email verified! Account created successfully.", "user": new_user.to_dict()}), 201


# ══════════════════════════════════════════════════════════════════
#  LOGIN
# ══════════════════════════════════════════════════════════════════

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required."}), 400

    email = data["email"].strip().lower()
    user  = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "No account exists with this email address. Please register first."}), 404

    if not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"message": "Incorrect password. Please try again or reset your password."}), 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({"message": "Login successful", "token": token, "user": user.to_dict()}), 200


# ══════════════════════════════════════════════════════════════════
#  PASSWORD RESET FLOW
# ══════════════════════════════════════════════════════════════════

@auth_bp.route("/send-reset-otp", methods=["POST"])
def send_reset_otp():
    """Step 1 of password reset: verify email exists, send OTP."""
    data = request.get_json()
    if not data or not data.get("email"):
        return jsonify({"message": "Email address is required."}), 400

    email = data["email"].strip().lower()
    user  = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "No account exists with this email address."}), 404

    otp = _generate_otp()
    _store_otp(email, otp, "reset")

    try:
        _send_otp_email(email, otp, "reset")
    except Exception as e:
        current_app.logger.error(f"Mail send error: {e}")
        return jsonify({
            "message": "Failed to send reset email. Check that your MAIL_USERNAME and MAIL_PASSWORD are set in the backend .env file."
        }), 500

    return jsonify({"message": f"Password reset code sent to {email}. It expires in 10 minutes."}), 200


@auth_bp.route("/verify-reset-otp", methods=["POST"])
def verify_reset_otp():
    """Step 2: verify OTP and return a short-lived reset token."""
    data = request.get_json()
    if not data or not data.get("email") or not data.get("otp"):
        return jsonify({"message": "Email and OTP are required."}), 400

    email = data["email"].strip().lower()
    otp   = data["otp"].strip()

    ok, reason = _verify_otp(email, otp, "reset")
    if not ok:
        return jsonify({"message": reason}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found."}), 404

    reset_token = jwt.encode(
        {
            "user_id": user.id,
            "email": email,
            "type": "password_reset",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({"message": "OTP verified.", "reset_token": reset_token, "email": email}), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Step 3: set new password using the verified reset token."""
    data = request.get_json()
    if not data or not data.get("reset_token") or not data.get("new_password"):
        return jsonify({"message": "Reset token and new password are required."}), 400

    try:
        payload = jwt.decode(
            data["reset_token"], current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
        if payload.get("type") != "password_reset":
            return jsonify({"message": "Invalid reset token."}), 400

        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"message": "User no longer exists."}), 404

        user.password_hash = generate_password_hash(data["new_password"])
        db.session.commit()

        return jsonify({"message": "Password updated successfully! You can now log in."}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Reset token has expired. Please start over."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid reset token."}), 400


# Keep old /register route for compatibility but redirect to OTP flow
@auth_bp.route("/register", methods=["POST"])
def register():
    """Legacy endpoint — now routes through OTP verification."""
    return jsonify({
        "message": "Please use /auth/send-register-otp to begin registration with email verification.",
        "use_otp": True
    }), 400
