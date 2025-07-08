import React from 'react';
import {
  Grid,
  Pagination,
  Box,
} from '@mui/material';
import { ExerciseDetailse, ProgrammingLanguage, Category } from '../../types/api';
import ExerciseCard from './ExerciseCard';

interface ExerciseListProps {
  exercises: ExerciseDetailse[];
  languages: ProgrammingLanguage[];
  categories: Category[];
  currentPage: number;
  exercisesPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (exercise: ExerciseDetailse) => void;
  onDelete: (id: string) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  languages,
  categories,
  currentPage,
  exercisesPerPage,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  const totalPages = Math.ceil(exercises.length / exercisesPerPage);
  const startIndex = (currentPage - 1) * exercisesPerPage;
  const endIndex = startIndex + exercisesPerPage;
  const paginatedExercises = exercises.slice(startIndex, endIndex);

  return (
    <>
      <Grid container spacing={2}>
        {paginatedExercises.map(ex => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={ex.exercise.id}>
            <ExerciseCard
              exerciseDetailse={ex}
              languages={languages}
              categories={categories}
              onEdit={onEdit}
            />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => onPageChange(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </>
  );
};

export default ExerciseList; 