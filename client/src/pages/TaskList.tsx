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
} from '@mui/material';
import { PlayArrow as PlayIcon, TableRows as TableRowsIcon, ViewModule as ViewModuleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchExercisesWithFilters,
  setCurrentPage,
  setSelectedLanguage,
  setSelectedCategory,
  setSelectedDifficulty
} from '../store/slices/exerciseSlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchDifficulties } from '../store/slices/difficultySlice';
import { getUser } from '../store/slices/userSlice';
import TaskCard from './TaskCard';


const TaskList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux state
  const {
    exercises,
    loading: exercisesLoading,
    pagination,
    currentPage,
    selectedLanguage,
    selectedCategory,
    selectedDifficulty
  } = useSelector((state: RootState) => state.exercises);

  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { difficulties, loading: difficultiesLoading } = useSelector((state: RootState) => state.difficulties);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loading = exercisesLoading || languagesLoading || categoriesLoading || difficultiesLoading;
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


  // useEffect для загрузки задач только после загрузки справочников
  const filtersLoaded = !languagesLoading && !categoriesLoading && !difficultiesLoading;

  useEffect(() => {
    if (!filtersLoaded) return;
    dispatch(fetchExercisesWithFilters({
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
      easy: 'Легко',
      medium: 'Средне',
      hard: 'Сложно'
    };
    const colors: Record<string, 'success' | 'warning' | 'error'> = {
      easy: 'success',
      medium: 'warning',
      hard: 'error'
    };
    return {
      label: labels[difficulty] || difficulty,
      color: colors[difficulty] || 'default'
    };
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Сложность</InputLabel>
                <Select
                  value={selectedDifficulty}
                  label="Сложность"
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                >
                  <MenuItem value="all">Все уровни</MenuItem>
                  {difficulties.map(diff => (
                    <MenuItem key={diff.value} value={diff.value}>
                      {diff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        {/* Результаты */}
        <Box sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 2 }}>
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Сложность</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Язык</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Решено</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exercises.map((exercise) => {
                    const category = categories.find(c => c.id === exercise.category_id);
                    const language = languages.find(l => l.value === exercise.programming_language);
                    const difficultyProps = getDifficultyProps(exercise.difficulty);
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
                          <Chip
                            label={difficultyProps.label}
                            color={difficultyProps.color}
                            size="small"
                          />
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
                            label={exercise.is_solved ? "Да" : "Нет"}
                            color={exercise.is_solved ? "success" : "default"}
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
                            Начать
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
                {exercises.map((exercise) => {
                  const category = categories.find(c => c.id === exercise.category_id);
                  const language = languages.find(l => l.value === exercise.programming_language);
                  const difficultyProps = getDifficultyProps(exercise.difficulty);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.id}>
                      <TaskCard
                        id={exercise.id}
                        title={exercise.title}
                        description={exercise.description}
                        languageIcon={language?.icon_svg}
                        languageName={language?.name || exercise.programming_language}
                        categoryName={category?.name}
                        difficulty={exercise.difficulty}
                        isSolved={exercise.is_solved}
                        onStart={handleExerciseClick}
                        difficultyLabel={difficultyProps.label}
                        difficultyColor={difficultyProps.color}
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
        </Box>
      </Container>
    </Box>
  );
};

export default TaskList; 