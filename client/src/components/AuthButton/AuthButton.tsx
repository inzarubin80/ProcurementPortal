import React from 'react';
import { Button, Box, Typography, useTheme } from '@mui/material';

interface AuthButtonProps {
  isMobile?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ isMobile = false }) => {
  const theme = useTheme();

  const handleAuthClick = () => {
    // Сохраняем текущий URL для редиректа после авторизации
    localStorage.setItem('redirectUrl', window.location.pathname);
    
    // URL для авторизации через Яндекс
    const authUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/providers`;
    
    // Открываем окно авторизации
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const authWindow = window.open(
      authUrl,
      'auth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    // Слушаем сообщения от окна авторизации
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== (process.env.REACT_APP_API_URL || 'http://localhost:8080')) {
        return;
      }

      if (event.data.type === 'AUTH_SUCCESS') {
        authWindow?.close();
        window.removeEventListener('message', handleMessage);
        // Перезагружаем страницу для обновления состояния
        window.location.reload();
      } else if (event.data.type === 'AUTH_ERROR') {
        authWindow?.close();
        window.removeEventListener('message', handleMessage);
        console.error('Auth error:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  return (
    <Button
      variant="contained"
      size={isMobile ? "medium" : "large"}
      onClick={handleAuthClick}
      sx={{
        width: '100%',
        height: isMobile ? 48 : 56,
        backgroundColor: '#FF0000',
        color: 'white',
        fontSize: isMobile ? '1rem' : '1.1rem',
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#CC0000',
          boxShadow: '0 6px 16px rgba(255, 0, 0, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <Box
        component="img"
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMiA2QzE0LjIwOTEgNiAxNiA3Ljc5MDg2IDE2IDEwQzE2IDEyLjIwOTEgMTQuMjA5MSAxNCAxMiAxNEM5Ljc5MDg2IDE0IDggMTIuMjA5MSA4IDEwQzggNy43OTA4NiA5Ljc5MDg2IDYgMTIgNloiIGZpbGw9IiNGRjAwMDAiLz4KPHBhdGggZD0iTTEyIDE4QzE1LjMxMzcgMTggMTggMTUuMzEzNyAxOCAxMkMxOCA4LjY4NjI5IDE1LjMxMzcgNiAxMiA2QzguNjg2MjkgNiA2IDguNjg2MjkgNiAxMkM2IDE1LjMxMzcgOC42ODYyOSAxOCAxMiAxOFoiIHN0cm9rZT0iI0ZGMDAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo="
        alt="Яндекс"
        sx={{
          width: 24,
          height: 24,
        }}
      />
      <Typography variant={isMobile ? "body1" : "h6"}>
        Войти через Яндекс
      </Typography>
    </Button>
  );
};

export default AuthButton; 