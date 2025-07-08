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
          />
        ) : (
          <CategoryForm
            form={form}
            onFormChange={onFormChange}
            languages={languages}
            triedSave={triedSave}
          />
        )}
        {dialogType === 'edit' && entityType === 'exercise' && onDelete && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button color="error" variant="outlined" onClick={onDelete}>
              Удалить упражнение
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={onSave} variant="contained">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityDialog; 