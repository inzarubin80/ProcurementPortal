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
import UserExerciseList from '../components/UserExercises/UserExerciseList';


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
    if (categories.length === 0) dispatch(fetchCategories());
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

  const handleExerciseClick = (exerciseId: number) => {
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

  return (
    <UserExerciseList
      userExercises={userExercises}
      loading={loading}
      loadingInitial={loadingInitial}
      pagination={pagination}
      currentPage={currentPage}
      selectedLanguage={selectedLanguage}
      selectedCategory={selectedCategory}
      languages={languages}
      categories={categories}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      onExerciseClick={handleExerciseClick}
      onLanguageChange={handleLanguageChange}
      onCategoryChange={handleCategoryChange}
      onResetFilters={handleResetFilters}
      onGoToManagement={handleGoToManagement}
      tableContainerRef={tableContainerRef}
      exercisesLoading={exercisesLoading}
    />
  );
};

export default TaskList; 