import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import { PlayArrow as PlayIcon, Check as CheckIcon, Refresh as RefreshIcon, BarChart as BarChartIcon, ThumbUp as ThumbUpIcon, Visibility as VisibilityIcon, Edit as EditIcon, TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, Speed as SpeedIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExerciseById } from '../store/slices/exerciseSlice';
import { Exercise } from '../types/api';

const ExerciseCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentExercise: exercise, loading } = useSelector((state: RootState) => state.exercises);
  
  // Local state
  const [userCode, setUserCode] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [resultMsg, setResultMsg] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchExerciseById(id));
    }
  }, [id, dispatch]);

  const handleStart = () => {
    setIsStarted(true);
    setUserCode(exercise?.code_to_remember || '');
    setIsCorrect(null);
    setResultMsg('');
  };

  const handleCheck = () => {
    if (!exercise) return;
    const normalizedUserCode = userCode.trim().replace(/\s+/g, ' ');
    const normalizedExerciseCode = exercise.code_to_remember.trim().replace(/\s+/g, ' ');
    const correct = normalizedUserCode === normalizedExerciseCode;
    setIsCorrect(correct);
    setResultMsg(correct ? 'Поздравляем! Ваш код правильный!' : 'Код не совпадает, попробуйте ещё раз.');
  };

  const handleReset = () => {
    setIsStarted(false);
    setUserCode('');
    setIsCorrect(null);
    setResultMsg('');
  };

  const handleShowStats = () => setShowStats((prev) => !prev);

  if (loading || !exercise) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Описание</Typography>
          <Typography variant="body1">{exercise.description}</Typography>
        </Box>
      </Card>
      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
          <Typography variant="body2">Язык: <b>{exercise.programming_language}</b></Typography>
          <Typography variant="body2">Сложность: <b>{exercise.difficulty}</b></Typography>
          <Button
            size="small"
            endIcon={<ExpandMoreIcon sx={{ transform: showStats ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
            onClick={handleShowStats}
            sx={{ ml: 2, minWidth: 0, px: 1, fontSize: '0.9rem' }}
          >
            {showStats ? 'Скрыть' : 'Показать подробную статистику'}
          </Button>
        </Box>
        {showStats && (
          <Box sx={{ display: 'flex', gap: 3, mb: 2, mt: -1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2">Создано: <b>{new Date(exercise.created_at).toLocaleDateString()}</b></Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SpeedIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="body2">Обновлено: <b>{new Date(exercise.updated_at).toLocaleDateString()}</b></Typography>
            </Box>
          </Box>
        )}
        {!isStarted ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <VisibilityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>Код для повторения</Typography>
            </Box>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: 'hidden', background: '#fffde7', boxShadow: 0, userSelect: 'none' }}
                onContextMenu={e => e.preventDefault()}
                onCopy={e => e.preventDefault()}
                onCut={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
              >
                <MonacoEditor
                  height="180px"
                  defaultLanguage={exercise.programming_language.toLowerCase()}
                  value={exercise.code_to_remember}
                  options={{ readOnly: true, fontSize: 16, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                />
              </Paper>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              size="large"
              sx={{
                background: 'linear-gradient(90deg, #1da1f2 0%, #21cbf3 100%)',
                color: 'white',
                borderRadius: 3,
                boxShadow: 3,
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #21cbf3 0%, #1da1f2 100%)',
                  boxShadow: 6,
                  transform: 'scale(1.04)',
                },
              }}
              onClick={() => {
                setIsStarted(true);
                setUserCode('');
                setIsCorrect(null);
                setResultMsg('');
              }}
            >
              Начать выполнение
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EditIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>Введите код</Typography>
            </Box>
            <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <MonacoEditor
                height="180px"
                defaultLanguage={exercise.programming_language.toLowerCase()}
                value={userCode}
                onChange={(v: string | undefined) => setUserCode(v || '')}
                options={{ fontSize: 16, minimap: { enabled: false }, scrollBeyondLastLine: false, readOnly: false }}
              />
            </Paper>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                sx={{
                  borderRadius: 3,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  fontSize: '1rem',
                  background: 'linear-gradient(90deg, #64b5f6 0%, #1976d2 100%)',
                  color: 'white',
                  boxShadow: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                    boxShadow: 4,
                    transform: 'scale(1.04)',
                  },
                }}
                onClick={handleCheck}
              >
                Проверить
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: 3,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  fontSize: '1rem',
                  background: 'white',
                  color: '#1da1f2',
                  border: '2px solid #bdbdbd',
                  boxShadow: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: '#f0f7fa',
                    color: '#1976d2',
                    border: '2px solid #1976d2',
                    boxShadow: 2,
                    transform: 'scale(1.04)',
                  },
                }}
                onClick={handleReset}
              >
                Сбросить
              </Button>
            </Box>
            {isCorrect !== null && (
              <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 2, fontWeight: 'bold' }}>
                {resultMsg}
              </Alert>
            )}
          </>
        )}
      </Card>
    </Container>
  );
};

export default ExerciseCard; 