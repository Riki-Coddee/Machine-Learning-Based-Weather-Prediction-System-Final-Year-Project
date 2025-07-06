from pymongo import MongoClient, ReturnDocument
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from flask import request, jsonify
from datetime import datetime, timedelta
import logging
import os
from datetime import datetime, timezone
from bson import ObjectId

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = 'rainfall_prediction_system'
USER_COLLECTION = 'users'
LOCKOUT_COLLECTION = 'auth_lockouts'
PREDICTION_COLLECTION = 'user_predictions'
ADMIN_COLLECTION = 'admins'

# JWT configuration
SECRET_KEY = os.environ.get('SECRET_KEY') or "your-secret-key-here"
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB client setup
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db[USER_COLLECTION]
admins_collection = db[ADMIN_COLLECTION]
lockouts_collection = db[LOCKOUT_COLLECTION]
predictions_collection = db[PREDICTION_COLLECTION]

# Create indexes
users_collection.create_index('email', unique=True)
lockouts_collection.create_index('email', unique=True)
lockouts_collection.create_index('locked_until', expireAfterSeconds=0)
admins_collection.create_index('email', unique=True)

def init_user_accounts():
    """Initialize MongoDB collections (no-op as MongoDB creates collections automatically)"""
    pass

def user_exists(email):
    """Check if user exists in MongoDB"""
    return bool(users_collection.count_documents({'email': email.lower()}))

def admin_exists(email):
    """Check if admin exists in MongoDB"""
    return bool(admins_collection.count_documents({'email': email.lower()}))

def add_user(fullname, email, password):
    """Add new user to MongoDB with proper validation"""
    email = email.strip().lower()
    
    if user_exists(email):
        raise ValueError("User already exists")
    
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    hashed_pw = generate_password_hash(password)
    
    user_data = {
        'fullname': fullname.strip(),
        'email': email,
        'password': hashed_pw,
        'created_at': datetime.utcnow(),
        'failed_attempts': 0,
        'is_active': True
    }
    
    result = users_collection.insert_one(user_data)
    if not result.inserted_id:
        raise ValueError("Failed to create user")
    
    return email

def verify_user(email, password):
    """Verify user credentials against MongoDB and return user ID if successful"""
    try:
        user = users_collection.find_one({'email': email.lower()})
        
        if not user:
            logger.warning(f"User not found: {email}")
            return False, "User not found", None
        
        if not user.get('is_active', True):
            return False, "Account is disabled", None
        
        if not check_password_hash(user['password'], password):
            # Increment failed attempts
            users_collection.update_one(
                {'email': email.lower()},
                {'$inc': {'failed_attempts': 1}}
            )
            return False, "Invalid password", None
        
        # Reset failed attempts on successful login
        users_collection.update_one(
            {'email': email.lower()},
            {'$set': {'failed_attempts': 0}}
        )
        
        return True, None, str(user['_id'])  # Return user ID as string
        
    except Exception as e:
        logger.error(f"Verification error: {str(e)}", exc_info=True)
        return False, "Authentication error", None
def is_locked_out(email):
    """Check if user is currently locked out"""
    lockout = lockouts_collection.find_one({'email': email.lower()})
    if lockout:
        if datetime.utcnow() < lockout['locked_until']:
            return True
        else:
            # Lockout period has expired
            remove_lockout(email)
            return False
    return False

def lock_user(email):
    """Lock user account for specified duration"""
    lock_time = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
    
    lockouts_collection.update_one(
        {'email': email.lower()},
        {'$set': {
            'email': email.lower(),
            'locked_until': lock_time
        }},
        upsert=True
    )

def remove_lockout(email):
    """Remove lockout for user"""
    lockouts_collection.delete_one({'email': email.lower()})

