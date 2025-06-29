import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import AuthProviders from '../../components/AuthProviders';

const Login: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                    MemCode
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

                {/* Дополнительный мотивационный текст */}
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 3,
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