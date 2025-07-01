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
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 6px 32px 0 rgba(30, 60, 90, 0.12), 0 1.5px 6px 0 rgba(30, 60, 90, 0.10)',
        height: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f8fafc',
        transition: 'box-shadow 0.3s, transform 0.3s',
        '&:hover': {
          boxShadow: '0 12px 48px 0 rgba(30, 60, 90, 0.18), 0 3px 12px 0 rgba(30, 60, 90, 0.14)',
          transform: 'translateY(-4px) scale(1.025)',
        },
        p: 0,
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', p: 3 }}>
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
        <Box sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            Категория: {categoryName || '—'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Chip label={difficultyLabel} color={difficultyColor} size="small" />
          {isSolved && (
            <Chip label="Решено" color="success" size="small" />
          )}
        </Box>
      </CardContent>
      <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
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