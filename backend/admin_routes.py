from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from auth_utils import (
   admin_token_required
)
from werkzeug.utils import secure_filename
from bson import ObjectId
from datetime import datetime
import os
import logging
from pymongo import MongoClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = 'rainfall_prediction_system'
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
# Collections
users_collection = db['users']
admins_collection = db['admins']
predictions_collection = db['user_predictions']
news_collection = db['news']
feedback_collection = db['feedback']

# Configure upload settings for news images
UPLOAD_FOLDER = 'uploads/news'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

admin_bp = Blueprint('admin_bp', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper functions
def get_users():
    """Get all users from MongoDB"""
    try:
        users = list(users_collection.find({}, {
            'password': 0,
            'failed_attempts': 0,
            'is_active': 0
        }))
        
        formatted_users = []
        for user in users:
            formatted_user = {
                'id': str(user['_id']),
                'name': user.get('fullname', ''),
                'email': user['email'],
                'created_at': user.get('created_at', datetime.utcnow()).isoformat(),
                'last_active': user.get('last_active', '').isoformat() if user.get('last_active') else 'Never'
            }
            formatted_users.append(formatted_user)
        
        return formatted_users
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise
def get_admins():
    """Get all admins from MongoDB"""
    try:
        admins = list(admins_collection.find({}, {
            'password': 0,
        }))
        
        formatted_admins = []
        for admin in admins:
            formatted_admin = {
                'id': str(admin['_id']),
                'name': admin.get('fullname', ''),
                'email': admin['email'],
                'created_at': admin.get('created_at', datetime.utcnow()).isoformat(),
                'last_active': admin.get('last_active', '').isoformat() if admin.get('last_active') else 'Never'
            }
            formatted_admins.append(formatted_admin)
        
        return formatted_admins
    except Exception as e:
        logger.error(f"Error fetching admins: {str(e)}")
        raise

def delete_user(user_id):
    """Delete a user by ID from MongoDB"""
    try:
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        return result.deleted_count == 1
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise

# User Management Routes
@admin_bp.route('/api/fetch/users', methods=['GET'])
def fetch_users_route():
    try:
        users = get_users()
        return jsonify(users)
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"error": "Failed to fetch users"}), 500
@admin_bp.route('/api/fetch/admins', methods=['GET'])
def fetch_admin_route():
    print("Admin fetch route hit!")  # Add this
    try:                
        admins = get_admins()
        return jsonify(admins)
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"error": "Failed to fetch users"}), 500
@admin_bp.route('/api/delete/users/<user_id>', methods=['DELETE'])
def delete_user_route(user_id):
    try:
        success = delete_user(user_id)
        if success:
            return jsonify({"message": "User deleted successfully"})
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({"error": "Failed to delete user"}), 500

@admin_bp.route('/api/update/users/<user_id>', methods=['PUT'])
def update_user_route(user_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        update_data = {}
        
        if 'name' in data:
            update_data['fullname'] = data['name'].strip()
        if 'email' in data:
            update_data['email'] = data['email'].strip().lower()
        if 'role' in data:
            if data['role'] not in ['user', 'admin']:
                return jsonify({"error": "Invalid role"}), 400
            update_data['role'] = data['role']
        if 'password' in data and data['password']:
            update_data['password'] = generate_password_hash(data['password'])
        
        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400
            
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "User not found or no changes made"}), 404
            
        return jsonify({"message": "User updated successfully"})
        
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        return jsonify({"error": "Failed to update user"}), 500

