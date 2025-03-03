// Viborita Indie BA - Main Game Script
// This file contains the game logic for the snake-like game set in Buenos Aires

// Game Constants
const TAMANIO_CUADRA = 30;
const GRILLA_ANCHO = 20;
const GRILLA_ALTO = 20;
const VENTANA_ANCHO = TAMANIO_CUADRA * GRILLA_ANCHO; // 600
const VENTANA_ALTO = TAMANIO_CUADRA * GRILLA_ALTO;   // 600

// Multiplayer Variables
let ws;
let otherPlayers = new Map();
let myColor;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 50; // Send updates every 50ms

// Darker neighborhood colors for better contrast
const COLOR_RECOLETA = [200, 200, 210];
const COLOR_PALERMO = [180, 210, 180];
const COLOR_COLEGIALES = [180, 190, 210];
const COLOR_CHACARITA = [210, 190, 180];
const COLOR_VIBORITA = [50, 168, 82];
const COLOR_CAFE = [139, 69, 19]; // Brown color for coffee
const COLOR_CAFE_ACCENT = [101, 67, 33]; // Darker brown for details
const COLOR_CAFE_OSCURO = [101, 50, 25]; // Dark brown for text and UI elements
const COLOR_BACHE = [80, 80, 80];
const COLOR_UI = [65, 105, 225];
const COLOR_MODAL_BG = [20, 20, 30, 220];
const COLOR_BUTTON = [50, 120, 200];
const COLOR_BUTTON_HOVER = [70, 140, 220];
const COLOR_NEIGHBORHOOD_LABEL_BG = [30, 30, 30, 180];
const COLOR_NEIGHBORHOOD_LABEL_TEXT = [255, 255, 255];

// Updated café data structure organized by neighborhood
const CAFES_BA = {
  PALERMO: [
    "LAB Tostadores de Café",
    "Café Registrado",
    "Full City Coffee House",
    "Cuervo Café",
    "Birkin Café",
    "Vive Café",
    "Lattente Palermo",
    "Bodø",
    "Félix Felicitas",
    "Ninina"
  ],
  RECOLETA: [
    "Lattente Recoleta",
    "Coffee Town",
    "Plácido",
    "Usina Cafetera",
    "Import Coffee Company",
    "Rondó Café",
    "The Shelter Coffee",
    "PANI Recoleta",
    "Grand Café",
    "Birkin Recoleta"
  ],
  COLEGIALES: [
    "Codo Bar",
    "Felicidad",
    "La Noire",
    "Salvaje Bakery",
    "Tres Café",
    "Verdín",
    "Crisol",
    "All Saints Café",
    "Hay Café Café",
    "Sicilia Café"
  ],
  CHACARITA: [
    "Negro Cueva de Café",
    "Santa Paula Café",
    "Falena",
    "Origo Coffee Shop",
    "Cuervo Chacarita",
    "Donnet",
    "García Castro",
    "Lutero",
    "Obrador",
    "Alegra"
  ]
};

// Game Variables
let viborita = [];
let direccion;
let cafe;
let cafeActual = '';
let baches = [];
let puntaje = 0;
let nombreJugador = "";
let ingresandoNombre = true;
let textoNombre = "";
let juegoTerminado = false;
const velocidadInicial = 4; // Slightly faster initial speed
let velocidadActual = velocidadInicial;
let cafeIcon; // Variable to store the coffee icon image
let bacheIcon; // Variable to store the pothole icon image
let colisionJugador = null;
let gameOverReason = '';

// Add new variables for background effects at the top with other game variables
let particles = [];
const NUM_PARTICLES = 50;
const PARTICLE_SPEED = 0.5;

// Add current neighborhood tracking
let currentNeighborhood = '';

// Add new variables for Spotify integration
let isPlaying = true; // Start with music playing
const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/64sMCJNA9dqrKOS0sYVf8S?utm_source=generator&autoplay=1";

// P5.js Preload Function
function preload() {
  // Load coffee icon image
  cafeIcon = loadImage('assets/iconcafe.png');
  // Load pothole icon image
  bacheIcon = loadImage('assets/bache.png');
}

// P5.js Setup Function
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(velocidadActual);
  textFont('Montserrat');
  rectMode(CENTER);
  ellipseMode(CENTER);
  imageMode(CENTER);
  
  // Initialize particles
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(2, 6),
      speed: random(0.2, 0.8) * PARTICLE_SPEED,
      angle: random(TWO_PI)
    });
  }
}

// Window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// P5.js Draw Function
function draw() {
  if (ingresandoNombre) {
    dibujarModalNombre();
  } else if (juegoTerminado) {
    dibujarModalGameOver();
  } else {
    jugar();
  }
}

