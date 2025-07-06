import { BarChart, Database, Users, Shield, MessageSquare, Newspaper, Activity, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 2,
    todayPredictions: 23,
    systemAccuracy: 86,
    totalAdmins: 2,
    totalNews: 7,
    newFeedback: 1
  });
  const adminDataString = localStorage.getItem('admin');
  const adminData = JSON.parse(adminDataString);
const adminId = adminData.id;
const adminEmail = adminData.fullname;
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'login',
      user: adminEmail,
      time: '2 minutes ago',
      icon: <UserCheck className="text-blue-500" />,
      color: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'prediction',
      user: adminEmail,
      time: '15 minutes ago',
      icon: <Database className="text-green-500" />,
      color: 'bg-green-100'
    },
    {
      id: 3,
      type: 'news',
      title: 'Monsoon Update Published',
      time: '1 hour ago',
      icon: <Newspaper className="text-red-500" />,
      color: 'bg-red-100'
    },
    {
      id: 4,
      type: 'warning',
      message: 'High prediction volume detected',
      time: '3 hours ago',
      icon: <AlertTriangle className="text-yellow-500" />,
      color: 'bg-yellow-100'
    },
    {
      id: 5,
      type: 'feedback',
      user: 'feedback@user.org',
      time: '5 hours ago',
      icon: <MessageSquare className="text-purple-500" />,
      color: 'bg-purple-100'
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        const data = await response.json();
        setStats({
          totalUsers: data.total_users,
          todayPredictions: data.today_predictions,
          systemAccuracy: data.system_accuracy,
          totalAdmins: data.total_admins,
          totalNews: data.total_news,
          newFeedback: data.new_feedback
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Overview</h1>
        <div className="flex items-center space-x-2 text-gray-500">
          <Clock className="h-5 w-5" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-100 transform transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-200">
                  <Users className="text-blue-600 h-6 w-6" />
                </div>
                <h3 className="text-gray-600 font-medium">Total Users</h3>
              </div>
              <p className="text-4xl font-bold text-blue-800">{stats.totalUsers}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800">+12% this month</span>
          </div>
        </div>
        
        {/* Today's Predictions Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-100 transform transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-green-200">
                  <Database className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="text-gray-600 font-medium">Today's Predictions</h3>
              </div>
              <p className="text-4xl font-bold text-green-800">{stats.todayPredictions}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">+24 today</span>
          </div>
        </div>
        
        {/* System Accuracy Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-100 transform transition-all hover:scale-[1.02]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-200">
              <BarChart className="text-purple-600 h-6 w-6" />
            </div>
            <h3 className="text-gray-600 font-medium">System Accuracy</h3>
          </div>
          <div className="flex items-end space-x-2">
            <p className="text-4xl font-bold text-purple-800">{stats.systemAccuracy}%</p>
            <div className="w-full bg-purple-200 rounded-full h-2.5 mb-1">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${stats.systemAccuracy}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Admins Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-lg border border-orange-100 transform transition-all hover:scale-[1.02]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-orange-200">
              <Shield className="text-orange-600 h-6 w-6" />
            </div>
            <h3 className="text-gray-600 font-medium">Total Admins</h3>
          </div>
          <p className="text-4xl font-bold text-orange-800">{stats.totalAdmins}</p>
        </div>

        {/* News Articles Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-100 transform transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-red-200">
                  <Newspaper className="text-red-600 h-6 w-6" />
                </div>
                <h3 className="text-gray-600 font-medium">News Articles</h3>
              </div>
              <p className="text-4xl font-bold text-red-800">{stats.totalNews}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-800">3 new today</span>
          </div>
        </div>

        {/* New Feedbacks Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl shadow-lg border border-yellow-100 transform transition-all hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-yellow-200">
                  <MessageSquare className="text-yellow-600 h-6 w-6" />
                </div>
                <h3 className="text-gray-600 font-medium">New Feedbacks</h3>
              </div>
              <p className="text-4xl font-bold text-yellow-800">{stats.newFeedback}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">Requires attention</span>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Activity className="text-indigo-500 mr-2" />
            Recent Activity
          </h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map(activity => (
            <div key={activity.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-3 rounded-full ${activity.color} mr-4`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                {activity.type === 'login' && (
                  <p className="text-gray-800">
                    <span className="font-medium">{activity.user}</span> logged in
                  </p>
                )}
                {activity.type === 'prediction' && (
                  <p className="text-gray-800">
                    New prediction submitted by <span className="font-medium">{activity.user}</span>
                  </p>
                )}
                {activity.type === 'news' && (
                  <p className="text-gray-800">
                    New article published: <span className="font-medium">{activity.title}</span>
                  </p>
                )}
                {activity.type === 'warning' && (
                  <p className="text-gray-800">
                    System alert: <span className="font-medium">{activity.message}</span>
                  </p>
                )}
                {activity.type === 'feedback' && (
                  <p className="text-gray-800">
                    New feedback received from <span className="font-medium">{activity.user}</span>
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}