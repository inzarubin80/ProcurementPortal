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
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExercises, fetchExercisesByLanguage, fetchExercisesByCategory } from '../store/slices/exerciseSlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { ProgrammingLanguage, Exercise, Category } from '../types/api';

const TaskList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  
  // Redux state
  const { exercises, loading: exercisesLoading, pagination } = useSelector((state: RootState) => state.exercises);
  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const loading = exercisesLoading || languagesLoading || categoriesLoading;

  useEffect(() => {
    loadData();
  }, [currentPage, selectedLanguage, selectedCategory]);

  const loadData = async () => {
    try {
      // Загружаем языки и категории только один раз
      if (languages.length === 0) {
        await dispatch(fetchLanguages());
      }
      if (categories.length === 0) {
        await dispatch(fetchCategories({ page: 1, pageSize: 100 }));
      }
      
      // Загружаем каты с фильтрами
      if (selectedLanguage !== 'all' && selectedCategory !== 'all') {
        await dispatch(fetchExercisesByCategory({ categoryId: selectedCategory, page: currentPage, pageSize: 10 }));
      } else if (selectedLanguage !== 'all') {
        await dispatch(fetchExercisesByLanguage({ language: selectedLanguage, page: currentPage, pageSize: 10 }));
      } else {
        await dispatch(fetchExercises({ page: currentPage, pageSize: 10 }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
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
    const matchesLanguage = selectedLanguage === 'all' || (exercise.programming_language && exercise.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
    return matchesSearch && matchesDifficulty && matchesLanguage;
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
                    <MenuItem key={language.value} value={language.value}>
                      <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: language.icon_svg}} />
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
                    .filter(c => selectedLanguage === 'all' || (c.programming_language && c.programming_language.toLowerCase() === selectedLanguage.toLowerCase()))
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
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
              Всего кат: {pagination.total}
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
                    Язык
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                    Действия
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExercises.map((exercise) => {
                  const category = categories.find(c => c.id === exercise.category_id);
                  return (
                    <TableRow
                      key={exercise.id}
                      sx={{ '&:hover': { backgroundColor: theme.palette.action.hover }, cursor: 'pointer' }}
                      onClick={() => handleExerciseClick(exercise.id)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h5" sx={{ mr: 1 }}>
                            <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: languages.find(l => l.value === exercise.programming_language)?.icon_svg || ''}} />
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
                        {(() => {
                          const lang = languages.find(l => l.value === exercise.programming_language);
                          if (lang && lang.icon_svg) {
                            return <span style={{verticalAlign: 'middle', marginRight: 0}} dangerouslySetInnerHTML={{__html: lang.icon_svg}} />;
                          }
                          return <Typography variant="body2" component="span">{exercise.programming_language}</Typography>;
                        })()}
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