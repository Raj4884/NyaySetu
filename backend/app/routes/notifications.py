from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app.models.user import User

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.objects(user=user_id).order_by('-created_at').limit(50)
    return jsonify([n.to_dict() for n in notifications]), 200

@notifications_bp.route('/<notif_id>/read', methods=['POST'])
@jwt_required()
def mark_as_read(notif_id):
    user_id = get_jwt_identity()
    notif = Notification.objects(id=notif_id, user=user_id).first()
    if not notif:
        return jsonify({'message': 'Notification not found'}), 404
        
    notif.read = True
    notif.save()
    return jsonify({'message': 'Success'}), 200

@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.objects(user=user_id, read=False).update(read=True)
    return jsonify({'message': 'Success'}), 200
