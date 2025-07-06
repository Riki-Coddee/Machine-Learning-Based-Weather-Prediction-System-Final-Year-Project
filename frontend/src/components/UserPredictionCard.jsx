import React from 'react';
import { 
  Trash2, 
  Eye, 
  Shield, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  MapPin,
  Thermometer,
  Droplets,
  Gauge,
  Cloud,
  TrendingUp,
  CloudRain,
  Sun
} from 'lucide-react';

export default function PredictionCard({ 
  id,
  prediction, 
  onDelete, 
  onViewRisk, 
  onViewPrecautions 
}) {
  
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskLevel = (riskSummary) => {
    const summary = riskSummary.toLowerCase();
    if (summary.includes('high') || summary.includes('severe')) {
      return { level: 'High', color: 'text-red-600 bg-red-50', icon: AlertTriangle };
    } else if (summary.includes('medium') || summary.includes('moderate')) {
      return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50', icon: AlertTriangle };
    } else {
      return { level: 'Low', color: 'text-green-600 bg-green-50', icon: Shield };
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRainfallPrediction = (finalPrediction) => {
    const isRainExpected = finalPrediction === 'Yes';
    return {
      expected: isRainExpected,
      text: isRainExpected ? 'Rainfall Expected' : 'Rainfall Unexpected',
      icon: isRainExpected ? CloudRain : Sun,
      color: isRainExpected ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200',
      iconColor: isRainExpected ? 'text-blue-600' : 'text-orange-600'
    };
  };

  const riskInfo = getRiskLevel(prediction.risk_summary);
  const RiskIcon = riskInfo.icon;
  const confidence = prediction.model_confidence || 0;
  const weatherConditions = prediction.weather_conditions || {};
  const area = prediction.area || 'Unknown Location';
  
  // Get rainfall prediction info
  const finalPrediction = prediction.prediction?.final_prediction || 'No';
  const rainfallInfo = getRainfallPrediction(finalPrediction);
  const RainfallIcon = rainfallInfo.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1">
      {/* Header with location and confidence */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <MapPin className="text-blue-500 flex-shrink-0" size={18} />
            <span className="text-sm font-medium text-gray-700 truncate">
              {area}
            </span>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${riskInfo.color} ml-2`}>
            <RiskIcon size={14} />
            <span className="text-xs font-semibold">{riskInfo.level} Risk</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="text-blue-500" size={16} />
            <span className="text-xs text-gray-600">
              {formatDate(prediction.timestamp)}
            </span>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${getConfidenceColor(confidence)}`}>
            <TrendingUp size={12} />
            <span className="text-xs font-semibold">
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Weather Conditions */}
      {Object.keys(weatherConditions).length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Cloud className="mr-2" size={16} />
            Weather Conditions
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {weatherConditions.temperature && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <Thermometer className="text-red-500" size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Temperature</p>
                  <p className="text-sm font-semibold text-gray-800">{weatherConditions.temperature}°C</p>
                </div>
              </div>
            )}
            
            {weatherConditions.humidity && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Droplets className="text-blue-500" size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-sm font-semibold text-gray-800">{weatherConditions.humidity}%</p>
                </div>
              </div>
            )}
            
            {weatherConditions.pressure && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Gauge className="text-purple-500" size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pressure</p>
                  <p className="text-sm font-semibold text-gray-800">{weatherConditions.pressure} hPa</p>
                </div>
              </div>
            )}
            
            {weatherConditions.cloud_cover !== undefined && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gray-100 rounded-lg">
                  <Cloud className="text-gray-500" size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cloud Cover</p>
                  <p className="text-sm font-semibold text-gray-800">{weatherConditions.cloud_cover}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prediction Content */}
      <div className="p-6">
        {/* Rainfall Prediction */}
        {prediction.prediction && (
          <div className={`mb-4 p-4 rounded-xl border ${rainfallInfo.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-white ${rainfallInfo.iconColor}`}>
                  <RainfallIcon size={20} />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Weather Forecast:</span>
                  <p className="text-lg font-bold">{rainfallInfo.text}</p>
                </div>
              </div>
            </div>
            {prediction.prediction.was_overridden && (
              <div className="mt-3 flex items-center space-x-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="text-orange-600" size={14} />
                <p className="text-xs text-orange-700 font-medium">
                  Prediction was manually overridden
                </p>
              </div>
            )}
          </div>
        )}

        {/* Precautions count */}
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="text-green-500" size={16} />
          <span className="text-sm text-gray-600">
            {prediction.precautions?.length || 0} precaution{(prediction.precautions?.length || 0) !== 1 ? 's' : ''} recommended
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewRisk(prediction)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium"
          >
            <Eye size={16} />
            <span>View Risk</span>
          </button>
          <button
            onClick={() => onViewPrecautions(prediction)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 font-medium"
          >
            <Shield size={16} />
            <span>Precautions</span>
          </button>
          <button
            onClick={() => onDelete(prediction)}
            className="p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}