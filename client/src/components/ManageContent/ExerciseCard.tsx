import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Stack,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Edit as EditIcon, CheckCircle as CheckCircleIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon } from '@mui/icons-material';
import LockIcon from '@mui/icons-material/Lock';
import { ExerciseDetailse, ProgrammingLanguage, Category } from '../../types/api';
import UserExerciseButton from '../UserExerciseButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ExerciseCardProps {
  exerciseDetailse: ExerciseDetailse;
  languages: ProgrammingLanguage[];
  //categories: Category[];
  onEdit: (exercise: ExerciseDetailse) => void;
  onDelete: (exercise: ExerciseDetailse) => void; // добавляем проп
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseDetailse,
  languages,
  //categories,
  onEdit,
  onDelete,
}) => {
  const { exercise, user_info } = exerciseDetailse;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const user = useSelector((state: RootState) => state.user.user);
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
      {/* Удалить LockIcon с position: absolute сверху */}
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          {/* Показываем меню только если задача не общая или пользователь админ, иначе замок */}
          {(!exerciseDetailse.exercise.is_common || user?.is_admin) ? (
            <IconButton onClick={handleMenuOpen} sx={{ mr: 1 }}>
              <MoreVertIcon />
            </IconButton>
          ) : (
            <LockIcon sx={{ mr: 1, color: 'primary.main' }} titleAccess="Общая задача" />
          )}
          <span 
            style={{verticalAlign: 'middle', marginRight: 8, marginTop: 2}} 
            dangerouslySetInnerHTML={{__html: languages.find(l => l.value === exercise.programming_language)?.icon_svg || ''}} 
          />
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              sx={{ 
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '3.2em',
                maxHeight: '3.2em',
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {exercise.title}
              {user_info.is_solved && (
                <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} titleAccess="Задача решена" />
              )}
            </Typography>
            {/* меню оставляем тут, чтобы не перекрывать */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {(!exercise.is_common || user?.is_admin) && (
                <MenuItem onClick={() => { handleMenuClose(); onEdit(exerciseDetailse); }}>
                  <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Редактировать" />
                </MenuItem>
              )}
              {(!exercise.is_common || user?.is_admin) && (
                <MenuItem onClick={() => { handleMenuClose(); onDelete(exerciseDetailse); }}>
                  <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Удалить" />
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 1, 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.4em',
            maxHeight: '2.4em',
            lineHeight: 1.2
          }}
        >
          {exercise.description}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={exercise.category_name || '—'} />
        </Stack>
      </CardContent>
      <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
        <UserExerciseButton 
          exerciseId={exercise.id} 
          isUserExercise={user_info.is_user_exercise} 
          fullWidth 
        />
      </CardActions>
    </Card>
  );
};

export default ExerciseCard; 