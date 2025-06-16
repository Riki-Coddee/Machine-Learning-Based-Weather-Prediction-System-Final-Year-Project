
import pandas as pd
import numpy as np


np.random.seed(42)


n_samples = 1000

temperature = np.round(np.random.normal(loc=25, scale=5, size=n_samples), 1)  # in Celsius
humidity = np.round(np.random.uniform(40, 100, size=n_samples), 1)             # in %
pressure = np.round(np.random.normal(loc=1013, scale=10, size=n_samples), 1)   # in hPa
wind_speed = np.round(np.random.uniform(0, 15, size=n_samples), 1)             # in km/h
cloud_cover = np.round(np.random.uniform(0, 100, size=n_samples), 1)           # in %

# Additional features for better prediction
visibility = np.round(np.random.uniform(1, 50, size=n_samples), 1)             # in km
dew_point = np.round(temperature - np.random.uniform(2, 15, size=n_samples), 1) # in Celsius
uv_index = np.round(np.random.uniform(0, 11, size=n_samples), 1)               # UV index 0-11
solar_radiation = np.round(np.random.uniform(0, 1200, size=n_samples), 1)      # in W/m²
wind_direction = np.round(np.random.uniform(0, 360, size=n_samples), 1)        # in degrees
precipitation_last_hour = np.round(np.random.uniform(0, 5, size=n_samples), 1) # in mm
soil_moisture = np.round(np.random.uniform(10, 80, size=n_samples), 1)         # in %
evaporation_rate = np.round(np.random.uniform(0, 8, size=n_samples), 1)        # in mm/day

# Temperature-related features
feels_like_temp = np.round(temperature + np.random.uniform(-3, 3, size=n_samples), 1)
temp_change_1h = np.round(np.random.uniform(-5, 5, size=n_samples), 1)         # temp change in 1 hour

# Atmospheric stability indicators
wind_gust = np.round(wind_speed + np.random.uniform(0, 10, size=n_samples), 1) # in km/h
pressure_tendency = np.round(np.random.uniform(-5, 5, size=n_samples), 1)      # pressure change in 3h

rainfall = []

# Enhanced rule to determine rainfall with more factors
for i in range(n_samples):
    rain_score = 0
    
    # Original conditions
    if humidity[i] > 70:
        rain_score += 1
    if pressure[i] < 1010:
        rain_score += 1
    if cloud_cover[i] > 60:
        rain_score += 1
    
    # Additional conditions
    if dew_point[i] > temperature[i] - 5:  # High dew point relative to temperature
        rain_score += 1
    if visibility[i] < 10:  # Low visibility often indicates precipitation
        rain_score += 1
    if wind_speed[i] > 8 and wind_gust[i] > 12:  # Strong winds can indicate storms
        rain_score += 0.5
    if pressure_tendency[i] < -2:  # Rapidly falling pressure
        rain_score += 1
    if soil_moisture[i] < 20:  # Very dry soil might indicate need for rain
        rain_score -= 0.5
    if evaporation_rate[i] > 6:  # High evaporation reduces rain likelihood
        rain_score -= 0.5
    
    # Determine rainfall based on score
    if rain_score >= 3:
        rainfall.append(1)  # Rain
    else:
        rainfall.append(0)  # No Rain

# Create DataFrame with all features
df = pd.DataFrame({
    'Temperature(C)': temperature,
    'Humidity(%)': humidity,
    'Pressure(hPa)': pressure,
    'WindSpeed(km/h)': wind_speed,
    'CloudCover(%)': cloud_cover,
    'Visibility(km)': visibility,
    'DewPoint(C)': dew_point,
    'UVIndex': uv_index,
    'SolarRadiation(W/m²)': solar_radiation,
    'WindDirection(°)': wind_direction,
    'PrecipitationLastHour(mm)': precipitation_last_hour,
    'SoilMoisture(%)': soil_moisture,
    'EvaporationRate(mm/day)': evaporation_rate,
    'FeelsLikeTemp(C)': feels_like_temp,
    'TempChange1h(C)': temp_change_1h,
    'WindGust(km/h)': wind_gust,
    'PressureTendency(hPa/3h)': pressure_tendency,
    'Rainfall': rainfall
})

print(f"Dataset shape: {df.shape}")
print(f"Rainfall distribution: {df['Rainfall'].value_counts()}")
print("\nFirst few rows:")
print(df.head())

df.to_csv('weather_data.csv', index=False)
print("\nEnhanced dataset saved to 'weather_data.csv'")