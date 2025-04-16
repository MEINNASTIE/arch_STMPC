const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3005;

// Middleware
app.use(bodyParser.json());
app.use(express.static('static'));

// Read users from JSON file
const usersPath = path.join(__dirname, 'users.json');
let users = [];

try {
    const usersData = fs.readFileSync(usersPath, 'utf8');
    users = JSON.parse(usersData).users;
} catch (error) {
    console.error('Error reading users file:', error);
    process.exit(1);
}

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 