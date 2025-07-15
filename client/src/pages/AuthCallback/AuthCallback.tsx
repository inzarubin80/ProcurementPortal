import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography, Container, Snackbar } from '@mui/material';
import { setLoginData } from '../../store/slices/userSlice';
import { AppDispatch } from '../../store';
import { authAxios } from '../../service/http-common';

const AuthCallback: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = React.useRef("");
  
  interface PostData {
    AuthorizationCode: string;
    ProviderKey: string;
  }

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const handleAuthCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const provider = queryParams.get('provider') || queryParams.get('state');
      const state = queryParams.get('state') || '';

      if (code && intervalRef.current !== code) {
        intervalRef.current = code;
        

        if (code && provider) {
          // Если state начинается с 'link_', это привязка
          if (state.startsWith('link_')) {
            try {
              await authAxios.get(
                `/user/providers/link?code=${encodeURIComponent(code)}&provider=${encodeURIComponent(provider)}`,
                { withCredentials: true }
              );
              setSnackbar({ open: true, message: 'Провайдер успешно привязан к вашему профилю!', severity: 'success' });
              setTimeout(() => navigate('/profile'), 1200);
            } catch (error) {
              setSnackbar({ open: true, message: 'Ошибка привязки провайдера', severity: 'error' });
              setTimeout(() => navigate('/profile'), 1200);
            }
          } else {
            // Обычный логин
            const data: PostData = {
              AuthorizationCode: code,
              ProviderKey: provider,
            };

            try {
              const response = await authAxios.post('/user/login', data, {
                withCredentials: true, // Отправляем куки
              });

              dispatch(setLoginData(response.data));
             
              const fromLocal = localStorage.getItem('redirectUrl');
              localStorage.removeItem('redirectUrl');
              const from = fromLocal || '/'; 
              navigate(from);
           
            } catch (error) {
              setSnackbar({ open: true, message: 'Ошибка входа через провайдера', severity: 'error' });
              setTimeout(() => navigate('/login?error=auth_failed'), 1200);
            }
          }
        } else {
          setSnackbar({ open: true, message: 'Отсутствует code или provider', severity: 'error' });
          setTimeout(() => navigate('/login?error=missing_params'), 1200);
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ style: { backgroundColor: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', color: 'white', fontWeight: 600 } }}
      />
    </Container>
  );
};

export default AuthCallback; 