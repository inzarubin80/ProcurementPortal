import React, { useEffect, useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProviders } from '../store/slices/authProviderSlice';
import { AuthProvider } from '../types/api';
import { userExercisesApi } from '../service/userExercisesApi';
import { guestLoginUser } from '../store/slices/userSlice';

const AuthProviders: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { providers, loading, error } = useSelector((state: RootState) => state.authProviders);

  // Guest login state
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProviders());
  }, [dispatch]);

  const handleProviderClick = (provider: AuthProvider) => {
    const authUrl = new URL(provider.AuthURL);
    authUrl.searchParams.append('client_id', provider.ClientId);
    authUrl.searchParams.append('redirect_uri', provider.RedirectUri);
    authUrl.searchParams.append('response_type', 'code');
    const scope = getProviderScope(provider);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', provider.Provider);
    window.location.href = authUrl.toString();
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setGuestError(null);
    try {
      const resultAction = await dispatch(guestLoginUser());
      if (guestLoginUser.fulfilled.match(resultAction)) {
        window.location.href = '/';
      } else {
        setGuestError(resultAction.payload as string || 'Ошибка анонимного входа');
      }
    } catch (e: any) {
      setGuestError(e?.response?.data?.message || 'Ошибка анонимного входа');
    } finally {
      setGuestLoading(false);
    }
  };

  const getProviderScope = (provider: AuthProvider) => {
    return provider.Scopes ? provider.Scopes.join(' ') : '';
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
      case 'guest':
        return theme.palette.success.main;
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

        {/* Кнопка "Войти как гость" */}
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleGuestLogin}
          sx={{
            py: 2,
            px: 3,
            border: `2px solid ${getProviderColor('guest')}`,
            color: getProviderColor('guest'),
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
              backgroundColor: getProviderColor('guest'),
              color: 'white',
              borderColor: getProviderColor('guest'),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 8px rgba(0,0,0,0.1)`,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
          disabled={guestLoading}
        >
          <Box
            component="div"
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
          >
            {/* Простая иконка пользователя */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill={getProviderColor('guest')} />
              <rect x="4" y="16" width="16" height="4" rx="2" fill={getProviderColor('guest')} />
            </svg>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {guestLoading ? <CircularProgress size={20} color="inherit" /> : 'Войти как гость'}
          </Typography>
        </Button>
        {guestError && <Alert severity="error">{guestError}</Alert>}
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