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
import LockIcon from '@mui/icons-material/Lock';
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
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map(cat => (
            <TableRow key={cat.id} style={{ position: 'relative' }}>
              <TableCell>
                <span style={{display: 'inline-flex', alignItems: 'center'}}>
                  {cat.icon && (
                    <img src={cat.icon} alt={cat.name} style={{width: 28, height: 28, marginRight: 8, borderRadius: 6, objectFit: 'cover', boxShadow: '0 1px 4px #eee'}} />
                  )}
                  {cat.name}
                </span>
              </TableCell>
              <TableCell>
                <span 
                  style={{verticalAlign: 'middle', marginRight: 8}} 
                  dangerouslySetInnerHTML={{__html: languages.find(l => l.value === cat.programming_language)?.icon_svg || ''}} 
                />
                {cat.programming_language}
              </TableCell>
              <TableCell
                style={
                  (cat.is_common && !isAdmin)
                    ? { display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 'none' }
                    : { display: 'flex', justifyContent: 'center', alignItems: 'center' }
                }
              >
                {(cat.is_common && !isAdmin)
                  ? (
                    <LockIcon titleAccess="Общая категория" sx={{ color: 'primary.main' }} />
                  )
                  : (
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