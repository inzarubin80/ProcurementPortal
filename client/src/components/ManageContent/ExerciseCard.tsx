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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { ExerciseDetailse, ProgrammingLanguage, Category } from '../../types/api';
import UserExerciseButton from '../UserExerciseButton';

interface ExerciseCardProps {
  exerciseDetailse: ExerciseDetailse;
  languages: ProgrammingLanguage[];
  categories: Category[];
  onEdit: (exercise: ExerciseDetailse) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseDetailse,
  languages,
  categories,
  onEdit,
}) => {
  const { exercise, user_info } = exerciseDetailse;
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
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
                minHeight: '2.4em',
                maxHeight: '2.4em',
                lineHeight: 1.2
              }}
            >
              {exercise.title}
            </Typography>
            <IconButton onClick={() => onEdit(exerciseDetailse)} sx={{ ml: 1 }}>
              <EditIcon />
            </IconButton>
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
          <Chip size="small" label={categories.find(c => c.id === exercise.category_id)?.name || '—'} />
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