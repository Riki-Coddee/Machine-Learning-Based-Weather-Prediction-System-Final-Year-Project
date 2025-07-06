from flask import Blueprint, request, jsonify
from auth_utils import (
    generate_token, token_required, add_user, verify_user, add_admin, verify_admin, admin_token_required,
    users_collection, is_admin, admins_collection, generate_admin_token, predictions_collection
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import logging
from datetime import datetime
import pytz

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


@auth_bp.route('/api/signup', methods=['POST'])
def register():
    try:
        data = request.get_json()
        required = ['fullname', 'email', 'password']
        
        # Validate required fields
        if not all(field in data for field in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Clean and validate email
        email = data['email'].strip().lower()
        if not '@' in email or '.' not in email.split('@')[1]:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password length
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Add user to MongoDB
        try:
            user_email = add_user(
                data['fullname'].strip(),
                email,
                data['password']
            )
            
            return jsonify({
                'message': 'User created successfully',
                'email': user_email
            }), 201
            
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Registration failed',
            'details': str(e)
        }), 500


@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        is_valid, error_msg, user_id= verify_user(email, password)
        if not is_valid:
            logger.warning(f"Failed login for {email}: {error_msg}")
            return jsonify({'error': error_msg}), 401

        user = users_collection.find_one(
            {'_id': ObjectId(user_id)},
            {'password': 0}  
        )
        if not user:
            return jsonify({'error': 'User not found'}), 404
        nepal_tz = pytz.timezone('Asia/Kathmandu')
        nepal_time = datetime.now(nepal_tz)
        # Update last_active timestamp
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_active': nepal_time}}
        )

        user = {id: user_id, email: email}
        token = generate_token({
            'id': user_id,
            'email': email
        })
        
        logger.info(f"Successful login for {email}")
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user_id,
                'email': email,
                'fullname': user.get('fullname', ''),
                'created_at':user.get('created_at', nepal_time),
                'last_active':user.get('last_active', nepal_time)
            }
        }), 200

    except Exception as e:
        logger.error(f"Login processing error: {str(e)}")
        return jsonify({'error': 'Login processing failed'}), 500
    
@auth_bp.route('/api/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    try:
        # Find user in MongoDB
        user = users_collection.find_one(
            {'email': current_user.get('email')},
            {'password': 0}  # Exclude password from results
        )
        user['_id'] = str(user['_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Token is valid',
            'id':user['_id'],
            'email': user.get('email', ''),
            'fullname': user.get('fullname', '')
        }), 200

    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        return jsonify({'error': 'Verification failed'}), 500
    
@auth_bp.route('/api/predictions', methods=['GET'])
@token_required
def get_user_predictions(current_user):
    """
    Retrieve all prediction records for the authenticated user,
    including a string 'id' for each document.
    """
    try:
        user_id = current_user['id']

        # Fetch all matching docs, include _id so we can re-map it
        cursor = predictions_collection.find(
            {'user_id': user_id},
            {'_id': 1, 'user_id': 1, 'timestamp': 1, 'area': 1,
             'prediction':1, 'risk_summary':1, 'precautions':1,
             'model_confidence':1, 'was_overridden':1,
             'weather_conditions':1}
        )

        predictions = []
        for doc in cursor:
            # Pull out the ObjectId and replace with a string 'id'
            doc['id'] = str(doc['_id'])
            del doc['_id']
            predictions.append(doc)

        return jsonify(predictions), 200

    except Exception as e:
        logger.error(f"Error fetching predictions for user {current_user}: {e}", exc_info=True)
        return jsonify({'error': 'Could not retrieve predictions'}), 500
    
@auth_bp.route('/api/predictions/<prediction_id>', methods=['DELETE'])
@token_required
def delete_prediction(current_user, prediction_id):
    """
    Delete a specific prediction record for the authenticated user
    """
    try:
        # Convert string ID to ObjectId
        try:
            obj_id = ObjectId(prediction_id)
        except Exception:
            return jsonify({'error': 'Invalid prediction ID format'}), 400

        # Delete the prediction if it belongs to the user
        result = predictions_collection.delete_one({
            '_id': obj_id,
            'user_id': current_user['id']
        })

        if result.deleted_count == 0:
            return jsonify({
                'error': 'Prediction not found or you do not have permission to delete it'
            }), 404

        return jsonify({
            'message': 'Prediction deleted successfully',
            'prediction_id': prediction_id
        }), 200

    except Exception as e:
        logger.error(f"Error deleting prediction: {str(e)}", exc_info=True)
        return jsonify({'error': 'Could not delete prediction'}), 500
    
@auth_bp.route('/api/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    """Get all users (admin only)"""
    try:
        # Check admin status
        if not is_admin(current_user['id']):
            return jsonify({'error': 'Admin access required'}), 403

        # Pagination parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        skip = (page - 1) * per_page

        # Search filter
        search = request.args.get('search', '').strip()
        query = {}
        if search:
            query['$or'] = [
                {'email': {'$regex': search, '$options': 'i'}},
                {'fullname': {'$regex': search, '$options': 'i'}}
            ]

        # Get users with pagination
        users_cursor = users_collection.find(
            query,
            {'password': 0, 'failed_attempts': 0}
        ).skip(skip).limit(per_page)

        total_users = users_collection.count_documents(query)
        users = list(users_cursor)

        # Convert ObjectId to string
        for user in users:
            user['_id'] = str(user['_id'])
            user['created_at'] = user.get('created_at', datetime.now()).isoformat()

        return jsonify({
            'users': users,
            'total': total_users,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_users + per_page - 1) // per_page
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}", exc_info=True)
        return jsonify({'error': 'Could not retrieve users'}), 500

@auth_bp.route('/api/admin/register', methods=['POST'])
def admin_register():
    try:
        data = request.get_json()
        required = ['fullname', 'email', 'password']
        
        # Validate required fields
        if not all(field in data for field in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Clean and validate email
        email = data['email'].strip().lower()
        if not '@' in email or '.' not in email.split('@')[1]:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password length
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Add user to MongoDB
        try:
            admin_email = add_admin(
                data['fullname'].strip(),
                email,
                data['password']
            )
            
            return jsonify({
                'message': 'Admin created successfully',
                'email': admin_email
            }), 201
            
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Registration failed',
            'details': str(e)
        }), 500
    
@auth_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        is_valid, error_msg, admin_id = verify_admin(email, password)
        if not is_valid:
            logger.warning(f"Failed login for {email}: {error_msg}")
            return jsonify({'error': error_msg}), 401
        # Get Nepal timezone and current time in Nepal
        nepal_tz = pytz.timezone('Asia/Kathmandu')
        nepal_time = datetime.now(nepal_tz)
        # Update last_active timestamp
        admins_collection.update_one(
            {'_id': ObjectId(admin_id)},
            {'$set': {'last_active': nepal_time}}
        )

        admin = admins_collection.find_one(
            {'_id': ObjectId(admin_id)},
            {'password': 0}  
        )
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404

        token = generate_admin_token({
            'id': admin_id,
            'email': email
        })
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'admin': {
                'id': admin_id,
                'email': email,
                'fullname': admin.get('fullname', ''),
                'last_active': nepal_time.isoformat()
            }
        }), 200

    except Exception as e:
        logger.error(f"Login processing error: {str(e)}")
        return jsonify({'error': 'Login processing failed'}), 500
    
