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
  Stack,
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  TableRows as TableRowsIcon, 
  ViewModule as ViewModuleIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Settings as SettingsIcon,
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
import TaskCard from './TaskCard';


const TaskList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const {
    userExercises,
    loading: exercisesLoading,
    pagination,
    currentPage,
    selectedLanguage,
    selectedCategory,
  } = useSelector((state: RootState) => state.userExercises);

  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loading = exercisesLoading || languagesLoading || categoriesLoading;
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


  // useEffect для загрузки задач только после загрузки справочников
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

  const handleResetFilters = () => {
    dispatch(setCurrentPage(1));
    dispatch(setSelectedLanguage('all'));
    dispatch(setSelectedCategory('all'));
  };

  const handleGoToManagement = () => {
    navigate('/manage');
  };

  // Компонент для пустого состояния
  const EmptyState = () => {
    const hasActiveFilters = selectedLanguage !== 'all' || selectedCategory !== 'all';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        p: 4 
      }}>
        <Card sx={{ 
          maxWidth: 500, 
          textAlign: 'center', 
          borderRadius: 3,
          boxShadow: 3,
          p: 4
        }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
              {hasActiveFilters ? 'Упражнения не найдены' : 'Список упражнений пуст'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {hasActiveFilters 
                ? 'Попробуйте изменить фильтры или добавьте упражнения в управлении'
                : 'Добавьте упражнения в свой список через меню управления'
              }
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleResetFilters}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    width: 220,
                    height: 48,
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem'
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={handleGoToManagement}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  width: 220,
                  height: 48,
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem',
                  borderColor: '#1da1f2',
                  color: '#1da1f2',
                  '&:hover': {
                    borderColor: '#0d8bd9',
                    backgroundColor: '#f8f9fa',
                  }
                }}
              >
                Перейти к управлению
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
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
              Выберите упражнение
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
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.icon_svg && (
                        <span
                          style={{verticalAlign: 'middle', marginRight: 8}}
                          dangerouslySetInnerHTML={{__html: lang.icon_svg}}
                        />
                      )}
                      {lang.name}
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
                  disabled={selectedLanguage === 'all'}
                >
                  <MenuItem value="all">Все категории</MenuItem>
                  {categories
                    .filter(c =>
                      selectedLanguage === 'all' ||
                      c.programming_language?.toLowerCase() === selectedLanguage.toLowerCase()
                    )
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
        {/* Результаты */}
        <Box sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 2 }}>
          {userExercises.length === 0 && !loading ? (
            <EmptyState />
          ) : (
            <>
              {viewMode === 'table' ? (
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 800, borderRadius: 4, position: 'relative' }}
                  ref={tableContainerRef}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Название</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Категория</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Язык</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Решено</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userExercises.map((exerciseDetailse) => {
                        const { exercise, user_info } = exerciseDetailse;
                        const category = categories.find(c => c.id === exercise.category_id);
                        const language = languages.find(l => l.value === exercise.programming_language);
                        const isCompleted = user_info.is_solved;
                        return (
                          <TableRow
                            key={exercise.id}
                            hover
                            onClick={() => handleExerciseClick(exercise.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {language?.icon_svg && (
                                  <span
                                    style={{verticalAlign: 'middle', marginRight: 8}}
                                    dangerouslySetInnerHTML={{__html: language.icon_svg}}
                                  />
                                )}
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold">
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
                              {language?.icon_svg ? (
                                <span
                                  dangerouslySetInnerHTML={{__html: language.icon_svg}}
                                />
                              ) : (
                                <Typography variant="body2">
                                  {exercise.programming_language}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={isCompleted ? "Да" : "Нет"}
                                color={isCompleted ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                startIcon={<PlayIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExerciseClick(exercise.id);
                                }}
                                sx={{
                                  background: 'linear-gradient(90deg, #1da1f2 0%, #21cbf3 100%)',
                                  color: 'white',
                                  borderRadius: 3,
                                  fontWeight: 'bold',
                                  '&:hover': {
                                    background: 'linear-gradient(90deg, #21cbf3 0%, #1da1f2 100%)',
                                    transform: 'scale(1.05)',
                                  },
                                }}
                              >
                                {isCompleted ? 'Повторить' : 'Начать'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {exercisesLoading && currentPage > 1 && pagination.hasNext && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={32} />
                    </Box>
                  )}
                </TableContainer>
              ) : (
                <Box
                  ref={tableContainerRef}
                  sx={{
                    maxHeight: 800,
                    overflowY: 'auto',
                    position: 'relative',
                    p: 1,
                  }}
                >
                  <Grid container spacing={2}>
                    {userExercises.map((exerciseDetailse) => {
                      const { exercise, user_info } = exerciseDetailse;
                      const category = categories.find(c => c.id === exercise.category_id);
                      const language = languages.find(l => l.value === exercise.programming_language);
                      const isCompleted = user_info.is_solved;
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.id}>
                          <TaskCard
                            id={exercise.id}
                            title={exercise.title}
                            description={exercise.description}
                            languageIcon={language?.icon_svg}
                            languageName={language?.name || exercise.programming_language}
                            categoryName={category?.name}
                            isSolved={user_info.is_solved}
                            onStart={handleExerciseClick}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                  {exercisesLoading && currentPage > 1 && pagination.hasNext && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={32} />
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default TaskList; 