import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user } = useUserStore();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedAdminRoute;