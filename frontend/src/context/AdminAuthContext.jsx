import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
const verifyToken = async (token) => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/verify', {
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
  const token = localStorage.getItem('admin_token');
  if (!token) {
    setLoading(false);
    return;
  }

  verifyToken(token).then(result => {
    if (result.success) {
      setAdmin({
        email: result.user.email,
        token: token,
        fullname: result.user.fullname
      });
    } else {
      localStorage.removeItem('admin_token');
    }
    setLoading(false);
  });
}, []);

   const login = async (email, password) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin', JSON.stringify({
      id: data.admin.id,
      fullname: data.admin.fullname,
      last_active: data.admin.last_active
    }));
      setAdmin({
        id: data.user_id,
        email: data.email,
        token: data.token
      });
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    setAdmin(null);
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ 
      admin, 
      login, 
      logout, 
      loading, 
      error,
      setError, setLoading
    }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);