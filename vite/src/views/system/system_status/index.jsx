import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, TextField, Button } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { AccessAlarm, ThreeDRotation, Assignment, AttachMoney } from '@mui/icons-material';

const SampleComponent = ({ icon: Icon, title }) => (
  <Box display="flex" alignItems="center" mb={2}>
    <Icon style={{ marginRight: 8 }} />
    <Typography variant="subtitle1">{title}</Typography>
  </Box>
);

const SystemStatus = () => {
  const [username, setUsername] = useState('');
  const [rolename, setRolename] = useState('');
  const [password, setPassword] = useState('');
  const [expDate, setExpDate] = useState('2999-01-01');
  const [enabled, setEnabled] = useState('1');
  const [userRights, setUserRights] = useState({
    "system_time": "rwx",
    "api/config/user": "rw",
    "api/config/system": "rw"
  });
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [users, setUsers] = useState([]);

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
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  };

  const handleDelete = () => {
    fetch(`/api/user/userId/${userIdToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => console.log('User deleted:', data))
    .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <MainCard title="User Management" style={{ textAlign: 'center', marginTop: '100px' }}>
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
            label="Role Name"
            variant="outlined"
            value={rolename}
            onChange={(e) => setRolename(e.target.value)}
            required
          />
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
        <Box mb={2}>
          <TextField
            label="Expiration Date"
            variant="outlined"
            type="date"
            value={expDate}
            onChange={(e) => setExpDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Enabled (1 or 0)"
            variant="outlined"
            value={enabled}
            onChange={(e) => setEnabled(e.target.value)}
            required
          />
        </Box>
        <Button type="submit" variant="contained" color="primary">
          Create User
        </Button>
      </form>

      <Typography variant="h4" gutterBottom style={{ marginTop: '50px' }}>
        Delete User
      </Typography>
      <Box mb={2}>
        <TextField
          select
          label="Select User to Delete"
          variant="outlined"
          value={userIdToDelete}
          onChange={(e) => setUserIdToDelete(e.target.value)}
          required
          SelectProps={{
            native: true,
          }}
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </TextField>
      </Box>
      <Button onClick={handleDelete} variant="contained" color="secondary">
        Delete User
      </Button>

      <Grid container justifyContent="center" spacing={3}>
        <Grid item xs={12} md={6}>
          <SampleComponent icon={AccessAlarm} title="First Component" />
          <Typography variant="body2" gutterBottom>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SampleComponent icon={ThreeDRotation} title="Second Component" />
          <Typography variant="body2" gutterBottom>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SampleComponent icon={Assignment} title="Third Component" />
          <Typography variant="body2" gutterBottom>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SampleComponent icon={AttachMoney} title="Fourth Component" />
          <Typography variant="body2" gutterBottom>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default SystemStatus;
