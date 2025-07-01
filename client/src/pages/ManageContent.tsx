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
  Card,
  CardContent,
  CardActions,
  Grid,
  Pagination,
  Chip,
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
  const { exercises, loading: exercisesLoading, error: exercisesError } = useSelector((state: RootState) => state.exercises);
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories);
  const { languages, loading: languagesLoading, error: languagesError } = useSelector((state: RootState) => state.languages);
  
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
  const [exercisePage, setExercisePage] = useState(1);
  const exercisesPerPage = 12;

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
      setSnackbar({open: true, message: exercisesError, severity: 'error'});
    }
  }, [exercisesError]);

  useEffect(() => {
    if (categoriesError) {
      setSnackbar({open: true, message: categoriesError, severity: 'error'});
    }
  }, [categoriesError]);

  useEffect(() => {
    if (languagesError) {
      setSnackbar({open: true, message: languagesError, severity: 'error'});
    }
  }, [languagesError]);

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
          await dispatch(createExercise(form)).unwrap();
          setSnackbar({open: true, message: 'Упражнение создано', severity: 'success'});
        } else {
          await dispatch(updateExercise({ id: editItem.id, updates: form })).unwrap();
          setSnackbar({open: true, message: 'Упражнение обновлено', severity: 'success'});
        }
      } else {
        if (dialogType === 'add') {
          await dispatch(createCategory(form)).unwrap();
          setSnackbar({open: true, message: 'Категория создана', severity: 'success'});
        } else {
          await dispatch(updateCategory({ id: editItem.id, updates: form })).unwrap();
          setSnackbar({open: true, message: 'Категория обновлена', severity: 'success'});
        }
      }
      setOpenDialog(false);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Ошибка при сохранении';
      setSnackbar({open: true, message: errorMessage, severity: 'error'});
    }
  };
  
  const handleDelete = async (type: 'exercise' | 'category', id: string) => {
    try {
      if (type === 'exercise') {
        await dispatch(deleteExercise(id)).unwrap();
        setSnackbar({open: true, message: 'Упражнение удалено', severity: 'success'});
      } else {
        await dispatch(deleteCategory(id)).unwrap();
        setSnackbar({open: true, message: 'Категория удалена', severity: 'success'});
      }
    } catch (error: any) {
      let errorMessage = error?.message || error?.toString() || 'Ошибка при удалении';
      // Дружелюбные сообщения для удаления категории
      if (type === 'category') {
        if (errorMessage.includes('category contains exercises')) {
          errorMessage = 'Нельзя удалить категорию, в которой есть упражнения';
        }
        if (errorMessage.includes('category not found')) {
          errorMessage = 'Упражнение не найдено или не принадлежит вам';
        }
      }
      setSnackbar({open: true, message: errorMessage, severity: 'error'});
    }
  };

  // --- Filtered lists ---
  const filteredCategories = selectedLanguage === 'all' ? categories : categories.filter(c => c.programming_language && c.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
  const filteredExercises = selectedLanguage === 'all' ? exercises : exercises.filter(e => e.programming_language && e.programming_language.toLowerCase() === selectedLanguage.toLowerCase());
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
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Язык</InputLabel>
            <Select value={selectedLanguage} label="Язык" onChange={handleLanguageChange}>
              <MenuItem value="all">Все языки</MenuItem>
              {languages.map(l => <MenuItem key={l.value} value={l.value}>
                <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: l.icon_svg}} />
                {l.name}
              </MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAddDialog(tab === 0 ? 'exercise' : 'category')}>
            {tab === 0 ? 'Добавить упражнение' : 'Добавить категорию'}
          </Button>
        </Stack>
        {tab === 0 ? (
          <>
            <Grid container spacing={2}>
              {paginatedExercises.map(ex => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ex.id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: languages.find(l => l.value === ex.programming_language)?.icon_svg || ''}} />
                        <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>{ex.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 36, maxHeight: 48, overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.description}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip size="small" label={categories.find(c => c.id === ex.category_id)?.name || '—'} />
                        <Chip size="small" label={ex.difficulty} color="info" />
                        <Chip size="small" label={ex.programming_language} color="default" />
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <IconButton onClick={() => openEditDialog('exercise', ex)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete('exercise', ex.id)}><DeleteIcon /></IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredExercises.length / exercisesPerPage)}
                page={exercisePage}
                onChange={(_, value) => setExercisePage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
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
                    <TableCell>
                      <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: languages.find(l => l.value === cat.programming_language)?.icon_svg || ''}} />
                      {cat.programming_language}
                    </TableCell>
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
                    {languages.map(l => <MenuItem key={l.value} value={l.value}>
                      <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: l.icon_svg}} />
                      {l.name}
                    </MenuItem>)}
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
                    {languages.map(l => <MenuItem key={l.value} value={l.value}>
                      <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: l.icon_svg}} />
                      {l.name}
                    </MenuItem>)}
                  </Select>
                </FormControl>
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
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageContent; 