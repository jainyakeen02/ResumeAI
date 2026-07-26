import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models.user import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!', 'code': 'token_missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found!', 'code': 'user_not_found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired! Please log in again.', 'code': 'token_expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'message': 'Token is invalid!', 'code': 'token_invalid', 'error': str(e)}), 401
        except Exception as e:
            return jsonify({'message': 'Authentication failed!', 'code': 'auth_failed', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

