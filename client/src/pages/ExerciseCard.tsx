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
  Chip,
} from '@mui/material';
import { PlayArrow as PlayIcon, Check as CheckIcon, Refresh as RefreshIcon, BarChart as BarChartIcon, ThumbUp as ThumbUpIcon, Visibility as VisibilityIcon, Edit as EditIcon, TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, Speed as SpeedIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExerciseById, setExerciseSolved } from '../store/slices/exerciseSlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { Exercise } from '../types/api';
import axios from 'axios';
import { authAxios } from '../service/http-common';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { diffWords, diffLines as diffLinesFn } from 'diff';
import Confetti from 'react-confetti';
import './ExerciseCard.css';
import { useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ExerciseCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentExercise: exercise, loading, exercises } = useSelector((state: RootState) => state.exercises);
  const { languages } = useSelector((state: RootState) => state.languages);
  
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
  const [lastCheckedUserCode, setLastCheckedUserCode] = useState<string | null>(null);
  const theme = useTheme();

  // Индекс текущей задачи и id следующей
  const currentIndex = exercises.findIndex(e => e.id === id);
  const hasExercises = exercises.length > 0;
  let nextExerciseId: string | undefined = undefined;
  if (hasExercises && currentIndex !== -1) {
    if (currentIndex === exercises.length - 1) {
      nextExerciseId = exercises[0].id;
    } else {
      nextExerciseId = exercises[currentIndex + 1]?.id;
    }
  }

  useEffect(() => {
    if (id) {
      dispatch(fetchExerciseById(id));
    }
    if (languages.length === 0) {
      dispatch(fetchLanguages());
    }
  }, [id, dispatch, languages.length]);

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

  // Функция для умной нормализации кода по языкам программирования
  const normalizeCode = (code: string, language: string): string => {
    const lang = language.toLowerCase();
    
    switch (lang) {
      case 'javascript':
      case 'typescript':
      case 'js':
      case 'ts':
        return code
          // Убираем лишние пробелы вокруг операторов
          .replace(/\s*([+\-*/=<>!&|])\s*/g, '$1')
          // Убираем пробелы вокруг скобок, точек с запятой, запятых
          .replace(/\s*([{}();,])\s*/g, '$1')
          // Убираем пробелы вокруг точек (для методов)
          .replace(/\s*\.\s*/g, '.')
          // Убираем пробелы вокруг двоеточий (для объектов)
          .replace(/\s*:\s*/g, ':')
          // Заменяем множественные пробелы на один
          .replace(/\s+/g, ' ')
          .trim();

      case 'python':
      case 'py':
        return code
          // Сохраняем отступы, но нормализуем лишние пробелы
          .replace(/\s*([+\-*/=<>!&|])\s*/g, ' $1 ')
          // Убираем пробелы вокруг скобок
          .replace(/\s*([()])\s*/g, '$1')
          // Убираем пробелы вокруг запятых
          .replace(/\s*,\s*/g, ', ')
          // Убираем пробелы вокруг двоеточий
          .replace(/\s*:\s*/g, ': ')
          // Заменяем множественные пробелы на один
          .replace(/\s+/g, ' ')
          .trim();

      case 'java':
        return code
          // Убираем пробелы вокруг операторов
          .replace(/\s*([+\-*/=<>!&|])\s*/g, '$1')
          // Убираем пробелы вокруг скобок, точек с запятой
          .replace(/\s*([{}();,])\s*/g, '$1')
          // Убираем пробелы вокруг точек
          .replace(/\s*\.\s*/g, '.')
          // Заменяем множественные пробелы на один
          .replace(/\s+/g, ' ')
          .trim();

      case 'rust':
        return code
          // Убираем пробелы вокруг операторов
          .replace(/\s*([+\-*/=<>!&|])\s*/g, '$1')
          // Убираем пробелы вокруг скобок, точек с запятой
          .replace(/\s*([{}();,])\s*/g, '$1')
          // Убираем пробелы вокруг точек
          .replace(/\s*\.\s*/g, '.')
          // Убираем пробелы вокруг двоеточий (для типов)
          .replace(/\s*:\s*/g, ': ')
          // Убираем пробелы вокруг стрелок (->)
          .replace(/\s*->\s*/g, ' -> ')
          // Заменяем множественные пробелы на один
          .replace(/\s+/g, ' ')
          .trim();

      case 'go':
        return code
          // Убираем пробелы вокруг операторов
          .replace(/\s*([+\-*/=<>!&|])\s*/g, '$1')
          // Убираем пробелы вокруг скобок, точек с запятой
          .replace(/\s*([{}();,])\s*/g, '$1')
          // Убираем пробелы вокруг точек
          .replace(/\s*\.\s*/g, '.')
          // Убираем пробелы вокруг двоеточий (для типов)
          .replace(/\s*:\s*/g, ': ')
          // Заменяем множественные пробелы на один
          .replace(/\s+/g, ' ')
          .trim();

      default:
        // Базовая нормализация для остальных языков
        return code
          .replace(/\s+/g, ' ')
          .trim();
    }
  };

  // Гибридное сравнение кода
  const smartCompare = (userCode: string, expectedCode: string, language: string) => {
    // Сначала пробуем строгое сравнение
    if (userCode.trim() === expectedCode.trim()) {
      return { correct: true, type: 'exact' };
    }
    
    // Затем пробуем нормализованное сравнение
    const normalizedUser = normalizeCode(userCode, language);
    const normalizedExpected = normalizeCode(expectedCode, language);
    
    if (normalizedUser === normalizedExpected) {
      return { correct: true, type: 'normalized' };
    }
    
    // Если и это не помогло, показываем различия
    return { correct: false, type: 'diff' };
  };

  const handleCheck = async () => {
    if (!exercise) return;
    setChecking(true);
    
    setLastCheckedUserCode(userCode);

    const result = smartCompare(userCode, exercise.code_to_remember, exercise.programming_language);
    
    setIsCorrect(result.correct);
    setResultMsg(result.correct ? 'Поздравляем! Ваш код правильный!' : '');
    
    // Diff для визуализации различий (построчно)
    if (!result.correct) {
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
      dispatch(setExerciseSolved(exercise.id));
    }
    
    // Отправляем статистику
    try {
      const typingTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      await authAxios.post('/exercise_stat/update', {
        exercise_id: exercise.id,
        attempts: 1,
        success_attempts: result.correct ? 1 : 0,
        typing_time: typingTime,
        typed_chars: userCode.length,
      });
      await fetchStat();
    } catch (error) {
      console.error('Ошибка при отправке статистики:', error);
      setStatError('Ошибка обновления статистики');
    }
    
    // Показываем правильный ответ
    setUserCode(exercise.code_to_remember);
    setStartTime(Date.now());
    setIsStarted(false);
    
    setChecking(false);
  };

  const handleReset = () => {
    setIsStarted(false);
    setUserCode('');
    setIsCorrect(null);
    setResultMsg('');
  };

  const handleBackToList = () => {
    navigate('/');
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

  // Функция для генерации списка ошибок с подсветкой отличий
  function getLineErrorList(expected: string, actual: string) {
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    const maxLen = Math.max(expectedLines.length, actualLines.length);
    const errors: { line: number, expected?: string, actual?: string, type: string, diffHtml?: string }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const e = expectedLines[i];
      const a = actualLines[i];
      if (e === undefined) {
        errors.push({ line: i + 1, actual: a, type: 'extra', diffHtml: `<span style=\"background:#ffeef0\">${a}</span>` });
      } else if (a === undefined) {
        errors.push({ line: i + 1, expected: e, type: 'missing', diffHtml: `<span style=\"background:#ffeef0;text-decoration:line-through\">${e}</span>` });
      } else if (e !== a) {
        // Посимвольный diff
        const wordDiff = diffWords(e, a);
        const diffHtml = wordDiff.map(part =>
          part.added
            ? `<span style=\"background:#d4fcbc\">${part.value}</span>`
            : part.removed
            ? `<span style=\"background:#ffeef0;text-decoration:line-through\">${part.value}</span>`
            : part.value
        ).join('');
        errors.push({ line: i + 1, expected: e, actual: a, type: 'mismatch', diffHtml });
      }
    }
    return errors;
  }

  const cpm = elapsedTime > 0 ? Math.round((userCode.length / elapsedTime) * 60) : 0;
  function getSpeedColor(cpm: number) {
    if (cpm < 100) return '#e57373'; // красный
    if (cpm < 250) return '#ffd54f'; // жёлтый
    return '#64b5f6'; // синий
  }

  if (loading || !exercise) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box>
        <Button
          variant="outlined"
          onClick={handleBackToList}
          sx={{ mb: 2, fontWeight: 500 }}
        >
          Вернуться в список
        </Button>
        <Card className={showShake ? 'shake' : ''} sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 1 }}>
          <Box>
            {languages.find(l => l.value === exercise.programming_language)?.icon_svg && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <span
                  style={{ verticalAlign: 'middle', width: 32, height: 32, display: 'inline-block' }}
                  dangerouslySetInnerHTML={{ __html: languages.find(l => l.value === exercise.programming_language)?.icon_svg || '' }}
                />
              </Box>
            )}
            <Typography variant="body1">{exercise.description}</Typography>
          </Box>
        </Card>
      </Box>
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
              <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
              <Typography variant="body2">Попыток: <b>{exerciseStat ? (exerciseStat.total_attempts ?? 0) : 0}</b></Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
              <ThumbUpIcon color="secondary" sx={{ mr: 1 }} />
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
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              size="large"
              sx={{
                borderRadius: 3,
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
              }}
              onClick={() => {
                if (nextExerciseId) navigate(`/exercise/${nextExerciseId}`);
              }}
              disabled={!hasExercises}
            >
              Перейти к следующей задаче
            </Button>
          </Box>
          {isCorrect !== null && isCorrect && (
            <Alert severity="success" sx={{ mt: 2, fontWeight: 'bold' }}>
              {resultMsg}
            </Alert>
          )}
          {isCorrect === false && lastCheckedUserCode !== null && (
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Ошибки:</Typography>
              <ul style={{ paddingLeft: 20 }}>
                {getLineErrorList(exercise.code_to_remember, lastCheckedUserCode).map(err => (
                  <li key={err.line} style={{ marginBottom: 8 }}>
                    <b>Строка {err.line}:</b> {err.type === 'missing' && <>Ожидалось: <code>{err.expected}</code> (строка пропущена)</>}
                    {err.type === 'extra' && <>Лишняя строка: <code>{err.actual}</code></>}
                    {err.type === 'mismatch' && (
                      err.diffHtml ? <span dangerouslySetInnerHTML={{ __html: err.diffHtml }} /> : null
                    )}
                  </li>
                ))}
              </ul>
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
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, ml: 2 }}>
            <Box sx={{ textAlign: 'center', minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <SpeedIcon color="secondary" sx={{ fontSize: 24 }} />
              <Typography variant="body2" sx={{ color: getSpeedColor(cpm), fontWeight: 500 }}>{cpm}</Typography>
              <span style={{ fontSize: 15, color: getSpeedColor(cpm), fontWeight: 500, marginLeft: 4 }}>симв/мин</span>
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