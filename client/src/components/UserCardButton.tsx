import React from 'react';
import { Box, Avatar, Tooltip } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UserCardButton = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  // Получаем инициалы
  const initials = user?.name
    ? user.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <Box>
      <Tooltip title={user?.name || 'Профиль'}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 40,
            height: 40,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            boxShadow: 1,
            '&:hover': {
              boxShadow: 4,
              bgcolor: 'primary.dark',
            },
            fontWeight: 700,
            fontSize: 20,
          }}
          onClick={() => navigate('/profile')}
          src={user && 'avatar_url' in user ? (user as any).avatar_url : undefined}
        >
          {user && 'avatar_url' in user && (user as any).avatar_url
            ? null
            : initials
              ? initials
              : <AccountCircleIcon fontSize="large" />}
        </Avatar>
      </Tooltip>
    </Box>
  );
};

export default UserCardButton; 