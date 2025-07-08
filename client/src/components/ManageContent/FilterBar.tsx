import React from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ProgrammingLanguage } from '../../types/api';

interface FilterBarProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onAddClick: () => void;
  languages: ProgrammingLanguage[];
  tab: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedLanguage,
  onLanguageChange,
  onAddClick,
  languages,
  tab,
}) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Язык</InputLabel>
        <Select value={selectedLanguage} label="Язык" onChange={(e) => onLanguageChange(e.target.value)}>
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
        onClick={onAddClick}
      >
        {tab === 0 ? 'Добавить упражнение' : 'Добавить категорию'}
      </Button>
    </Stack>
  );
};

export default FilterBar; 