// Draw the name input modal
function dibujarModalNombre() {
  // Create a dynamic backdrop with a subtle gradient
  background(20, 20, 30);
  
  // Calculate responsive modal size based on window dimensions
  let modalWidth = min(550, width * 0.8);
  let modalHeight = min(480, height * 0.75); // Increased modal height for better spacing
  
  // Add subtle animation to the background
  for (let i = 0; i < 20; i++) {
    let size = random(2, 6);
    let alpha = random(50, 150);
    fill(255, 255, 255, alpha);
    noStroke();
    ellipse(random(width), random(height), size, size);
  }
  
  // Drop shadow effect for the modal (multiple layers with decreasing opacity)
  for (let i = 5; i > 0; i--) {
    fill(0, 0, 0, 15);
    rect(width/2, height/2 + i, modalWidth + i*2, modalHeight + i*2, 20);
  }
  
  // Modal background with rounded corners
  fill(COLOR_MODAL_BG);
  rect(width/2, height/2, modalWidth, modalHeight, 20);
  
  // Decorative header bar with gradient effect
  let headerHeight = 60;
  for (let i = 0; i < headerHeight; i++) {
    let inter = map(i, 0, headerHeight, 0, 1);
    let c = lerpColor(
      color(COLOR_BUTTON[0], COLOR_BUTTON[1], COLOR_BUTTON[2]), 
      color(COLOR_BUTTON_HOVER[0], COLOR_BUTTON_HOVER[1], COLOR_BUTTON_HOVER[2]), 
      inter
    );
    fill(c);
    rect(width/2, height/2 - modalHeight/2 + i/2, modalWidth, 1);
  }
  
  // Calculate vertical positions for better spacing
  let titleY = height/2 - modalHeight/2 + headerHeight + 50;
  let subtitleY = titleY + 45;
  let labelY = subtitleY + 80;
  let inputY = labelY + 45;
  let buttonY = inputY + 80;
  let instructionsY = buttonY + 45;
  
  // Draw coffee icons if the image is loaded (fallback to draw function if not)
  let cupSize = 55; // Reducido ligeramente de 60 a 55 para mejor proporción
  let cupSpacing = modalWidth * 0.42; // Aumentado para mayor separación
  
  // Use try/catch in case the image fails to load
  try {
    if (cafeIcon) {
      // Left coffee cup
      push();
      imageMode(CENTER);
      translate(width/2 - cupSpacing, titleY);
      rotate(sin(frameCount * 0.02) * 0.05);
      image(cafeIcon, 0, 0, cupSize, cupSize);
      pop();
    
      // Right coffee cup
      push();
      imageMode(CENTER);
      translate(width/2 + cupSpacing, titleY);
      rotate(sin(frameCount * 0.02 + PI) * 0.05);
      image(cafeIcon, 0, 0, cupSize, cupSize);
      pop();
    }
  } catch (e) {
    // Fallback to drawn coffee cup if image fails
    push();
    translate(width/2 - cupSpacing, titleY);
    rotate(sin(frameCount * 0.02) * 0.05);
    drawCoffeeCup(0, 0, cupSize);
    pop();
    
    push();
    translate(width/2 + cupSpacing, titleY);
    rotate(sin(frameCount * 0.02 + PI) * 0.05);
    drawCoffeeCup(0, 0, cupSize);
    pop();
  }
  
  // Title with shadow effect - positioned between coffee cups
  textAlign(CENTER, CENTER);
  // Shadow
  fill(0, 0, 0, 100);
  textSize(36);
  textStyle(BOLD);
  text("VIBORITA INDIE BA", width/2 + 2, titleY + 2);
  // Text
  fill(255);
  text("VIBORITA INDIE BA", width/2, titleY);
  
  // Subtitle with improved spacing
  textSize(18);
  textStyle(NORMAL);
  fill(220);
  text("Una viborita también quiere tomar un cafecito porteño", width/2, subtitleY);
  
  // Label with better positioning and spacing
  textSize(18);
  fill(200);
  textStyle(BOLD);
  text("¿CÓMO TE LLAMÁS?", width/2, labelY);
  
  // Input field with improved styling and size
  let inputWidth = modalWidth * 0.7;
  let inputHeight = 55;
  
  // Input field border glow effect
  fill(40, 40, 50);
  if (frameCount % 120 < 60) {
    stroke(COLOR_BUTTON[0], COLOR_BUTTON[1], COLOR_BUTTON[2], 100);
    strokeWeight(2);
  } else {
    noStroke();
  }
  rect(width/2, inputY, inputWidth, inputHeight, 28);
  noStroke();
  
  // Input text with animated cursor - centered in the input field
  fill(255);
  textSize(22);
  textAlign(CENTER, CENTER);
  text(textoNombre + (frameCount % 30 < 15 ? "|" : ""), width/2, inputY);
  
  // Button with improved styling and positioning
  if (textoNombre.length > 0) {
    let buttonX = width/2;
    let buttonWidth = inputWidth * 0.6;
    let buttonHeight = 55;
    
    // Check if mouse is over button
    let mouseOverButton = mouseX > buttonX - buttonWidth/2 && 
                          mouseX < buttonX + buttonWidth/2 && 
                          mouseY > buttonY - buttonHeight/2 && 
                          mouseY < buttonY + buttonHeight/2;
    
    // Button shadow for depth
    if (mouseOverButton) {
      for (let i = 3; i > 0; i--) {
        fill(0, 0, 0, 10);
        rect(buttonX, buttonY + i, buttonWidth + i, buttonHeight, 28);
      }
    }
    
    // Button background with gradient effect
    if (mouseOverButton) {
      // Gradient effect on hover
      for (let i = 0; i < buttonHeight; i++) {
        let inter = map(i, 0, buttonHeight, 0, 1);
        let c = lerpColor(
          color(COLOR_BUTTON_HOVER[0], COLOR_BUTTON_HOVER[1], COLOR_BUTTON_HOVER[2]), 
          color(COLOR_BUTTON[0], COLOR_BUTTON[1], COLOR_BUTTON[2]), 
          inter
        );
        fill(c);
        rect(buttonX, buttonY - buttonHeight/2 + i, buttonWidth, 1);
      }
    } else {
      fill(COLOR_BUTTON);
      rect(buttonX, buttonY, buttonWidth, buttonHeight, 28);
    }
    
    // Button text
    fill(255);
    textSize(20);
    textStyle(BOLD);
    text("COMENZAR", buttonX, buttonY);
    
    // Button icon (arrow)
    let arrowX = buttonX + buttonWidth/2 - 30;
    let arrowY = buttonY;
    fill(255);
    triangle(
      arrowX - 10, arrowY - 5,
      arrowX - 10, arrowY + 5,
      arrowX, arrowY
    );
    
    // Instructions with better positioning
    textSize(14);
    textStyle(NORMAL);
    fill(180);
    text("Presiona ENTER para comenzar", width/2, instructionsY);
  }
}

