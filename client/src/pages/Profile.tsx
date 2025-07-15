import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Avatar, Stack, TextField, Button, CircularProgress, Alert, Chip, Divider, IconButton, Tooltip, Fade, Snackbar } from '@mui/material';
import { AccountCircle, Edit as EditIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUserName } from '../store/slices/userSlice';
import { fetchProviders, fetchUserLinkedProviders } from '../store/slices/authProviderSlice';
import { AuthProvider } from '../types/api';
import axios from 'axios';
import { authAxios } from '../service/http-common';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const isLoading = useSelector((state: RootState) => state.user.isLoading);
  const error = useSelector((state: RootState) => state.user.error);
  const providers = useSelector((state: RootState) => state.authProviders.providers);
  const providersLoading = useSelector((state: RootState) => state.authProviders.loading);
  const linkedProviders = useSelector((state: RootState) => state.authProviders.userLinkedProviders);
  const linkedLoading = useSelector((state: RootState) => state.authProviders.userLinkedLoading);

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [success, setSuccess] = useState(false);
  const [detachLoading, setDetachLoading] = useState<string | null>(null);
  const [detachError, setDetachError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setEditName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    dispatch(fetchProviders());
    dispatch(fetchUserLinkedProviders());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
    setSuccess(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setSuccess(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditName(user?.name || '');
    setSuccess(false);
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === user?.name) {
      setEditMode(false);
      return;
    }
    setSuccess(false);
    const resultAction = await dispatch(updateUserName(editName));
    if (updateUserName.fulfilled.match(resultAction)) {
      setSuccess(true);
      setEditMode(false);
    }
  };

  const handleProviderDetach = async (providerName: string) => {
    setDetachLoading(providerName);
    setDetachError(null);
    try {
      await authAxios.post('/user/providers/unlink', { provider: providerName });
      setSnackbar({ open: true, message: `Провайдер ${providerName} успешно отвязан`, severity: 'success' });
      dispatch(fetchUserLinkedProviders());
    } catch (e: any) {
      setDetachError(e?.response?.data?.error || 'Ошибка отвязки провайдера');
      setSnackbar({ open: true, message: `Ошибка отвязки: ${e?.response?.data?.error || ''}`, severity: 'error' });
    } finally {
      setDetachLoading(null);
    }
  };

  // Провайдеры, которые ещё не привязаны
  const notLinkedProviders = providers.filter(
    (p) => Array.isArray(linkedProviders) && linkedProviders.some ? !linkedProviders.some((lp) => lp.provider === p.Provider) : true
  );

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8090';
  const handleProviderAttach = (provider: AuthProvider) => {
    window.location.href = `${API_URL}/api/user/providers/link?provider=${provider.Provider}`;
  };

  // Получить первую букву имени для аватара
  const getInitial = (name?: string) => (name && name.length > 0 ? name[0].toUpperCase() : 'U');

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 5, boxShadow: 4, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
        {/* Хедер профиля */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" mb={4}>
          <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: 48, boxShadow: 2 }}>
            {user?.name ? getInitial(user.name) : <AccountCircle sx={{ fontSize: 72 }} />}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {editMode ? (
                <TextField
                  value={editName}
                  onChange={handleNameChange}
                  size="small"
                  autoFocus
                  variant="outlined"
                  sx={{ fontSize: 32, fontWeight: 700, minWidth: 180 }}
                  inputProps={{ style: { fontSize: 28, fontWeight: 700, padding: 4 } }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                  disabled={isLoading}
                />
              ) : (
                <Typography variant="h4" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                  {user?.name || 'Пользователь'}
                </Typography>
              )}
              {!editMode && (
                <Tooltip title="Изменить имя" arrow TransitionComponent={Fade}>
                  <IconButton onClick={handleEditClick} size="small" sx={{ ml: 1 }}>
                    <EditIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              )}
              {editMode && (
                <>
                  <Tooltip title="Сохранить" arrow TransitionComponent={Fade}>
                    <IconButton color="primary" onClick={handleSaveName} size="small" disabled={isLoading || !editName.trim() || editName === user?.name}>
                      {isLoading ? <CircularProgress size={22} color="inherit" /> : <CheckIcon fontSize="medium" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Отмена" arrow TransitionComponent={Fade}>
                    <IconButton color="secondary" onClick={handleCancelEdit} size="small">
                      <CloseIcon fontSize="medium" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 16 }}>
              Профиль пользователя
            </Typography>
            {success && <Alert severity="success" sx={{ mt: 2, maxWidth: 320 }}>Имя успешно обновлено!</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2, maxWidth: 320 }}>{error}</Alert>}
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Привязанные провайдеры</Typography>
        {linkedLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            {(Array.isArray(linkedProviders) && linkedProviders.length === 0) && <Typography color="text.secondary">Нет привязанных провайдеров</Typography>}
            {Array.isArray(linkedProviders) && linkedProviders.map((provider) => (
              <Box key={provider.provider} sx={{ display: 'flex', alignItems: 'center', mb: 1, mr: 1 }}>
                <Chip
                  label={provider.display_name || provider.provider}
                  avatar={provider.icon_svg ? <span dangerouslySetInnerHTML={{ __html: provider.icon_svg }} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> : undefined}
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: 500, fontSize: 16, px: 1.5, py: 0.5, boxShadow: 1 }}
                />
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ ml: 1, minWidth: 0, px: 1, fontWeight: 600, borderRadius: 2, fontSize: 14 }}
                  onClick={() => handleProviderDetach(provider.provider)}
                  disabled={detachLoading === provider.provider}
                >
                  {detachLoading === provider.provider ? <CircularProgress size={18} /> : 'Открепить'}
                </Button>
              </Box>
            ))}
          </Stack>
        )}
        <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>Доступные для привязки</Typography>
        {providersLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(Array.isArray(notLinkedProviders) && notLinkedProviders.length === 0) && <Typography color="text.secondary">Все провайдеры уже привязаны</Typography>}
            {Array.isArray(notLinkedProviders) && notLinkedProviders.map((provider) => (
              <Button
                key={provider.Provider}
                variant="outlined"
                size="medium"
                onClick={() => handleProviderAttach(provider)}
                sx={{ mb: 1, fontWeight: 600, borderRadius: 3, px: 2, py: 1, boxShadow: 1, textTransform: 'none', fontSize: 16, display: 'flex', alignItems: 'center', gap: 1 }}
                startIcon={provider.IconSVG ? <span dangerouslySetInnerHTML={{ __html: provider.IconSVG }} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }} /> : undefined}
              >
                Привязать {provider.display_name || provider.Provider}
              </Button>
            ))}
          </Stack>
        )}
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ style: { backgroundColor: snackbar.severity === 'success' ? '#43a047' : '#d32f2f', color: 'white', fontWeight: 600 } }}
      />
      {detachError && <Alert severity="error" sx={{ mt: 2 }}>{detachError}</Alert>}
    </Container>
  );
};

export default Profile; 