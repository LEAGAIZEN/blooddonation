import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If no token exists, send them to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If children are provided, render them. Otherwise, fallback to Outlet.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;