// Draw the game over modal
function dibujarModalGameOver() {
  // Semi-transparent background
  rectMode(CORNER);
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);
  
  // Modal background
  rectMode(CENTER);
  fill(COLOR_RECOLETA);
  rect(width/2, height/2, 400, 300, 20);
  
  // Game Over text
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(COLOR_CAFE_OSCURO);
  text('¡GAME OVER!', width/2, height/2 - 80);
  
  // Different messages based on game over reason
  textSize(24);
  fill(COLOR_CAFE_OSCURO);
  
  if (colisionJugador) {
    text(`¡Chocaste con ${colisionJugador}!`, width/2, height/2 - 20);
  } else {
    switch(gameOverReason) {
      case 'border':
        text('¡Te saliste del mapa!', width/2, height/2 - 20);
        break;
      case 'self':
        text('¡Te chocaste con vos mismo!', width/2, height/2 - 20);
        break;
      case 'bache':
        text('¡Caíste en un bache!', width/2, height/2 - 20);
        break;
    }
  }
  
  // Score text
  text(`Puntaje final: ${puntaje}`, width/2, height/2 + 20);
  
  // Restart instructions
  textSize(16);
  text('Presioná ENTER para jugar de nuevo', width/2, height/2 + 80);
  
  // Draw restart button
  fill(COLOR_CAFE_OSCURO);
  rect(width/2, height/2 + 120, 200, 40, 10);
  fill(255);
  textSize(16);
  text('REINICIAR', width/2, height/2 + 120);
}

// Handle mouse clicks
function mousePressed() {
  if (ingresandoNombre && textoNombre.length > 0) {
    let modalWidth = min(550, width * 0.8);
    let inputWidth = modalWidth * 0.7;
    let buttonWidth = inputWidth * 0.6;
    let buttonHeight = 55;
    
    // Calculate vertical positions for consistent spacing
    let titleY = height/2 - min(480, height * 0.75)/2 + 60 + 50;
    let subtitleY = titleY + 45;
    let labelY = subtitleY + 80;
    let inputY = labelY + 45;
    let buttonY = inputY + 80;
    
    let buttonX = width/2;
    
    if (mouseX > buttonX - buttonWidth/2 && 
        mouseX < buttonX + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      nombreJugador = textoNombre;
      ingresandoNombre = false;
      iniciarJuego();
    }
  } else if (juegoTerminado) {
    let buttonX = width/2;
    let buttonY = height/2 + 120;
    let buttonWidth = 200;
    let buttonHeight = 40;
    
    if (mouseX > buttonX - buttonWidth/2 && 
        mouseX < buttonX + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      reiniciarJuego();
    }
  } else {
    // Check for music control button click
    let buttonSize = 50;
    let margin = 30;
    let x = width - buttonSize/2 - margin;
    let y = height - buttonSize/2 - margin;
    
    if (dist(mouseX, mouseY, x, y) < buttonSize/2) {
      isPlaying = !isPlaying;
      let iframe = document.getElementById('spotify-iframe');
      if (iframe) {
        // Send message to Spotify iframe to play/pause
        iframe.contentWindow.postMessage({ command: isPlaying ? 'play' : 'pause' }, '*');
      }
      return;
    }
  }
}

// Handle keyboard input
function keyPressed() {
  if (ingresandoNombre) {
    if (key === "Enter" && textoNombre.length > 0) {
      nombreJugador = textoNombre;
      ingresandoNombre = false;
      iniciarJuego();
    } else if (key === "Backspace") {
      textoNombre = textoNombre.slice(0, -1);
    } else if (key.length === 1 && textoNombre.length < 15) {
      textoNombre += key;
    }
  } else if (juegoTerminado) {
    if (key === "Enter") {
      reiniciarJuego();
    }
  } else {
    if (keyCode === UP_ARROW && direccion.y !== 1) direccion = {x: 0, y: -1};
    else if (keyCode === DOWN_ARROW && direccion.y !== -1) direccion = {x: 0, y: 1};
    else if (keyCode === LEFT_ARROW && direccion.x !== 1) direccion = {x: -1, y: 0};
    else if (keyCode === RIGHT_ARROW && direccion.x !== -1) direccion = {x: 1, y: 0};
  }
}

