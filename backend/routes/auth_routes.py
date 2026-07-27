from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from extensions import db
from models.user import User

auth_bp = Blueprint("auth", __name__)

# ══════════════════════════════════════════════════════════════════
#  REGISTER
# ══════════════════════════════════════════════════════════════════

@auth_bp.route("/register", methods=["POST"])
def register():
    """Direct registration without OTP."""
    data = request.get_json()
    if not data or not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Username, email, and password are required."}), 400

    email = data["email"].strip().lower()
    username = data["username"].strip()

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with this email address already exists."}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username is already taken."}), 409

    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(data["password"])
    )
    db.session.add(new_user)
    db.session.commit()

    # Generate login token for auto-login after register
    token = jwt.encode(
        {
            "user_id": new_user.id,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({
        "message": "Account created successfully!",
        "token": token,
        "user": new_user.to_dict()
    }), 201


# ══════════════════════════════════════════════════════════════════
#  LOGIN
# ══════════════════════════════════════════════════════════════════

@auth_bp.route("/login", methods=["POST"])
def login():
    """Login with strict email existence check."""
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required."}), 400

    email = data["email"].strip().lower()
    user = User.query.filter_by(email=email).first()

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
#  FORGOT PASSWORD / RESET PASSWORD
# ══════════════════════════════════════════════════════════════════

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Verify registered email and issue a reset token."""
    data = request.get_json()
    if not data or not data.get("email"):
        return jsonify({"message": "Email address is required."}), 400

    email = data["email"].strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "No account exists with this email address."}), 404

    reset_token = jwt.encode(
        {
            "user_id": user.id,
            "email": email,
            "type": "password_reset",
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({
        "message": "Email verified! Proceed to set your new password.",
        "reset_token": reset_token,
        "email": email
    }), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Set new password using verified reset token."""
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
        return jsonify({"message": "Reset session has expired. Please try again."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid reset token."}), 400
