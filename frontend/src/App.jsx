
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import HomePage from "./pages/HomePage";
import PredictionPage from "./pages/PredictionPage";
import HistoricalData from "./pages/HistoricalData";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import ScrollToTop from "./components/ScrollToTop";
import ViewUserPredictions from "./pages/ViewUserPredictions";
import WeatherNewsPortal from "./pages/WeatherNewsPortal";
import AdminPanel from "./admin/AdminPanel";
import Dashboard from "./admin/Dashboard";
import UserManagement from "./admin/UserManagement";
import PredictionHistory from "./admin/PredictionHistory";
import WeatherData from "./admin/WeatherData";
import NewsManagement from "./admin/NewsManagement";
import AdminSignup from "./admin/AdminSignup";
import AdminLogin from "./admin/AdminLogin";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import AdminFeedback from "./admin/AdminFeedback";
import Navbar from "./components/Navbar";
import AdminManagement from "./admin/AdminManagement";
import Footer from "./components/Footer";
import NewsDetail from "./pages/NewsDetail";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import AllNewsPage from './pages/AllNewsPage';
import MyProfile from './pages/MyProfile';
// ... other imports remain the same ...

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") && 
                      !["/admin/login", "/admin/register"].includes(location.pathname);

  return (
    <ScrollToTop>
      {/* Show Navbar for non-admin routes */}
      {!isAdminRoute && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin/register" element={<AdminSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path="/" element={<WeatherNewsPortal />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/historical" element={<HistoricalData />} />
          <Route path="/technology" element={<HomePage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/home" element={<WeatherNewsPortal />} />
          <Route path="/view_user_predictions" element={<ViewUserPredictions />} />
          <Route path="/all-news" element={<AllNewsPage />} />
          <Route path="/my_profile" element={<MyProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedAdminRoute><Outlet /></ProtectedAdminRoute>}>
          <Route path="/admin" element={<AdminPanel />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="predictions" element={<PredictionHistory />} />
            <Route path="weather-data" element={<WeatherData />} />
            <Route path="user/feedback" element={<AdminFeedback />} />
            <Route path="news" element={<NewsManagement />} />
            <Route path="admins" element={<AdminManagement />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show Footer for non-admin routes */}
      {!isAdminRoute && <Footer />}
    </ScrollToTop>
  );
}

export default App;