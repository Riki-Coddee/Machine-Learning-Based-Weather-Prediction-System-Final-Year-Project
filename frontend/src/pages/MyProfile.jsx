import { User, Settings, Mail, Calendar, MapPin, CloudRain, Droplets, Thermometer, Wind, Lock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const { user} = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    location: user?.location || ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Weather preferences state
  const [weatherPreferences, setWeatherPreferences] = useState({
    rainfallAlerts: true,
    temperatureThreshold: 30,
    windSpeedAlerts: true,
    locations: ["Kathmandu", "Pokhara", "Lumbini"]
  });

  // Activity data
  const activityData = [
    { id: 1, action: "Viewed rainfall prediction", time: "2 hours ago" },
    { id: 2, action: "Saved Kathmandu forecast", time: "1 day ago" },
    { id: 3, action: "Updated notification settings", time: "3 days ago" }
  ];

  // Handle profile form changes
  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Submit profile updates
const handleProfileSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Basic validation
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    const response = await fetch(`http://localhost:5000/api/update/profile/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    toast.success('Profile updated successfully!');
    navigate(-1); // Go back to previous page
    
  } catch (err) {
    toast.error(err.message);
  }
};

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    
      try {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    // Validate password strength (optional)
        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        const requestData = {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        };
    const response = await fetch(`http://localhost:5000/api/update/password/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update ssword');
    }
      if (response.ok) {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
    toast.success('Password updated successfully!');
  } catch (err) {
    toast.error(err.message);
  }
};
    
  // Toggle weather preference
  const togglePreference = (preference) => {
    setWeatherPreferences({
      ...weatherPreferences,
      [preference]: !weatherPreferences[preference]
    });
  };

  // Update temperature threshold
  const updateTemperatureThreshold = (value) => {
    setWeatherPreferences({
      ...weatherPreferences,
      temperatureThreshold: parseInt(value)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute -bottom-16 left-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg"
              >
                {user?.email ? (
                  <span className="text-4xl font-bold text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </motion.div>
            </div>
            <div className="absolute right-6 bottom-6">
              {!isEditing && !isChangingPassword && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/90 text-blue-600 rounded-full shadow-md flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {formData.fullname || user?.email || 'Weather Enthusiast'}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Tabs */}
            <motion.div 
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab("weather")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'weather' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Weather Preferences
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'activity' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Recent Activity
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "profile" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isEditing ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleProfileChange}
                            placeholder="Enter your location"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : isChangingPassword ? (
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Update Password
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-blue-50/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Full Name</h3>
                            <p className="text-gray-800">{formData.fullname || 'Not specified'}</p>
                          </div>
                          <div className="bg-blue-50/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Email</h3>
                            <p className="text-gray-800">{user?.email || 'Not specified'}</p>
                          </div>
                          <div className="bg-blue-50/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Location</h3>
                            <p className="text-gray-800 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              {formData.location || 'Not specified'}
                            </p>
                          </div>
                          <div className="bg-blue-50/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Member Since</h3>
                            <p className="text-gray-800">
                              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="mt-6 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "weather" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Your Weather Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-3">
                          <CloudRain className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-medium">Rainfall Alerts</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Receive notifications when rainfall exceeds 10mm in your area
                        </p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={weatherPreferences.rainfallAlerts} 
                            onChange={() => togglePreference('rainfallAlerts')}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {weatherPreferences.rainfallAlerts ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-3">
                          <Thermometer className="h-5 w-5 text-orange-500 mr-2" />
                          <h4 className="font-medium">Temperature Threshold</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Alert me when temperature exceeds:
                        </p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="20"
                            max="40"
                            value={weatherPreferences.temperatureThreshold}
                            onChange={(e) => updateTemperatureThreshold(e.target.value)}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm font-medium w-10 text-center">
                            {weatherPreferences.temperatureThreshold}°C
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-3">
                          <Wind className="h-5 w-5 text-blue-400 mr-2" />
                          <h4 className="font-medium">Wind Speed Alerts</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Notify me when wind speed exceeds 30km/h
                        </p>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={weatherPreferences.windSpeedAlerts} 
                            onChange={() => togglePreference('windSpeedAlerts')}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-700">
                            {weatherPreferences.windSpeedAlerts ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-3">
                          <MapPin className="h-5 w-5 text-green-500 mr-2" />
                          <h4 className="font-medium">Saved Locations</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Your favorite weather locations
                        </p>
                        <div className="space-y-2">
                          {weatherPreferences.locations.map((location, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50/50 px-3 py-2 rounded-lg">
                              <span className="text-sm font-medium">{location}</span>
                              <button 
                                className="text-red-500 hover:text-red-700 text-sm"
                                onClick={() => {
                                  setWeatherPreferences({
                                    ...weatherPreferences,
                                    locations: weatherPreferences.locations.filter((_, i) => i !== index)
                                  });
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button 
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          onClick={() => {
                            const newLocation = prompt("Enter new location:");
                            if (newLocation) {
                              setWeatherPreferences({
                                ...weatherPreferences,
                                locations: [...weatherPreferences.locations, newLocation]
                              });
                            }
                          }}
                        >
                          + Add new location
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "activity" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {activityData.map((activity) => (
                        <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                          <div className="bg-blue-100 p-2 rounded-full mr-4">
                            <Droplets className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Weather Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">Your Weather Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CloudRain className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-700">Rainfall Checks</span>
                  </div>
                  <span className="font-medium">142</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-700">Temp Alerts</span>
                  </div>
                  <span className="font-medium">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wind className="h-5 w-5 text-blue-400 mr-3" />
                    <span className="text-gray-700">Wind Warnings</span>
                  </div>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Saved Locations</span>
                  </div>
                  <span className="font-medium">{weatherPreferences.locations.length}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setActiveTab("profile");
                    setIsChangingPassword(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-blue-700 font-medium">Change Password</span>
                  <Lock className="h-4 w-4 text-blue-600" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <span className="text-blue-700 font-medium">Notification Settings</span>
                  <Mail className="h-4 w-4 text-blue-600" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <span className="text-blue-700 font-medium">Data Privacy</span>
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Weather Insights Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-medium mb-3">Your Weather Insights</h3>
              <p className="text-sm mb-4 opacity-90">
                You check rainfall predictions 40% more than average users in your region.
              </p>
              <div className="h-2 bg-white/20 rounded-full mb-2">
                <div className="h-2 bg-yellow-300 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs opacity-80">Your activity: High</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;