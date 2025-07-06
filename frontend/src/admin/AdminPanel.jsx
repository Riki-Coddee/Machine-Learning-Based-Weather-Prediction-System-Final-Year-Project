import { BarChart3, CloudRain, Database, LogOut, Newspaper, Settings, Users } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({
    fullname: '',
    last_active: '',
    email: ''
  });
  
  useEffect(() => {
    // Get admin data from localStorage
    const storedAdmin = localStorage.getItem('admin');
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminData({
          fullname: parsedAdmin.fullname || '',
          last_active: parsedAdmin.last_active || '',
          email: parsedAdmin.email || ''
        });
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  // Format the Nepali time for display
  const formatLastActive = (isoString) => {
    if (!isoString) return 'No login data';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Kathmandu',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return new Date().toLocaleString(); // fallback to current time
    }
  };

  // Get first letter of fullname
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  // Get current section title from URL
  const getSectionTitle = () => {
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts.pop() || pathParts.pop(); // handle trailing slash
    return lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg flex flex-col"
      >
        {/* Logo/Header */}
        <div className="p-4 flex items-center space-x-2 border-b border-blue-700">
          <CloudRain className="h-8 w-8 text-blue-300" />
          <h1 className="text-xl font-bold">RainCheck Admin</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="p-4 space-y-2 flex-1">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/admin/users" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </Link>

          <Link 
            to="/admin/admins" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Admin Management</span>
          </Link>
          
          <Link 
            to="/admin/predictions" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Database className="h-5 w-5" />
            <span>Prediction History</span>
          </Link>
          
          <Link 
            to="/admin/user/feedback" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CloudRain className="h-5 w-5" />
            <span>User Feedbacks</span>
          </Link>
          
          <Link 
            to="/admin/news" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Newspaper className="h-5 w-5" />
            <span>Weather News</span>
          </Link>
          
          <Link 
            to="/admin/settings" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </Link>
        </nav>
        
        {/* Admin Profile & Logout */}
        <div className="p-4 border-t border-blue-700 space-y-3">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-800">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {getInitial(adminData.fullname)}
            </div>
            <div className="truncate">
              <p className="font-medium truncate">{adminData.fullname}</p>
              <p className="text-xs text-blue-200 truncate">{adminData.email}</p>
            </div>
          </div>
          
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`
              flex items-center justify-center space-x-3 w-full p-3 rounded-lg
              bg-red-600 hover:bg-red-700 transition-all duration-200
              text-white font-medium
              shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50
            `}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {getSectionTitle()}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Last active: {formatLastActive(adminData.last_active)}
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {getInitial(adminData.fullname)}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
          
          {/* Default Dashboard Content */}
          {window.location.pathname === "/admin/dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <h3 className="text-gray-500">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">2</p>
                <p className="text-green-500 text-sm">↑ 12% from last month</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <h3 className="text-gray-500">Predictions Today</h3>
                <p className="text-3xl font-bold text-blue-600">2</p>
                <p className="text-green-500 text-sm">↑ 2% from yesterday</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <h3 className="text-gray-500">System Accuracy</h3>
                <p className="text-3xl font-bold text-blue-600">86%</p>
                <p className="text-green-500 text-sm">2.1% this week</p>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}