import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography, Container } from '@mui/material';
import { setLoginData } from '../../store/slices/userSlice';
import { AppDispatch } from '../../store';
import { publicAxios } from '../../service/http-common';

const AuthCallback: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = React.useRef("");
  
  interface PostData {
    AuthorizationCode: string;
    ProviderKey: string;
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const provider = queryParams.get('provider') || queryParams.get('state');

      if (code && intervalRef.current !== code) {
        intervalRef.current = code;
        

        if (code && provider) {
          const data: PostData = {
            AuthorizationCode: code,
            ProviderKey: provider,
          };

          try {
            const response = await publicAxios.post('/user/login', data, {
              withCredentials: true, // Отправляем куки
            });

            dispatch(setLoginData(response.data));
           
            const fromLocal = localStorage.getItem('redirectUrl');
            localStorage.removeItem('redirectUrl');
            const from = fromLocal || '/'; 
            navigate(from);
         
          } catch (error) {
            console.error('Error during login:', error);
            navigate('/login?error=auth_failed');
          }
        } else {
          console.error('Missing code or provider in query params');
          navigate('/login?error=missing_params');
        }
      }
    };

    handleAuthCallback();
  }, [location.search, navigate, dispatch]);

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Обработка авторизации...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Пожалуйста, подождите
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthCallback; 