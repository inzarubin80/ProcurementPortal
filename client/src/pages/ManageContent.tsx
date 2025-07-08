import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExercises, createExercise, updateExercise, deleteExercise } from '../store/slices/exerciseSlice';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { 
  ExerciseList, 
  CategoryTable, 
  EntityDialog, 
  FilterBar 
} from '../components/ManageContent';
import { useEntityDialog, useSnackbar, useFormValidation } from '../hooks';

const ManageContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { exercises, loading: exercisesLoading, error: exercisesError } = useSelector((state: RootState) => state.exercises);
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories);
  const { languages, loading: languagesLoading, error: languagesError } = useSelector((state: RootState) => state.languages);
  
  // Local state
  const [tab, setTab] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [exercisePage, setExercisePage] = useState(1);
  const exercisesPerPage = 12;

  // Custom hooks
  const {
    openDialog,
    dialogType,
    entityType,
    editItem,
    form,
    triedSave,
    openAddDialog,
    openEditDialog,
    closeDialog,
    setForm,
    setTriedSave,
    handleFormChange,
  } = useEntityDialog();

  const { snackbar, showSuccess, showError, closeSnackbar } = useSnackbar();
  const { validateExerciseForm, validateCategoryForm } = useFormValidation();

  const loading = exercisesLoading || categoriesLoading || languagesLoading;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchLanguages()),
        dispatch(fetchCategories({ page: 1, pageSize: 100 })),
        dispatch(fetchExercises({ page: 1, pageSize: 100 })),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Обработка ошибок из Redux store
  useEffect(() => {
    if (exercisesError) {
      showError(exercisesError);
    }
  }, [exercisesError, showError]);

  useEffect(() => {
    if (categoriesError) {
      showError(categoriesError);
    }
  }, [categoriesError, showError]);

  useEffect(() => {
    if (languagesError) {
      showError(languagesError);
    }
  }, [languagesError, showError]);

  // --- Handlers ---
  const handleTabChange = (_: any, newValue: number) => setTab(newValue);
  const handleLanguageChange = (language: string) => setSelectedLanguage(language);
  const handleAddClick = () => openAddDialog(tab === 0 ? 'exercise' : 'category');
  
  const handleSave = async () => {
    setTriedSave(true);
    
    let validation;
    if (entityType === 'exercise') {
      validation = validateExerciseForm(form);
    } else {
      validation = validateCategoryForm(form);
    }
    
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }
    
    try {
      if (entityType === 'exercise') {
        if (dialogType === 'add') {
          const { title, description, category_id, programming_language, code_to_remember } = form;
          await dispatch(createExercise({
            title,
            description,
            category_id,
            programming_language,
            code_to_remember,
            is_active: true,
          })).unwrap();
          showSuccess('Упражнение создано');
        } else {
          await dispatch(updateExercise({ id: editItem.id, updates: form })).unwrap();
          showSuccess('Упражнение обновлено');
        }
      } else {
        if (dialogType === 'add') {
          await dispatch(createCategory(form)).unwrap();
          showSuccess('Категория создана');
          dispatch(fetchCategories({ page: 1, pageSize: 100 }));
        } else {
          const { name, description, programming_language } = form;
          await dispatch(updateCategory({ id: editItem.id, updates: { name, description, programming_language } })).unwrap();
          showSuccess('Категория обновлена');
          dispatch(fetchCategories({ page: 1, pageSize: 100 }));
        }
      }
      closeDialog();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Ошибка при сохранении';
      showError(errorMessage);
    }
  };
  
  const handleDelete = async (type: 'exercise' | 'category', id: number) => {
    try {
      if (type === 'exercise') {
        await dispatch(deleteExercise(id)).unwrap();
        showSuccess('Упражнение удалено');
      } else {
        await dispatch(deleteCategory(id)).unwrap();
        showSuccess('Категория удалена');
      }
    } catch (error: any) {
      let errorMessage = error?.message || error?.toString() || 'Ошибка при удалении';
      if (type === 'category' && errorMessage.includes('category contains exercises')) {
        errorMessage = 'Нельзя удалить категорию, в которой есть упражнения';
      }
      showError(errorMessage);
    }
  };

  // --- Filtered lists ---
  const filteredCategories = selectedLanguage === 'all' ? categories : categories.filter(c => c.programming_language && c.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
  const filteredExercises = selectedLanguage === 'all'
    ? exercises
    : exercises.filter(e => e.exercise.programming_language && e.exercise.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
  const paginatedExercises = filteredExercises.slice((exercisePage - 1) * exercisesPerPage, exercisePage * exercisesPerPage);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Управление контентом</Typography>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Упражнения" />
          <Tab label="Категории" />
        </Tabs>
        
        <FilterBar
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          onAddClick={handleAddClick}
          languages={languages}
          tab={tab}
        />
        
        {tab === 0 ? (
          <ExerciseList
            exercises={filteredExercises}
            languages={languages}
            categories={categories}
            currentPage={exercisePage}
            exercisesPerPage={exercisesPerPage}
            onPageChange={setExercisePage}
            onEdit={(exercise) => openEditDialog('exercise', exercise)}
            onDelete={(id) => handleDelete('exercise', id)}
          />
        ) : (
          <CategoryTable
            categories={filteredCategories}
            languages={languages}
            onEdit={(category) => openEditDialog('category', category)}
            onDelete={(id) => handleDelete('category', id)}
          />
        )}
      </Paper>
      
      <EntityDialog
        open={openDialog}
        onClose={closeDialog}
        onSave={handleSave}
        entityType={entityType}
        dialogType={dialogType}
        form={form}
        onFormChange={handleFormChange}
        languages={languages}
        categories={categories}
        triedSave={triedSave}
        onDelete={
          dialogType === 'edit' && entityType === 'exercise'
            ? () => handleDelete('exercise', form.id)
            : undefined
        }
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={closeSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageContent; 