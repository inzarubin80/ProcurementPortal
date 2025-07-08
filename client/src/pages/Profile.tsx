import React, { useEffect } from 'react';
import { Container, Paper, Typography, Box, Avatar, Stack } from '@mui/material';
import { AccountCircle, TrendingUp, ThumbUp, CheckCircle } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExercises } from '../store/slices/exerciseSlice';
import { fetchUserStats } from '../store/slices/userStatsSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userName = useSelector((state: RootState) => state.user.userName);
  const userStats = useSelector((state: RootState) => state.userStats.userStats);


  useEffect(() => {
      dispatch(fetchUserStats());

  }, [dispatch]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
            <AccountCircle sx={{ fontSize: 48 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{userName || 'Пользователь'}</Typography>
            <Typography color="text.secondary">Профиль пользователя</Typography>
          </Box>
        </Stack>
        <Typography variant="h6" sx={{ mb: 2 }}>Ваша статистика</Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp color="secondary" sx={{ mr: 1 }} />
            <Typography>Всего упражнений: <b>{userStats ? userStats.total_exercises : 0}</b></Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThumbUp color="secondary" sx={{ mr: 1 }} />
            <Typography>Выполнено упражнений: <b>{userStats ? userStats.completed_exercises : 0}</b></Typography>
          </Box>

        </Stack>
      </Paper>
    </Container>
  );
};

export default Profile; 