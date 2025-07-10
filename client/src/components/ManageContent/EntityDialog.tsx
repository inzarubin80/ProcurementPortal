import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { ProgrammingLanguage, Category } from '../../types/api';
import ExerciseForm from './ExerciseForm';
import CategoryForm from './CategoryForm';

interface EntityDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  entityType: 'exercise' | 'category';
  dialogType: 'add' | 'edit';
  form: any;
  onFormChange: (e: any) => void;
  languages: ProgrammingLanguage[];
  categories: Category[];
  triedSave: boolean;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const EntityDialog: React.FC<EntityDialogProps> = ({
  open,
  onClose,
  onSave,
  entityType,
  dialogType,
  form,
  onFormChange,
  languages,
  categories,
  triedSave,
  onDelete,
  isAdmin,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogType === 'add' ? 'Добавить' : 'Редактировать'} {entityType === 'exercise' ? 'упражнение' : 'категорию'}
      </DialogTitle>
      <DialogContent>
        {entityType === 'exercise' ? (
          <ExerciseForm
            form={form}
            onFormChange={onFormChange}
            languages={languages}
            categories={categories}
            triedSave={triedSave}
            isAdmin={isAdmin}
          />
        ) : (
          <CategoryForm
            form={form}
            onFormChange={onFormChange}
            languages={languages}
            triedSave={triedSave}
            isAdmin={isAdmin}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onSave} variant="contained" sx={{ color: '#fff' }}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityDialog; 