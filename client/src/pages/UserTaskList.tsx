import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  LinearProgress,
  AppBar,
  Toolbar,
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  TableRows as TableRowsIcon, 
  ViewModule as ViewModuleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchUserExercisesWithFilters,
  setCurrentPage,
  setSelectedLanguage,
  setSelectedCategory,
  setSelectedDifficulty
} from '../store/slices/userExerciseSlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchDifficulties } from '../store/slices/difficultySlice';
import { getUser } from '../store/slices/userSlice';
import { UserExerciseWithDetails } from '../types/api';

const UserTaskList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const {
    userExercises,
    loading: userExercisesLoading,
    pagination,
    currentPage,
    selectedLanguage,
    selectedCategory,
    selectedDifficulty
  } = useSelector((state: RootState) => state.userExercises);

  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { difficulties, loading: difficultiesLoading } = useSelector((state: RootState) => state.difficulties);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loading = userExercisesLoading || languagesLoading || categoriesLoading || difficultiesLoading;
  const loadingInitial = loading && currentPage === 1;

  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('cards');
  const handleViewModeChange = (_: any, nextView: 'table' | 'cards') => {
    if (nextView !== null) setViewMode(nextView);
  };

  // useEffect для загрузки справочников (языки, категории, сложности)
  useEffect(() => {
    if (languages.length === 0) dispatch(fetchLanguages());
    if (categories.length === 0) dispatch(fetchCategories({ page: 1, pageSize: 30 }));
    if (difficulties.length === 0) dispatch(fetchDifficulties());
  }, [dispatch, languages.length, categories.length, difficulties.length]);

  // useEffect для загрузки задач пользователя только после загрузки справочников
  const filtersLoaded = !languagesLoading && !categoriesLoading && !difficultiesLoading;

  useEffect(() => {
    if (!filtersLoaded) return;
    dispatch(fetchUserExercisesWithFilters({
      language: selectedLanguage,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      page: currentPage,
      pageSize: 30
    }));
  }, [selectedLanguage, selectedCategory, selectedDifficulty, currentPage, dispatch, filtersLoaded]);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]); 

  // Обработка бесконечного скролла
  useEffect(() => {
    const handleScroll = () => {
      const container = tableContainerRef.current;
      if (!container || loading || !pagination.hasNext) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        dispatch(setCurrentPage(currentPage + 1));
      }
    };
    const container = tableContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading, pagination.hasNext, currentPage, dispatch]);

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const handleLanguageChange = (language: string) => {
    dispatch(setCurrentPage(1));
    dispatch(setSelectedLanguage(language));
    dispatch(setSelectedCategory('all'));
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setCurrentPage(1));
    dispatch(setSelectedCategory(category));
  };

  const handleDifficultyChange = (difficulty: string) => {
    dispatch(setCurrentPage(1));
    dispatch(setSelectedDifficulty(difficulty));
  };

  const getDifficultyProps = (difficulty: string) => {
    const labels: Record<string, string> = {
      beginner: 'Начинающий',
      intermediate: 'Средний',
      hard: 'Сложный'
    };
    const colors: Record<string, 'success' | 'warning' | 'error'> = {
      beginner: 'success',
      intermediate: 'warning',
      hard: 'error'
    };
    return {
      label: labels[difficulty] || difficulty,
      color: colors[difficulty] || 'default'
    };
  };

  const getLanguageLabel = (value: string) => {
    const language = languages.find(lang => lang.value === value);
    return language ? language.name : value;
  };

  const getCategoryLabel = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : id;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingInitial) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" sx={{ background: '#1da1f2' }}>
          <Toolbar>
            <Typography variant="h6">Загрузка...</Typography>
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
        {/* Фильтры и переключатель вида */}
        <Box sx={{ mb: 4, bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Мои упражнения
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{ background: '#fafafa', borderRadius: 2 }}
            >
              <ToggleButton value="table" aria-label="Таблица">
                <TableRowsIcon />
              </ToggleButton>
              <ToggleButton value="cards" aria-label="Карточки">
                <ViewModuleIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Язык программирования</InputLabel>
                <Select
                  value={selectedLanguage}
                  label="Язык программирования"
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <MenuItem value="all">Все языки</MenuItem>
                  {languages.map((language) => (
                    <MenuItem key={language.value} value={language.value}>
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
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <MenuItem value="all">Все категории</MenuItem>
                  {categories
                    .filter(cat => selectedLanguage === 'all' || cat.programming_language === selectedLanguage)
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
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                >
                  <MenuItem value="all">Все сложности</MenuItem>
                  {difficulties.map((difficulty) => (
                    <MenuItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Содержимое */}
        <Box ref={tableContainerRef} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {viewMode === 'table' ? (
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Название</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Язык</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Категория</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Сложность</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Статус</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Попытки</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Оценка</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userExercises.map((userExercise) => (
                    <TableRow key={userExercise.exercise_id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {userExercise.exercise.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userExercise.exercise.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getLanguageLabel(userExercise.exercise.programming_language)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getCategoryLabel(userExercise.exercise.category_id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getDifficultyProps(userExercise.exercise.difficulty).label}
                          color={getDifficultyProps(userExercise.exercise.difficulty).color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {userExercise.completed_at ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Завершено"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<ScheduleIcon />}
                            label="В процессе"
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {userExercise.attempts_count}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {userExercise.score ? (
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {userExercise.score}%
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayIcon />}
                          onClick={() => handleExerciseClick(userExercise.exercise_id)}
                        >
                          Начать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Grid container spacing={3}>
              {userExercises.map((userExercise) => (
                <Grid item xs={12} sm={6} md={4} key={userExercise.exercise_id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', flex: 1 }}>
                          {userExercise.exercise.title}
                        </Typography>
                        {userExercise.completed_at ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ScheduleIcon color="warning" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {userExercise.exercise.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={getLanguageLabel(userExercise.exercise.programming_language)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={getDifficultyProps(userExercise.exercise.difficulty).label}
                          color={getDifficultyProps(userExercise.exercise.difficulty).color}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Попытки: {userExercise.attempts_count}
                        </Typography>
                        {userExercise.score && (
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Оценка: {userExercise.score}%
                          </Typography>
                        )}
                      </Box>
                      {userExercise.completed_at && (
                        <Typography variant="caption" color="text.secondary">
                          Завершено: {formatDate(userExercise.completed_at)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayIcon />}
                        onClick={() => handleExerciseClick(userExercise.exercise_id)}
                      >
                        {userExercise.completed_at ? 'Повторить' : 'Начать'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && userExercises.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                У вас пока нет упражнений
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Перейдите к списку всех упражнений, чтобы начать обучение
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default UserTaskList; 