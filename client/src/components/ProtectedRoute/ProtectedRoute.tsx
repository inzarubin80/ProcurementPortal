import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { isTokenValid } from '../../utils/authUtils';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  
  // Проверяем токен и статус авторизации
  const hasValidToken = isTokenValid();
  const isUserAuthenticated = hasValidToken && isAuthenticated;

  if (!isUserAuthenticated) {
    // Сохраняем URL для редиректа после входа
    localStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 