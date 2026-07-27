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
        return jsonify({"message": "Incorrect password. Please try again."}), 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({"message": "Login successful", "token": token, "user": user.to_dict()}), 200
