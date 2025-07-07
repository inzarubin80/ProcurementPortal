import React from 'react';
import { Button, Tooltip, CircularProgress } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { addUserExercise, removeUserExercise } from '../store/slices/userExerciseSlice';

interface UserExerciseButtonProps {
  exerciseId: string;
  isUserExercise: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

const UserExerciseButton: React.FC<UserExerciseButtonProps> = ({
  exerciseId,
  isUserExercise,
  size = 'medium',
  variant = 'outlined',
  color = 'primary'
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.userExercises);

  const handleClick = async () => {
    if (isUserExercise) {
      await dispatch(removeUserExercise(exerciseId));
    } else {
      await dispatch(addUserExercise(exerciseId));
    }
  };

  const buttonText = isUserExercise ? 'Убрать из списка' : 'Добавить в список';
  const tooltipText = isUserExercise 
    ? 'Удалить упражнение из моего списка задач' 
    : 'Добавить упражнение в мой список задач';

  return (
    <Tooltip title={tooltipText} arrow>
      <Button
        variant={variant}
        color={color}
        size={size}
        startIcon={
          loading ? (
            <CircularProgress size={16} />
          ) : isUserExercise ? (
            <RemoveIcon />
          ) : (
            <AddIcon />
          )
        }
        onClick={handleClick}
        disabled={loading}
        sx={{
          minWidth: 'auto',
          px: 2,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 2,
          },
          ...(isUserExercise && {
            backgroundColor: 'error.main',
            color: 'error.contrastText',
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }),
          ...(!isUserExercise && {
            backgroundColor: 'success.main',
            color: 'success.contrastText',
            '&:hover': {
              backgroundColor: 'success.dark',
            },
          }),
        }}
      >
        {buttonText}
      </Button>
    </Tooltip>
  );
};

export default UserExerciseButton; 