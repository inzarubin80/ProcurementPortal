import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { School as SchoolIcon, Settings as SettingsIcon, AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AppBar position="static" sx={{ background: '#1da1f2' }}>
      <Toolbar>
        <Button
          onClick={() => navigate('/')}
          sx={{ color: 'white', textTransform: 'none', fontWeight: 'bold', fontSize: '1.2rem', mr: 2, display: 'flex', alignItems: 'center' }}
          startIcon={<SchoolIcon sx={{ fontSize: 32 }} />}
        >
          Языковой тренажер
        </Button>
        <Button
          onClick={() => navigate('/manage')}
          sx={{ color: 'white', fontWeight: 'bold', textTransform: 'none', mr: 2 }}
          startIcon={<SettingsIcon />}
        >
          Управление
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={() => navigate('/profile')}
          sx={{ color: 'white', fontWeight: 'bold', textTransform: 'none' }}
          startIcon={<AccountCircleIcon />}
        >
          Профиль
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 