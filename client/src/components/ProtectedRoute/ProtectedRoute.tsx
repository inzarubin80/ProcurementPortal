import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { RootState, AppDispatch } from '../../store';
import { checkAuthToken } from '../../store/slices/userSlice';
import { isTokenValid } from '../../utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, userID, error } = useSelector((state: RootState) => state.user);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Проверяем токен только один раз при монтировании компонента
  useEffect(() => {
    if (!hasCheckedAuth) {
      console.log('ProtectedRoute: Checking authentication...');
      if (isTokenValid()) {
        console.log('ProtectedRoute: Token found, validating...');
        dispatch(checkAuthToken());
      } else {
        console.log('ProtectedRoute: No valid token found, redirecting to login');
        navigate('/login');
      }
      setHasCheckedAuth(true);
    }
  }, [dispatch, navigate, hasCheckedAuth]);

  // Если после проверки пользователь не авторизован, редиректим на логин
  useEffect(() => {
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, hasCheckedAuth]);

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <CircularProgress size={60} />
          <Typography variant="h6" style={{ marginTop: 16 }}>
            Проверка авторизации...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Если пользователь авторизован, показываем защищенный контент
  if (isAuthenticated && userID) {
    console.log('ProtectedRoute: User authenticated, showing content');
    return <>{children}</>;
  }

  // Если есть ошибка, показываем её
  if (error) {
    console.log('ProtectedRoute: Authentication error:', error);
  }

  // Если не авторизован, показываем загрузку (будет редирект)
  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" style={{ marginTop: 16 }}>
          Перенаправление на страницу входа...
        </Typography>
      </Box>
    </Container>
  );
};

export default ProtectedRoute; 