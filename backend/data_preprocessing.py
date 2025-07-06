import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import fbeta_score
from scipy import stats

def clean_weather_data(df):
    df = df.drop_duplicates(keep='first')
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
    numeric_cols = [col for col in numeric_cols if col != 'Rainfall']
    z_scores = np.abs(stats.zscore(df[numeric_cols]))
    df = df[(z_scores < 3).all(axis=1)]
    return df

def add_features(df):
    df['HumidityPressureRatio'] = df['Humidity(%)'] / df['Pressure(hPa)']
    df['TempDewDiff'] = df['Temperature(C)'] - df['DewPoint(C)']
    df['WindGustRatio'] = df['WindGust(km/h)'] / (df['WindSpeed(km/h)'] + 0.1)
    df['HumidityCloudRatio'] = df['Humidity(%)'] * (df['CloudCover(%)'] / 100)
    df['CloudPressureIndex'] = df['CloudCover(%)'] * (1015 - df['Pressure(hPa)'])
    return df

def scale_data(X):
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return pd.DataFrame(X_scaled, columns=X.columns), scaler

def find_optimal_threshold(y_true, y_probs, beta=2):
    thresholds = np.linspace(0.1, 0.9, 100)
    fbeta_scores = [fbeta_score(y_true, y_probs >= t, beta=beta) for t in thresholds]
    return thresholds[np.argmax(fbeta_scores)]
