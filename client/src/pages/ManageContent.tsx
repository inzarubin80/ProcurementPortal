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
import { Language, Category, Exercise } from '../types/api';
import { languageApi, categoryApi, exerciseApi } from '../services/api';

const ManageContent: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [langs, cats, exs] = await Promise.all([
      languageApi.getLanguages(),
      categoryApi.getCategories(),
      exerciseApi.getExercises(),
    ]);
    setLanguages(langs);
    setCategories(cats);
    setExercises(exs);
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

  // --- CRUD Logic (front only) ---
  const handleFormChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = () => {
    if (entityType === 'exercise') {
      if (dialogType === 'add') {
        setExercises([...exercises, { ...form, id: Date.now() }]);
        setSnackbar({open: true, message: 'Упражнение добавлено', severity: 'success'});
      } else {
        setExercises(exercises.map(e => e.id === form.id ? form : e));
        setSnackbar({open: true, message: 'Упражнение обновлено', severity: 'success'});
      }
    } else {
      if (dialogType === 'add') {
        setCategories([...categories, { ...form, id: Date.now() }]);
        setSnackbar({open: true, message: 'Категория добавлена', severity: 'success'});
      } else {
        setCategories(categories.map(c => c.id === form.id ? form : c));
        setSnackbar({open: true, message: 'Категория обновлена', severity: 'success'});
      }
    }
    setOpenDialog(false);
  };
  const handleDelete = (type: 'exercise' | 'category', id: number) => {
    if (type === 'exercise') {
      setExercises(exercises.filter(e => e.id !== id));
      setSnackbar({open: true, message: 'Упражнение удалено', severity: 'success'});
    } else {
      setCategories(categories.filter(c => c.id !== id));
      setSnackbar({open: true, message: 'Категория удалена', severity: 'success'});
    }
  };

  // --- Filtered lists ---
  const filteredCategories = selectedLanguage === 'all' ? categories : categories.filter(c => c.language_id.toString() === selectedLanguage);
  const filteredExercises = selectedLanguage === 'all' ? exercises : exercises.filter(e => e.language_id.toString() === selectedLanguage);

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
              {languages.map(l => <MenuItem key={l.id} value={l.id.toString()}>{l.name}</MenuItem>)}
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
                    <TableCell>{languages.find(l => l.id === ex.language_id)?.name}</TableCell>
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
                    <TableCell>{languages.find(l => l.id === cat.language_id)?.name}</TableCell>
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
            <FormControl fullWidth>
              <InputLabel>Язык</InputLabel>
              <Select
                name="language_id"
                value={form.language_id || ''}
                label="Язык"
                onChange={handleFormChange}
              >
                {languages.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              name="name"
              label={entityType === 'category' ? 'Название категории' : 'Название упражнения'}
              value={form.name || ''}
              onChange={handleFormChange}
              fullWidth
            />
            {entityType === 'exercise' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    name="category_id"
                    value={form.category_id || ''}
                    label="Категория"
                    onChange={handleFormChange}
                  >
                    {categories
                      .filter(c => c.language_id === form.language_id)
                      .map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  name="title"
                  label="Заголовок упражнения"
                  value={form.title || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  name="description"
                  label="Описание"
                  value={form.description || ''}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <TextField
                  name="code"
                  label="Код"
                  value={form.code || ''}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
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
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ManageContent; 