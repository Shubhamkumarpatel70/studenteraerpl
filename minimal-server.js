// Minimal server with no dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the index.html file
    try {
      const indexPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else {
        // If index.html doesn't exist, serve a default page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
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
                <p>Node.js Version: ${process.version}</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else if (req.url === '/api/status') {
    // API status endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Server is running',
      version: '1.0.0',
      nodeVersion: process.version
    }));
  } else {
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory');
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});