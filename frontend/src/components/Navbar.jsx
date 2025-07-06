import { CloudRain, Menu, X, User, Settings, LogOut, Home, Info, Cpu, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Safe user name extraction
  const getUserInitial = () => {
    if (!auth?.user?.name) return <User className="h-5 w-5" />;
    const initials = auth.user.name.split(' ').map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  };

  const getFirstName = () => {
    if (!auth?.user?.name) return 'Profile';
    return auth.user.name.split(' ')[0];
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm border-b border-gray-100"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <motion.div 
            whileHover={{ rotate: [0, 15, -5, 0] }}
            transition={{ duration: 0.6 }}
          >
            <CloudRain className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
          </motion.div>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
          >
            RainCheck
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium group"
            >
              <Home className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
              Home
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/about-us"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium group"
            >
              <Info className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
              About
            </Link>
          </motion.div>
            <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/contact"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium group"
            >
              <Mail className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
              Contact
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }}>
            <Link
              to="/technology"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium group"
            >
              <Cpu className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
              Technology
            </Link>
          </motion.div>
          
        

          {auth?.user ? (
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                  {getUserInitial()}
                </div>
                <span className="text-gray-700 font-medium">
                  {getFirstName()}
                </span>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      <Link
                        to="/my_profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-5 w-5 mr-3 text-gray-500" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-5 w-5 mr-3 text-gray-500" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          auth.logout();
                          setIsProfileOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium flex items-center"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </motion.button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
              <Link
                to="/about-us"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="h-5 w-5 mr-3" />
                About Us
              </Link>
              <Link
                to="/technology"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Cpu className="h-5 w-5 mr-3" />
                Technology
              </Link>
              <Link
                to="/contact"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Mail className="h-5 w-5 mr-3" />
                Contact
              </Link>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              {auth?.user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      auth.logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}