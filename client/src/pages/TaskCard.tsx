import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Box } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  languageIcon?: string;
  languageName: string;
  categoryName?: string;
  difficulty: string;
  isSolved: boolean;
  onStart: (id: string) => void;
  difficultyLabel: string;
  difficultyColor: 'success' | 'warning' | 'error' | 'default';
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  languageIcon,
  languageName,
  categoryName,
  difficulty,
  isSolved,
  onStart,
  difficultyLabel,
  difficultyColor,
}) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {languageIcon && (
            <span style={{ verticalAlign: 'middle', marginRight: 8 }} dangerouslySetInnerHTML={{ __html: languageIcon }} />
          )}
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Категория: {categoryName || '—'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Chip label={difficultyLabel} color={difficultyColor} size="small" />
          <Chip label={isSolved ? 'Решено' : 'Не решено'} color={isSolved ? 'success' : 'default'} size="small" />
        </Box>
      </CardContent>
      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={() => onStart(id)}
          sx={{
            background: 'linear-gradient(90deg, #1da1f2 0%, #21cbf3 100%)',
            color: 'white',
            borderRadius: 3,
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(90deg, #21cbf3 0%, #1da1f2 100%)',
              transform: 'scale(1.05)',
            },
          }}
        >
          Начать
        </Button>
      </Box>
    </Card>
  );
};

export default TaskCard; 