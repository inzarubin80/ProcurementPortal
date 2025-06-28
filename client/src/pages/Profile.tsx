import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Avatar, Stack } from '@mui/material';
import { AccountCircle, TrendingUp, ThumbUp, Speed, CheckCircle } from '@mui/icons-material';
import { exerciseApi } from '../services/api';

const Profile: React.FC = () => {
  // Моки для статистики
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successfulAttempts: 0,
    averageAccuracy: 0,
    averageWpm: 0,
  });

  useEffect(() => {
    // Здесь можно получить статистику из API или сессий, пока моки
    // Например, суммировать по всем упражнениям
    exerciseApi.getExercises().then(exs => {
      // В реальном приложении брать из сессий
      const totalAttempts = exs.reduce((sum, e) => sum + (e.attempts || 0), 0);
      const successfulAttempts = exs.reduce((sum, e) => sum + (e.successful_attempts || 0), 0);
      setStats({
        totalAttempts,
        successfulAttempts,
        averageAccuracy: 97,
        averageWpm: 42,
      });
    });
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            <AccountCircle sx={{ fontSize: 48 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">Иван Иванов</Typography>
            <Typography color="text.secondary">Профиль пользователя</Typography>
          </Box>
        </Stack>
        <Typography variant="h6" sx={{ mb: 2 }}>Ваша статистика</Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp color="primary" sx={{ mr: 1 }} />
            <Typography>Всего попыток: <b>{stats.totalAttempts}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThumbUp color="success" sx={{ mr: 1 }} />
            <Typography>Успешных попыток: <b>{stats.successfulAttempts}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="info" sx={{ mr: 1 }} />
            <Typography>Средняя точность: <b>{stats.averageAccuracy}%</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Speed color="secondary" sx={{ mr: 1 }} />
            <Typography>Средняя скорость: <b>{stats.averageWpm} зн/мин</b></Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Profile; 