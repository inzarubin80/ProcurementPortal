import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProviders } from '../store/slices/authProviderSlice';
import { AuthProvider } from '../types/api';

const AuthProviders: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { providers, loading, error } = useSelector((state: RootState) => state.authProviders);

  useEffect(() => {
    dispatch(fetchProviders());
  }, [dispatch]);

  const handleProviderClick = (provider: AuthProvider) => {
    // Создаем URL для авторизации с параметрами
    const authUrl = new URL(provider.AuthURL);
    authUrl.searchParams.append('client_id', provider.ClientId);
    authUrl.searchParams.append('redirect_uri', provider.RedirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'login:info');
    authUrl.searchParams.append('state', provider.Provider);
    
    // Перенаправляем пользователя на страницу авторизации
    window.location.href = authUrl.toString();
  };

  const getProviderDisplayName = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'yandex':
        return 'Войти через Яндекс';
      case 'google':
        return 'Войти через Google';
      case 'github':
        return 'Войти через GitHub';
      case 'vk':
        return 'Войти через ВКонтакте';
      case 'telegram':
        return 'Войти через Telegram';
      default:
        return `Войти через ${providerName}`;
    }
  };

  const getProviderColor = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'yandex':
        return '#FF0000';
      case 'google':
        return '#4285F4';
      case 'github':
        return '#333333';
      case 'vk':
        return '#4C75A3';
      case 'telegram':
        return '#0088CC';
      default:
        return theme.palette.primary.main;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка загрузки провайдеров: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <Stack spacing={2} sx={{ width: '100%' }}>
        {providers.map((provider) => (
          <Button
            key={provider.Provider}
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => handleProviderClick(provider)}
            sx={{
              py: 2,
              px: 3,
              border: `2px solid ${getProviderColor(provider.Provider)}`,
              color: getProviderColor(provider.Provider),
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: getProviderColor(provider.Provider),
                color: 'white',
                borderColor: getProviderColor(provider.Provider),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 8px rgba(0,0,0,0.1)`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <Box
              component="div"
              dangerouslySetInnerHTML={{ __html: provider.IconSVG }}
              sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': {
                  width: '100%',
                  height: '100%',
                },
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {getProviderDisplayName(provider.Provider)}
            </Typography>
          </Button>
        ))}
      </Stack>

      {providers.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Нет доступных провайдеров авторизации
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
           <Typography variant="body2" color="text.secondary">
          Выберите один из способов входа выше
        </Typography>
      </Box>
    </Container>
  );
};

export default AuthProviders; 