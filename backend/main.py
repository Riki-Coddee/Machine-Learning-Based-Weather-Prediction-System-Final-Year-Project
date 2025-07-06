from flask import Flask, request, jsonify
import joblib
import pandas as pd
import flask_cors
from sklearn.preprocessing import StandardScaler
import os
import logging
from functools import lru_cache
from datetime import datetime, timedelta
from auth_routes import auth_bp
from auth_utils import token_required, store_user_prediction
from auth_routes import token_required
from admin_routes import admin_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
flask_cors.CORS(app)
# Setup authentication routes
app.register_blueprint(auth_bp) 
app.register_blueprint(admin_bp)
# Global variables for models and data
model = None
scaler = None
historical_df = None

def load_models():
    """Load ML models with error handling"""
    global model, scaler
    try:
        if os.path.exists('best_rainfall_model.pkl'):
            model = joblib.load('best_rainfall_model.pkl')
            logger.info("Model loaded successfully")
        else:
            logger.error("Model file not found. Please run prediction.py first.")
            return False
            
        if os.path.exists('scaler.pkl'):
            scaler = joblib.load('scaler.pkl')
            logger.info("Scaler loaded successfully")
        else:
            logger.warning("Scaler file not found. Creating new scaler.")
            scaler = StandardScaler()
        return True
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        return False

def load_historical_data():
    """Load historical data with error handling"""
    global historical_df
    try:
        if os.path.exists('historical_weather_data.csv'):
            historical_df = pd.read_csv('historical_weather_data.csv')
            logger.info(f"Historical data loaded: {len(historical_df)} records")
        else:
            logger.warning("Historical data file not found. Please run historical_data.py first.")
            historical_df = pd.DataFrame()  # Empty dataframe
    except Exception as e:
        logger.error(f"Error loading historical data: {str(e)}")
        historical_df = pd.DataFrame()

# Initialize models and data
models_loaded = load_models()
load_historical_data()

# Constants
BASE_FIELDS = [
    'Temperature(C)', 'Humidity(%)', 'Pressure(hPa)', 'WindSpeed(km/h)',
    'CloudCover(%)', 'Visibility(km)', 'DewPoint(C)', 'UVIndex',
    'SolarRadiation(W/m²)', 'WindDirection(°)', 'PrecipitationLastHour(mm)', 
    'SoilMoisture(%)', 'EvaporationRate(mm/day)', 'FeelsLikeTemp(C)', 
    'TempChange1h(C)', 'WindGust(km/h)', 'PressureTendency(hPa/3h)'
]

ENGINEERED_FIELDS = [
    'HumidityPressureRatio',
    'TempDewDiff',
    'WindGustRatio',
    'HumidityCloudRatio',  # Added
    'CloudPressureIndex'   # Added
]

REQUIRED_FIELDS = BASE_FIELDS + ENGINEERED_FIELDS

# Risk thresholds
RISK_THRESHOLDS = {
    'high_humidity': 80,
    'low_pressure': 1005,
    'dense_cloud': 70,  # Changed from 70 to be more sensitive
    'very_dense_cloud': 90,
    'strong_wind': 10,
    'very_high_temp': 35,
    'very_low_temp': 5
}

@lru_cache(maxsize=128)
def get_risk_summary_cached(humidity, pressure, cloud_cover, wind_speed, temperature):
    """Cached risk summary calculation for better performance"""
    desc = []
    if humidity > RISK_THRESHOLDS['high_humidity']:
        desc.append("high humidity")
    if pressure < RISK_THRESHOLDS['low_pressure']:
        desc.append("low pressure")
    if cloud_cover > RISK_THRESHOLDS['very_dense_cloud']:
        desc.append("very dense cloud cover")
    elif cloud_cover > RISK_THRESHOLDS['dense_cloud']:
        desc.append("dense cloud cover")
    if wind_speed > RISK_THRESHOLDS['strong_wind']:
        desc.append("strong wind")
    if temperature > RISK_THRESHOLDS['very_high_temp']:
        desc.append("very high temperature")
    elif temperature < RISK_THRESHOLDS['very_low_temp']:
        desc.append("very low temperature")
    return ", ".join(desc) if desc else "normal conditions"

