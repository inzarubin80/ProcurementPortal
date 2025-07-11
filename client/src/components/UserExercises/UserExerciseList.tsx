import React, { useRef, useEffect } from 'react';
import {
  Box,
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
  Button,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import { TableRows as TableRowsIcon, ViewModule as ViewModuleIcon, FilterList as FilterListIcon, Settings as SettingsIcon, PlayArrow as PlayIcon } from '@mui/icons-material';
import UserExerciseCard from './UserExerciseCard';

interface UserExerciseListProps {
  userExercises: any[];
  loading: boolean;
  loadingInitial: boolean;
  pagination: any;
  currentPage: number;
  selectedLanguage: string;
  selectedCategory: string;
  languages: any[];
  categories: any[];
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  onExerciseClick: (id: number) => void;
  onLanguageChange: (lang: string) => void;
  onCategoryChange: (cat: string) => void;
  onResetFilters: () => void;
  onGoToManagement: () => void;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  exercisesLoading: boolean;
}

const UserExerciseList: React.FC<UserExerciseListProps> = ({
  userExercises,
  loading,
  loadingInitial,
  pagination,
  currentPage,
  selectedLanguage,
  selectedCategory,
  languages,
  categories,
  viewMode,
  onViewModeChange,
  onExerciseClick,
  onLanguageChange,
  onCategoryChange,
  onResetFilters,
  onGoToManagement,
  tableContainerRef,
  exercisesLoading,
}) => {
  // Empty state subcomponent
  const EmptyState = () => {
    const hasActiveFilters = selectedLanguage !== 'all' || selectedCategory !== 'all';
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, p: 4 }}>
        <Card sx={{ maxWidth: 500, textAlign: 'center', borderRadius: 3, boxShadow: 3, p: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.secondary' }}>
              {hasActiveFilters ? 'Упражнения не найдены' : 'Список упражнений пуст'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {hasActiveFilters
                ? 'Попробуйте изменить фильтры или добавьте упражнения в управлении'
                : 'Добавьте упражнения в свой список через меню управления'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={onResetFilters}
                  sx={{ borderRadius: 2, px: 3, py: 1.5, width: 220, height: 48, whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                >
                  Сбросить фильтры
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={onGoToManagement}
                sx={{ borderRadius: 2, px: 3, py: 1.5, width: 220, height: 48, whiteSpace: 'nowrap', fontSize: '0.875rem', borderColor: '#1da1f2', color: '#1da1f2', '&:hover': { borderColor: '#0d8bd9', backgroundColor: '#f8f9fa' } }}
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LinearProgress sx={{ width: '50%', mx: 'auto', my: 8 }} />
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
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
              onChange={(_, nextView) => nextView && onViewModeChange(nextView)}
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
                  onChange={(e) => onLanguageChange(e.target.value)}
                >
                  <MenuItem value="all">Все языки</MenuItem>
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.icon_svg && (
                        <span style={{ verticalAlign: 'middle', marginRight: 8 }} dangerouslySetInnerHTML={{ __html: lang.icon_svg }} />
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
                  onChange={(e) => onCategoryChange(e.target.value)}
                  disabled={selectedLanguage === 'all'}
                >
                  <MenuItem value="all">Все категории</MenuItem>
                  {categories
                    .filter(c => selectedLanguage === 'all' || c.programming_language?.toLowerCase() === selectedLanguage.toLowerCase())
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
                        const language = languages.find(l => l.value === exercise.programming_language);
                        const isCompleted = user_info.is_solved;
                        return (
                          <TableRow
                            key={exercise.id}
                            hover
                            onClick={() => onExerciseClick(exercise.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {language?.icon_svg && (
                                  <span style={{ verticalAlign: 'middle', marginRight: 8 }} dangerouslySetInnerHTML={{ __html: language.icon_svg }} />
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
                                {exercise.category_name || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {language?.icon_svg ? (
                                <span dangerouslySetInnerHTML={{ __html: language.icon_svg }} />
                              ) : (
                                <Typography variant="body2">
                                  {exercise.programming_language}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={isCompleted ? 'Да' : 'Нет'}
                                color={isCompleted ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                startIcon={<PlayIcon />}
                                onClick={e => {
                                  e.stopPropagation();
                                  onExerciseClick(exercise.id);
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
                  sx={{ maxHeight: 800, overflowY: 'auto', position: 'relative', p: 1 }}
                >
                  <Grid container spacing={2}>
                    {userExercises.map((exerciseDetailse) => {
                      const { exercise, user_info } = exerciseDetailse;
                      const language = languages.find(l => l.value === exercise.programming_language);
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.id}>
                          <UserExerciseCard
                            id={exercise.id}
                            title={exercise.title}
                            description={exercise.description}
                            languageIcon={language?.icon_svg}
                            languageName={language?.name || exercise.programming_language}
                            categoryName={exercise.category_name}
                            isSolved={user_info.is_solved}
                            onStart={onExerciseClick}
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

export default UserExerciseList; 