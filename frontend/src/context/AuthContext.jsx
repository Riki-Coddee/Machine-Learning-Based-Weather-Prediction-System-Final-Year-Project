import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
const verifyToken = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/api/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data };
    }
    return { success: false, error: await response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setLoading(false);
    return;
  }

  verifyToken(token).then(result => {
    if (result.success) {
      setUser({
        id: result.user.id,
        email: result.user.email,
        token: token,
        fullname: result.user.fullname
      });
    } else {
      localStorage.removeItem('token');
    }
    setLoading(false);
  });
}, []);

const login = async (email, password) => {
  try {
    setError(null);
    setLoading(true);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract error message from backend response
      const errorMessage = data.message || data.error || 
                         (response.status === 401 ? 'Invalid email or password' : 'Login failed');
      throw new Error(errorMessage);
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      fullname: data.user.fullname,
      createdAt: data.user.created_at,
      lastActive: data.user.last_active,
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser({
      ...userData,
      token: data.token
    });

    toast.success(`Welcome, ${userData.fullname || userData.email}!`);
    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.message || 'Login failed. Please try again.';
    setError(errorMessage);
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      error,
      setError
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);