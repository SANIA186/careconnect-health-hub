from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from database import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Bad Request", "message": "Email and password are required"}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Unauthorized", "message": "Invalid email or password"}), 401
        
    if not user.is_active:
        return jsonify({"error": "Forbidden", "message": "Account is disabled"}), 403
        
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, int(current_user_id))
    
    if not user:
        return jsonify({"error": "Not Found", "message": "User not found"}), 404
        
    return jsonify({
        "user": user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Successfully logged out"}), 200