// Initialize the game after name input
function iniciarJuego() {
  // Initialize Spotify player
  initSpotifyPlayer();
  
  // Initialize WebSocket connection with error handling
  const connectWebSocket = () => {
    ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
    
    ws.onopen = () => {
      console.log('Connected to game server');
      ws.send(JSON.stringify({
        type: 'join',
        name: nombreJugador,
        position: {x: 10, y: 10},
        snake: viborita
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'gameState') {
        // Update other players
        otherPlayers.clear();
        data.players.forEach(player => {
          if (player.name !== nombreJugador) {
            otherPlayers.set(player.name, player);
          } else {
            myColor = player.color;
          }
        });
      } else if (data.type === 'playerLeft') {
        otherPlayers.delete(data.playerId);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      // Attempt to reconnect after a delay
      setTimeout(connectWebSocket, 3000);
    };
  };
  
  // Start WebSocket connection
  connectWebSocket();
  
  // Initialize local game state
  viborita = [{x: 10, y: 10}];
  direccion = {x: 1, y: 0};
  baches = [];
  cafe = generarCafe();
  cafeActual = CAFES_BA[currentNeighborhood][Math.floor(random(CAFES_BA[currentNeighborhood].length))];
  // Start with just 2 baches
  for (let i = 0; i < 2; i++) {
    baches.push(generarBache());
  }
  puntaje = 0;
  juegoTerminado = false;
  velocidadActual = velocidadInicial;
  frameRate(velocidadActual);
  
  loop();
}

// Restart the game after game over
function reiniciarJuego() {
  // Reset game state
  viborita = [{x: 5, y: 5}];
  direccion = {x: 0, y: 0};
  cafe = generarCafe();
  baches = [];
  // Start with just 2 baches again
  for (let i = 0; i < 2; i++) {
    baches.push(generarBache());
  }
  puntaje = 0;
  juegoTerminado = false;
  colisionJugador = null;
  gameOverReason = '';
  velocidadActual = velocidadInicial;
  frameRate(velocidadActual);
  
  // Reset multiplayer state
  otherPlayers.clear();
  lastUpdateTime = millis();
  
  // Notify server of restart
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'restart',
      name: nombreJugador
    }));
  }
}

// Add new function for drawing background effects
function drawFancyBackground() {
  // Create gradient background
  let c1 = color(25, 25, 35);
  let c2 = color(35, 35, 45);
  
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Draw subtle grid pattern
  stroke(40, 40, 50, 30);
  strokeWeight(1);
  let gridSize = 30;
  
  for (let x = 0; x < width; x += gridSize) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += gridSize) {
    line(0, y, width, y);
  }
  
  // Update and draw particles
  for (let particle of particles) {
    particle.x += cos(particle.angle) * particle.speed;
    particle.y += sin(particle.angle) * particle.speed;
    
    // Wrap particles around screen
    if (particle.x < 0) particle.x = width;
    if (particle.x > width) particle.x = 0;
    if (particle.y < 0) particle.y = height;
    if (particle.y > height) particle.y = 0;
    
    // Draw particle with glow effect
    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(100, 150, 255, 5);
      ellipse(particle.x, particle.y, particle.size * i * 2);
    }
    fill(200, 220, 255, 150);
    ellipse(particle.x, particle.y, particle.size);
  }
  
  // Add subtle vignette effect
  drawingContext.shadowBlur = 0;
  let gradient = drawingContext.createRadialGradient(
    width/2, height/2, 0,
    width/2, height/2, width * 0.7
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
}

// Modify dibujarMapaBarrios to use new background
function dibujarMapaBarrios() {
  drawFancyBackground();
  
  // Calculate the center and scale for full-screen map
  let centerX = width / 2;
  let centerY = height / 2;
  let scale = min(width / VENTANA_ANCHO, height / VENTANA_ALTO);
  let scaledWidth = VENTANA_ANCHO * scale;
  let scaledHeight = VENTANA_ALTO * scale;
  
  // Draw neighborhoods with modern glass effect
  noStroke();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
  
  // Calculate neighborhood positions and sizes
  let quadSize = scaledWidth / 2;
  
  // Draw neighborhoods with glass effect
  function drawGlassRect(x, y, w, h, color) {
    // Main shape
    fill(color[0], color[1], color[2], 180);
    rect(x, y, w, h);
    
    // Highlight
    fill(255, 255, 255, 20);
    beginShape();
    vertex(x - w/2, y - h/2);
    vertex(x + w/2, y - h/2);
    vertex(x + w/2 - 20, y - h/2 + 20);
    vertex(x - w/2 + 20, y - h/2 + 20);
    endShape(CLOSE);
  }
  
  // Draw neighborhoods with glass effect
  drawGlassRect(centerX - quadSize/2, centerY - quadSize/2, quadSize, quadSize, COLOR_RECOLETA);
  drawGlassRect(centerX + quadSize/2, centerY - quadSize/2, quadSize, quadSize, COLOR_PALERMO);
  drawGlassRect(centerX - quadSize/2, centerY + quadSize/2, quadSize, quadSize, COLOR_COLEGIALES);
  drawGlassRect(centerX + quadSize/2, centerY + quadSize/2, quadSize, quadSize, COLOR_CHACARITA);
  
  // Reset shadow for other elements
  drawingContext.shadowBlur = 0;
  
  // Draw grid lines with fade effect
  stroke(50);
  strokeWeight(1);
  
  // Vertical grid lines
  for (let i = 0; i <= GRILLA_ANCHO; i++) {
    let x = centerX - scaledWidth/2 + i * (scaledWidth / GRILLA_ANCHO);
    let alpha = map(abs(x - centerX), 0, scaledWidth/2, 50, 20);
    stroke(50, alpha);
    line(x, centerY - scaledHeight/2, x, centerY + scaledHeight/2);
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= GRILLA_ALTO; i++) {
    let y = centerY - scaledHeight/2 + i * (scaledHeight / GRILLA_ALTO);
    let alpha = map(abs(y - centerY), 0, scaledHeight/2, 50, 20);
    stroke(50, alpha);
    line(centerX - scaledWidth/2, y, centerX + scaledWidth/2, y);
  }
  
  // Draw neighborhood labels with enhanced style
  drawNeighborhoodLabel("RECOLETA", centerX - quadSize/2, centerY - scaledHeight/2 + 30);
  drawNeighborhoodLabel("PALERMO", centerX + quadSize/2, centerY - scaledHeight/2 + 30);
  drawNeighborhoodLabel("COLEGIALES", centerX - quadSize/2, centerY + scaledHeight/2 - 30);
  drawNeighborhoodLabel("CHACARITA", centerX + quadSize/2, centerY + scaledHeight/2 - 30);
}

