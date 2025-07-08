import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { ProgrammingLanguage, Category } from '../../types/api';

interface ExerciseFormProps {
  form: any;
  onFormChange: (e: any) => void;
  languages: ProgrammingLanguage[];
  categories: Category[];
  triedSave: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  form,
  onFormChange,
  languages,
  categories,
  triedSave,
}) => {
  return (
    <Stack spacing={2}>
      <TextField
        name="title"
        label="Название"
        value={form.title || ''}
        onChange={onFormChange}
        fullWidth
        error={triedSave && (!form.title || String(form.title).trim() === '')}
        helperText={triedSave && (!form.title || String(form.title).trim() === '') ? 'Обязательное поле' : ''}
      />
      <TextField
        name="description"
        label="Описание"
        value={form.description || ''}
        onChange={onFormChange}
        multiline
        rows={3}
        fullWidth
        error={triedSave && (!form.description || String(form.description).trim() === '')}
        helperText={triedSave && (!form.description || String(form.description).trim() === '') ? 'Обязательное поле' : ''}
      />
      <FormControl fullWidth error={triedSave && (!form.programming_language || String(form.programming_language).trim() === '')}>
        <InputLabel>Язык программирования</InputLabel>
        <Select
          name="programming_language"
          value={form.programming_language || ''}
          label="Язык программирования"
          onChange={onFormChange}
        >
          {languages.map(l => (
            <MenuItem key={l.value} value={l.value}>
              <span style={{verticalAlign: 'middle', marginRight: 8}} dangerouslySetInnerHTML={{__html: l.icon_svg}} />
              {l.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth error={triedSave && (!form.category_id || String(form.category_id).trim() === '')}>
        <InputLabel>Категория</InputLabel>
        <Select
          name="category_id"
          value={form.category_id || ''}
          label="Категория"
          onChange={onFormChange}
        >
          {categories
            .filter(c => c.programming_language === form.programming_language)
            .map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
        </Select>
      </FormControl>
      <TextField
        name="code_to_remember"
        label="Код для запоминания"
        value={form.code_to_remember || ''}
        onChange={onFormChange}
        multiline
        rows={6}
        fullWidth
        error={triedSave && (!form.code_to_remember || String(form.code_to_remember).trim() === '')}
        helperText={triedSave && (!form.code_to_remember || String(form.code_to_remember).trim() === '') ? 'Обязательное поле' : ''}
      />
    </Stack>
  );
};

export default ExerciseForm; 