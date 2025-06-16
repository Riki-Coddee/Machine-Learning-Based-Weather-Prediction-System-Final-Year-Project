import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

n_days = 30
areas = ['Asansol', 'Durgapur', 'Kolkata', 'Barddhamān', 'Puruliya', 'Bānkura',
         'Howrah', 'Hooghly', 'Birbhum', 'Paschim Medinipur', 'Jaykaynagar']

start_date = datetime(2025, 5, 14)
data = []

for area in areas:
    base_temp = np.random.uniform(20, 30)
    for day in range(n_days):
        current_date = start_date + timedelta(days=day)
        temperature = np.round(np.random.normal(loc=base_temp, scale=3), 1)
        humidity = np.round(np.random.uniform(40, 100), 1)
        pressure = np.round(np.random.normal(loc=1013, scale=10), 1)
        wind_speed = np.round(np.random.uniform(0, 15), 1)
        cloud_cover = np.round(np.random.uniform(0, 100), 1)

        # Simulate rainfall in mm (only when conditions suggest rain)
        rain_chance = (humidity / 100) * (cloud_cover / 100) * np.clip((1015 - pressure) / 10, 0, 1)
        if np.random.rand() < rain_chance:
            rainfall = round(np.random.uniform(1.0, 20.0), 1)
        else:
            rainfall = 0.0


        data.append({
            'Area': area,
            'Date': current_date.strftime('%Y-%m-%d'),
            'Temperature(C)': temperature,
            'Humidity(%)': humidity,
            'Pressure(hPa)': pressure,
            'WindSpeed(km/h)': wind_speed,
            'CloudCover(%)': cloud_cover,
            'Rainfall(mm)': rainfall  # mm of rain
        })

df = pd.DataFrame(data)
df.to_csv('historical_weather_data.csv', index=False)
print(df.head())
