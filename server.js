const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

// Import the SnakeBot class
const { SnakeBot } = require('./snakeBot');

// Serve static files from the current directory
app.use(express.static('./'));

// Store active players and bots
const players = new Map();
const bots = new Map();

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
  console.log('New client connected. Current connections:', wss.clients.size);
  let playerId = null;

  // Send initial game state
  const initialGameState = {
    type: 'gameState',
    players: [
      ...Array.from(players.entries()).map(([id, player]) => ({
        id,
        ...player
      })),
      ...Array.from(bots.entries()).map(([id, bot]) => ({
        id,
        ...bot
      }))
    ]
  };
  
  console.log('Sending initial game state to new client:', JSON.stringify(initialGameState, null, 2));
  ws.send(JSON.stringify(initialGameState));

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
        players: [
          ...Array.from(players.entries()).map(([id, player]) => ({
            id,
            ...player
          })),
          ...Array.from(bots.entries()).map(([id, bot]) => ({
            id,
            ...bot
          }))
        ]
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

// Function to create and manage bots
function createBot() {
  const botId = 'Fran'; // Fixed name for the bot
  console.log(`Creating bot with ID: ${botId}`);
  
  const bot = new SnakeBot(botId);
  
  // Add bot to the bots map with initial state
  const botState = {
    name: botId,
    color: bot.color,
    position: bot.snake[0],
    snake: bot.snake,
    score: 0,
    isBot: true
  };
  
  bots.set(botId, botState);
  console.log(`Bot ${botId} added to bots map with state:`, JSON.stringify(botState, null, 2));
  
  // Start the bot
  bot.startPlaying();
  
  // Set up bot update interval
  const updateInterval = setInterval(() => {
    if (bots.has(botId) && bot.snake.length > 0) {
      // Update bot state
      const botData = {
        type: 'update',
        name: botId,
        position: bot.snake[0],
        snake: bot.snake,
        score: bot.score,
        direction: bot.direction,
        isBot: true,
        color: bot.color
      };
      
      // Update the bot's state in the bots map
      const updatedState = {
        name: botId,
        color: bot.color,
        position: bot.snake[0],
        snake: bot.snake,
        score: bot.score,
        isBot: true
      };
      
      bots.set(botId, updatedState);
      
      // Log bot state periodically (every 5 seconds)
      const now = Date.now();
      if (!bot.lastLog || now - bot.lastLog > 5000) {
        console.log(`Bot ${botId} state update:`, JSON.stringify(botData, null, 2));
        bot.lastLog = now;
      }
      
      // Broadcast bot update to all clients
      const botUpdateMsg = JSON.stringify(botData);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(botUpdateMsg);
          
          // Also send a gameState update
          const gameState = {
            type: 'gameState',
            players: [
              ...Array.from(players.entries()).map(([id, player]) => ({
                id,
                ...player
              })),
              ...Array.from(bots.entries()).map(([id, bot]) => ({
                id,
                ...bot
              }))
            ]
          };
          client.send(JSON.stringify(gameState));
        }
      });
    } else {
      console.log(`Bot ${botId} state invalid:`, {
        exists: bots.has(botId),
        snakeLength: bot.snake.length
      });
      clearInterval(updateInterval);
    }
  }, 50); // Update more frequently (20fps)
  
  return botId;
}

// Create just one bot with fixed name
console.log('Creating Fran bot...');
const franBot = createBot();
console.log('Fran bot created successfully');

// Log the current state of bots every 10 seconds
setInterval(() => {
  console.log('Current game state:', {
    players: Array.from(players.entries()),
    bots: Array.from(bots.entries()),
    connections: wss.clients.size
  });
}, 10000);

// Define a route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3005;
http.listen(PORT, () => {
  console.log(`Viborita Indie BA running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
}); 