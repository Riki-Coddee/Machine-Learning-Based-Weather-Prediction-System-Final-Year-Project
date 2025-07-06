import { useAdminAuth } from '../context/AdminAuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};