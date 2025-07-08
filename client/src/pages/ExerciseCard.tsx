import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { PlayArrow as PlayIcon, Check as CheckIcon, Refresh as RefreshIcon, BarChart as BarChartIcon, ThumbUp as ThumbUpIcon, Visibility as VisibilityIcon, Edit as EditIcon, TrendingUp as TrendingUpIcon, CheckCircle as CheckCircleIcon, ExpandMore as ExpandMoreIcon, Compare as CompareIcon, VisibilityOff as VisibilityOffIcon, Close as CloseIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExerciseById } from '../store/slices/exerciseSlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { Exercise } from '../types/api';
import axios from 'axios';
import { authAxios } from '../service/http-common';

import { diffWords, diffLines as diffLinesFn } from 'diff';
import Confetti from 'react-confetti';
import './ExerciseCard.css';
import { useTheme } from '@mui/material/styles';


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
  const [checkError, setCheckError] = useState<string | null>(null);
  const [diffLines, setDiffLines] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [lastCheckedUserCode, setLastCheckedUserCode] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffHtml, setDiffHtml] = useState<string | null>(null);
  const [detailedDiff, setDetailedDiff] = useState<{ lineNumber: number; expected: string; actual: string; hasDiff: boolean; diffHtml: string }[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [showDiffButton, setShowDiffButton] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [openDiffModal, setOpenDiffModal] = useState(false);
  const [openSolutionModal, setOpenSolutionModal] = useState(false);
  const theme = useTheme();

  // Индекс текущей задачи и id следующей - мемоизируем для оптимизации
  const currentIndex = React.useMemo(() => exercises.findIndex(e => e.exercise.id === id), [exercises, id]);
  const hasExercises = exercises.length > 0;
  const nextExerciseId = React.useMemo(() => {
    if (!hasExercises || currentIndex === -1) return undefined;
    if (currentIndex === exercises.length - 1) {
      return exercises[0].exercise.id;
    } else {
      return exercises[currentIndex + 1]?.exercise.id;
    }
  }, [hasExercises, currentIndex, exercises]);

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
    setUserCode('');
    setIsCorrect(null);
    setResultMsg('');
    setShowDiff(false);
    setDiffHtml(null);
    setLastCheckedUserCode(null);
    setShowSolution(false);
    setShowDiffButton(false);
    setErrorCount(0);
  };

  const fetchStat = async () => {
    if (!exercise) return;
    try {
      const res = await authAxios.get(`/exercise_stat?exercise_id=${exercise.exercise.id}`);
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
    setCheckError(null);
    setShowDiff(false);
    
    setLastCheckedUserCode(userCode);

    const result = smartCompare(userCode, exercise.exercise.code_to_remember, exercise.exercise.programming_language);
    
    setIsCorrect(result.correct);
    setResultMsg(result.correct ? 'Поздравляем! Ваш код правильный!' : '');
    
    // Diff для визуализации различий (построчно)
    if (!result.correct) {
      const diff = diffLinesFn(exercise.exercise.code_to_remember, userCode);
      const diffHtmlResult = diff.map((part, idx) => {
        if (part.added) return `<div style='background:#d4fcbc'>+ ${part.value.replace(/\n/g, '<br/>')}</div>`;
        if (part.removed) return `<div style='background:#ffeef0;text-decoration:line-through;'>- ${part.value.replace(/\n/g, '<br/>')}</div>`;
        return `<div>${part.value.replace(/\n/g, '<br/>')}</div>`;
      }).join('');
      
      // Генерируем детальный построчный diff
      const detailedDiffResult = generateDetailedDiff(exercise.exercise.code_to_remember, userCode);
      setDetailedDiff(detailedDiffResult);
      
      // Подсчитываем количество ошибок
      const errors = getLineErrorList(exercise.exercise.code_to_remember, userCode);
      setErrorCount(errors.length);
      
      setDiffHtml(diffHtmlResult);
      setShowShake(true);
      setShowDiffButton(detailedDiffResult.some(line => line.hasDiff));
      setTimeout(() => setShowShake(false), 700);
    } else {
      setDiffHtml(null);
      setDetailedDiff([]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      // Возвращаемся к отображению исходного кода при успешном выполнении
      setIsStarted(false);
      setUserCode('');
      // Оставляем isCorrect = true для отображения сообщения об успехе
    }
    
    // Отправляем статистику
    try {
      await authAxios.post('/exercise_stat/update', {
        exercise_id: exercise.exercise.id,
        attempts: 1,
        success_attempts: result.correct ? 1 : 0,
      });
      await fetchStat();
    } catch (error) {
      console.error('Ошибка при отправке статистики:', error);
      setStatError('Ошибка обновления статистики');
    }
    
    setChecking(false);
  };

  const handleReset = () => {
    setIsStarted(false);
    setUserCode('');
    setIsCorrect(null);
    setResultMsg('');
    setShowDiff(false);
    setDiffHtml(null);
    setDetailedDiff([]);
    setLastCheckedUserCode(null);
    setShowSolution(false);
    setShowDiffButton(false);
    setErrorCount(0);
    setOpenDiffModal(false);
    setOpenSolutionModal(false);
  };

  const handleBackToList = () => {
    navigate('/exercises');
  };

  useEffect(() => {
    if (exercise) {
      fetchStat();
    }
    // eslint-disable-next-line
  }, [exercise]);



  // Клавиатурные сокращения
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isStarted) return;
      
      // Ctrl+Enter или Cmd+Enter для проверки
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!checking && userCode.trim()) {
          handleCheck();
        }
      }
      
      // Escape для сброса
      if (event.key === 'Escape') {
        event.preventDefault();
        handleReset();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isStarted, checking, userCode]);

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

  // Функция для генерации построчного diff с подсветкой символов
  function generateDetailedDiff(expected: string, actual: string) {
    const expectedLines = expected.split('\n');
    const actualLines = actual.split('\n');
    const maxLen = Math.max(expectedLines.length, actualLines.length);
    const diffLines: { lineNumber: number; expected: string; actual: string; hasDiff: boolean; diffHtml: string }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const expectedLine = expectedLines[i] || '';
      const actualLine = actualLines[i] || '';
      const lineNumber = i + 1;
      
      if (expectedLine === actualLine) {
        // Строки одинаковые
        diffLines.push({
          lineNumber,
          expected: expectedLine,
          actual: actualLine,
          hasDiff: false,
          diffHtml: expectedLine
        });
      } else {
        // Строки отличаются - создаем детальный diff
        const wordDiff = diffWords(expectedLine, actualLine);
        const diffHtml = wordDiff.map(part => {
          if (part.added) {
            return `<span style="background:#d4fcbc; color:#2e7d32; font-weight:bold;">${part.value}</span>`;
          } else if (part.removed) {
            return `<span style="background:#ffebee; color:#c62828; text-decoration:line-through; font-weight:bold;">${part.value}</span>`;
          } else {
            return `<span style="color:#424242;">${part.value}</span>`;
          }
        }).join('');
        
        diffLines.push({
          lineNumber,
          expected: expectedLine,
          actual: actualLine,
          hasDiff: true,
          diffHtml
        });
      }
    }
    
    return diffLines;
  }

  // Добавить функцию для сопоставления языка
  const getMonacoLanguage = (lang: string) => {
    if (!lang) return '';
    if (lang.toLowerCase() === '1c') return 'bsl';
    return lang.toLowerCase();
  };

  if (loading || !exercise) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
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
            {languages.find(l => l.value === exercise.exercise.programming_language)?.icon_svg && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <span
                  style={{ verticalAlign: 'middle', width: 32, height: 32, display: 'inline-block' }}
                  dangerouslySetInnerHTML={{ __html: languages.find(l => l.value === exercise.exercise.programming_language)?.icon_svg || '' }}
                />
              </Box>
            )}
            <Typography variant="body1">{exercise.exercise.description}</Typography>
          </Box>
        </Card>
      </Box>
      {!isStarted ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <VisibilityIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.15rem' }}>Код для повторения</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            Внимательно изучите код, затем нажмите "Начать выполнение" для его воспроизведения
          </Typography>
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
                defaultLanguage={getMonacoLanguage(exercise.exercise.programming_language)}
                value={exercise.exercise.code_to_remember}
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
                setDetailedDiff([]);
                setShowDiff(false);
                setShowSolution(false);
                setShowDiffButton(false);
                setErrorCount(0);
                setOpenDiffModal(false);
                setOpenSolutionModal(false);
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
              Перейти к следующему упражнению
            </Button>
          </Box>
          {isCorrect !== null && isCorrect && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2, fontWeight: 'bold' }}>
                {resultMsg}
              </Alert>
            </Box>
          )}
          {checkError && (
            <Alert severity="error" sx={{ mt: 2, fontWeight: 'bold' }}>
              {checkError}
            </Alert>
          )}
          {isCorrect === false && (
            <Alert 
              severity="warning" 
              sx={{ 
                mt: 2, 
                fontWeight: 'bold',
                '& .MuiAlert-message': {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ❌ Код содержит {errorCount} ошибок. Исправьте и попробуйте снова.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  💡 Нажмите кнопку ниже, чтобы увидеть точные отличия от эталона
                </Typography>
                {detailedDiff.length > 0 && showDiffButton && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CompareIcon />}
                    onClick={() => setOpenDiffModal(true)}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 'bold',
                      px: 2,
                      py: 0.5,
                      fontSize: '0.8rem',
                      background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          transform: 'scale(1)',
                          boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                        },
                        '70%': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                        },
                        '100%': {
                          transform: 'scale(1)',
                          boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
                        },
                      },
                      '&:hover': {
                        background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                        animation: 'none',
                      },
                    }}
                  >
                    Показать отличия от эталона
                  </Button>
                )}
              </Box>
            </Alert>
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

          <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <MonacoEditor
              height="180px"
              defaultLanguage={getMonacoLanguage(exercise.exercise.programming_language)}
              value={userCode}
              onChange={(v: string | undefined) => setUserCode(v || '')}
              options={{ fontSize: 16, minimap: { enabled: false }, scrollBeyondLastLine: false, readOnly: false }}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              💡 Подсказка: Ctrl+Enter для проверки, Escape для сброса
            </Typography>
          </Box>
          
          {/* Кнопки для работы с ошибками */}
          {isCorrect === false && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {detailedDiff.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={() => setOpenDiffModal(true)}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    fontSize: '0.9rem',
                    color: '#1976d2',
                    border: '2px solid #1976d2',
                    '&:hover': {
                      background: '#f0f7fa',
                      border: '2px solid #1565c0',
                    },
                  }}
                >
                  Показать отличия от эталона
                </Button>
              )}
              
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setOpenSolutionModal(true)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  color: '#ff9800',
                  border: '2px solid #ff9800',
                  '&:hover': {
                    background: '#fff3e0',
                    border: '2px solid #f57c00',
                  },
                }}
              >
                Показать эталон
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{
                  borderRadius: 2,
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  fontSize: '0.9rem',
                  color: '#f44336',
                  border: '2px solid #f44336',
                  '&:hover': {
                    background: '#ffebee',
                    border: '2px solid #d32f2f',
                  },
                }}
              >
                Начать заново
              </Button>
            </Box>
          )}
          

        </>
      )}

      {/* Модальное окно для отличий */}
      <Dialog
        open={openDiffModal}
        onClose={() => setOpenDiffModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
            📊 Построчные отличия от эталона
          </Typography>
          <IconButton
            onClick={() => setOpenDiffModal(false)}
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {detailedDiff.length > 0 && (
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {detailedDiff.map((line, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    mb: line.hasDiff ? 1 : 0.5,
                    p: line.hasDiff ? 1 : 0.5,
                    borderRadius: line.hasDiff ? 1 : 0,
                    backgroundColor: line.hasDiff ? '#fff3e0' : 'transparent',
                    border: line.hasDiff ? '1px solid #ffcc02' : 'none'
                  }}
                >
                  <Box 
                    sx={{ 
                      minWidth: 40, 
                      textAlign: 'right', 
                      mr: 2, 
                      color: line.hasDiff ? '#d32f2f' : '#666',
                      fontWeight: line.hasDiff ? 'bold' : 'normal',
                      fontSize: '0.8rem'
                    }}
                  >
                    {line.lineNumber}
                  </Box>
                  <Box 
                    sx={{ 
                      flex: 1,
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap'
                    }}
                    dangerouslySetInnerHTML={{ __html: line.diffHtml }}
                  />
                  {line.hasDiff && (
                    <Box sx={{ ml: 1, fontSize: '0.7rem', color: '#d32f2f' }}>
                      ⚠️
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#666', fontStyle: 'italic' }}>
            💡 Зеленым выделены правильные символы, красным - ошибочные или отсутствующие
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button 
            onClick={() => setOpenDiffModal(false)}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно для эталона */}
      <Dialog
        open={openSolutionModal}
        onClose={() => setOpenSolutionModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            📋 Эталонный код
          </Typography>
          <IconButton
            onClick={() => setOpenSolutionModal(false)}
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Paper
            variant="outlined"
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden', 
              background: '#fafafa',
              border: '1px solid #e0e0e0'
            }}
          >
            <MonacoEditor
              height="400px"
              defaultLanguage={getMonacoLanguage(exercise?.exercise.programming_language)}
              value={exercise?.exercise.code_to_remember || ''}
              options={{ 
                readOnly: true, 
                fontSize: 16, 
                minimap: { enabled: false }, 
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                theme: 'vs-light',
                wordWrap: 'on'
              }}
            />
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button 
            onClick={() => setOpenSolutionModal(false)}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExerciseCard; 