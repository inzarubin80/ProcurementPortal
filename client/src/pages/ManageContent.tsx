import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchExercises, createExercise, updateExercise, deleteExercise } from '../store/slices/exerciseSlice';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categorySlice';
import { fetchLanguages } from '../store/slices/languageSlice';
import { ProgrammingLanguage, Category, Exercise } from '../types/api';

const ManageContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { exercises, loading: exercisesLoading } = useSelector((state: RootState) => state.exercises);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { languages, loading: languagesLoading } = useSelector((state: RootState) => state.languages);
  
  // Local state
  const [tab, setTab] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [editItem, setEditItem] = useState<any>(null);
  const [entityType, setEntityType] = useState<'exercise' | 'category'>('exercise');
  // Form state
  const [form, setForm] = useState<any>({});
  // Snackbar
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

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

  // --- Handlers ---
  const handleTabChange = (_: any, newValue: number) => setTab(newValue);
  const handleLanguageChange = (e: any) => setSelectedLanguage(e.target.value);

  // --- CRUD Dialogs ---
  const openAddDialog = (type: 'exercise' | 'category') => {
    setEntityType(type);
    setDialogType('add');
    setForm({});
    setEditItem(null);
    setOpenDialog(true);
  };
  const openEditDialog = (type: 'exercise' | 'category', item: any) => {
    setEntityType(type);
    setDialogType('edit');
    setForm(item);
    setEditItem(item);
    setOpenDialog(true);
  };
  const closeDialog = () => setOpenDialog(false);

  // --- CRUD Logic ---
  const handleFormChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleSave = async () => {
    try {
      if (entityType === 'exercise') {
        if (dialogType === 'add') {
          await dispatch(createExercise(form));
          setSnackbar({open: true, message: 'Упражнение добавлено', severity: 'success'});
        } else {
          await dispatch(updateExercise({ id: form.id, updates: form }));
          setSnackbar({open: true, message: 'Упражнение обновлено', severity: 'success'});
        }
      } else {
        if (dialogType === 'add') {
          await dispatch(createCategory(form));
          setSnackbar({open: true, message: 'Категория добавлена', severity: 'success'});
        } else {
          await dispatch(updateCategory({ id: form.id, updates: form }));
          setSnackbar({open: true, message: 'Категория обновлена', severity: 'success'});
        }
      }
      setOpenDialog(false);
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при сохранении', severity: 'error'});
    }
  };
  
  const handleDelete = async (type: 'exercise' | 'category', id: string) => {
    try {
      if (type === 'exercise') {
        await dispatch(deleteExercise(id));
        setSnackbar({open: true, message: 'Упражнение удалено', severity: 'success'});
      } else {
        await dispatch(deleteCategory(id));
        setSnackbar({open: true, message: 'Категория удалена', severity: 'success'});
      }
    } catch (error) {
      setSnackbar({open: true, message: 'Ошибка при удалении', severity: 'error'});
    }
  };

  // --- Filtered lists ---
  const filteredCategories = selectedLanguage === 'all' ? categories : categories.filter(c => c.programming_language === selectedLanguage);
  const filteredExercises = selectedLanguage === 'all' ? exercises : exercises.filter(e => e.programming_language === selectedLanguage);

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
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Язык</InputLabel>
            <Select value={selectedLanguage} label="Язык" onChange={handleLanguageChange}>
              <MenuItem value="all">Все языки</MenuItem>
              {languages.map(l => <MenuItem key={l.value} value={l.value}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAddDialog(tab === 0 ? 'exercise' : 'category')}>
            Добавить {tab === 0 ? 'упражнение' : 'категорию'}
          </Button>
        </Stack>
        {tab === 0 ? (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Язык</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Сложность</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExercises.map(ex => (
                  <TableRow key={ex.id}>
                    <TableCell>{ex.title}</TableCell>
                    <TableCell>{ex.programming_language}</TableCell>
                    <TableCell>{categories.find(c => c.id === ex.category_id)?.name}</TableCell>
                    <TableCell>{ex.difficulty}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => openEditDialog('exercise', ex)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete('exercise', ex.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Язык</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.programming_language}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => openEditDialog('category', cat)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete('category', cat.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Диалог добавления/редактирования */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogType === 'add' ? 'Добавить' : 'Редактировать'} {entityType === 'exercise' ? 'упражнение' : 'категорию'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {entityType === 'exercise' ? (
              <>
                <TextField
                  name="title"
                  label="Название"
                  value={form.title || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  name="description"
                  label="Описание"
                  value={form.description || ''}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Язык программирования</InputLabel>
                  <Select
                    name="programming_language"
                    value={form.programming_language || ''}
                    label="Язык программирования"
                    onChange={handleFormChange}
                  >
                    {languages.map(l => <MenuItem key={l.value} value={l.value}>{l.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    name="category_id"
                    value={form.category_id || ''}
                    label="Категория"
                    onChange={handleFormChange}
                  >
                    {categories
                      .filter(c => c.programming_language === form.programming_language)
                      .map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Сложность</InputLabel>
                  <Select
                    name="difficulty"
                    value={form.difficulty || ''}
                    label="Сложность"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="easy">Легко</MenuItem>
                    <MenuItem value="medium">Средне</MenuItem>
                    <MenuItem value="hard">Сложно</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  name="code_to_remember"
                  label="Код для запоминания"
                  value={form.code_to_remember || ''}
                  onChange={handleFormChange}
                  multiline
                  rows={6}
                  fullWidth
                />
              </>
            ) : (
              <>
                <TextField
                  name="name"
                  label="Название"
                  value={form.name || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  name="description"
                  label="Описание"
                  value={form.description || ''}
                  onChange={handleFormChange}
                  multiline
                  rows={3}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Язык программирования</InputLabel>
                  <Select
                    name="programming_language"
                    value={form.programming_language || ''}
                    label="Язык программирования"
                    onChange={handleFormChange}
                  >
                    {languages.map(l => <MenuItem key={l.value} value={l.value}>{l.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  name="color"
                  label="Цвет"
                  value={form.color || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  name="icon"
                  label="Иконка"
                  value={form.icon || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageContent; 