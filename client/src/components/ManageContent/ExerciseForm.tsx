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
import { ProgrammingLanguage, Category } from '../../types/api';
import CustomMonacoEditor from '../CustomMonacoEditor';

interface ExerciseFormProps {
  form: any;
  onFormChange: (e: any) => void;
  languages: ProgrammingLanguage[];
  categories: Category[];
  triedSave: boolean;
  isAdmin?: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  form,
  onFormChange,
  languages,
  categories,
  triedSave,
  isAdmin,
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
          label="Общая задача"
        />
      )}
      <div>
        <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Код для запоминания</label>
        <CustomMonacoEditor
          height="200px"
          defaultLanguage={form.programming_language || 'plaintext'}
          value={form.code_to_remember || ''}
          onChange={(v: string | undefined) => {
            onFormChange({ target: { name: 'code_to_remember', value: v || '' } });
          }}
          options={{ fontSize: 16, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on' }}
        />
        {triedSave && (!form.code_to_remember || String(form.code_to_remember).trim() === '') && (
          <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>Обязательное поле</div>
        )}
      </div>
    </Stack>
  );
};

export default ExerciseForm; 