// Helper function to draw stylish neighborhood labels
function drawNeighborhoodLabel(name, x, y) {
  // Background pill shape with a more distinctive color
  fill(50, 100, 150, 180);
  let labelWidth = textWidth(name) + 40; // Increased padding
  rect(x, y, labelWidth, 30, 15);
  
  // Add a subtle border with glow effect
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'rgba(70, 130, 180, 0.5)';
  stroke(70, 130, 180, 200);
  strokeWeight(2);
  noFill();
  rect(x, y, labelWidth, 30, 15);
  noStroke();
  drawingContext.shadowBlur = 0;
  
  // Text with improved styling
  fill(220, 240, 255);
  textSize(14);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(name, x, y);
}

// Move the viborita based on current direction
function moverViborita() {
  let cabeza = {x: viborita[0].x + direccion.x, y: viborita[0].y + direccion.y};
  
  // Check collision with other players
  let collidedPlayer = null;
  otherPlayers.forEach((player, playerName) => {
    if (player.snake) {
      for (let segment of player.snake) {
        if (cabeza.x === segment.x && cabeza.y === segment.y) {
          collidedPlayer = playerName;
          break;
        }
      }
    }
  });
  
  if (collidedPlayer) {
    juegoTerminado = true;
    colisionJugador = collidedPlayer;
    return;
  }
  
  viborita.unshift(cabeza);
  if (cabeza.x === cafe.x && cabeza.y === cafe.y) {
    puntaje++;
    cafe = generarCafe();
    cafeActual = CAFES_BA[currentNeighborhood][Math.floor(random(CAFES_BA[currentNeighborhood].length))];
    
    // More gradual speed increase with each café collected
    velocidadActual = velocidadInicial * Math.pow(1.1, puntaje);
    // Cap the maximum speed at 15
    velocidadActual = min(velocidadActual, 15);
    frameRate(velocidadActual);
  } else {
    viborita.pop();
  }
  
  // Progressive random bache generation based on score
  if (frameCount % 60 === 0) { // Check every second
    // Base probability increases with score, starting higher
    let baseProb = map(puntaje, 0, 20, 0.4, 0.9); // Increased probabilities (was 0.3, 0.8)
    baseProb = min(baseProb, 0.9); // Higher cap (was 0.8)
    
    // Add randomness factor
    let randomFactor = random(0, 0.3); // Increased random factor (was 0.2)
    let finalProb = baseProb + randomFactor;
    
    // Maximum baches scales with score and speed
    let maxBaches = floor(map(velocidadActual, velocidadInicial, 15, 8, GRILLA_ANCHO * GRILLA_ALTO * 0.35));
    maxBaches = constrain(maxBaches, 8, GRILLA_ANCHO * GRILLA_ALTO * 0.35);
    
    // Try to add multiple baches based on speed
    let bachesToAdd = floor(map(velocidadActual, velocidadInicial, 15, 1, 3));
    for(let i = 0; i < bachesToAdd; i++) {
      if (random() < finalProb && baches.length < maxBaches) {
        let newBache = generarBache();
        if (newBache) {
          baches.push(newBache);
        }
      }
    }
  }
  
  // Send position update to server
  const now = millis();
  if (now - lastUpdateTime > UPDATE_INTERVAL) {
    lastUpdateTime = now;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        position: cabeza,
        snake: viborita,
        score: puntaje
      }));
    }
  }
}

