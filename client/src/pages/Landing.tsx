import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  Keyboard as KeyboardIcon,
  ThumbUp as ThumbUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUserStats } from '../store/slices/userStatsSlice';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const { userStats, isLoading, error } = useSelector((state: RootState) => state.userStats);

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      dispatch(fetchUserStats());
    }
  }, [isAuthenticated, user?.user_id, dispatch]);

  // Отладочная информация
  useEffect(() => {
    if (userStats) {
      console.log('UserStats from server:', userStats);
      console.log('total_attempts type:', typeof userStats.total_attempts, 'value:', userStats.total_attempts);
    }
  }, [userStats]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  // Функция для безопасного преобразования значений
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1da1f2' }}>
            Добро пожаловать в Memo-Code
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Платформа для изучения программирования через практику
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            sx={{ 
              backgroundColor: '#1da1f2',
              '&:hover': { backgroundColor: '#0d8bd9' },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Войти в систему
          </Button>
        </Paper>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1da1f2', mb: 2 }}>
        Добро пожаловать, {user?.name || 'Пользователь'}!
      </Typography>

      {error ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => dispatch(fetchUserStats())}
            sx={{ mt: 2 }}
          >
            Попробовать снова
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Основная статистика */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Общий прогресс
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <AssignmentIcon sx={{ fontSize: 40, color: '#1da1f2', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1da1f2' }}>
                        {safeNumber(userStats?.total_exercises)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Всего упражнений
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <CheckCircleIcon sx={{ fontSize: 40, color: '#28a745', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                        {safeNumber(userStats?.completed_exercises)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Завершено
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                      <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        {safeNumber(userStats?.total_attempts)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Попытки
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
         
        
              </Grid>
            </Paper>
          </Grid>

          {/* Дополнительная информация */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Советы для эффективного обучения
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TimerIcon sx={{ fontSize: 40, color: '#1da1f2', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Регулярность
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Занимайтесь каждый день по 30 минут
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <KeyboardIcon sx={{ fontSize: 40, color: '#28a745', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Практика
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Пишите код самостоятельно
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#ffc107', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Повторение
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Повторяйте сложные упражнения
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#dc3545', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Прогресс
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Отслеживайте свой прогресс
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Landing; 