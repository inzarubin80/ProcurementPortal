import React from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ProgrammingLanguage, Category } from '../../types/api';

interface FilterBarProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onAddClick: () => void;
  languages: ProgrammingLanguage[];
  tab: number;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedLanguage,
  onLanguageChange,
  onAddClick,
  languages,
  tab,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <Paper sx={{ mb: 4, bgcolor: 'white', borderRadius: 4, boxShadow: 2, p: 3 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
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
        </Grid>
        {tab === 0 && (
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select value={selectedCategory} label="Категория" onChange={(e) => onCategoryChange(e.target.value)}>
                <MenuItem value="all">Все категории</MenuItem>
                {categories.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={onAddClick}
            sx={{ color: 'white', minWidth: 220, height: 48 }}
          >
            {tab === 0 ? 'Добавить упражнение' : 'Добавить категорию'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterBar; 