import React from 'react';
import { Box, Avatar } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from '../store';

function stringToColor(string: string) {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
}

function stringAvatar(name?: string | null) {
  if (!name?.trim()) {
    return {
      sx: {
        bgcolor: '#cccccc',
      },
      children: '?',
    };
  }
  const nameParts = name.trim().split(' ').filter(Boolean);
  let children = '';
  if (nameParts.length === 1) {
    children = nameParts[0][0];
  } else if (nameParts.length >= 2) {
    children = nameParts[0][0] + nameParts[1][0];
  }
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: children.toUpperCase(),
  };
}

const UserCardButton = () => {
    const navigate = useNavigate();
    const userName = useSelector((state: RootState) => state.user.userName);
    console.log(userName);
    return (
        <Box>
             <Avatar {...stringAvatar(userName)} onClick={() => navigate('/profile')}/>
        </Box>
    );
};

export default UserCardButton; 