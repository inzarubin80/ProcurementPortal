import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Box } from '@mui/material';
import { PlayArrow as PlayIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import CustomButton from '../CustomButton';

interface UserExerciseCardProps {
  id: number;
  title: string;
  description: string;
  languageIcon?: string;
  languageName: string;
  categoryName?: string;
  isSolved: boolean;
  onStart: (id: number) => void;
}

const UserExerciseCard: React.FC<UserExerciseCardProps> = ({
  id,
  title,
  description,
  languageIcon,
  languageName,
  categoryName,
  isSolved,
  onStart,
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
        {languageIcon && (
          <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', minHeight: 24 }}>
            <span style={{ verticalAlign: 'middle', width: 24, height: 24, display: 'inline-block' }} dangerouslySetInnerHTML={{ __html: languageIcon }} />
          </Box>
        )}
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.8em',
            maxHeight: '2.8em',
            lineHeight: 1.2,
          }}
        >
          {title}
          {isSolved && (
            <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} titleAccess="Задача решена" />
          )}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2.5,
            fontWeight: 600,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.4em',
            maxHeight: '2.4em',
            lineHeight: 1.2,
          }}
        >
          {description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={categoryName || '—'} />
        </Box>
      </CardContent>
      <Box sx={{ p: 3, pt: 0, display: 'block' }}>
        <CustomButton
          variant="contained"
          startIcon={<PlayIcon />}
          onClick={() => onStart(id)}
          sx={{
            width: '100%',
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
        </CustomButton>
      </Box>
    </Card>
  );
};

export default UserExerciseCard; 