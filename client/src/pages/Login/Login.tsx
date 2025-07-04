import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, useTheme, useMediaQuery, Button, Alert } from '@mui/material';
import AuthProviders from '../../components/AuthProviders';
import { RootState, AppDispatch } from '../../store';
import { fetchProviders } from '../../store/slices/authProviderSlice';
import { publicAxios } from '../../service/http-common';
import { AuthProvider } from '../../types/api';

const Login: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { providers, loading: isLoading, error } = useSelector((state: RootState) => state.authProviders);
    const { isAuthenticated } = useSelector((state: RootState) => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        // Если пользователь уже авторизован, перенаправляем на главную
        if (isAuthenticated) {
            navigate('/');
            return;
        }

        // Загружаем провайдеров аутентификации
        console.log('Login: Loading providers...');
        dispatch(fetchProviders());

        // Тестируем CORS
        testCORS();
    }, [dispatch, navigate, isAuthenticated]);

    const testCORS = async () => {
        try {
            console.log('Login: Testing CORS...');
            const response = await publicAxios.get('/ping');
            console.log('Login: CORS test successful:', response.data);
        } catch (error: any) {
            console.error('Login: CORS test failed:', error);
            console.error('Login: Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
        }
    };

    const handleProviderLogin = (provider: string) => {
        console.log('Login: Attempting login with provider:', provider);
        // Здесь будет логика входа через провайдера
    };

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
                    <Typography variant="h4" gutterBottom>
                        Загрузка провайдеров...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ px: isMobile ? 2 : 3 }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="95vh"
                py={isMobile ? 4 : 6}
                px={isMobile ? 2 : 4}
                textAlign="center"
            >
                {/* Заголовок с акцентом */}
                <Typography
                    variant={isMobile ? "h4" : "h3"}
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 2,
                        fontSize: isMobile ? '2rem' : '3rem',
                        textAlign: 'center',
                        lineHeight: 1.2
                    }}
                >
                    Memo-Code
                </Typography>

                {/* Подзаголовок с преимуществами */}
                <Typography
                    variant="subtitle1"
                    sx={{
                        mb: 4,
                        color: theme.palette.text.secondary,
                        fontSize: isMobile ? '1rem' : '1.25rem',
                        maxWidth: 500
                    }}
                >
                    Создавайте упражнения для запоминания кода<br />
                    и улучшайте свои навыки программирования<br />
                    <Box component="span" fontWeight="600" color={theme.palette.primary.main}>
                        эффективно и увлекательно!
                    </Box>
                </Typography>

                {/* Компонент с провайдерами авторизации */}
                <Box sx={{ 
                    width: '100%', 
                    maxWidth: 400,
                    mt: 2,
                }}>
                    {error && (
                        <Alert severity="error" style={{ marginBottom: 16, width: '100%' }}>
                            Ошибка загрузки провайдеров: {error}
                        </Alert>
                    )}

                    <Box display="flex" flexDirection="column" gap={2} width="100%">
                        {providers.map((provider: AuthProvider) => (
                            <Button
                                key={provider.Provider}
                                variant="contained"
                                size="large"
                                onClick={() => handleProviderLogin(provider.Provider)}
                                style={{ marginBottom: 8 }}
                            >
                                Войти через {provider.Provider}
                            </Button>
                        ))}
                    </Box>
                </Box>

                {/* Мотивационная иллюстрация - иероглиф упорства */}
                <Box
                    sx={{
                        width: isMobile ? 200 : 280,
                        height: isMobile ? 200 : 280,
                        mt: 4,
                        mb: 2,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 300 300"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Фон */}
                        <defs>
                            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={theme.palette.primary.light} stopOpacity="0.05" />
                                <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity="0.1" />
                            </linearGradient>
                            <linearGradient id="kanjiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={theme.palette.primary.main} />
                                <stop offset="50%" stopColor={theme.palette.secondary.main} />
                                <stop offset="100%" stopColor={theme.palette.primary.dark} />
                            </linearGradient>
                            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={theme.palette.warning.main} />
                                <stop offset="100%" stopColor={theme.palette.warning.dark} />
                            </linearGradient>
                        </defs>
                        
                        {/* Фоновая окружность */}
                        <circle cx="150" cy="150" r="120" fill="url(#bgGradient)" stroke={theme.palette.primary.main} strokeWidth="2" opacity="0.3" />
                        
                        {/* Иероглиф 練 (рэн) - упорство, тренировка */}
                        <g fill="url(#kanjiGradient)" stroke="url(#strokeGradient)" strokeWidth="3">
                            {/* Левая часть иероглифа - шелк/нить */}
                            <path d="M 80 80 L 120 80 L 120 220 L 80 220 Z" />
                            <path d="M 85 90 L 115 90" strokeWidth="2" />
                            <path d="M 85 110 L 115 110" strokeWidth="2" />
                            <path d="M 85 130 L 115 130" strokeWidth="2" />
                            <path d="M 85 150 L 115 150" strokeWidth="2" />
                            <path d="M 85 170 L 115 170" strokeWidth="2" />
                            <path d="M 85 190 L 115 190" strokeWidth="2" />
                            <path d="M 85 210 L 115 210" strokeWidth="2" />
                            
                            {/* Правая часть - огонь/энергия */}
                            <path d="M 130 80 L 220 80 L 220 220 L 130 220 Z" />
                            
                            {/* Внутренние элементы огня */}
                            <path d="M 140 100 L 210 100" strokeWidth="2" />
                            <path d="M 140 120 L 210 120" strokeWidth="2" />
                            <path d="M 140 140 L 210 140" strokeWidth="2" />
                            <path d="M 140 160 L 210 160" strokeWidth="2" />
                            <path d="M 140 180 L 210 180" strokeWidth="2" />
                            <path d="M 140 200 L 210 200" strokeWidth="2" />
                            
                            {/* Вертикальные линии энергии */}
                            <path d="M 160 90 L 160 210" strokeWidth="2" />
                            <path d="M 180 90 L 180 210" strokeWidth="2" />
                            <path d="M 200 90 L 200 210" strokeWidth="2" />
                        </g>
                        
                        {/* Эффект свечения вокруг иероглифа */}
                        <circle cx="150" cy="150" r="125" fill="none" stroke={theme.palette.primary.light} strokeWidth="1" opacity="0.6">
                            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
                        </circle>
                        
                        {/* Частицы энергии */}
                        <g fill={theme.palette.warning.light}>
                            <circle cx="70" cy="100" r="3">
                                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="230" cy="100" r="3">
                                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
                            </circle>
                            <circle cx="70" cy="200" r="3">
                                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s" />
                            </circle>
                            <circle cx="230" cy="200" r="3">
                                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
                            </circle>
                        </g>
                        
                        {/* Текст объяснения */}
                        <text x="150" y="250" textAnchor="middle" fontSize="14" fontWeight="bold" fill={theme.palette.primary.main}>
                            練 - Упорство и Тренировка
                        </text>
                        
                        {/* Дополнительный мотивационный текст */}
                        <text x="150" y="270" textAnchor="middle" fontSize="12" fill={theme.palette.text.secondary}>
                            Постоянная практика ведет к мастерству
                        </text>
                        
                        {/* Декоративные элементы - символы кода */}
                        <g fill={theme.palette.primary.light} opacity="0.4">
                            <text x="50" y="80" fontSize="12" fontWeight="bold">&lt;/&gt;</text>
                            <text x="250" y="80" fontSize="12" fontWeight="bold">function()</text>
                            <text x="50" y="220" fontSize="12" fontWeight="bold">return exercise;</text>
                            <text x="250" y="220" fontSize="12" fontWeight="bold">{}</text>
                        </g>
                        
                        {/* Анимированные линии энергии */}
                        <g stroke={theme.palette.warning.main} strokeWidth="2" opacity="0.7">
                            <line x1="60" y1="150" x2="80" y2="150">
                                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                            </line>
                            <line x1="220" y1="150" x2="240" y2="150">
                                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s" />
                            </line>
                        </g>
                    </svg>
                </Box>

                {/* Дополнительный мотивационный текст */}
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 2,
                        color: theme.palette.text.secondary,
                        fontStyle: 'italic'
                    }}
                >
                    Начните создавать свои упражнения уже сегодня!
                </Typography>
            </Box>
        </Container>
    );
};

export default Login; 