def summarize_risk_factors(data):
    """Risk summarizer using cached function"""
    return get_risk_summary_cached(
        data['Humidity(%)'], data['Pressure(hPa)'], data['CloudCover(%)'],
        data['WindSpeed(km/h)'], data['Temperature(C)']
    )

@lru_cache(maxsize=64)
def get_precautions_cached(summary):
    """Cached precautions generator"""
    precautions = []
    if "high humidity" in summary:
        precautions.append("Wear breathable clothes")
    if "low pressure" in summary:
        precautions.append("Carry an umbrella")
    if "dense cloud cover" in summary:
        precautions.append("Be prepared for poor visibility")
    if "strong wind" in summary:
        precautions.append("Secure loose objects outdoors")
    if "very high temperature" in summary:
        precautions.append("Stay hydrated and avoid sun exposure")
    if "very low temperature" in summary:
        precautions.append("Wear warm clothing and stay indoors if possible")
    if not precautions:
        precautions.append("No special precautions needed")
    return tuple(precautions)  # Return tuple for caching

def generate_precautions(summary):
    """Generate precautions using cached function"""
    return list(get_precautions_cached(summary))

def validate_input(data):
    """Input validation"""
    if not isinstance(data, dict):
        return "Invalid input format: expected JSON object", 400
    
    missing_fields = [field for field in BASE_FIELDS if field not in data]
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}", 400
    
    # Validate numeric values efficiently
    for field in BASE_FIELDS:
        try:
            value = float(data[field])
            # Basic range validation
            if field == 'Humidity(%)' and not (0 <= value <= 100):
                return f"Invalid {field}: must be between 0-100", 400
            elif field == 'CloudCover(%)' and not (0 <= value <= 100):
                return f"Invalid {field}: must be between 0-100", 400
            elif field == 'WindDirection(°)' and not (0 <= value <= 360):
                return f"Invalid {field}: must be between 0-360", 400
        except (ValueError, TypeError):
            return f"Invalid value for {field}: must be numeric", 400
    
    return None, None

def engineer_features(input_data):
    """Create engineered features from raw input data"""
    engineered = {}
    
    # Calculate Humidity to Pressure Ratio
    engineered['HumidityPressureRatio'] = input_data['Humidity(%)'] / input_data['Pressure(hPa)']
    
    # Calculate Temperature-Dew Point Difference
    engineered['TempDewDiff'] = input_data['Temperature(C)'] - input_data['DewPoint(C)']
    
    # Calculate Wind Gust Ratio (with protection against division by zero)
    wind_speed = input_data['WindSpeed(km/h)']
    engineered['WindGustRatio'] = input_data['WindGust(km/h)'] / (wind_speed + 0.001 if wind_speed == 0 else wind_speed)
    
    # Add new cloud-related features
    engineered['HumidityCloudRatio'] = input_data['Humidity(%)'] * (input_data['CloudCover(%)'] / 100)
    engineered['CloudPressureIndex'] = input_data['CloudCover(%)'] * (1015 - input_data['Pressure(hPa)'])
    
    return engineered
      
