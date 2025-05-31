const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
}

// Routes
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Student Era Application</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    h1 {
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Student Era Application</h1>
                    <p>Welcome to the Student Era Application!</p>
                    <p>Server is running successfully.</p>
                    <p>Status: <strong>Online</strong></p>
                </div>
            </body>
        </html>
    `);
});

app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        status: 'Server is running',
        version: '1.0.0',
        nodeVersion: process.version
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});