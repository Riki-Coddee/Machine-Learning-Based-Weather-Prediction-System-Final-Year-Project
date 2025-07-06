from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = 'rainfall_prediction_system'
USER_COLLECTION = 'users'

# MongoDB client setup
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db[USER_COLLECTION]

def init_user_data():
    """Initialize MongoDB collections (no-op as MongoDB creates collections automatically)"""
    # Create indexes
    users_collection.create_index('email', unique=True)
    logger.info("User collection indexes ensured")

def get_users():
    """Get all users from MongoDB"""
    try:
        users = list(users_collection.find({}, {
            'password': 0,  # Exclude password hash
            'failed_attempts': 0,
            'is_active': 0
        }))
        
        # Convert ObjectId to string and format the output
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

def delete_user(user_id):
    """Delete a user by ID from MongoDB"""
    try:
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count == 1:
            logger.info(f"Deleted user with ID: {user_id}")
            return True
        logger.warning(f"User not found with ID: {user_id}")
        return False
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise

def update_user_last_active(user_id):
    """Update a user's last active timestamp in MongoDB"""
    try:
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_active': datetime.utcnow()}}
        )
        return result.modified_count == 1
    except Exception as e:
        logger.error(f"Error updating last active time: {str(e)}")
        return False

def promote_to_admin(user_id):
    """Promote a user to admin role"""
    try:
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': 'admin'}}
        )
        return result.modified_count == 1
    except Exception as e:
        logger.error(f"Error promoting user to admin: {str(e)}")
        return False

def demote_from_admin(user_id):
    """Remove admin role from user"""
    try:
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': 'user'}}
        )
        return result.modified_count == 1
    except Exception as e:
        logger.error(f"Error demoting admin: {str(e)}")
        return False

def toggle_user_status(user_id):
    """Toggle user's active status"""
    try:
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        if not user:
            return False
            
        new_status = not user.get('is_active', True)
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'is_active': new_status}}
        )
        return result.modified_count == 1
    except Exception as e:
        logger.error(f"Error toggling user status: {str(e)}")
        return False
def update_user(user_id, update_data):
    """Update a user's information in MongoDB"""
    try:
        # Hash password if it's being updated
        if 'password' in update_data:
            update_data['password'] = generate_password_hash(update_data['password'])
        
        # Convert name to fullname for the database
        if 'name' in update_data:
            update_data['fullname'] = update_data.pop('name')
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            logger.warning(f"No user found with ID: {user_id} or no changes made")
            return False
            
        logger.info(f"Updated user with ID: {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise