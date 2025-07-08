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
} from '../store/slices/userExerciseSlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { fetchCategories } from '../store/slices/categorySlice';
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
  } = useSelector((state: RootState) => state.userExercises);

  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loading = userExercisesLoading || languagesLoading || categoriesLoading;
  const loadingInitial = loading && currentPage === 1;

  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('cards');
  const handleViewModeChange = (_: any, nextView: 'table' | 'cards') => {
    if (nextView !== null) setViewMode(nextView);
  };

  // useEffect для загрузки справочников (языки, категории)
  useEffect(() => {
    if (languages.length === 0) dispatch(fetchLanguages());
    if (categories.length === 0) dispatch(fetchCategories({ page: 1, pageSize: 30 }));
  }, [dispatch, languages.length, categories.length]);

  // useEffect для загрузки задач пользователя только после загрузки справочников
  const filtersLoaded = !languagesLoading && !categoriesLoading;

  useEffect(() => {
    if (!filtersLoaded) return;
    dispatch(fetchUserExercisesWithFilters({
      language: selectedLanguage,
      category: selectedCategory,
      page: currentPage,
      pageSize: 30
    }));
  }, [selectedLanguage, selectedCategory, currentPage, dispatch, filtersLoaded]);

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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Статус</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userExercises.map((exerciseDetailse) => {
                    const { exercise, user_info } = exerciseDetailse;
                    return (
                      <TableRow key={exercise.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {exercise.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exercise.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getLanguageLabel(exercise.programming_language)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getCategoryLabel(exercise.category_id)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {user_info.is_solved ? (
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
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayIcon />}
                            onClick={() => handleExerciseClick(exercise.id)}
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
          ) : (
            <Grid container spacing={3}>
              {userExercises.map((exerciseDetailse) => {
                const { exercise, user_info } = exerciseDetailse;
                return (
                  <Grid item xs={12} sm={6} md={4} key={exercise.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', flex: 1 }}>
                            {exercise.title}
                          </Typography>
                          {user_info.is_solved ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <ScheduleIcon color="warning" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {exercise.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={getLanguageLabel(exercise.programming_language)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<PlayIcon />}
                          onClick={() => handleExerciseClick(exercise.id)}
                        >
                          {user_info.is_solved ? 'Повторить' : 'Начать'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
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