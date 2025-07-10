import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Switch, CircularProgress } from '@mui/material';
import { authAxios } from '../../service/http-common';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authAxios.get('/users');
      setUsers(
        res.data.map((u: any) => ({
          id: u.user_id,
          name: u.name,
          isAdmin: u.is_admin,
        }))
      );
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleAdminToggle = async (userId: number, isAdmin: boolean) => {
    setUpdating(userId);
    try {
      await authAxios.post('/users/set-admin', { user_id: userId, is_admin: isAdmin });
      setUsers(users => users.map(u => u.id === userId ? { ...u, isAdmin } : u));
    } catch (e) {
      // handle error
    } finally {
      setUpdating(null);
    }
  };

      if (!user?.is_admin) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Пользователи</Typography>
        <Typography color="error">Доступно только администраторам</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Пользователи</Typography>
      {loading ? <CircularProgress /> : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Администратор</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.isAdmin}
                    onChange={(_, checked) => handleAdminToggle(user.id, checked)}
                    disabled={updating === user.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default ManageUsers; 