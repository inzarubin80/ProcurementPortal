import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { hasStoredUserData } from '../../utils/authUtils';

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.user);
  
  // Проверяем сохраненные данные пользователя и статус авторизации
  const hasStoredData = hasStoredUserData();
  const isUserAuthenticated = hasStoredData && isAuthenticated;

  // Если идет загрузка, показываем индикатор загрузки
  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isUserAuthenticated) {
    // Сохраняем URL для редиректа после входа
    localStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute; 