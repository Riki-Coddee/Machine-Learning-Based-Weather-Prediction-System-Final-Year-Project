import React, { useEffect, useState } from 'react';
import PredictionCard from '../components/UserPredictionCard';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import { TrendingUp, AlertCircle, Shield, Search, Filter, CheckCircle } from 'lucide-react';

export default function ViewUserPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [modalContent, setModalContent] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/predictions', {
          headers: { Authorization: `Bearer ${token}` },
        });        
        if (!res.ok) throw new Error('Failed to load predictions');
        const data = await res.json();
        setPredictions(data);
      } catch (err) {
        console.error('Error loading predictions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (pred) => {
    
    if (!window.confirm('Are you sure you want to delete this prediction? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      // Use _id for deletion
      const identifier = pred.id;
      const response = await fetch(
        `http://localhost:5000/api/predictions/${identifier}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete prediction');
      }
      
      // Remove from local state
      setPredictions((p) => p.filter((x) => x.id !== identifier));
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Prediction deleted successfully'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({
        type: 'error',
        message: 'Could not delete prediction. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const openModal = (title, items) => {
    setModalContent({ title, items });
  };
  const closeModal = () => setModalContent(null);

  const filteredPredictions = predictions.filter(pred => {
    // Primary search: Filter by area/location name
    const area = pred.area || '';
    const matchesSearch = area.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterLevel === 'all') return matchesSearch;
    
    // Secondary filter: Risk level filtering
    const riskSummary = pred.risk_summary || '';
    const riskLevel = riskSummary.toLowerCase();
    
    switch (filterLevel) {
      case 'high':
        return matchesSearch && (riskLevel.includes('high') || riskLevel.includes('severe'));
      case 'medium':
        return matchesSearch && (riskLevel.includes('medium') || riskLevel.includes('moderate'));
      case 'low':
        return matchesSearch && (!riskLevel.includes('high') && !riskLevel.includes('medium') && !riskLevel.includes('severe') && !riskLevel.includes('moderate'));
      default:
        return matchesSearch;
    }
  });

  if (loading) return <LoadingState message="Loading your predictions..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
          <p className="text-red-600 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4`}>
          <div 
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Predictions</h1>
                <p className="text-gray-600">Manage and review your weather predictions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{predictions.length}</p>
              <p className="text-sm text-gray-500">Total Predictions</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by location (e.g., Qambar Shahdadkot District, Pakistan)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filterLevel !== 'all' ? 'No matching predictions found' : 'No predictions yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterLevel !== 'all' 
                ? 'Try searching for a different location or adjusting your filter criteria'
                : 'Start by creating your first weather prediction'
              }
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Searched for: "{searchTerm}"
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPredictions.map((pred, index) => (
              <PredictionCard
                key={pred.id || pred.timestamp || index}
                id={pred.id}
                prediction={pred}
                onDelete={handleDelete}
                onViewRisk={(p) => openModal('Risk Analysis', [p.risk_summary])}
                onViewPrecautions={(p) => openModal('Recommended Precautions', p.precautions || [])}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!modalContent}
        title={modalContent?.title || ''}
        onClose={closeModal}
      >
        {modalContent?.items && modalContent.items.length > 0 ? (
          modalContent.items.map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-gray-700 leading-relaxed">{item}</p>
            </div>
          ))
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500 italic">No information available</p>
          </div>
        )}
      </Modal>
    </div>
  );
}