@auth_bp.route('/api/admin/verify', methods=['GET'])
@admin_token_required
def verify_admin_token(current_admin):
    try:
        # Find user in MongoDB
        admin = admins_collection.find_one(
            {'email': current_admin.get('email')},
            {'password': 0}  # Exclude password from results
        )
        
        if not admin:
            return jsonify({'error': 'Admin not found'}), 404
        
        return jsonify({
            'message': 'Token is valid',
            'email': admin.get('email', ''),
            'fullname': admin.get('fullname', '')
        }), 200

    except Exception as e:
        logger.error(f"Verification failed: {str(e)}")
        return jsonify({'error': 'Verification failed'}), 500
@auth_bp.route('/api/update/password/<user_id>', methods=['PUT'])
@token_required
def update_user_password(current_user, user_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'currentPassword' not in data or 'newPassword' not in data:
            return jsonify({"error": "Current password and new password are required"}), 400
            
        # Get the user from database
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Verify current password
        if not check_password_hash(user['password'], data['currentPassword']):
            return jsonify({"error": "Current password is incorrect"}), 401
            
        # Validate new password
        if len(data['newPassword']) < 8:
            return jsonify({"error": "New password must be at least 8 characters"}), 400
            
        # Update password
        hashed_password = generate_password_hash(data['newPassword'])
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': hashed_password}}
        )
        
        # Log the password change
        logger.info(f"Password updated for user {user_id} by admin {current_user['id']}")
        
        return jsonify({"message": "Password updated successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        return jsonify({"error": "Failed to update password"}), 500
@auth_bp.route('/api/update/profile/<user_id>', methods=['PUT'])
@token_required
def update_user_profile(current_user, user_id):
    try:
        # Verify the requesting user matches the user being updated
        if current_user['id'] != user_id:
            return jsonify({"error": "You can only update your own profile"}), 403

        data = request.get_json()
        
        # Validate required fields
        if not data or 'email' not in data:
            return jsonify({"error": "Email is required"}), 400
            
        # Get the user from database
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Prepare update data
        update_data = {
            'email': data.get('email', user['email']).strip().lower(),
            'fullname': data.get('fullname', user.get('fullname', '')).strip(),
            'location': data.get('location', user.get('location', '')).strip()
        }
        
        # Validate email format
        if not ('@' in update_data['email'] and '.' in update_data['email'].split('@')[1]):
            return jsonify({"error": "Invalid email format"}), 400
            
        # Check if email is being changed to one that already exists
        if update_data['email'] != user['email']:
            existing_user = users_collection.find_one({'email': update_data['email']})
            if existing_user:
                return jsonify({"error": "Email already in use"}), 400

        # Update user profile
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        # Get updated user data (excluding password)
        updated_user = users_collection.find_one(
            {'_id': ObjectId(user_id)},
            {'password': 0}
        )
        
        # Convert ObjectId to string
        updated_user['_id'] = str(updated_user['_id'])
        
        # Log the profile update
        logger.info(f"Profile updated for user {user_id}")
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({"error": "Failed to update profile"}), 500
