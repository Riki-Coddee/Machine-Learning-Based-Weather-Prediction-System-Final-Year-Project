
# Weather Prediction System 🌦️

A full-stack weather prediction application that uses machine learning to predict rainfall and provides risk assessments with safety precautions. The system consists of a Flask API backend and a React frontend.

## Description
A final year project of the Department of Information Technology, Asansol Engineering College (AEC).

## Project Members

The **Weather Prediction System** project is developed by the following team members:

- **Sanket Banerjee**: [Sanket2004](https://github.com/Sanket2004)
- **Suhana Parvin**: [suhanaparvin12](https://github.com/suhanaparvin12)
- **Shouvik Kr Ghosh**: [ShouvikGhosh2](https://github.com/ShouvikGhosh2)

## Guided by
- **Sheuli Chakraborty** [Google Scholar](https://scholar.google.com/citations?user=UcYPEX8AAAAJ&hl=en)


## 🚀 Features

- **Rainfall Prediction**: ML-powered rainfall probability prediction
- **Risk Assessment**: Real-time weather condition analysis
- **Safety Precautions**: Contextual safety recommendations
- **Historical Trends**: Access historical weather data for different areas
- **Interactive UI**: Modern React-based user interface
- **RESTful API**: Easy-to-use backend endpoints
- **Real-time Updates**: Live weather data visualization

## 🏗️ System Architecture

```
├── Backend (Flask API)
│   ├── Machine Learning Models
│   ├── Weather Data Processing
│   ├── Risk Assessment Engine
│   └── Historical Data Management
└── Frontend (React)
    ├── Weather Input Forms
    ├── Prediction Display
    ├── Historical Trends Charts
    └── Responsive UI Components
```

## 📊 Supported Weather Parameters

The system analyzes 17 meteorological parameters:
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

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Generate training data**:
   ```bash
   python generate_data.py
   ```

3. **Train the ML model**:
   ```bash
   python prediction.py
   ```

4. **Generate historical data**:
   ```bash
   python historical_data.py
   ```

5. **Test the model** (optional):
   ```bash
   python check_model.py
   ```

6. **Start the backend API**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Create React app**:
   ```bash
   npx create-react-app weather-frontend
   cd weather-frontend
   ```

2. **Install additional dependencies**:
   ```bash
   npm install axios chart.js react-chartjs-2 react-router-dom
   npm install @mui/material @emotion/react @emotion/styled
   npm install @mui/icons-material
   ```

3. **Start the frontend**:
   ```bash
   npm start
   ```

The React app will run on `http://localhost:5173`

## 📡 API Endpoints

### 1. Predict Rainfall
**POST** `/predict`

**Request Body**:
```json
{
  "Temperature(C)": 25.0,
  "Humidity(%)": 85.0,
  "Pressure(hPa)": 1005.0,
  ...
}
```

**Response**:
```json
{
  "RainfallPrediction": "Yes",
  "RiskSummary": "high humidity, low pressure, dense cloud cover",
  "Precautions": ["Wear breathable clothes", "Carry an umbrella"]
}
```

### 2. Get Available Areas
**GET** `/areas`

### 3. Historical Trends
**GET** `/historical-trends/<area>?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

### 4. Health Check
**GET** `/health`

## 🤖 Machine Learning Models

The system evaluates 6 different algorithms:
- **Random Forest** (with balanced class weights)
- **Gradient Boosting**
- **Logistic Regression** (with balanced class weights)
- **Support Vector Machine** (with balanced class weights)
- **Decision Tree** (with balanced class weights)
- **K-Nearest Neighbors**

## 📁 Project Structure

```
weather-prediction-system/
├── Backend/
│   ├── main.py
│   ├── prediction.py
│   ├── generate_data.py
│   ├── historical_data.py
│   ├── check_model.py
│   ├── requirements.txt
│   └── best_rainfall_model.pkl
└── Frontend/
    ├── public/
    │   └── droplet.svg
    ├── src/
    │   ├── components/
    │   │   ├── Footer.jsx
    │   │   ├── HistoricalDataVisualizer.jsx
    │   │   ├── LoadingState.jsx
    │   │   ├── Map.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── PredictionResult.jsx
    │   │   ├── ScrollToTop.jsx
    │   │   └── WeatherCard.jsx
    │   ├── pages/
    │   │   ├── Map.jsx
    │   │   ├── HistoricalData.jsx
    │   │   ├── HomePage.jsx
    │   │   └── PredictionPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔧 Configuration

### CORS Setup
The backend includes CORS configuration for cross-origin requests from the frontend.

### Environment Variables
- `PORT`: Backend port (default: 5000)
- `REACT_APP_API_URL`: Frontend API endpoint configuration

## 🌟 Features in Detail

### Risk Assessment
- High humidity (>80%)
- Low pressure (<1005 hPa)
- Dense cloud cover (>70%)
- Strong winds (>10 km/h)
- Extreme temperatures

### Safety Precautions
- Clothing recommendations
- Equipment suggestions
- Activity modifications
- Health and safety tips


## 🆘 Support

For support and questions:
- Check the API health endpoint: `/health`
- Review the console logs for detailed error messages
- Ensure all ML models are properly trained before starting

---

**Built with ❤️ using Flask, React, and Machine Learning**