// Draw the viborita on the canvas
function dibujarViborita() {
  // Calculate the center and scale for full-screen map
  let centerX = width / 2;
  let centerY = height / 2;
  let scale = min(width / VENTANA_ANCHO, height / VENTANA_ALTO);
  let scaledCuadra = TAMANIO_CUADRA * scale;
  let offsetX = centerX - (VENTANA_ANCHO * scale) / 2;
  let offsetY = centerY - (VENTANA_ALTO * scale) / 2;
  
  // Draw other players' snakes
  otherPlayers.forEach((player) => {
    if (player.snake) {
      noStroke();
      
      // Draw body segments
      for (let i = player.snake.length - 1; i > 0; i--) {
        let segmento = player.snake[i];
        let alpha = map(i, 0, player.snake.length - 1, 255, 150);
        fill(player.color[0], player.color[1], player.color[2], alpha);
        
        let x = offsetX + segmento.x * scaledCuadra + scaledCuadra/2;
        let y = offsetY + segmento.y * scaledCuadra + scaledCuadra/2;
        let size = map(i, 0, player.snake.length - 1, scaledCuadra - 2, scaledCuadra - 8);
        
        rect(x, y, size, size, 4);
      }
      
      // Draw head with player name
      if (player.snake.length > 0) {
        let cabeza = player.snake[0];
        fill(player.color[0], player.color[1], player.color[2]);
        let x = offsetX + cabeza.x * scaledCuadra + scaledCuadra/2;
        let y = offsetY + cabeza.y * scaledCuadra + scaledCuadra/2;
        rect(x, y, scaledCuadra - 2, scaledCuadra - 2, 6);
        
        // Draw player name above head
        fill(255);
        textSize(8 * scale);
        textAlign(CENTER, BOTTOM);
        text(player.name, x, y - scaledCuadra/2);
      }
    }
  });
  
  // Draw local player's snake
  noStroke();
  
  // Draw body segments
  for (let i = viborita.length - 1; i > 0; i--) {
    let segmento = viborita[i];
    let alpha = map(i, 0, viborita.length - 1, 255, 150);
    fill(myColor ? myColor[0] : COLOR_VIBORITA[0], 
         myColor ? myColor[1] : COLOR_VIBORITA[1], 
         myColor ? myColor[2] : COLOR_VIBORITA[2], 
         alpha);
    
    let x = offsetX + segmento.x * scaledCuadra + scaledCuadra/2;
    let y = offsetY + segmento.y * scaledCuadra + scaledCuadra/2;
    let size = map(i, 0, viborita.length - 1, scaledCuadra - 2, scaledCuadra - 8);
    
    rect(x, y, size, size, 4);
  }
  
  // Draw head
  let cabeza = viborita[0];
  fill(myColor ? myColor[0] : COLOR_VIBORITA[0], 
       myColor ? myColor[1] : COLOR_VIBORITA[1], 
       myColor ? myColor[2] : COLOR_VIBORITA[2]);
  let x = offsetX + cabeza.x * scaledCuadra + scaledCuadra/2;
  let y = offsetY + cabeza.y * scaledCuadra + scaledCuadra/2;
  rect(x, y, scaledCuadra - 2, scaledCuadra - 2, 6);
  
  // Draw player name above head
  fill(255);
  textSize(8 * scale);
  textAlign(CENTER, BOTTOM);
  text(nombreJugador, x, y - scaledCuadra/2);
  
  // Draw eyes
  fill(255);
  let eyeOffsetX = direccion.x * 5 * scale;
  let eyeOffsetY = direccion.y * 5 * scale;
  
  ellipse(x - 5 * scale + eyeOffsetX, y - 5 * scale + eyeOffsetY, 4 * scale, 4 * scale);
  ellipse(x + 5 * scale + eyeOffsetX, y - 5 * scale + eyeOffsetY, 4 * scale, 4 * scale);
}

// Generate a new café at a random unoccupied position
function generarCafe() {
  let posicionesOcupadas = viborita.concat(baches);
  
  // Determine which neighborhood based on grid position
  function getNeighborhoodFromPosition(x, y) {
    if (x < GRILLA_ANCHO/2) {
      return y < GRILLA_ALTO/2 ? 'RECOLETA' : 'COLEGIALES';
    } else {
      return y < GRILLA_ALTO/2 ? 'PALERMO' : 'CHACARITA';
    }
  }
  
  while (true) {
    let pos = {
      x: Math.floor(random(GRILLA_ANCHO)),
      y: Math.floor(random(GRILLA_ALTO))
    };
    
    if (!posicionesOcupadas.some(p => p.x === pos.x && p.y === pos.y)) {
      // Update current neighborhood and select a random café from that neighborhood
      currentNeighborhood = getNeighborhoodFromPosition(pos.x, pos.y);
      cafeActual = CAFES_BA[currentNeighborhood][Math.floor(random(CAFES_BA[currentNeighborhood].length))];
      return pos;
    }
  }
}

// Draw a coffee cup icon
function drawCoffeeCup(x, y, size) {
  // Cup body
  fill(COLOR_CAFE);
  noStroke();
  rect(x, y, size * 0.8, size, 3);
  
  // Cup handle
  noFill();
  stroke(COLOR_CAFE);
  strokeWeight(size * 0.08);
  arc(x + size * 0.4, y, size * 0.4, size * 0.5, PI/2, PI + PI/2);
  
  // Coffee liquid
  noStroke();
  fill(COLOR_CAFE_ACCENT);
  ellipse(x, y - size * 0.2, size * 0.6, size * 0.15);
  
  // Steam
  stroke(255, 200);
  strokeWeight(size * 0.05);
  noFill();
  
  // First steam curl
  beginShape();
  vertex(x - size * 0.2, y - size * 0.4);
  vertex(x - size * 0.1, y - size * 0.6);
  vertex(x, y - size * 0.5);
  endShape();
  
  // Second steam curl
  beginShape();
  vertex(x + size * 0.2, y - size * 0.4);
  vertex(x + size * 0.1, y - size * 0.6);
  vertex(x, y - size * 0.5);
  endShape();
}

