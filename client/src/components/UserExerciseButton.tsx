import React from 'react';
import { Button, Tooltip, CircularProgress } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { addUserExercise, removeUserExercise } from '../store/slices/userExerciseSlice';
import CustomButton from './CustomButton';

interface UserExerciseButtonProps {
  exerciseId: number;
  isUserExercise: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  fullWidth?: boolean;
  sx?: object;
}

const UserExerciseButton: React.FC<UserExerciseButtonProps> = ({
  exerciseId,
  isUserExercise,
  size = 'medium',
  variant = 'outlined',
  color = 'primary',
  fullWidth,
  sx
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

  const buttonText = isUserExercise ? 'Удалить из моих упражнений' : 'Добавить в мои упражнения';
  const tooltipText = isUserExercise 
    ? 'Удалить упражнение из моих упражнений' 
    : 'Добавить упражнение в мои упражнения';

  return (
    <Tooltip title={tooltipText} arrow>
      <CustomButton
        variant={isUserExercise ? 'outlined' : 'contained'}
        color={isUserExercise ? 'secondary' : 'primary'}
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
        fullWidth={fullWidth}
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
            background: '#1da1f2',
            color: '#fff',
            '&:hover': {
              background: '#0d8bd9',
              color: '#fff',
            },
          }),
          ...sx
        }}
      >
        {buttonText}
      </CustomButton>
    </Tooltip>
  );
};

export default UserExerciseButton; 