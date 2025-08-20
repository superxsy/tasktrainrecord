const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const PASSWORD = 'shogolab';
const DATA_FILE = path.join(__dirname, 'mouseTrainingData.json');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
  secret: 'mouse-training-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Initialize data file if it doesn't exist
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      "mice": [
        { "id": "C003", "sessions": "", "color": "#d7aefb" },
        { "id": "C004", "sessions": "", "color": "#d7aefb" },
        { "id": "X013", "sessions": "", "color": "#d7aefb" },
        { "id": "C006", "sessions": "", "color": "#d7aefb" },
        { "id": "Y006", "sessions": "", "color": "#aecbfa" },
        { "id": "X009", "sessions": "", "color": "#aecbfa" },
        { "id": "X010", "sessions": "", "color": "#aecbfa" },
        { "id": "X011", "sessions": "", "color": "#aecbfa" },
        { "id": "X012", "sessions": "", "color": "#aecbfa" },
        { "id": "T022", "sessions": "", "color": "#ccff90" },
        { "id": "T023", "sessions": "", "color": "#ccff90" },
        { "id": "T024", "sessions": "", "color": "#ccff90" },
        { "id": "T025", "sessions": "", "color": "#ccff90" }
      ],
      "steps": [
        {
          "title": "0. Habituation",
          "mice": [
            { "id": "C003", "sessions": "", "color": "#d7aefb" },
            { "id": "C004", "sessions": "", "color": "#d7aefb" },
            { "id": "X013", "sessions": "", "color": "#d7aefb" },
            { "id": "C006", "sessions": "", "color": "#d7aefb" },
            { "id": "Y006", "sessions": "", "color": "#aecbfa" },
            { "id": "X009", "sessions": "", "color": "#aecbfa" },
            { "id": "X010", "sessions": "", "color": "#aecbfa" },
            { "id": "X011", "sessions": "", "color": "#aecbfa" },
            { "id": "X012", "sessions": "", "color": "#aecbfa" },
            { "id": "T022", "sessions": "", "color": "#ccff90" },
            { "id": "T023", "sessions": "", "color": "#ccff90" },
            { "id": "T024", "sessions": "", "color": "#ccff90" },
            { "id": "T025", "sessions": "", "color": "#ccff90" }
          ]
        },
        {
          "title": "1a. Touch – Reward (M). (1 lever, LED constantly on)",
          "mice": []
        },
        {
          "title": "1b. Push – Reward (M)",
          "mice": []
        },
        {
          "title": "2. [Start] – LED on – Push – Reward (M) – [End]. (1 lever)",
          "mice": []
        },
        {
          "title": "3. [Start] – LED on – Push – Reward (A) – [End]. (1 lever, position changing)",
          "mice": []
        },
        {
          "title": "4. [Start] – 1 of 3 LED on – Push – Reward (A) – [End]. (3 lever)",
          "mice": []
        },
        {
          "title": "5. [Start] – LED 1 on – Push – Reward (A) – [End], ITI, \\n    [Start] – LED 2 on – Push – Reward (A) – [End], ITI, \\n    [Start] – LED 3 on – Push – Reward (A+M) – [End]. \\n(↑ Repeat these 3 trials in the same order)",
          "mice": []
        },
        {
          "title": "6. [Start] – LED 1 on – Push – Reward (M) in Interval 1 – \\n                   LED 2 on – Push – Reward (M) in Interval 2 – \\n                   LED 3 on – Push – Reward (A) – [End].",
          "mice": []
        },
        {
          "title": "7. [Start] – LED 1 on – Push – Interval 1 – \\n                  LED 2 on – Push – Interval 2 – \\n                  LED 3 on – Push – Reward (A) – [End].\\n (AUTO group Final version)",
          "mice": []
        }
      ],
      "mouseOrder": [
        "C003", "C004", "C006", "X013", "Y006", "X009", "X010", "X011", "X012", "T022", "T023", "T024", "T025"
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    console.log('Initialized default data file:', DATA_FILE);
  }
}

// API endpoints for data management
// Get data
app.get('/api/data', requireAuth, (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Save data
app.post('/api/data', requireAuth, (req, res) => {
  try {
    const dataToSave = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(DATA_FILE, dataToSave);
    res.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Backup endpoint
app.get('/api/backup', requireAuth, (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="mouseTrainingData-backup-${timestamp}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Login page
app.get('/login', (req, res) => {
  const loginPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Mouse Training System</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        
        .login-title {
            font-size: 2rem;
            font-weight: 700;
            color: #2c3e50;
            margin: 0 0 30px 0;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .error-message {
            background: #ff6b6b;
            color: white;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: ${req.query.error ? 'block' : 'none'};
        }
        
        .info-text {
            color: #7f8c8d;
            font-size: 0.9rem;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1 class="login-title">Mouse Training System</h1>
        <div class="error-message">
            Invalid password. Please try again.
        </div>
        <form method="POST" action="/login">
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required autofocus>
            </div>
            <button type="submit" class="login-btn">Login</button>
        </form>
        <p class="info-text">Enter the password to access the training tracking system.</p>
    </div>
</body>
</html>`;
  res.send(loginPage);
});

// Handle login
app.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (password === PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login?error=1');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Serve the main application (protected)
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'matrix-version.html'));
});

// Serve static files (if any) - also protected
app.use('/static', requireAuth, express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize data file on startup
initializeDataFile();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at: http://your-server-ip:${PORT}`);
  console.log(`Password: ${PASSWORD}`);
  console.log(`Data file: ${DATA_FILE}`);
});