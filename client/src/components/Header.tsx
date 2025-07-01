import React from 'react';
import { AppBar, Toolbar, Button, Box, Typography, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { School as SchoolIcon, Settings as SettingsIcon, AccountCircle as AccountCircleIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logoutUser } from '../store/slices/userSlice';
import UserCardButton from './UserCardButton';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { userID, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ background: '#1da1f2' }}>
      <Toolbar>
        <Button
          onClick={() => navigate('/')}
          sx={{ color: 'white', textTransform: 'none', fontWeight: 'bold', fontSize: '1.2rem', mr: 2, display: 'flex', alignItems: 'center' }}
          startIcon={<SchoolIcon sx={{ fontSize: 32 }} />}
        >
          Memo-Code
        </Button>
        {isAuthenticated && (
          <>
            <Button
              onClick={() => navigate('/manage')}
              sx={{ color: 'white', fontWeight: 'bold', textTransform: 'none', mr: 2 }}
              startIcon={<SettingsIcon />}
            >
              Управление
            </Button>
          </>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {isAuthenticated && userID ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box onClick={handleMenu} sx={{ cursor: 'pointer' }}>
              <UserCardButton />
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <AccountCircleIcon sx={{ mr: 1 }} />
                Профиль
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            sx={{ color: 'white', fontWeight: 'bold', textTransform: 'none' }}
            startIcon={<AccountCircleIcon />}
          >
            Войти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 