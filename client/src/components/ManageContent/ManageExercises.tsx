import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchExercises, createExercise, updateExercise, deleteExercise } from '../../store/slices/exerciseSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchLanguages } from '../../store/slices/languageSlice';
import ExerciseList from './ExerciseList';
import FilterBar from './FilterBar';
import EntityDialog from './EntityDialog';
import { useEntityDialog, useSnackbar, useFormValidation } from '../../hooks';
import { Container, Snackbar, Alert } from '@mui/material';

const ManageExercises: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { exercises, loading: exercisesLoading, error: exercisesError } = useSelector((state: RootState) => state.exercises);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const user = useSelector((state: RootState) => state.user.user);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [exercisePage, setExercisePage] = useState(1);
  const exercisesPerPage = 12;

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
  const { validateExerciseForm } = useFormValidation();

  const loading = exercisesLoading || categoriesLoading || languagesLoading;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchLanguages()),
        dispatch(fetchCategories()),
        dispatch(fetchExercises({ page: 1, pageSize: 100 })),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (exercisesError) {
      showError(exercisesError);
    }
  }, [exercisesError, showError]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    dispatch(fetchExercises({
      page: 1,
      pageSize: 100,
      programming_language: language !== 'all' ? language : undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined
    }));
  };
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    dispatch(fetchExercises({
      page: 1,
      pageSize: 100,
      programming_language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
      category_id: category !== 'all' ? category : undefined
    }));
  };
  const handleAddClick = () => {
    // Найти выбранную категорию
    const selectedCat = categories.find(c => String(c.id) === String(selectedCategory));
    if (!user?.is_admin && selectedCat && selectedCat.is_common) {
      showError('Вы не можете добавлять задачи в общую категорию');
      return;
    }
    openAddDialog('exercise');
  };

  const handleSave = async () => {
    setTriedSave(true);
    const validation = validateExerciseForm(form);
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }
    // Проверка: если задача общая и не админ, запретить сохранение
    if (!user?.is_admin && form.is_common) {
      showError('Вы не можете изменять общую задачу');
      return;
    }
    try {
      if (dialogType === 'add') {
        const { title, description, category_id, programming_language, code_to_remember, is_common } = form;
        await dispatch(createExercise({
          title,
          description,
          category_id,
          programming_language,
          code_to_remember,
          is_active: true,
          is_common: !!is_common,
        })).unwrap();
        showSuccess('Упражнение создано');
      } else {
        await dispatch(updateExercise({ id: editItem.exercise.id, updates: form })).unwrap();
        await dispatch(fetchExercises({ page: 1, pageSize: 100 }));
        showSuccess('Упражнение обновлено');
      }
      closeDialog();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Ошибка при сохранении';
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    // Найти задачу
    const ex = exercises.find(e => e.exercise.id === id);
    if (!user?.is_admin && ex && ex.exercise.is_common) {
      showError('Вы не можете удалить общую задачу');
      return;
    }
    try {
      await dispatch(deleteExercise(id)).unwrap();
      showSuccess('Упражнение удалено');
    } catch (error: any) {
      let errorMessage = error?.message || error?.toString() || 'Ошибка при удалении';
      showError(errorMessage);
    }
  };

  const filteredCategories = selectedLanguage === 'all' ? categories : categories.filter(c => c.programming_language && c.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
  const filteredExercises = exercises.filter(e => {
    const langMatch = selectedLanguage === 'all' || (e.exercise.programming_language && e.exercise.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
    const catMatch = selectedCategory === 'all' || (e.exercise.category_id && String(e.exercise.category_id) === String(selectedCategory));
    return langMatch && catMatch;
  });
  const paginatedExercises = filteredExercises.slice((exercisePage - 1) * exercisesPerPage, exercisePage * exercisesPerPage);

  if (loading) {
    return <Container maxWidth="lg" sx={{ py: 4 }}><span>Загрузка...</span></Container>;
  }

  return (
    <>
      <FilterBar
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        onAddClick={handleAddClick}
        languages={languages}
        tab={0}
      />
      <ExerciseList
        exercises={filteredExercises}
        languages={languages}
        categories={categories}
        currentPage={exercisePage}
        exercisesPerPage={exercisesPerPage}
        onPageChange={setExercisePage}
        onEdit={(exerciseDetailse) => openEditDialog('exercise', exerciseDetailse)}
        onDelete={handleDelete}
      />
      <EntityDialog
        open={openDialog}
        onClose={closeDialog}
        onSave={handleSave}
        entityType={'exercise'}
        dialogType={dialogType}
        form={form}
        onFormChange={handleFormChange}
        languages={languages}
        categories={categories}
        triedSave={triedSave}
        onDelete={dialogType === 'edit' ? () => handleDelete(form.id) : undefined}
        isAdmin={user?.is_admin}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default ManageExercises; 