def generate_token(user_data):
    """Generate JWT token with user data"""
    try:
        payload = {
            'sub': user_data['email'],  # Subject is email
            'user_id': user_data['id'],  # Include user ID
            'exp': datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Token generation failed: {str(e)}")
        raise ValueError("Could not generate token")

def token_required(f):
    """Decorator for routes that require valid JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
        
        if not token:
            logger.error("No token provided")
            return jsonify({'error': 'Authentication required'}), 401
            
        try:
            # Decode token
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
                options={'require_exp': True}
            )
            
            # Verify user still exists and is active
            user = users_collection.find_one({
                '_id': ObjectId(payload['user_id']),
                'email': payload['sub']
            })
            
            if not user or not user.get('is_active', True):
                raise jwt.InvalidTokenError("User no longer exists or is inactive")
                
            # Pass user_id and email to the route
            return f({
                'id': str(user['_id']),
                'email': user['email']
            }, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            logger.warning("Expired token")
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return jsonify({'error': 'Token verification failed'}), 401
            
    return decorated
def add_admin(fullname, email, password):
    """Add new admin to MongoDB with proper validation"""
    email = email.strip().lower()
    
    if admin_exists(email):
        raise ValueError("Admin already exists")
    
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    hashed_pw = generate_password_hash(password)
    
    admin_data = {
        'fullname': fullname.strip(),
        'email': email,
        'password': hashed_pw,
        'created_at': datetime.utcnow(),
        'failed_attempts': 0,
        'is_active': True
    }
    
    result = admins_collection.insert_one(admin_data)
    if not result.inserted_id:
        raise ValueError("Failed to create user")
    
    return email

def is_admin(user_id):
    """Check if user has admin role"""
    try:
        user = users_collection.find_one(
            {'_id': ObjectId(user_id)},
            {'role': 1}  # Only fetch the role field
        )
        return user and user.get('role') == 'admin'
    except Exception as e:
        logger.error(f"Error checking admin status: {str(e)}")
        return False
def store_user_prediction(user, prediction_data):
    """Store or update user prediction in MongoDB, ensuring one prediction per user/area/day"""
    try:
        # Get current UTC datetime
        now = datetime.utcnow()
        
        # Calculate start and end of current day in UTC
        start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        end_of_day = start_of_day + timedelta(days=1)
        
        # Create the prediction record
        prediction_record = {
            'user_id': user['id'],
            'timestamp': now,
            'area': prediction_data.get('area', 'unknown'),
            'prediction': prediction_data.get('prediction', {}),
            'risk_summary': prediction_data.get('risk_summary', ''),
            'precautions': prediction_data.get('precautions', []),
            'model_confidence': prediction_data.get('model_confidence', 0),
            'was_overridden': prediction_data.get('was_overridden', False),
            'weather_conditions': {
                'humidity': prediction_data.get('humidity', 0),
                'pressure': prediction_data.get('pressure', 0),
                'temperature': prediction_data.get('temperature', 0),
                'cloud_cover': prediction_data.get('cloud_cover', 0)
            }
        }
        
        # Create a unique key for today's prediction in this area
        query = {
            'user_id': user['id'],
            'area': prediction_record['area'],
            'timestamp': {
                '$gte': start_of_day,
                '$lt': end_of_day
            }
        }
        
        # Perform upsert operation
        result = predictions_collection.update_one(
            query,
            {'$set': prediction_record},
            upsert=True
        )
        
        # Log the operation
        if result.upserted_id:
            logger.info(f"Inserted new prediction for user {user['id']} in area {prediction_record['area']}")
        else:
            logger.info(f"Updated existing prediction for user {user['id']} in area {prediction_record['area']}")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to store prediction: {str(e)}")
        return False
        
def verify_admin(email, password):
    """Verify admin credentials against MongoDB and return user ID if successful"""
    try:
        admin = admins_collection.find_one({'email': email.lower()})
        
        if not admin:
            logger.warning(f"Admin not found: {email}")
            return False, "Admin not found", None
        
        if not check_password_hash(admin['password'], password):
            # Increment failed attempts
            admins_collection.update_one(
                {'email': email.lower()},
                {'$inc': {'failed_attempts': 1}}
            )
            return False, "Invalid password", None
        
        # Reset failed attempts on successful login
        admins_collection.update_one(
            {'email': email.lower()},
            {'$set': {'failed_attempts': 0}}
        )
        
        return True, None, str(admin['_id'])  # Return user ID as string
        
    except Exception as e:
        logger.error(f"Verification error: {str(e)}", exc_info=True)
        return False, "Authentication error", None
    
def admin_token_required(f):
    """Decorator for routes that require valid JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
        
        if not token:
            logger.error("No token provided")
            return jsonify({'error': 'Authentication required'}), 401
            
        try:
            # Decode token
            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
                options={'require_exp': True}
            )
            
            
            admin = admins_collection.find_one({
                '_id': ObjectId(payload['admin_id']),
                'email': payload['sub']
            })
            if not admin :
                raise jwt.InvalidTokenError("Admin no longer exists or is inactive")
            return f({
            'id': str(admin['_id']),
            'email': admin['email']
            }, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            logger.warning("Expired token")
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return jsonify({'error': 'Token verification failed'}), 401
            
    return decorated
def generate_admin_token(admin_data):
    """Generate JWT token with user data"""
    try:
        payload = {
            'sub': admin_data['email'],  # Subject is email
            'admin_id': admin_data['id'],  # Include user ID
            'exp': datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Token generation failed: {str(e)}")
        raise ValueError("Could not generate token")