// Draw the café on the canvas with improved display
function dibujarCafe() {
  // Calculate the center and scale for full-screen map
  let centerX = width / 2;
  let centerY = height / 2;
  let scale = min(width / VENTANA_ANCHO, height / VENTANA_ALTO);
  let scaledCuadra = TAMANIO_CUADRA * scale;
  let offsetX = centerX - (VENTANA_ANCHO * scale) / 2;
  let offsetY = centerY - (VENTANA_ALTO * scale) / 2;
  
  let x = offsetX + cafe.x * scaledCuadra + scaledCuadra/2;
  let y = offsetY + cafe.y * scaledCuadra + scaledCuadra/2;
  
  // Draw coffee cup using the loaded image with a subtle bounce animation
  if (cafeIcon) {
    let iconSize = scaledCuadra * 1.2; // Slightly larger icon
    let bounce = sin(frameCount * 0.05) * 2; // Subtle floating animation
    
    // Enhanced glow effect
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 220, 150, 0.4)';
    
    push();
    imageMode(CENTER);
    image(cafeIcon, x, y + bounce, iconSize, iconSize);
    pop();
    
    drawingContext.shadowBlur = 0;
  } else {
    drawCoffeeCup(x, y, scaledCuadra * 0.8);
  }
  
  // Draw café name with improved styling and more separation
  textAlign(CENTER, CENTER);
  
  // Background panel with gradient - moved further down
  let panelWidth = textWidth(cafeActual) + 60; // Increased padding
  let panelHeight = 32; // Slightly reduced height
  let panelY = y + scaledCuadra * 1.2; // Increased separation from icon
  
  // Enhanced panel shadow
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.4)';
  
  // Gradient background with improved colors
  let gradient = drawingContext.createLinearGradient(
    x - panelWidth/2, panelY - panelHeight/2,
    x + panelWidth/2, panelY + panelHeight/2
  );
  gradient.addColorStop(0, 'rgba(35, 35, 45, 0.95)');
  gradient.addColorStop(0.5, 'rgba(45, 45, 55, 0.95)');
  gradient.addColorStop(1, 'rgba(35, 35, 45, 0.95)');
  drawingContext.fillStyle = gradient;
  
  // Draw panel with rounded corners
  rect(x, panelY, panelWidth, panelHeight, 16);
  
  // Add subtle shine effect at the top
  fill(255, 255, 255, 15);
  rect(x, panelY - panelHeight/4, panelWidth - 4, panelHeight/8, 4);
  
  // Café name with enhanced styling
  drawingContext.shadowBlur = 2;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.6)';
  textSize(13 * scale);
  textStyle(BOLD);
  fill(255, 255, 230);
  text(cafeActual, x, panelY);
  
  drawingContext.shadowBlur = 0;
}

// Generate a new bache at a random unoccupied position
function generarBache() {
  let posicionesOcupadas = viborita.concat(baches);
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    let pos = {
      x: Math.floor(random(GRILLA_ANCHO)),
      y: Math.floor(random(GRILLA_ALTO))
    };
    
    // Also check it's not on top of the café
    if (!posicionesOcupadas.some(p => p.x === pos.x && p.y === pos.y) &&
        !(pos.x === cafe.x && pos.y === cafe.y)) {
      console.log('Generated new bache at:', pos);
      return pos;
    }
    attempts++;
  }
  
  console.log('Could not generate bache after max attempts');
  return null; // Return null if we couldn't find a valid position
}

// Draw the baches on the canvas
function dibujarBaches() {
  // Calculate the center and scale for full-screen map
  let centerX = width / 2;
  let centerY = height / 2;
  let scale = min(width / VENTANA_ANCHO, height / VENTANA_ALTO);
  let scaledCuadra = TAMANIO_CUADRA * scale;
  let offsetX = centerX - (VENTANA_ANCHO * scale) / 2;
  let offsetY = centerY - (VENTANA_ALTO * scale) / 2;
  
  for (let bache of baches) {
    let x = offsetX + bache.x * scaledCuadra + scaledCuadra/2;
    let y = offsetY + bache.y * scaledCuadra + scaledCuadra/2;
    
    // Use the bache image if loaded
    if (bacheIcon) {
      // Calculate appropriate size for the bache icon
      let iconSize = scaledCuadra * 0.9;
      
      // Draw the bache icon image
      push();
      imageMode(CENTER);
      image(bacheIcon, x, y, iconSize, iconSize);
      pop();
    } else {
      // Fallback to drawn bache if image fails to load
      noStroke();
      fill(COLOR_BACHE);
      ellipse(x, y, (TAMANIO_CUADRA - 6) * scale, (TAMANIO_CUADRA - 6) * scale);
      
      // Add texture to the pothole
      fill(60);
      ellipse(x - 3 * scale, y - 3 * scale, 5 * scale, 5 * scale);
      ellipse(x + 4 * scale, y + 2 * scale, 4 * scale, 4 * scale);
    }
  }
}

// Initialize Spotify player
function initSpotifyPlayer() {
  let iframe = document.getElementById('spotify-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'spotify-iframe';
    iframe.style.position = 'absolute';
    iframe.style.visibility = 'hidden';
    iframe.style.pointerEvents = 'none';
    iframe.style.border = 'none';
    iframe.src = SPOTIFY_EMBED_URL;
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    document.body.appendChild(iframe);
    
    // Add event listener for iframe load
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.postMessage({ command: 'play' }, '*');
      }, 1000);
    };
  }
}