# Prediction Management Routes
@admin_bp.route('/api/admin/predictions', methods=['GET'])
def get_user_predictions():
    try:
        predictions_cursor = predictions_collection.find(
            {},
            {'_id': 1, 'user_id': 1, 'timestamp': 1, 'area': 1,
             'prediction': 1, 'risk_summary': 1, 'precautions': 1,
             'model_confidence': 1, 'was_overridden': 1,
             'weather_conditions': 1}
        )
        user_ids = set()
        predictions = []
        for doc in predictions_cursor:
            user_ids.add(doc['user_id'])
            doc['id'] = str(doc['_id'])
            del doc['_id']
            predictions.append(doc)
        user_ids = [ObjectId(uid) for uid in user_ids]

        users_cursor = users_collection.find(
            {'_id': {'$in': user_ids}},
            {'_id': 1, 'fullname': 1, 'email': 1}
        )
        
        user_map = {str(user['_id']): user for user in users_cursor}
        
        combined_data = []
        for prediction in predictions:
            user_id_str = str(prediction['user_id'])
            user_data = user_map.get(user_id_str, {})
            
            combined_data.append({
                **prediction,
                'user': {
                    'id': user_id_str,
                    'name': user_data.get('fullname', 'Unknown'),
                    'email': user_data.get('email', '')
                }
            })
        return jsonify(combined_data), 200

    except Exception as e:
        logger.error(f"Error fetching predictions: {e}", exc_info=True)
        return jsonify({'error': 'Could not retrieve predictions'}), 500
    
