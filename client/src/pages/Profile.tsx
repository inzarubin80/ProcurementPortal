import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Avatar, Stack } from '@mui/material';
import { AccountCircle, TrendingUp, ThumbUp, Speed, CheckCircle } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExercises } from '../store/slices/exerciseSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { exercises } = useSelector((state: RootState) => state.exercises);
  
  // Моки для статистики
  const [stats, setStats] = useState({
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    totalTime: 0,
  });

  useEffect(() => {
    // Загружаем каты для подсчета статистики
    dispatch(fetchExercises({ page: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    // Обновляем статистику когда каты загружены
    if (exercises.length > 0) {
      setStats({
        totalExercises: exercises.length,
        completedExercises: Math.floor(exercises.length * 0.7), // Мок: 70% выполнено
        averageScore: 85, // Мок: средний балл
        totalTime: exercises.length * 15, // Мок: 15 минут на кату
      });
    }
  }, [exercises]);

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
            <Typography>Всего кат: <b>{stats.totalExercises}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThumbUp color="success" sx={{ mr: 1 }} />
            <Typography>Выполнено кат: <b>{stats.completedExercises}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle color="info" sx={{ mr: 1 }} />
            <Typography>Средний балл: <b>{stats.averageScore}%</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Speed color="secondary" sx={{ mr: 1 }} />
            <Typography>Общее время: <b>{stats.totalTime} мин</b></Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Profile; 