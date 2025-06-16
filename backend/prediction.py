from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler


# Data Cleaning Methods
def clean_weather_data(df):
    """Data cleaning pipeline"""
    print(f"Initial dataset shape: {df.shape}")

    # Remove duplicates
    df = df.drop_duplicates()
    print(f"After removing duplicates: {df.shape}")

    # Fill missing values with median
    df = df.fillna(df.median())
    print(f"Missing values filled: {df.isnull().sum().sum()} remaining")

    # Remove obvious outliers (basic range checks)
    df = df[(df['Temperature(C)'] >= -50) & (df['Temperature(C)'] <= 60)]
    df = df[(df['Humidity(%)'] >= 0) & (df['Humidity(%)'] <= 100)]
    df = df[(df['Pressure(hPa)'] >= 900) & (df['Pressure(hPa)'] <= 1100)]
    print(f"After basic outlier removal: {df.shape}")

    print("Data cleaning completed!\n")
    return df


# Load Data
df = pd.read_csv('weather_data.csv')
df = clean_weather_data(df)


# Split Features and Labels
X = df.drop(columns=['Rainfall'])
Y = df['Rainfall']

# scale the data
scaler = StandardScaler()
X = pd.DataFrame(scaler.fit_transform(X), columns=[
    'Temperature(C)', 'Humidity(%)', 'Pressure(hPa)', 'WindSpeed(km/h)', 'CloudCover(%)',
    'Visibility(km)', 'DewPoint(C)', 'UVIndex', 'SolarRadiation(W/m²)', 'WindDirection(°)',
    'PrecipitationLastHour(mm)', 'SoilMoisture(%)', 'EvaporationRate(mm/day)', 'FeelsLikeTemp(C)',
    'TempChange1h(C)', 'WindGust(km/h)', 'PressureTendency(hPa/3h)'
])


# Train-Test Split
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# Define Models (with class_weight where applicable)
models = {
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
    "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced'),
    "SVM": SVC(kernel='rbf', probability=True, class_weight='balanced'),
    "Decision Tree": DecisionTreeClassifier(random_state=42, class_weight='balanced'),
    "KNN": KNeighborsClassifier()
}

# Evaluate Models
results = {}
for name, model in models.items():
    print(f"\nTraining {name}...")
    model.fit(X_train, Y_train)
    Y_pred = model.predict(X_test)
    accuracy = accuracy_score(Y_test, Y_pred)
    report = classification_report(Y_test, Y_pred, output_dict=True, zero_division=0)

    # Store results
    results[name] = {
        "accuracy": accuracy,
        "classification_report": report
    }

    # Print report
    print(f"{name} Accuracy: {accuracy:.2f}")
    print("Classification Report:")
    print(classification_report(Y_test, Y_pred, zero_division=0))

    # Print confusion matrix
    print("Confusion Matrix:")
    print(confusion_matrix(Y_test, Y_pred))

    # Print confusion matrix using matplotlib
    import matplotlib.pyplot as plt
    import seaborn as sns
    cm = confusion_matrix(Y_test, Y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title(f'{name} Confusion Matrix')
    plt.show()
    plt.close()
    print("\n")

# Show bar chart comparing all algos with different colors
accuracies = [results[model]["accuracy"] for model in results]
colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow']
plt.bar(results.keys(), accuracies, color=colors)
plt.xlabel('Model')
plt.ylabel('Accuracy')
plt.title('Model Accuracy Comparison')
plt.show()
plt.close()

# Find Best Model
best_model_name = max(results, key=lambda x: results[x]["accuracy"])
best_model = models[best_model_name]
print(f"\n✅ Best Model: {best_model_name} with Accuracy: {results[best_model_name]['accuracy']:.2f}")

# Feature Importance Analysis
print(f"\n📊 Feature Importance Analysis for {best_model_name}:")
print("=" * 60)

if hasattr(best_model, 'feature_importances_'):
    # Get feature importance scores
    feature_names = X.columns
    importance_scores = best_model.feature_importances_
    
    # Create feature importance dataframe
    feature_importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importance_scores,
        'Importance_Percentage': importance_scores * 100
    }).sort_values('Importance', ascending=False)
    
    print("Feature Importance Ranking:")
    print("-" * 50)
    for idx, row in feature_importance_df.iterrows():
        print(f"{row['Feature']:<25}: {row['Importance']:.4f} ({row['Importance_Percentage']:.1f}%)")
    
    # Plot feature importance
    plt.figure(figsize=(12, 8))
    plt.barh(range(len(feature_importance_df)), feature_importance_df['Importance'])
    plt.yticks(range(len(feature_importance_df)), feature_importance_df['Feature'])
    plt.xlabel('Feature Importance Score')
    plt.title(f'Feature Importance - {best_model_name}')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("\nFeature importance chart saved as feature_importance.png")
    
    # Calculate cumulative importance
    feature_importance_df['Cumulative_Importance'] = feature_importance_df['Importance'].cumsum()
    
    print(f"\nTop 5 features contribute {feature_importance_df.head(5)['Cumulative_Importance'].iloc[-1]:.1%} of total importance")
    print(f"Top 10 features contribute {feature_importance_df.head(10)['Cumulative_Importance'].iloc[-1]:.1%} of total importance")

else:
    print(f"Feature importance not available for {best_model_name}")

# Correlation Analysis
print(f"\n🔍 Correlation Analysis:")
print("=" * 40)
correlation_with_target = df.corr()['Rainfall'].abs().sort_values(ascending=False)
print("Features correlation with Rainfall (absolute values):")
print("-" * 50)
for feature, corr in correlation_with_target.items():
    if feature != 'Rainfall':
        print(f"{feature:<25}: {corr:.4f}")

# Save the best model
joblib.dump(best_model, 'best_rainfall_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
print(f"\n💾 Model and scaler saved successfully!")