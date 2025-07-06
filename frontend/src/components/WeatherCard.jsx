import { useState } from "react";
import { Thermometer, Droplets, Wind, Gauge, Cloud, MapPin } from "lucide-react";

const WeatherCard = ({ weatherData, openCageLoc, makePrediction }) => {
  const [editableMetrics, setEditableMetrics] = useState(weatherData);
  const [validationErrors, setValidationErrors] = useState({});

  // Universal standard validation ranges
  const validationRules = {
    "Temperature(C)": { 
      min: -89.2, 
      max: 56.7,
      message: "Must be between -89.2°C and 56.7°C" 
    },
    "Humidity(%)": { 
      min: 0, 
      max: 100,
      message: "Must be between 0% and 100%" 
    },
    "Pressure(hPa)": { 
      min: 870, 
      max: 1084,
      message: "Must be between 870hPa and 1084hPa" 
    },
    "WindSpeed(km/h)": { 
      min: 0, 
      max: 408,
      message: "Must be between 0km/h and 408km/h" 
    },
    "CloudCover(%)": { 
      min: 0, 
      max: 100,
      message: "Must be between 0% and 100%" 
    }
  };

  const handleMetricChange = (metric, value) => {
    const updatedMetrics = {
      ...editableMetrics,
      [metric]: value
    };
    
    setEditableMetrics(updatedMetrics);
    
    // Real-time validation
    if (validationRules[metric]) {
      const numericValue = parseFloat(value);
      const rule = validationRules[metric];
      
      if (value === "" || isNaN(numericValue)) {
        setValidationErrors(prev => ({ ...prev, [metric]: "Must be a number" }));
      } else if (numericValue < rule.min || numericValue > rule.max) {
        setValidationErrors(prev => ({ ...prev, [metric]: rule.message }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[metric];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = () => {
    // Final validation check
    const hasErrors = Object.values(validationErrors).some(Boolean);
    if (!hasErrors) {
      // Convert all values to numbers before prediction
      const sanitizedMetrics = Object.fromEntries(
        Object.entries(editableMetrics).map(([key, value]) => 
          [key, parseFloat(value)]
        )
      );
      makePrediction(sanitizedMetrics);
    }
  };

  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weatherIcon}@2x.png`;

  const metrics = [
    {
      label: "Temperature(C)",
      displayName: "Temperature",
      value: editableMetrics["Temperature(C)"],
      Icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      unit: "°C",
      width: "w-20"
    },
    {
      label: "Humidity(%)",
      displayName: "Humidity",
      value: editableMetrics["Humidity(%)"],
      Icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      unit: "%",
      width: "w-12"
    },
    {
      label: "Pressure(hPa)",
      displayName: "Pressure",
      value: editableMetrics["Pressure(hPa)"],
      Icon: Gauge,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      unit: "hPa",
      width: "w-16"
    },
    {
      label: "WindSpeed(km/h)",
      displayName: "Wind Speed",
      value: editableMetrics["WindSpeed(km/h)"],
      Icon: Wind,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      unit: "km/h",
      width: "w-20"
    },
    {
      label: "CloudCover(%)",
      displayName: "Cloud Cover",
      value: editableMetrics["CloudCover(%)"],
      Icon: Cloud,
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      unit: "%",
      width: "w-12"
    },
  ];

  const hasErrors = Object.values(validationErrors).some(Boolean);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header with location and weather icon */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <MapPin className="h-5 w-5 mr-2" />
              <h2 className="text-xl font-semibold">
                {openCageLoc.location}, {openCageLoc.country}
              </h2>
            </div>
            <p className="text-blue-100 capitalize text-lg">{weatherData.weatherDescription}</p>
          </div>
          <div className="text-right">
            <img
              src={iconUrl}
              alt={weatherData.weatherDescription}
              className="w-16 h-16 drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Weather metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {metrics.map(({ label, displayName, value, Icon, color, bgColor, borderColor, unit, width }) => (
            <div key={label}>
              <div className={`p-4 rounded-xl border ${bgColor} ${
                validationErrors[label] ? "border-red-300 bg-red-50" : borderColor
              } transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${bgColor} border ${
                      validationErrors[label] ? "border-red-300" : borderColor
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        validationErrors[label] ? "text-red-500" : color
                      }`} />
                    </div>
                    <span className="ml-3 text-gray-700 font-medium">{displayName}</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleMetricChange(label, e.target.value)}
                      className={`text-lg font-bold bg-transparent border-none ${width} text-right focus:outline-none focus:ring-0 ${
                        validationErrors[label] ? "text-red-500" : "text-gray-900"
                      }`}
                      step={label === "Temperature(C)" ? "0.1" : "1"}
                    />
                    <span className={`text-lg font-bold ml-1 ${
                      validationErrors[label] ? "text-red-500" : "text-gray-900"
                    }`}>
                      {unit}
                    </span>
                  </div>
                </div>
              </div>
              {validationErrors[label] && (
                <p className="text-red-500 text-xs mt-1 text-right">
                  {validationErrors[label]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={hasErrors}
            className={`px-4 py-2 rounded-lg transition-colors ${
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {hasErrors ? "Fix errors to update" : "Update Prediction"}
          </button>
        </div>
      </div>

      {/* Footer with timestamp */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-left">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default WeatherCard;