import joblib
import pandas as pd

# Load trained model and scaler
loaded_model = joblib.load(
    'best_rainfall_model.pkl'
)  # Make sure you're using the correct model filename
scaler = joblib.load('scaler.pkl')

# Sample input data
input_data = pd.DataFrame([[25.0, 85.0, 1005.0, 5.0, 70.0, 10.0, 18.0, 5.0, 250.0, 180.0, 0.5, 15.0, 40.0, 2.0, 20.0, 12.0, 5.0]], columns=[
    'Temperature(C)', 'Humidity(%)', 'Pressure(hPa)', 'WindSpeed(km/h)', 'CloudCover(%)',
    'Visibility(km)', 'DewPoint(C)', 'UVIndex', 'SolarRadiation(W/m²)', 'WindDirection(°)',
    'PrecipitationLastHour(mm)', 'SoilMoisture(%)', 'EvaporationRate(mm/day)', 'FeelsLikeTemp(C)',
    'TempChange1h(C)', 'WindGust(km/h)', 'PressureTendency(hPa/3h)'
])


# Scale input data
input_scaled = pd.DataFrame(scaler.transform(input_data), columns=input_data.columns)


# Rule-based risk summary
def summarize_risk_factors(data):
    desc = []
    if data['Humidity(%)'].values[0] > 80:
        desc.append("high humidity")
    if data['Pressure(hPa)'].values[0] < 1005:
        desc.append("low pressure")
    if data['CloudCover(%)'].values[0] > 70:
        desc.append("dense cloud cover")
    if data['WindSpeed(km/h)'].values[0] > 10:
        desc.append("strong wind")
    if data['Temperature(C)'].values[0] > 35:
        desc.append("very high temperature")
    elif data['Temperature(C)'].values[0] < 5:
        desc.append("very low temperature")
    return ", ".join(desc) if desc else "normal conditions"


# Precautions
def generate_precautions(summary):
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
    return precautions


# Predict rainfall
prediction = loaded_model.predict(input_scaled)[0]
rainfall_status = "Yes" if prediction == 1 else "No"


# Generate risk summary and precautions (use raw input)
risk_summary = summarize_risk_factors(input_data)
precaution_list = generate_precautions(risk_summary)

# Output
print("Rainfall Prediction:", rainfall_status)
print("Risk Summary:", risk_summary)
print("Precautions:")
for i, p in enumerate(precaution_list, 1):
    print(f"{i}. {p}")
