import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';
import { fetchLanguages } from '../../store/slices/languageSlice';
import CategoryTable from './CategoryTable';
import EntityDialog from './EntityDialog';
import { useEntityDialog, useSnackbar, useFormValidation } from '../../hooks';
import { Container, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ManageCategories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories);
  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  const [categoryPage, setCategoryPage] = useState(1);
  const categoriesPerPage = 12;
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const user = useSelector((state: RootState) => state.user.user);

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
  const { validateCategoryForm } = useFormValidation();

  const loading = categoriesLoading || languagesLoading;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchLanguages()),
        dispatch(fetchCategories()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (categoriesError) {
      showError(categoriesError);
    }
  }, [categoriesError, showError]);

  const handleAddClick = () => openAddDialog('category');

  const handleSave = async () => {
    setTriedSave(true);
    const validation = validateCategoryForm(form);
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }
    try {
      if (dialogType === 'add') {
        await dispatch(createCategory(form)).unwrap();
        showSuccess('Категория создана');
        dispatch(fetchCategories());
      } else {
        const { name, description, programming_language } = form;
        await dispatch(updateCategory({ id: editItem.id, updates: { name, description, programming_language } })).unwrap();
        showSuccess('Категория обновлена');
        dispatch(fetchCategories());
      }
      closeDialog();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Ошибка при сохранении';
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      showSuccess('Категория удалена');
    } catch (error: any) {
      let errorMessage = error?.message || error?.toString() || 'Ошибка при удалении';
      if (errorMessage.includes('category contains exercises')) {
        errorMessage = 'Нельзя удалить категорию, в которой есть упражнения';
      }
      showError(errorMessage);
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const paginatedCategories = categories.slice((categoryPage - 1) * categoriesPerPage, categoryPage * categoriesPerPage);
  const filteredCategories = selectedLanguage === 'all'
    ? categories
    : categories.filter(c => c.programming_language && c.programming_language.toLowerCase() === selectedLanguage.toLowerCase());

  if (loading) {
    return <Container maxWidth="lg" sx={{ py: 4 }}><span>Загрузка...</span></Container>;
  }

  return (
    <>
      <Paper sx={{ mb: 4, bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Язык</InputLabel>
            <Select value={selectedLanguage} label="Язык" onChange={(e) => handleLanguageChange(e.target.value)}>
              <MenuItem value="all">Все языки</MenuItem>
              {languages.map(l => (
                <MenuItem key={l.value} value={l.value}>
                  <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: l.icon_svg}} />
                  {l.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ color: 'white', minWidth: 220, height: 48 }}
          >
            Добавить категорию
          </Button>
        </Box>
      </Paper>
      <CategoryTable
        categories={filteredCategories}
        languages={languages}
        onEdit={(category) => openEditDialog('category', category)}
        onDelete={handleDelete}
        isAdmin={user?.is_admin}
        userId={user?.user_id}
      />
      <EntityDialog
        open={openDialog}
        onClose={closeDialog}
        onSave={handleSave}
        entityType={'category'}
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

export default ManageCategories; 