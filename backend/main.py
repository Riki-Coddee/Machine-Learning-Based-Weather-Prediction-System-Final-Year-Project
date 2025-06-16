
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import flask_cors
from sklearn.preprocessing import StandardScaler
import os
import logging
from functools import lru_cache
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
flask_cors.CORS(app)

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
REQUIRED_FIELDS = [
    'Temperature(C)', 'Humidity(%)', 'Pressure(hPa)', 'WindSpeed(km/h)',
    'CloudCover(%)', 'Visibility(km)', 'DewPoint(C)', 'UVIndex',
    'SolarRadiation(W/m²)', 'WindDirection(°)', 'PrecipitationLastHour(mm)', 
    'SoilMoisture(%)', 'EvaporationRate(mm/day)', 'FeelsLikeTemp(C)', 
    'TempChange1h(C)', 'WindGust(km/h)', 'PressureTendency(hPa/3h)'
]

# Risk thresholds
RISK_THRESHOLDS = {
    'high_humidity': 80,
    'low_pressure': 1005,
    'dense_cloud': 70,
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
    if cloud_cover > RISK_THRESHOLDS['dense_cloud']:
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
    
    missing_fields = [field for field in REQUIRED_FIELDS if field not in data]
    if missing_fields:
        return f"Missing required fields: {', '.join(missing_fields)}", 400
    
    # Validate numeric values efficiently
    for field in REQUIRED_FIELDS:
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

@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    if not models_loaded:
        return jsonify({"error": "Models not loaded. Please run prediction.py first."}), 503
    
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Validate input data
        error_message, error_code = validate_input(data)
        if error_message:
            return jsonify({"error": error_message}), error_code

        # Prepare input for prediction as DataFrame to maintain feature names
        input_df = pd.DataFrame([[data[field] for field in REQUIRED_FIELDS]], 
                               columns=REQUIRED_FIELDS)
        
        # Scale input if scaler is available
        if scaler:
            input_scaled = scaler.transform(input_df)
            # Convert back to DataFrame to maintain feature names
            input_scaled = pd.DataFrame(input_scaled, columns=REQUIRED_FIELDS)
        else:
            input_scaled = input_df
            
        # Make prediction
        prediction = model.predict(input_scaled)[0]
        rainfall = "Yes" if prediction == 1 else "No"
        
        # Generate risk summary and precautions
        summary = summarize_risk_factors(data)
        precautions = generate_precautions(summary)

        return jsonify({
            "RainfallPrediction": rainfall,
            "RiskSummary": summary,
            "Precautions": precautions
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({"error": "Internal server error occurred"}), 500

@app.route('/historical-trends/<area>', methods=['GET'])
def get_historical_trends(area):
    """Historical trends endpoint"""
    if historical_df.empty:
        return jsonify({'error': 'Historical data not available. Please run historical_data.py first.'}), 503
    
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

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
    logger.info("Starting Weather Prediction API...")
    app.run(debug=False, host='0.0.0.0', port=5000)
