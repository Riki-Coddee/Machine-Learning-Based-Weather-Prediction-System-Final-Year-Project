import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/predictions');
        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }
        const data = await response.json();

        // Format the data for display
        const formattedPredictions = data.map(prediction => ({
          id: prediction.id,
          user: prediction.user.name || prediction.user.email,
          date: new Date(prediction.timestamp).toLocaleDateString(),
          time: new Date(prediction.timestamp).toLocaleTimeString(),
          location: prediction.area || 'Unknown',
          rainfall: Array.isArray(prediction.prediction?.final_prediction) 
            ? prediction.prediction.final_prediction 
            : [prediction.prediction?.final_prediction || 'No data'],
          confidence: `${Math.round((prediction.model_confidence || 0) * 100)}%`,
          riskSummary: prediction.risk_summary || 'No risk summary',
          precautions: prediction.precautions || [],
          wasOverridden: prediction.was_overridden || false,
          weatherConditions: prediction.weather_conditions || {}
        }));

        setPredictions(formattedPredictions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setError('Failed to load prediction history');
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

const handleDelete = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/delete/predictions/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete prediction');
    }
    
    setPredictions(predictions.filter(pred => pred.id !== id));
    toast.success('Prediction deleted successfully');
  } catch (err) {
    console.error('Error deleting prediction:', err);
    setError('Failed to delete prediction');
    toast.success('Could not delete prediction');
  }
};

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Prediction History</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rainfall Predictions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {predictions.map((pred) => (
              <tr key={pred.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pred.user}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{pred.date}</div>
                  <div className="text-sm text-gray-500">{pred.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pred.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {pred.rainfall.map((result, index) => (
                      <span 
                        key={index}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          result === 'Yes' ? 'bg-blue-100 text-blue-800' : 
                          result === 'No' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {result === 'Yes' ? 'Expected' : result === 'No' ? 'Not Expected' : result}
                      </span>
                    ))}
                  </div>
                  {pred.wasOverridden && (
                    <span className="mt-1 block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 w-fit">
                      Overridden
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    parseFloat(pred.confidence) > 90 ? 'bg-green-100 text-green-800' : 
                    parseFloat(pred.confidence) > 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pred.confidence}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="font-semibold">{pred.riskSummary}</div>
                  {pred.precautions.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs font-semibold">Precautions:</span>
                      <ul className="text-xs list-disc list-inside">
                        {pred.precautions.map((precaution, index) => (
                          <li key={index}>{precaution}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(pred.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}