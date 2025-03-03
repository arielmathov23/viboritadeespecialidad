const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

// Serve static files from the current directory
app.use(express.static('./'));

// Store active players
const players = new Map();

// Generate random color for new players
function getRandomColor() {
  const colors = [
    [255, 87, 51],  // Coral
    [255, 195, 0],  // Yellow
    [97, 226, 148], // Mint
    [45, 156, 219], // Blue
    [147, 112, 219],// Purple
    [238, 130, 238],// Violet
    [255, 160, 122],// Light Salmon
    [64, 224, 208], // Turquoise
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  let playerId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data.type, 'from player:', data.name);
      
      switch(data.type) {
        case 'join':
          // New player joins
          playerId = data.name;
          players.set(playerId, {
            name: data.name,
            color: getRandomColor(),
            position: data.position,
            snake: data.snake,
            score: 0
          });
          console.log('Player joined:', playerId);
          break;
          
        case 'update':
          // Update player position
          if (players.has(playerId)) {
            const player = players.get(playerId);
            player.position = data.position;
            player.snake = data.snake;
            player.score = data.score;
          }
          break;
          
        case 'restart':
          // Handle player restart
          if (players.has(playerId)) {
            const player = players.get(playerId);
            player.snake = [{x: 5, y: 5}];
            player.score = 0;
          }
          break;
      }
      
      // Broadcast game state to all clients
      const gameState = {
        type: 'gameState',
        players: Array.from(players.entries()).map(([id, player]) => ({
          id,
          ...player
        }))
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(gameState));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    if (playerId) {
      console.log('Player disconnected:', playerId);
      players.delete(playerId);
      // Broadcast player left
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'playerLeft',
            playerId
          }));
        }
      });
    }
  });

  // Handle connection errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Define a route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3005;
http.listen(PORT, () => {
  console.log(`Viborita Indie BA running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
}); 