@app.route('/predict', methods=['POST'])
@token_required  # Add this decorator to require authentication
def predict(user):
    if not models_loaded:
        return jsonify({"error": "Models not loaded"}), 503
    
    try:
        data = request.get_json()
        error_message, error_code = validate_input(data)
        if error_message:
            return jsonify({"error": error_message}), error_code

        engineered_features = engineer_features(data)
        
        all_features = {**data, **engineered_features}
        
        input_df = pd.DataFrame([[all_features[field] for field in REQUIRED_FIELDS]], 
                              columns=REQUIRED_FIELDS)
        input_scaled = scaler.transform(input_df)
        input_scaled = pd.DataFrame(input_scaled, columns=REQUIRED_FIELDS)
        
        proba = model.predict_proba(input_scaled)[0][1]
        threshold = joblib.load('threshold.pkl')
        model_prediction = "Yes" if proba >= threshold else "No"
        confidence = max(proba, 1-proba)
        
        final_prediction = apply_business_rules(data, model_prediction)

        summary = summarize_risk_factors(data)
        precautions = generate_precautions(summary)

        prediction_data = {
            'area': data.get('Area') or "unknown",  # You might want to add area to your request
            'prediction': {
                'model_prediction': model_prediction,
                'final_prediction': final_prediction
            },
            'risk_summary': summary,
            'precautions': precautions,
            'model_confidence': confidence,
            'was_overridden': final_prediction != model_prediction,
            'humidity': data['Humidity(%)'],
            'pressure': data['Pressure(hPa)'],
            'temperature': data['Temperature(C)'],
            'cloud_cover': data['CloudCover(%)']
        }
        
        store_user_prediction(user, prediction_data)

        return jsonify({
            "RainfallPrediction": final_prediction,
            "ModelPrediction": model_prediction,  # Keep original for reference
            "WasOverridden": final_prediction != model_prediction,
            "Confidence": f"{confidence:.1%}",
            "RiskSummary": summary,
            "Precautions": precautions
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# In main.py, modify the apply_business_rules function:
def apply_business_rules(data, model_prediction):
    """Apply domain knowledge rules that override model in clear cases"""
    # Strong indicators of rain (override any model prediction)
    if (data['Humidity(%)'] > 85 and 
        data['CloudCover(%)'] > 70 and  # Changed from 70 to be more strict
        data['Pressure(hPa)'] < 1005):
        return "Yes"
    
    # Strong indicators of no rain (override any model prediction)
    elif (data['Humidity(%)'] < 40 and 
          data['CloudCover(%)'] < 10 and  # Changed from 20 to be more strict
          data['Pressure(hPa)'] > 1015):
        return "No"
    
    # Additional rule based primarily on cloud cover
    elif data['CloudCover(%)'] > 90:  # Very dense cloud cover
        return "Yes"
    elif data['CloudCover(%)'] < 10:  # Very clear skies
        return "No"
    
    # Keep model prediction in ambiguous cases
    return model_prediction

@app.route('/historical-trends/<area>', methods=['GET'])
def get_historical_trends(area):
    """Historical trends endpoint (GET) - Existing functionality"""
    if historical_df.empty:
        return jsonify({'error': 'Historical data not available. Please run historical_data.py first.'}), 503
    
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        print(f"Received request with start_date: {start_date}, end_date: {end_date}")
        if not area:
            return jsonify({'error': 'Area parameter is required'}), 400

        # Case-insensitive area filtering
        area_df = historical_df[historical_df['Area'].str.lower() == area.lower()]

        if area_df.empty:
            available_areas = historical_df['Area'].unique().tolist()
            return jsonify({
                'error': f'Area "{area}" not found',
                'available_areas': available_areas
            }), 404

        # Apply date filters
        if start_date:
            area_df = area_df[area_df['Date'] >= start_date]
        if end_date:
            area_df = area_df[area_df['Date'] <= end_date]

        # Optimize data extraction
        trend_data = area_df.sort_values('Date')[['Date', 'Rainfall(mm)']].to_dict(orient='records')

        return jsonify({
            'area': area,
            'rainfall_trend': trend_data,
            'total_records': len(trend_data)
        })
        
    except Exception as e:
        logger.error(f"Historical trends error: {str(e)}")
        return jsonify({"error": "Internal server error occurred"}), 500

@app.route('/historical-trends', methods=['POST'])
def post_historical_trends():
    try:
        data = request.get_json()
        
        # ===== Handle Data Insertion/Update =====
        if 'area' in data and 'weather_data' in data:
            # Transform into backend format
            transformed_data = {
                'Area': data['area'],
                'Date': data.get('end_date', datetime.now().strftime("%Y-%m-%d")),
                **data['weather_data'],
                'Rainfall(mm)': data['weather_data'].get('Rainfall(mm)', 0.0)
            }
            
            # Validate required fields
            required_fields = [
                'Area', 'Date', 'Temperature(C)', 'Humidity(%)',
                'Pressure(hPa)', 'WindSpeed(km/h)', 'CloudCover(%)', 'Rainfall(mm)'
            ]
            
            missing_fields = [field for field in required_fields if field not in transformed_data]
            if missing_fields:
                return jsonify({
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                }), 400
            
            # Check if entry already exists for this area and date
            global historical_df
            mask = (historical_df['Area'].str.lower() == transformed_data['Area'].lower()) & \
                   (historical_df['Date'] == transformed_data['Date'])
            
            if not historical_df[mask].empty:
                # Update existing record
                for col, value in transformed_data.items():
                    historical_df.loc[mask, col] = value
                action = 'updated'
            else:
                # Create new DataFrame row and append
                new_entry = pd.DataFrame([transformed_data])
                historical_df = pd.concat([historical_df, new_entry], ignore_index=True)
                action = 'inserted'
            
            # Save back to CSV
            historical_df.to_csv('historical_weather_data.csv', index=False)
        
        # ===== Always Return Historical Data =====
        if 'area' in data:  # This will be true for both cases
            area = data['area']
            start_date = data.get('start_date', (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"))
            end_date = data.get('end_date', datetime.now().strftime("%Y-%m-%d"))

            if historical_df.empty:
                return jsonify({'error': 'Historical data not available'}), 404
                
            area_data = historical_df[
                (historical_df['Area'].str.lower() == area.lower()) &
                (historical_df['Date'] >= start_date) &
                (historical_df['Date'] <= end_date)
            ]
            
            trend_data = area_data.sort_values('Date')[['Date', 'Rainfall(mm)']].to_dict('records')
            
            response = {
                'area': area,
                'rainfall_trend': trend_data,
                'total_records': len(trend_data)
            }
            
            # Add update status if we performed an update/insert
            if 'action' in locals():
                response.update({
                    'update_status': 'success',
                    'update_action': action,
                    'updated_record': transformed_data
                })
            
            return jsonify(response)
        
        else:
            return jsonify({
                'error': 'Invalid request format',
                'hint': 'Must include at least area parameter'
            }), 400
            
    except Exception as e:
        logger.error(f"Historical trends error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

@app.route("/areas", methods=["GET"])
def get_areas():
    """Get available areas with caching"""
    if historical_df.empty:
        return jsonify({'error': 'Historical data not available'}), 503
    
    try:
        areas = historical_df["Area"].unique().tolist()
        return jsonify(areas)
    except Exception as e:
        logger.error(f"Areas endpoint error: {str(e)}")
        return jsonify({"error": "Internal server error occurred"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "models_loaded": models_loaded,
        "historical_data_loaded": not historical_df.empty,
        "version": "1.0.0"
    })

@app.route("/")
def home():
    """Home endpoint"""
    return jsonify({
        "message": "Welcome to the Weather Prediction API!",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "POST - Predict rainfall",
            "/historical-trends/<area>": "GET - Get historical trends",
            "/historical-trends": "POST - Insert historical data",
            "/areas": "GET - Get available areas",
            "/health": "GET - Health check"
        },
        "status": "active"
    })

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Invalid request format", "status": 400}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found", "status": 404}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error", "status": 500}), 500

@app.errorhandler(503)
def service_unavailable(error):
    return jsonify({"error": "Service temporarily unavailable", "status": 503}), 503

if __name__ == '__main__':
    # Initialize user accounts file on startup
    from auth_utils import init_user_accounts
    init_user_accounts()
    logger.info("Starting Weather Prediction API...")
    app.run(debug=False, host='0.0.0.0', port=5000)