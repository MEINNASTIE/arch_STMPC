import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SystemStatus = () => {
  const [username, setUsername] = useState('');
  const [rolename, setRolename] = useState('user');
  const [password, setPassword] = useState('');
  const [expDate] = useState('2999-01-01');
  const [enabled] = useState('1');
  const [userRights] = useState({
    "system_time": "rwx",
    "api/config/user": "rw",
    "api/config/system": "rw"
  });
  const [users, setUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    password: '',
    rolename: '',
    expDate: '',
    enabled: '1',
    rights: {
      "system_time": "rwx",
      "api/config/user": "rw",
      "api/config/system": "rw"
    }
  });

  const generateHashB64 = async (username, password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${username};${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return btoa(hashString); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashedPassword = await generateHashB64(username, password);

    const userData = { 
      username, 
      hash: hashedPassword,
      rolename, 
      expDate, 
      enabled: enabled === '1' ? 1 : 0,
      rights: userRights
    };
    
    fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      window.location.reload();
    })
    .catch(error => console.error('Error:', error));
  };

  const handleDelete = (username) => {
    fetch(`/api/user/username/${username}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('User deleted:', data);
      window.location.reload();
    })
    .catch(error => console.error('Error:', error));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      password: '',
      rolename: user.rolename,
      expDate: user.expDate.split('T')[0],
      enabled: user.enabled.toString(),
      rights: { ...user.rights }
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      const updateData = {};
      
      if (editForm.password) {
        updateData.hash = await generateHashB64(editingUser.username, editForm.password);
      }
      
      if (editForm.rolename !== editingUser.rolename) {
        updateData.rolename = editForm.rolename;
      }
      
      updateData.expDate = editForm.expDate;
      updateData.enabled = editForm.enabled === '1' ? 1 : 0;
      
      if (JSON.stringify(editForm.rights) !== JSON.stringify(editingUser.rights)) {
        updateData.rights = editForm.rights;
      }

      if (Object.keys(updateData).length === 0) {
        console.log('No changes to update');
        setEditDialogOpen(false);
        return;
      }

      const response = await fetch(`/api/user/username/${editingUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('User updated:', data);
      setEditDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setUsers(data.payload);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Box title="User Management" style={{ textAlign: 'center', marginTop: '100px', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Create User
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            select
            label="Role"
            variant="outlined"
            value={rolename}
            onChange={(e) => setRolename(e.target.value)}
            required
            SelectProps={{
              native: true,
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </TextField>
        </Box>
        <Box mb={2}>
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Create User
        </Button>
      </form>

      <Typography variant="h4" gutterBottom style={{ marginTop: '50px' }}>
        Users
      </Typography>
      <TableContainer component={Paper} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.rolename}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      onClick={() => handleEdit(user)}
                      variant="contained" 
                      color="primary"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(user.username)}
                      variant="contained" 
                      color="secondary"
                      size="small"
                    >
                      Delete
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Password"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({...editForm, password: e.target.value})}
              helperText="Leave blank to keep current password"
            />
            
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.rolename}
                label="Role"
                onChange={(e) => setEditForm({...editForm, rolename: e.target.value})}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemStatus;
