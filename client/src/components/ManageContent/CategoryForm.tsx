import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ProgrammingLanguage } from '../../types/api';

interface CategoryFormProps {
  form: any;
  onFormChange: (e: any) => void;
  languages: ProgrammingLanguage[];
  triedSave: boolean;
  isAdmin?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  form,
  onFormChange,
  languages,
  triedSave,
  isAdmin,
}) => {
  return (
    <Stack spacing={2}>
      <TextField
        name="name"
        label="Название"
        value={form.name || ''}
        onChange={onFormChange}
        fullWidth
        error={triedSave && (!form.name || String(form.name).trim() === '')}
        helperText={triedSave && (!form.name || String(form.name).trim() === '') ? 'Обязательное поле' : ''}
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
      {isAdmin && (
        <FormControlLabel
          control={
            <Switch
              checked={!!form.is_common}
              onChange={e => onFormChange({ target: { name: 'is_common', value: e.target.checked } })}
              name="is_common"
              color="primary"
            />
          }
          label="Общая категория"
        />
      )}
    </Stack>
  );
};

export default CategoryForm; 