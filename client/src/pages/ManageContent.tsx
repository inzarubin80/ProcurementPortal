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
import ManageExercises from '../components/ManageContent/ManageExercises';
import ManageCategories from '../components/ManageContent/ManageCategories';
import ManageUsers from '../components/ManageContent/ManageUsers';

const ManageContent: React.FC = () => {
  const [tab, setTab] = useState(0);
  const handleTabChange = (_: any, newValue: number) => setTab(newValue);
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.is_admin;
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Управление контентом</Typography>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Упражнения" />
          <Tab label="Категории" />
          {isAdmin && <Tab label="Пользователи" />}
        </Tabs>
        {tab === 0 ? <ManageExercises /> : tab === 1 ? <ManageCategories /> : (isAdmin ? <ManageUsers /> : null)}
      </Paper>
    </Container>
  );
};

export default ManageContent; 