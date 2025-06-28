import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  useTheme,
  LinearProgress,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Language, Exercise, Category } from '../types/api';
import { languageApi, exerciseApi, categoryApi } from '../services/api';

const TaskList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [languagesData, exercisesData, categoriesData] = await Promise.all([
        languageApi.getLanguages(),
        exerciseApi.getExercises(),
        categoryApi.getCategories(),
      ]);
      setLanguages(languagesData);
      setExercises(exercisesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleExerciseClick = (exerciseId: number) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const getLanguageIcon = (languageName: string) => {
    switch (languageName.toLowerCase()) {
      case 'javascript': return '⚡';
      case 'python': return '🐍';
      case 'go': return '🚀';
      case 'rust': return '🦀';
      case 'typescript': return '📘';
      default: return '💻';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return difficulty;
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    const matchesLanguage = selectedLanguage === 'all' || exercise.language_id.toString() === selectedLanguage;
    const matchesCategory = selectedCategory === 'all' || exercise.category_id.toString() === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesLanguage && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" sx={{ background: '#1da1f2' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Загрузка...
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filters */}
        <Box sx={{ mb: 4, bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
            Выберите упражнение
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Язык программирования</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Язык программирования"
                  onChange={(e: SelectChangeEvent) => setSelectedLanguage(e.target.value)}
                >
                  <MenuItem value="all">Все языки</MenuItem>
                  {languages.map((language) => (
                    <MenuItem key={language.id} value={language.id.toString()}>
                      {language.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Категория"
                  onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">Все категории</MenuItem>
                  {categories
                    .filter(c => selectedLanguage === 'all' || c.language_id.toString() === selectedLanguage)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={selectedDifficulty}
                  label="Сложность"
                  onChange={(e: SelectChangeEvent) => setSelectedDifficulty(e.target.value)}
                >
                  <MenuItem value="all">Все уровни</MenuItem>
                  <MenuItem value="easy">Легко</MenuItem>
                  <MenuItem value="medium">Средне</MenuItem>
                  <MenuItem value="hard">Сложно</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" startIcon={<TrendingUpIcon />} disabled>
              Всего упражнений: {filteredExercises.length}
            </Button>
          </Box>
        </Box>

        {/* Results */}
        <Box sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 2 }}>
          <TableContainer component={Paper} sx={{ maxHeight: 500, borderRadius: 4 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Название
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Категория
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Сложность
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Попытки
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Успешные
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExercises.map((exercise) => {
                  const language = languages.find(l => l.id === exercise.language_id);
                  const category = categories.find(c => c.id === exercise.category_id);
                  const attempts = exercise.attempts || 0;
                  const successful = exercise.successful_attempts || 0;
                  const percent = attempts > 0 ? Math.round((successful / attempts) * 100) : 0;
                  return (
                    <TableRow
                      key={exercise.id}
                      sx={{ '&:hover': { backgroundColor: theme.palette.action.hover }, cursor: 'pointer' }}
                      onClick={() => handleExerciseClick(exercise.id)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h5" sx={{ mr: 1 }}>
                            {language ? getLanguageIcon(language.name) : '💻'}
                          </Typography>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {exercise.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {exercise.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {category?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getDifficultyLabel(exercise.difficulty)}
                          color={getDifficultyColor(exercise.difficulty) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{attempts}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{successful} ({percent}%)</Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          startIcon={<PlayIcon sx={{ fontSize: 24 }} />}
                          size="medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExerciseClick(exercise.id);
                          }}
                          sx={{
                            background: 'linear-gradient(90deg, #1da1f2 0%, #21cbf3 100%)',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: 3,
                            fontWeight: 'bold',
                            px: 3,
                            py: 1.2,
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #21cbf3 0%, #1da1f2 100%)',
                              boxShadow: 6,
                              transform: 'scale(1.06)',
                            },
                          }}
                        >
                          Начать
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default TaskList; 