@admin_bp.route('/api/admin/delete/predictions/<prediction_id>', methods=['DELETE'])
def delete_prediction_route(prediction_id):
    try:
        if not ObjectId.is_valid(prediction_id):
            return jsonify({'error': 'Invalid prediction ID'}), 400

        result = predictions_collection.delete_one({'_id': ObjectId(prediction_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Prediction not found'}), 404
            
        logger.info(f"Admin deleted prediction {prediction_id}")
        return jsonify({'message': 'Prediction deleted successfully'}), 200

    except Exception as e:
        logger.error(f"Error deleting prediction: {e}", exc_info=True)
        return jsonify({'error': 'Could not delete prediction'}), 500

# News Management Routes
@admin_bp.route('/api/admin/news', methods=['GET'])
def get_all_news():
    try:
        news_cursor = news_collection.find({})
        news_list = []
        for news in news_cursor:
            news['id'] = str(news['_id'])
            del news['_id']
            news_list.append(news)
        return jsonify(news_list), 200
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        return jsonify({"error": "Failed to fetch news"}), 500

@admin_bp.route('/api/admin/news', methods=['POST'])
def create_news():
    try:
        title = request.form.get('title')
        content = request.form.get('content')
        category = request.form.get('category')
        
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            news_item = {
                'title': title,
                'content': content,
                'category': category,
                'image': f"/{UPLOAD_FOLDER}/{filename}",
                'date': datetime.utcnow()
            }
            
            result = news_collection.insert_one(news_item)
            news_item['id'] = str(result.inserted_id)
            del news_item['_id']
            
            return jsonify(news_item), 201
        else:
            return jsonify({"error": "File type not allowed"}), 400
    except Exception as e:
        logger.error(f"Error creating news: {str(e)}")
        return jsonify({"error": "Failed to create news"}), 500

@admin_bp.route('/api/admin/news/<news_id>', methods=['PUT'])
def update_news(news_id):
    try:
        if not ObjectId.is_valid(news_id):
            return jsonify({"error": "Invalid news ID"}), 400
            
        existing_news = news_collection.find_one({'_id': ObjectId(news_id)})
        if not existing_news:
            return jsonify({"error": "News not found"}), 404
            
        update_data = {
            'title': request.form.get('title', existing_news.get('title')),
            'content': request.form.get('content', existing_news.get('content')),
            'category': request.form.get('category', existing_news.get('category')),
            'updated_at': datetime.utcnow()
        }
        
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '' and allowed_file(file.filename):
                if existing_news.get('image'):
                    try:
                        old_filepath = existing_news['image'].lstrip('/')
                        if os.path.exists(old_filepath):
                            os.remove(old_filepath)
                    except Exception as e:
                        logger.error(f"Error deleting old image: {str(e)}")
                
                filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                update_data['image'] = f"/{UPLOAD_FOLDER}/{filename}"
        
        result = news_collection.update_one(
            {'_id': ObjectId(news_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({"message": "No changes made"}), 200
            
        updated_news = news_collection.find_one({'_id': ObjectId(news_id)})
        updated_news['id'] = str(updated_news['_id'])
        del updated_news['_id']
        
        return jsonify(updated_news), 200
    except Exception as e:
        logger.error(f"Error updating news: {str(e)}")
        return jsonify({"error": "Failed to update news"}), 500

@admin_bp.route('/api/admin/news/<news_id>', methods=['DELETE'])
def delete_news(news_id):
    try:
        if not ObjectId.is_valid(news_id):
            return jsonify({"error": "Invalid news ID"}), 400
            
        news_to_delete = news_collection.find_one({'_id': ObjectId(news_id)})
        if not news_to_delete:
            return jsonify({"error": "News not found"}), 404
            
        if news_to_delete.get('image'):
            try:
                filepath = news_to_delete['image'].lstrip('/')
                if os.path.exists(filepath):
                    os.remove(filepath)
            except Exception as e:
                logger.error(f"Error deleting image file: {str(e)}")
        
        result = news_collection.delete_one({'_id': ObjectId(news_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "News not found"}), 404
            
        return jsonify({"message": "News deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting news: {str(e)}")
        return jsonify({"error": "Failed to delete news"}), 500

@admin_bp.route('/uploads/news/<filename>')
def serve_news_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@admin_bp.route('/api/admin/add/feedback', methods=['POST'])
def submit_feedback():
    """Endpoint to receive and store user feedback"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['name', 'email', 'message']):
            return jsonify({
                "success": False,
                "message": "Missing required fields (name, email, message)"
            }), 400
        
        # Create feedback document
        feedback = {
            'name': data['name'].strip(),
            'email': data['email'].strip().lower(),
            'message': data['message'].strip(),
            'created_at': datetime.utcnow(),
            'status': 'new',  # Can be 'new', 'reviewed', 'archived'
            'source': data.get('source', 'website')  # Track where feedback came from
        }
        
        # Insert into MongoDB
        result = feedback_collection.insert_one(feedback)
        
        return jsonify({
            "success": True,
            "message": "Feedback submitted successfully",
            "feedback_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to submit feedback"
        }), 500

@admin_bp.route('/api/admin/feedback', methods=['GET'])
def get_all_feedback():
    """Endpoint for admin to retrieve all feedback"""
    try:
        # Get query parameters for pagination/filtering
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        status = request.args.get('status', None)
        
        # Build query
        query = {}
        if status:
            query['status'] = status
        
        # Get total count for pagination
        total = feedback_collection.count_documents(query)
        
        # Get paginated results
        feedbacks = list(feedback_collection.find(query)
            .sort('created_at', -1)
            .skip((page - 1) * limit)
            .limit(limit))
        
        # Convert ObjectId to string and format dates
        formatted_feedbacks = []
        for fb in feedbacks:
            fb['id'] = str(fb['_id'])
            del fb['_id']
            fb['created_at'] = fb['created_at'].isoformat()
            formatted_feedbacks.append(fb)
        
        return jsonify({
            "success": True,
            "data": formatted_feedbacks,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching feedback: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to fetch feedback"
        }), 500

@admin_bp.route('/api/admin/feedback/<feedback_id>', methods=['PUT'])
def update_feedback_status(feedback_id):
    """Endpoint to update feedback status (admin only)"""
    try:
        if not ObjectId.is_valid(feedback_id):
            return jsonify({"error": "Invalid feedback ID"}), 400
            
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['new', 'reviewed', 'archived']:
            return jsonify({"error": "Invalid status value"}), 400
            
        result = feedback_collection.update_one(
            {'_id': ObjectId(feedback_id)},
            {'$set': {
                'status': new_status,
                'updated_at': datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Feedback not found"}), 404
            
        return jsonify({
            "success": True,
            "message": "Feedback status updated"
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating feedback: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Failed to update feedback"
        }), 500
@admin_bp.route('/api/admin/delete/feedback/<feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    try:
        if not ObjectId.is_valid(feedback_id):
            return jsonify({"success": False, "message": "Invalid feedback ID"}), 400
            
        result = feedback_collection.delete_one({'_id': ObjectId(feedback_id)})
        
        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Feedback not found"}), 404
            
        return jsonify({
            "success": True, 
            "message": "Feedback deleted successfully"
        }), 200
    except Exception as e:
        logger.error(f"Error deleting feedback: {str(e)}")
        return jsonify({
            "success": False, 
            "message": "Failed to delete feedback"
        }), 500
@admin_bp.route('/api/admin/update/<admin_id>', methods=['PUT'])
@admin_token_required
def update_admin(current_admin, admin_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate admin_id format
        try:
            admin_obj_id = ObjectId(admin_id)
        except:
            return jsonify({'error': 'Invalid admin ID format'}), 400

        # Verify the admin is trying to update their own account
        if str(current_admin['id']) != admin_id:
            return jsonify({'error': 'You can only update your own account'}), 403

        # Check if the admin exists
        existing_admin = admins_collection.find_one({'_id': admin_obj_id})
        if not existing_admin:
            return jsonify({'error': 'Admin not found'}), 404

        # Prepare update data
        update_data = {}
        
        # Update fullname if provided
        if 'name' in data and data['name'].strip():
            update_data['fullname'] = data['name'].strip()

        # Update email if provided and valid
        if 'email' in data and data['email'].strip():
            email = data['email'].strip().lower()
            if not '@' in email or '.' not in email.split('@')[1]:
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Check if email is already in use by another admin
            if email != existing_admin.get('email', ''):
                if admins_collection.find_one({'email': email, '_id': {'$ne': admin_obj_id}}):
                    return jsonify({'error': 'Email already in use'}), 400
            
            update_data['email'] = email

        # Update password if provided and valid
        if 'password' in data and data['password']:
            if len(data['password']) < 8:
                return jsonify({'error': 'Password must be at least 8 characters'}), 400
            # In production, you would hash the password here
            update_data['password'] = generate_password_hash(data['password'])

        # If no valid fields to update
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Perform the update
        result = admins_collection.update_one(
            {'_id': admin_obj_id},
            {'$set': update_data}
        )

        if result.modified_count == 0:
            return jsonify({'message': 'No changes made to admin data'}), 200

        # Get updated admin data
        updated_admin = admins_collection.find_one(
            {'_id': admin_obj_id},
            {'password': 0}  # Exclude password from response
        )

        # Convert ObjectId to string for JSON response
        updated_admin['_id'] = str(updated_admin['_id'])

        return jsonify({
            'message': 'Admin updated successfully',
            'admin': updated_admin
        }), 200

    except Exception as e:
        logger.error(f"Error updating admin: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to update admin'}), 500
@admin_bp.route('/api/admin/news/<news_id>', methods=['GET'])
def get_single_news(news_id):
    try:
        if not ObjectId.is_valid(news_id):
            return jsonify({"error": "Invalid news ID format"}), 400
            
        news_item = news_collection.find_one({'_id': ObjectId(news_id)})
        if not news_item:
            return jsonify({"error": "News article not found"}), 404
            
        # Convert ObjectId to string and format the response
        news_item['id'] = str(news_item['_id'])
        del news_item['_id']
        
        # Format date if it exists
        if 'date' in news_item and isinstance(news_item['date'], datetime):
            news_item['date'] = news_item['date'].isoformat()
            
        return jsonify(news_item), 200
        
    except Exception as e:
        logger.error(f"Error fetching single news article: {str(e)}")
        return jsonify({"error": "Failed to fetch news article"}), 500
@admin_bp.route('/api/admin/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    try:
        # Get counts from all collections
        stats = {
            'total_users': users_collection.count_documents({}),
            'total_admins': admins_collection.count_documents({}),
            'total_predictions': predictions_collection.count_documents({}),
            'today_predictions': predictions_collection.count_documents({
                'timestamp': {
                    '$gte': datetime.combine(datetime.today(), datetime.min.time())
                }
            }),
            'total_news': news_collection.count_documents({}),
            'total_feedback': feedback_collection.count_documents({}),
            'new_feedback': feedback_collection.count_documents({'status': 'new'}),
            'system_accuracy': 86  # This would come from your ML model metrics
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard statistics'}), 500