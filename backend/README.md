
# Weather Prediction API 🌦️

A machine learning-powered weather prediction API that predicts rainfall and provides risk assessments with safety precautions based on meteorological data.

## 🚀 Features

- **Rainfall Prediction**: Uses trained ML models to predict rainfall probability
- **Risk Assessment**: Analyzes weather conditions and provides risk summaries
- **Safety Precautions**: Generates contextual safety recommendations
- **Historical Trends**: Access historical weather data for different areas
- **Multiple ML Models**: Compares performance of 6 different algorithms
- **RESTful API**: Easy-to-use endpoints for integration

## 📊 Supported Weather Parameters

The API analyzes 17 different meteorological parameters:
- Temperature (°C)
- Humidity (%)
- Atmospheric Pressure (hPa)
- Wind Speed (km/h)
- Cloud Cover (%)
- Visibility (km)
- Dew Point (°C)
- UV Index
- Solar Radiation (W/m²)
- Wind Direction (°)
- Precipitation Last Hour (mm)
- Soil Moisture (%)
- Evaporation Rate (mm/day)
- Feels Like Temperature (°C)
- Temperature Change 1h (°C)
- Wind Gust (km/h)
- Pressure Tendency (hPa/3h)

## 🛠️ Installation & Setup

1. **Clone the repository** (if using Git)
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Generate training data**:
   ```bash
   python generate_data.py
   ```

4. **Train the model**:
   ```bash
   python prediction.py
   ```

5. **Generate historical data**:
   ```bash
   python historical_data.py
   ```

6. **Test the model** (optional):
   ```bash
   python check_model.py
   ```

7. **Start the API server**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### 1. Predict Rainfall
**POST** `/predict`

Predicts rainfall based on weather parameters.

**Request Body**:
```json
{
  "Temperature(C)": 25.0,
  "Humidity(%)": 85.0,
  "Pressure(hPa)": 1005.0,
  "WindSpeed(km/h)": 5.0,
  "CloudCover(%)": 70.0,
  "Visibility(km)": 10.0,
  "DewPoint(C)": 18.0,
  "UVIndex": 5.0,
  "SolarRadiation(W/m²)": 250.0,
  "WindDirection(°)": 180.0,
  "PrecipitationLastHour(mm)": 0.5,
  "SoilMoisture(%)": 15.0,
  "EvaporationRate(mm/day)": 4.0,
  "FeelsLikeTemp(C)": 27.0,
  "TempChange1h(C)": 2.0,
  "WindGust(km/h)": 12.0,
  "PressureTendency(hPa/3h)": -2.0
}
```

**Response**:
```json
{
  "RainfallPrediction": "Yes",
  "RiskSummary": "high humidity, low pressure, dense cloud cover",
  "Precautions": [
    "Wear breathable clothes",
    "Carry an umbrella",
    "Be prepared for poor visibility"
  ]
}
```

### 2. Get Available Areas
**GET** `/areas`

Returns list of areas with historical data.

**Response**:
```json
["Asansol", "Durgapur", "Kolkata", "Barddhamān", "Puruliya", ...]
```

### 3. Historical Trends
**GET** `/historical-trends/<area>?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

Get historical rainfall trends for a specific area.

**Response**:
```json
{
  "area": "Kolkata",
  "rainfall_trend": [
    {"Date": "2025-05-14", "Rainfall(mm)": 5.2},
    {"Date": "2025-05-15", "Rainfall(mm)": 0.0}
  ]
}
```

### 4. Home
**GET** `/`

Welcome message and API status.

## 🤖 Machine Learning Models

The system evaluates 6 different algorithms:
- **Random Forest** (with balanced class weights)
- **Gradient Boosting**
- **Logistic Regression** (with balanced class weights)
- **Support Vector Machine** (with balanced class weights)
- **Decision Tree** (with balanced class weights)
- **K-Nearest Neighbors**

The best-performing model is automatically selected and saved as `best_rainfall_model.pkl`.

## 📁 Project Structure

```
├── main.py                 # Flask API server
├── prediction.py           # Model training and evaluation
├── generate_data.py        # Synthetic weather data generation
├── historical_data.py      # Historical data generation
├── check_model.py         # Model testing script
├── best_rainfall_model.pkl # Trained model (generated)
├── scaler.pkl             # Data scaler (generated)
├── weather_data.csv       # Training data (generated)
├── historical_weather_data.csv # Historical data (generated)
├── requirements.txt       # Dependencies
└── README.md             # This file
```

## 🔧 Configuration

The API runs on port 5000 by default. You can modify this in `main.py`:

```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

## 🌟 Features in Detail

### Risk Assessment
The system analyzes multiple weather parameters to identify risk factors:
- High humidity (>80%)
- Low pressure (<1005 hPa)
- Dense cloud cover (>70%)
- Strong winds (>10 km/h)
- Extreme temperatures

### Safety Precautions
Based on identified risks, the system provides contextual safety advice:
- Clothing recommendations
- Equipment suggestions (umbrella, etc.)
- Activity modifications
- Health and safety tips
