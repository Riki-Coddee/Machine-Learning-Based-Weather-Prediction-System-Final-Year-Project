from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from imblearn.ensemble import BalancedRandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import pandas as pd
import joblib
import numpy as np

from data_preprocessing import (
    clean_weather_data,
    add_features,
    scale_data,
    find_optimal_threshold
)
from data_visualization import (
    plot_confusion_matrix,
    plot_feature_importance
)

# === Load and Prepare Data ===
df = pd.read_csv('weather_data.csv')

# Validate binary classes
print("\nRaw data class distribution:")
print(df['Rainfall'].value_counts())
if len(df['Rainfall'].unique()) < 2:
    raise ValueError("Dataset must contain both rain (1) and no-rain (0) cases")

df = clean_weather_data(df)
df = add_features(df)

# Validate again after cleaning
if len(df['Rainfall'].unique()) < 2:
    raise ValueError("Cleaning removed all cases of one class. Adjust cleaning.")

# Split features and target
X = df.drop(columns=['Rainfall'])
y = df['Rainfall']

# === Balance using SMOTE ===
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)
print("\nAfter SMOTE resampling:")
print(y_resampled.value_counts(normalize=True))

# === Scale features ===
X_scaled, scaler = scale_data(X_resampled)

# === Train/Test Split ===
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_resampled, test_size=0.2, random_state=42, stratify=y_resampled
)

# === Train Model ===
model = BalancedRandomForestClassifier(
    n_estimators=300,
    max_depth=15,
    min_samples_split=10,
    sampling_strategy='auto',
    replacement=True,
    random_state=42
)

print("\nTraining Random Forest model...")
model.fit(X_train, y_train)

# === Predict and Threshold ===
y_probs = model.predict_proba(X_test)[:, 1]
optimal_threshold = find_optimal_threshold(y_test, y_probs, beta=2)
print(f"\nOptimal prediction threshold (F2-optimized): {optimal_threshold:.4f}")

y_pred = (y_probs >= optimal_threshold).astype(int)

# === Evaluate Model ===
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy: {accuracy:.2f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

plot_confusion_matrix(y_test, y_pred)
plot_feature_importance(model, X.columns)

# === Save Artifacts ===
joblib.dump(model, 'best_rainfall_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(optimal_threshold, 'threshold.pkl')
print("\nModel artifacts saved successfully!")
