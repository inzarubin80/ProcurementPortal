import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Category, ProgrammingLanguage } from '../../types/api';

interface CategoryTableProps {
  categories: Category[];
  languages: ProgrammingLanguage[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isAdmin?: boolean;
  userId?: number; // добавлено
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  languages,
  onEdit,
  onDelete,
  isAdmin,
  userId,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Название</TableCell>
            <TableCell>Язык</TableCell>
            <TableCell>Общая</TableCell> {/* Новая колонка */}
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map(cat => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>
                <span 
                  style={{verticalAlign: 'middle', marginRight: 8}} 
                  dangerouslySetInnerHTML={{__html: languages.find(l => l.value === cat.programming_language)?.icon_svg || ''}} 
                />
                {cat.programming_language}
              </TableCell>
              <TableCell>
                {cat.is_common ? 'Да' : 'Нет'}
              </TableCell>
              <TableCell>
                {(!cat.is_common && (isAdmin || cat.user_id === userId)) && (
                  <>
                    <IconButton onClick={() => onEdit(cat)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => onDelete(cat.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CategoryTable; 