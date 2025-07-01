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
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { PlayArrow as PlayIcon, Check as CheckIcon, Refresh as RefreshIcon, BarChart as BarChartIcon, ThumbUp as ThumbUpIcon, Visibility as VisibilityIcon, Edit as EditIcon, TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, Speed as SpeedIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExerciseById } from '../store/slices/exerciseSlice';
import { Exercise } from '../types/api';
import axios from 'axios';
import { authAxios } from '../service/http-common';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { diffWords, diffLines as diffLinesFn } from 'diff';
import Confetti from 'react-confetti';
import './ExerciseCard.css';

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
  const [exerciseStat, setExerciseStat] = useState<null | {
    total_attempts: number;
    successful_attempts: number;
    total_typing_time: number;
    total_typed_chars: number;
  }>(null);
  const [statError, setStatError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [diffLines, setDiffLines] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

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
    setStartTime(Date.now());
  };

  const fetchStat = async () => {
    if (!exercise) return;
    try {
      const res = await authAxios.get(`/exercise_stat?exercise_id=${exercise.id}`);
      setExerciseStat(res.data);
      setStatError(null);
    } catch (e: any) {
      if (e.response && e.response.status === 404) {
        setExerciseStat({
          total_attempts: 0,
          successful_attempts: 0,
          total_typing_time: 0,
          total_typed_chars: 0,
        });
        setStatError(null);
      } else {
        setStatError('Не удалось получить статистику');
      }
    }
  };

  const handleCheck = async () => {
    if (!exercise) return;
    setChecking(true);
    const normalizedUserCode = userCode.trim().replace(/\s+/g, ' ');
    const normalizedExerciseCode = exercise.code_to_remember.trim().replace(/\s+/g, ' ');
    const correct = normalizedUserCode === normalizedExerciseCode;
    setIsCorrect(correct);
    setResultMsg(correct ? 'Поздравляем! Ваш код правильный!' : '');
    // Diff для визуализации различий (построчно)
    if (!correct) {
      const diff = diffLinesFn(exercise.code_to_remember, userCode);
      const diffHtml = diff.map((part, idx) => {
        if (part.added) return `<div style='background:#d4fcbc'>+ ${part.value.replace(/\n/g, '<br/>')}</div>`;
        if (part.removed) return `<div style='background:#ffeef0;text-decoration:line-through;'>- ${part.value.replace(/\n/g, '<br/>')}</div>`;
        return `<div>${part.value.replace(/\n/g, '<br/>')}</div>`;
      }).join('');
      setDiffLines(diffHtml);
      setShowShake(true);
      setTimeout(() => setShowShake(false), 700);
    } else {
      setDiffLines(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    // Отправляем статистику
    let typingTime = 0;
    if (startTime) {
      typingTime = Math.floor((Date.now() - startTime) / 1000);
    }
    try {
      await authAxios.post('/exercise_stat/update', {
        exercise_id: exercise.id,
        is_success: correct,
        typing_time: typingTime,
        total_typed_chars: userCode.length,
      });
      await fetchStat();
    } catch (e) {
      setStatError('Ошибка обновления статистики');
    }
    setChecking(false);
    setUserCode(exercise.code_to_remember);
    setStartTime(Date.now());
    setIsStarted(false);
  };

  const handleReset = () => {
    setIsStarted(false);
    setUserCode('');
    setIsCorrect(null);
    setResultMsg('');
  };

  useEffect(() => {
    if (exercise) {
      fetchStat();
    }
    // eslint-disable-next-line
  }, [exercise]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isStarted && startTime) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStarted, startTime]);

  if (loading || !exercise) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card className={showShake ? 'shake' : ''} sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Описание</Typography>
          <Typography variant="body1">{exercise.description}</Typography>
        </Box>
      </Card>
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
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              mb: 2,
              mt: 1,
              p: 2,
              bgcolor: '#f5f7fa',
              borderRadius: 3,
              boxShadow: 1,
              justifyContent: 'flex-start',
              alignItems: 'center',
              flexWrap: 'wrap',
              border: '1px solid #e0e0e0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Попыток: <b>{exerciseStat ? (exerciseStat.total_attempts ?? 0) : 0}</b></Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
              <ThumbUpIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">Успешных: <b>{exerciseStat ? (exerciseStat.successful_attempts ?? 0) : 0}</b></Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 180 }}>
              <SpeedIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Скорость набора: <b>{
                  exerciseStat && exerciseStat.total_typing_time > 0
                    ? Math.round(
                        exerciseStat.total_typed_chars / (exerciseStat.total_typing_time / 60)
                      )
                    : 0
                } символов/мин</b>
              </Typography>
            </Box>
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
              setStartTime(Date.now());
            }}
          >
            Начать выполнение
          </Button>
          {isCorrect !== null && isCorrect && (
            <Alert severity="success" sx={{ mt: 2, fontWeight: 'bold' }}>
              {resultMsg}
            </Alert>
          )}
          {isCorrect === false && diffLines && (
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Отличия:</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff8e1', borderRadius: 2, overflowX: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: diffLines }} />
              </Paper>
            </Box>
          )}
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={800}
              recycle={false}
              wind={0.08}
              gravity={0.6}
              initialVelocityX={8}
              initialVelocityY={20}
            />
          )}
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
            <EditIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>Введите код</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>⏱ {elapsedTime} сек.</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>✍️ {userCode.length} символов</Typography>
            </Box>
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
              disabled={checking || !userCode.trim()}
            >
              {checking ? <CircularProgress size={24} color="inherit" /> : 'Проверить'}
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
        </>
      )}
    </Container>
  );
};

export default ExerciseCard; 