// Draw the music control button
function dibujarMusicControl() {
  let buttonSize = 50;
  let margin = 30;
  let x = width - buttonSize/2 - margin;
  let y = height - buttonSize/2 - margin;
  
  // Check if mouse is over button
  let mouseOverButton = dist(mouseX, mouseY, x, y) < buttonSize/2;
  
  // Button background with gradient
  drawingContext.shadowBlur = mouseOverButton ? 15 : 10;
  drawingContext.shadowColor = 'rgba(30, 215, 96, 0.3)';
  
  // Gradient background for button
  let gradient = drawingContext.createRadialGradient(
    x, y, 0,
    x, y, buttonSize/2
  );
  gradient.addColorStop(0, mouseOverButton ? 'rgba(30, 215, 96, 1)' : 'rgba(25, 185, 85, 1)');
  gradient.addColorStop(1, mouseOverButton ? 'rgba(25, 185, 85, 1)' : 'rgba(20, 155, 75, 1)');
  drawingContext.fillStyle = gradient;
  
  ellipse(x, y, buttonSize, buttonSize);
  
  // Draw pause/play icon - centered
  fill(255);
  noStroke();
  if (isPlaying) {
    // Pause icon (two rectangles) - adjusted position
    let barWidth = 4;
    let barHeight = 16;
    let spacing = 6;
    rect(x - spacing - barWidth/2, y - barHeight/2, barWidth, barHeight, 2);
    rect(x + spacing - barWidth/2, y - barHeight/2, barWidth, barHeight, 2);
  } else {
    // Play icon (triangle) - adjusted position
    let triangleSize = 14;
    beginShape();
    vertex(x - triangleSize/2, y - triangleSize);
    vertex(x + triangleSize, y);
    vertex(x - triangleSize/2, y + triangleSize);
    endShape(CLOSE);
  }
  
  drawingContext.shadowBlur = 0;
}

// Main game loop and UI
function jugar() {
  dibujarMapaBarrios();
  moverViborita();
  
  let cabeza = viborita[0];
  
  // Check different types of collisions
  if (cabeza.x < 0 || cabeza.x >= GRILLA_ANCHO || cabeza.y < 0 || cabeza.y >= GRILLA_ALTO) {
    juegoTerminado = true;
    gameOverReason = 'border';
    return;
  }
  
  // Check self collision
  if (viborita.slice(1).some(seg => seg.x === cabeza.x && seg.y === cabeza.y)) {
    juegoTerminado = true;
    gameOverReason = 'self';
    return;
  }
  
  // Check bache collision
  if (baches.some(b => b.x === cabeza.x && b.y === cabeza.y)) {
    juegoTerminado = true;
    gameOverReason = 'bache';
    return;
  }
  
  dibujarBaches();
  dibujarCafe();
  dibujarViborita();
  drawGameUI();
  dibujarMusicControl();
}

// Draw the game UI with player name and score
function drawGameUI() {
  // Score panel in top right with improved dimensions
  let panelWidth = 220;
  let panelHeight = 80;
  let margin = 25;
  let cornerRadius = 15;
  
  // Panel shadow for depth
  for (let i = 3; i > 0; i--) {
    fill(0, 0, 0, 10);
    rect(width - panelWidth/2 - margin, margin + panelHeight/2 + i, 
         panelWidth + i, panelHeight, cornerRadius);
  }
  
  // Panel background with gradient
  let panelY = margin + panelHeight/2;
  for (let i = 0; i < panelHeight; i++) {
    let inter = map(i, 0, panelHeight, 0, 1);
    let c = lerpColor(
      color(30, 30, 40, 220),
      color(20, 20, 30, 220),
      inter
    );
    fill(c);
    rect(width - panelWidth/2 - margin, panelY - panelHeight/2 + i, 
         panelWidth, 1, cornerRadius);
  }
  
  // Decorative accent line
  stroke(COLOR_BUTTON[0], COLOR_BUTTON[1], COLOR_BUTTON[2], 180);
  strokeWeight(2);
  line(width - panelWidth + margin, margin + 22,
       width - margin - 10, margin + 22);
  noStroke();
  
  // Player section
  textAlign(LEFT, TOP);
  
  // Label with subtle glow
  fill(150, 150, 150);
  textSize(12);
  textStyle(BOLD);
  text("JUGADOR", width - panelWidth + margin, margin + 8);
  
  // Player name with shadow
  fill(0, 0, 0, 100);
  textSize(20);
  text(nombreJugador, width - panelWidth + margin + 1, margin + 31);
  fill(255);
  text(nombreJugador, width - panelWidth + margin, margin + 30);
  
  // Score section
  textAlign(RIGHT, TOP);
  
  // Score label with subtle glow
  fill(150, 150, 150);
  textSize(12);
  text("PUNTAJE", width - margin - 10, margin + 8);
  
  // Score value with shadow and larger size
  textSize(28);
  textStyle(BOLD);
  fill(0, 0, 0, 100);
  text(puntaje, width - margin - 9, margin + 31);
  fill(255, 255, 200); // Slightly warm tint for score
  text(puntaje, width - margin - 10, margin + 30);
} 