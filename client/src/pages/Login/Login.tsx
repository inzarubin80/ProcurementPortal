import React, { useState } from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery, Button, CircularProgress, Alert } from '@mui/material';
import AuthProviders from '../../components/AuthProviders';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { guestLoginUser } from '../../store/slices/userSlice';
import { userExercisesApi } from '../../service/userExercisesApi';

const Login: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const handleGuestLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const resultAction = await dispatch(guestLoginUser());
            if (guestLoginUser.fulfilled.match(resultAction)) {
                window.location.href = '/'; // редирект на главную после входа
            } else {
                setError(resultAction.payload as string || 'Ошибка анонимного входа');
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Ошибка анонимного входа');
        } finally {
            setLoading(false);
        }
    };

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
                    <AuthProviders />
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

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