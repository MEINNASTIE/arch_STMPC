import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Container,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';

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
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonAddIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Create User
                </Typography>
              </Box>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      variant="outlined"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Role"
                      variant="outlined"
                      value={rolename}
                      onChange={(e) => setRolename(e.target.value)}
                      required
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      variant="outlined"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      fullWidth
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      startIcon={<PersonAddIcon />}
                    >
                      Create User
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Users List Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ border: 1, borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  User Management
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.userId} hover>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.rolename}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton 
                              onClick={() => handleEdit(user)}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton 
                              onClick={() => handleDelete(user.username)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 1 }} />
            Edit User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  helperText="Leave blank to keep current password"
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained" 
            color="primary"
            startIcon={<EditIcon />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SystemStatus;
