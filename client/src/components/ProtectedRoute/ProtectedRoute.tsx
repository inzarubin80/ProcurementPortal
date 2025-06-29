import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Container } from '@mui/material';
import { RootState, AppDispatch } from '../../store';
import { getSession } from '../../store/slices/userSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Если пользователь не авторизован, проверяем сессию
    if (!isAuthenticated && !isLoading) {
      dispatch(getSession());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  useEffect(() => {
    // Если после проверки сессии пользователь все еще не авторизован, перенаправляем на логин
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
        </Box>
      </Container>
    );
  }

  // Если пользователь авторизован, показываем защищенный контент
  if (isAuthenticated && user) {
    return <>{children}</>;
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
      </Box>
    </Container>
  );
};

export default ProtectedRoute; 