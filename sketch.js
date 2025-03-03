// Viborita Indie BA - Main Game Script
// This file contains the game logic for the snake-like game set in Buenos Aires

// Game Constants
const SNAKE_SIZE = 20;
const MOVE_SPEED = 8;
const TAMANIO_CUADRA = 20;
const GRILLA_ANCHO = 30;
const GRILLA_ALTO = 30;
const VENTANA_ANCHO = TAMANIO_CUADRA * GRILLA_ANCHO; // 600
const VENTANA_ALTO = TAMANIO_CUADRA * GRILLA_ALTO;   // 600

// Multiplayer Variables
let ws;
let otherPlayers = new Map();
let myColor;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 16; // Increased update frequency (approximately 60fps)

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
let snake = [];
let direction = { x: 0, y: 0 };
let cafe = null;
let cafeActual = '';
let baches = [];
let puntaje = 0;
let nombreJugador = "";
let ingresandoNombre = true;
let textoNombre = "";
let juegoTerminado = false;
const velocidadInicial = 12; // Increased from 8
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

// Add new variables for YouTube integration
let isPlaying = true; // Start with music playing
const YOUTUBE_VIDEO_ID = "DTZKSgR9aEc";
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?enablejsapi=1&autoplay=1&loop=1&controls=0&modestbranding=1`;
let youtubePlayer = null;

// Add these variables at the top with other constants
const NUM_BACHES = 15; // Increased number of baches
const BACKGROUND_COLORS = [
  [200, 200, 200], // Default gray
  [173, 216, 230], // Light blue
  [144, 238, 144], // Light green
  [255, 182, 193], // Light pink
  [255, 218, 185], // Peach
  [221, 160, 221]  // Plum
];
let currentBackgroundIndex = 0;
let backgroundTransitionProgress = 0;

// Add these variables at the top with other constants
const SPACE_COLORS = [
  [20, 20, 40],    // Deep space blue
  [40, 20, 40],    // Purple space
  [20, 40, 40],    // Teal space
  [40, 20, 20],    // Red space
  [30, 40, 20],    // Green space
  [40, 30, 20]     // Orange space
];
let currentSpaceIndex = 0;
let spaceTransitionProgress = 0;
let stars = [];
const NUM_STARS = 200;

// Add new variables for coffee animation
let drinkingCoffee = false;
let drinkingAnimation = 0;
let drinkingStartTime = 0;
const DRINKING_DURATION = 500; // Animation duration in milliseconds
let lastCoffeePosition = null;

// Add mobile detection at the top with other constants
let isMobile = false;
let hasTouchControls = false;

// P5.js Preload Function
function preload() {
  try {
    // Load coffee icon image with absolute path
    cafeIcon = loadImage(window.location.origin + '/assets/iconcafe.png', 
      // Success callback
      () => console.log('Coffee icon loaded successfully'),
      // Error callback
      () => {
        console.warn('Failed to load coffee icon, will use fallback');
        cafeIcon = null;
      }
    );
    
    // Load pothole icon image with absolute path
    bacheIcon = loadImage(window.location.origin + '/assets/bache.png',
      // Success callback
      () => console.log('Bache icon loaded successfully'),
      // Error callback
      () => {
        console.warn('Failed to load bache icon, will use fallback');
        bacheIcon = null;
      }
    );
  } catch (error) {
    console.error('Error in preload:', error);
    cafeIcon = null;
    bacheIcon = null;
  }
}

// P5.js Setup Function
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(velocidadActual);
  textFont('Montserrat');
  rectMode(CENTER);
  ellipseMode(CENTER);
  imageMode(CENTER);
  
  // Detect mobile device with improved detection
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  // If on mobile, adjust game constants for better mobile experience
  if (isMobile) {
    // Increase snake size for better visibility on mobile
    adjustForMobile();
    setupMobileControls();
    
    // Create a hidden input element for mobile keyboard
    createMobileInputField();
  }
  
  // Create stars
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(100, 255)
    });
  }
  
  // Create particles
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.2, 1) * PARTICLE_SPEED,
      angle: random(TWO_PI)
    });
  }
  
  // Set framerate
  frameRate(velocidadInicial);
}

// New function to adjust game parameters for mobile
function adjustForMobile() {
  // Increase sizes for better visibility on mobile
  SNAKE_SIZE_MOBILE = 30; // Larger snake for mobile
}

// Create a hidden input field for mobile
function createMobileInputField() {
  // Remove any existing input field
  let existingInput = document.getElementById('mobileNameInput');
  if (existingInput) {
    existingInput.remove();
  }
  
  // Create a new input field
  let inputField = document.createElement('input');
  inputField.id = 'mobileNameInput';
  inputField.type = 'text';
  inputField.maxLength = 15;
  inputField.placeholder = 'Tu nombre';
  inputField.style.position = 'absolute';
  inputField.style.left = '-1000px'; // Hide it off-screen initially
  inputField.style.top = '0';
  inputField.style.zIndex = '1000';
  inputField.style.fontSize = '16px'; // Prevent zoom on iOS
  inputField.style.padding = '12px';
  inputField.style.borderRadius = '8px';
  inputField.style.border = '2px solid #4286f4';
  inputField.style.backgroundColor = '#2a3a5a';
  inputField.style.color = 'white';
  
  // Add event listeners
  inputField.addEventListener('input', function() {
    textoNombre = this.value.substring(0, 15);
  });
  
  inputField.addEventListener('blur', function() {
    // Hide the input when not in focus
    this.style.left = '-1000px';
  });
  
  document.body.appendChild(inputField);
}

// Show the mobile input field
function showMobileInput(x, y) {
  let inputField = document.getElementById('mobileNameInput');
  if (inputField) {
    // Position the input field at the tap location
    inputField.style.left = (x - 150) + 'px';
    inputField.style.top = (y - 25) + 'px';
    inputField.style.width = '300px';
    inputField.value = textoNombre;
    inputField.focus();
  }
}

// Update drawNombreIngreso function to optimize for mobile
function drawNombreIngreso() {
  // First draw a completely opaque background to hide everything
  push();
  // Use a solid dark background
  background(15, 15, 25);
  
  // Draw stars with very low opacity for subtle background
  for (let star of stars) {
    let twinkle = sin(frameCount * 0.05 + star.x * 0.01) * 0.5 + 0.5;
    let alpha = map(twinkle, -1, 1, 10, 40);
    let size = map(twinkle, -1, 1, star.size * 0.5, star.size * 1.2);
    
    fill(255, 255, 255, alpha);
    noStroke();
    ellipse(star.x, star.y, size, size);
  }
  
  // Calculate modal dimensions - make it larger on mobile
  let modalWidth = isMobile ? min(width * 0.95, 600) : min(550, width * 0.9);
  let modalHeight = isMobile ? min(height * 0.8, 700) : min(480, height * 0.75);
  let inputWidth = modalWidth * 0.8; // Wider input on mobile
  
  // Draw modal background with rounded corners and stronger border
  rectMode(CENTER);
  fill(25, 25, 40, 240);
  strokeWeight(3);
  stroke(100, 100, 200, 200);
  rect(width/2, height/2, modalWidth, modalHeight, 20);
  
  // Add a subtle inner glow to the modal
  noFill();
  stroke(100, 100, 200, 50);
  strokeWeight(1);
  rect(width/2, height/2, modalWidth - 10, modalHeight - 10, 15);
  
  // Simple, evenly spaced layout - adjusted for mobile
  let titleY = height/2 - modalHeight * 0.35;
  let subtitleY = titleY + (isMobile ? 60 : 45);
  let labelY = height/2 - (isMobile ? 50 : 30);
  let inputY = height/2 + (isMobile ? 30 : 20);
  let buttonY = height/2 + modalHeight * 0.3;
  
  // Draw title with clean, elegant styling - larger on mobile
  noStroke();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
  fill(255);
  textSize(isMobile ? 36 : 28);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text('¡Bienvenido a', width/2, titleY - (isMobile ? 30 : 20));
  text('Viborita de Especialidad!', width/2, titleY + (isMobile ? 30 : 20));
  
  // Draw subtitle - larger on mobile
  drawingContext.shadowBlur = 5;
  textSize(isMobile ? 20 : 16);
  textStyle(NORMAL);
  fill(200, 200, 200);
  text('El juego de cafetería en Buenos Aires', width/2, subtitleY);
  
  // Draw input label - larger on mobile
  fill(255);
  textSize(isMobile ? 24 : 18);
  textStyle(NORMAL);
  text('Ingresá tu nombre:', width/2, labelY);
  
  // Draw input box with clean styling - larger on mobile
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(100, 100, 255, 0.3)';
  fill(35, 35, 55);
  stroke('#4286f4');
  strokeWeight(2);
  let inputHeight = isMobile ? 60 : 50;
  rect(width/2, inputY, inputWidth, inputHeight, 10);
  
  // Draw text input content
  drawingContext.shadowBlur = 0;
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 26 : 20);
  text(textoNombre + (frameCount % 60 < 30 ? '|' : ''), width/2, inputY);
  
  // Add touch instructions for mobile
  if (isMobile) {
    textSize(18);
    fill(180, 180, 180);
    text('Toca aquí para escribir', width/2, inputY + 50);
  }
  
  // Draw start button with clean styling - larger on mobile
  let buttonWidth = inputWidth * 0.7;
  let buttonHeight = isMobile ? 70 : 55;
  let buttonHover = mouseX > width/2 - buttonWidth/2 && 
                   mouseX < width/2 + buttonWidth/2 && 
                   mouseY > buttonY - buttonHeight/2 && 
                   mouseY < buttonY + buttonHeight/2;
  
  drawingContext.shadowBlur = buttonHover ? 15 : 10;
  drawingContext.shadowColor = 'rgba(66, 134, 244, 0.5)';
  fill(buttonHover ? '#4286f4' : '#2a5298');
  stroke(100, 100, 200);
  strokeWeight(2);
  rect(width/2, buttonY, buttonWidth, buttonHeight, 10);
  
  // Button text - larger on mobile
  drawingContext.shadowBlur = 0;
  fill(255);
  noStroke();
  textSize(isMobile ? 28 : 20);
  textStyle(BOLD);
  text('¡JUGAR!', width/2, buttonY);
  
  // Add instruction for mobile view if name is empty
  if (isMobile && textoNombre.length === 0) {
    fill(255, 200, 200);
    textSize(18);
    textStyle(NORMAL);
    text('Por favor, ingresa un nombre para continuar', width/2, buttonY + 50);
  }
  
  // Reset drawing settings
  pop();
}

// Update mousePressed function to handle the mobile input field
function mousePressed() {
  if (ingresandoNombre) {
    let modalWidth = isMobile ? min(width * 0.95, 600) : min(550, width * 0.9);
    let modalHeight = isMobile ? min(height * 0.8, 700) : min(480, height * 0.75);
    let inputWidth = modalWidth * 0.8;
    let inputHeight = isMobile ? 60 : 50;
    let inputY = height/2 + (isMobile ? 30 : 20);
    let buttonWidth = inputWidth * 0.7;
    let buttonHeight = isMobile ? 70 : 55;
    let buttonY = height/2 + modalHeight * 0.3;
    
    // Check if input field was clicked
    if (isMobile && 
        mouseX > width/2 - inputWidth/2 && 
        mouseX < width/2 + inputWidth/2 && 
        mouseY > inputY - inputHeight/2 && 
        mouseY < inputY + inputHeight/2) {
      // Show the mobile input field
      showMobileInput(width/2, inputY);
      return;
    }
    
    // Check if button was clicked and name is not empty
    if (textoNombre.length > 0 &&
        mouseX > width/2 - buttonWidth/2 && 
        mouseX < width/2 + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      nombreJugador = textoNombre;
      ingresandoNombre = false;
      iniciarJuego();
      
      // Hide the mobile input field
      let inputField = document.getElementById('mobileNameInput');
      if (inputField) {
        inputField.style.left = '-1000px';
      }
    }
  } else if (juegoTerminado) {
    let modalWidth = min(500, width * 0.9);
    let modalHeight = min(400, height * 0.7);
    let buttonWidth = modalWidth * 0.5;
    let buttonHeight = 55;
    let buttonY = height/2 + modalHeight * 0.3;
    
    if (mouseX > width/2 - buttonWidth/2 && 
        mouseX < width/2 + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      reiniciarJuego();
    }
  } else {
    // Check for music control button click in header
    let buttonSize = 40;
    let x = width - 45;
    let y = 30;
    
    if (dist(mouseX, mouseY, x, y) < buttonSize/2) {
      isPlaying = !isPlaying;
      if (youtubePlayer) {
        if (isPlaying) {
          youtubePlayer.playVideo();
        } else {
          youtubePlayer.pauseVideo();
        }
      }
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
    if (keyCode === UP_ARROW && direction.y >= 0) direction = {x: 0, y: -MOVE_SPEED};
    else if (keyCode === DOWN_ARROW && direction.y <= 0) direction = {x: 0, y: MOVE_SPEED};
    else if (keyCode === LEFT_ARROW && direction.x >= 0) direction = {x: -MOVE_SPEED, y: 0};
    else if (keyCode === RIGHT_ARROW && direction.x <= 0) direction = {x: MOVE_SPEED, y: 0};
  }
}

// Initialize the game after name input
function iniciarJuego() {
  // Initialize YouTube player
  initYoutubePlayer();
  
  // Initialize snake in center of screen
  const startX = width/2;
  const startY = height/2;
  snake = [{x: startX, y: startY}];
  direction = {x: MOVE_SPEED, y: 0};
  baches = [];
  
  // Generate initial cafe
  cafe = generarCafe();
  
  // Make sure we have a valid neighborhood before accessing it
  currentNeighborhood = getNeighborhoodFromPosition(cafe.x, cafe.y);
  cafeActual = CAFES_BA[currentNeighborhood][Math.floor(random(CAFES_BA[currentNeighborhood].length))];
  
  // Generate initial baches
  for (let i = 0; i < NUM_BACHES; i++) {
    let newBache = generarBache();
    if (newBache) baches.push(newBache);
  }
  
  puntaje = 0;
  juegoTerminado = false;
  velocidadActual = velocidadInicial;
  frameRate(velocidadActual);
  
  // Set default color for single player mode
  myColor = COLOR_VIBORITA;
  
  // Initialize WebSocket connection
  initializeWebSocket(startX, startY);
}

// Restart the game after game over
function reiniciarJuego() {
  // Generate random starting position
  const startX = random(SNAKE_SIZE, width - SNAKE_SIZE);
  const startY = random(SNAKE_SIZE, height - SNAKE_SIZE);
  
  // Reset game state
  snake = [{x: startX, y: startY}];
  direction = {x: 0, y: 0};
  cafe = generarCafe();
  baches = [];
  
  // Start with just a few baches
  for (let i = 0; i < 3; i++) {
    let newBache = generarBache();
    if (newBache) baches.push(newBache);
  }
  
  puntaje = 0;
  juegoTerminado = false;
  colisionJugador = null;
  gameOverReason = '';
  velocidadActual = velocidadInicial;
  frameRate(velocidadActual);
  
  // Notify server of restart with new position
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'restart',
      name: nombreJugador,
      position: {x: startX, y: startY},
      color: myColor
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
  fill(30, 30, 40, 200);
  let labelWidth = textWidth(name) + 40;
  let labelHeight = 30;
  rect(x, y, labelWidth, labelHeight, 15);
  
  // Add a subtle glow effect
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
  stroke(100, 200, 255, 150);
  strokeWeight(2);
  noFill();
  rect(x, y, labelWidth, labelHeight, 15);
  noStroke();
  
  // Text with improved styling
  fill(255);
  textSize(16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(name, x, y);
  
  drawingContext.shadowBlur = 0;
}

// Move the viborita based on current direction
function moverViborita() {
  let cabeza = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  
  // Check border collision
  if (cabeza.x < 0 || cabeza.x > width || cabeza.y < 0 || cabeza.y > height) {
    juegoTerminado = true;
    gameOverReason = 'border';
    return;
  }
  
  // Check collision with other players only if not drinking
  if (!drinkingCoffee) {
    let collidedPlayer = checkPlayerCollisions(cabeza);
    if (collidedPlayer) {
      juegoTerminado = true;
      colisionJugador = collidedPlayer;
      return;
    }
  }
  
  snake.unshift(cabeza);
  
  // Check cafe collection with a more forgiving distance
  if (cafe && !drinkingCoffee && dist(cabeza.x, cabeza.y, cafe.x, cafe.y) < SNAKE_SIZE * 1.2) {
    // Start drinking animation
    drinkingCoffee = true;
    drinkingAnimation = 0;
    drinkingStartTime = millis();
    lastCoffeePosition = {x: cafe.x, y: cafe.y};
    
    // Update score and generate new cafe
    puntaje += 1;
    cafe = generarCafe();
    currentNeighborhood = getNeighborhoodFromPosition(cafe.x, cafe.y);
    cafeActual = CAFES_BA[currentNeighborhood][Math.floor(random(CAFES_BA[currentNeighborhood].length))];
    
    // Increase speed with a cap
    velocidadActual = min(velocidadInicial * Math.pow(1.05, puntaje), 20);
    frameRate(velocidadActual);
    
    // Add new bache every 3 points
    if (puntaje % 3 === 0) {
      let newBache = generarBache();
      if (newBache) baches.push(newBache);
    }
  } else {
    snake.pop();
  }
  
  // Send updates to server
  sendPlayerUpdate(cabeza);
}

// Draw the viborita on the canvas
function dibujarViborita() {
  // Draw other players' snakes
  otherPlayers.forEach((player) => {
    if (player.snake) {
      noStroke();
      
      // Draw body segments
      for (let i = player.snake.length - 1; i > 0; i--) {
        let segmento = player.snake[i];
        let alpha = map(i, 0, player.snake.length - 1, 255, 150);
        fill(player.color[0], player.color[1], player.color[2], alpha);
        rect(segmento.x, segmento.y, SNAKE_SIZE, SNAKE_SIZE, 5);
      }
      
      // Draw head with player name
      if (player.snake.length > 0) {
        let cabeza = player.snake[0];
        fill(player.color[0], player.color[1], player.color[2]);
        rect(cabeza.x, cabeza.y, SNAKE_SIZE, SNAKE_SIZE, 8);
        
        // Draw player name above head
        fill(255);
        textSize(14);
        textAlign(CENTER, BOTTOM);
        text(player.name, cabeza.x, cabeza.y - SNAKE_SIZE);
      }
    }
  });
  
  // Reset drawing settings
  noStroke();
  rectMode(CENTER);
  
  // Draw local player's snake body
  for (let i = snake.length - 1; i > 0; i--) {
    let segmento = snake[i];
    let alpha = map(i, 0, snake.length - 1, 255, 150);
    fill(myColor ? myColor[0] : COLOR_VIBORITA[0], 
         myColor ? myColor[1] : COLOR_VIBORITA[1], 
         myColor ? myColor[2] : COLOR_VIBORITA[2], 
         alpha);
    rect(segmento.x, segmento.y, SNAKE_SIZE, SNAKE_SIZE, 5);
  }
  
  // Draw head
  let cabeza = snake[0];
  fill(myColor ? myColor[0] : COLOR_VIBORITA[0], 
       myColor ? myColor[1] : COLOR_VIBORITA[1], 
       myColor ? myColor[2] : COLOR_VIBORITA[2]);
  rect(cabeza.x, cabeza.y, SNAKE_SIZE, SNAKE_SIZE, 8);
  
  // Draw player name
  fill(255);
  textSize(14);
  textAlign(CENTER, BOTTOM);
  text(nombreJugador, cabeza.x, cabeza.y - SNAKE_SIZE);
  
  // Draw eyes
  fill(255);
  let eyeSize = 5;
  let eyeSpacing = 8;
  let eyeY = cabeza.y - 4;
  
  // Adjust eye positions based on direction
  if (direction.x !== 0) {
    // Moving horizontally
    let eyeX1 = cabeza.x - eyeSpacing/2;
    let eyeX2 = cabeza.x + eyeSpacing/2;
    if (direction.x > 0) { // Moving right
      eyeX1 += 2;
      eyeX2 += 2;
    } else { // Moving left
      eyeX1 -= 2;
      eyeX2 -= 2;
    }
    ellipse(eyeX1, eyeY, eyeSize, eyeSize);
    ellipse(eyeX2, eyeY, eyeSize, eyeSize);
  } else if (direction.y !== 0) {
    // Moving vertically
    let eyeX1 = cabeza.x - eyeSpacing/2;
    let eyeX2 = cabeza.x + eyeSpacing/2;
    if (direction.y > 0) { // Moving down
      eyeY += 2;
    } else { // Moving up
      eyeY -= 2;
    }
    ellipse(eyeX1, eyeY, eyeSize, eyeSize);
    ellipse(eyeX2, eyeY, eyeSize, eyeSize);
  } else {
    // Not moving
    ellipse(cabeza.x - eyeSpacing/2, eyeY, eyeSize, eyeSize);
    ellipse(cabeza.x + eyeSpacing/2, eyeY, eyeSize, eyeSize);
  }
  
  // Draw drinking animation
  if (drinkingCoffee) {
    let elapsed = millis() - drinkingStartTime;
    drinkingAnimation = elapsed / DRINKING_DURATION;
    
    if (drinkingAnimation >= 1) {
      drinkingCoffee = false;
    } else {
      // Happy eyes (slightly larger during drinking)
      let blinkPhase = sin(frameCount * 0.5);
      eyeSize = map(blinkPhase, -1, 1, 4, 7);
      
      // Draw happy mouth
      stroke(255);
      strokeWeight(2);
      noFill();
      let smileSize = map(drinkingAnimation, 0, 1, 0, 8);
      arc(cabeza.x, cabeza.y + 2, smileSize, smileSize, 0, PI);
      noStroke();
      
      // Draw coffee effect
      if (lastCoffeePosition) {
        drawCoffeeEffect(lastCoffeePosition.x, lastCoffeePosition.y, drinkingAnimation);
      }
    }
  }
}

// Add new function for coffee drinking effect
function drawCoffeeEffect(x, y, progress) {
  let numParticles = 8;
  let maxRadius = SNAKE_SIZE * 2;
  
  push();
  translate(x, y);
  
  // Draw expanding circle
  noFill();
  stroke(COLOR_CAFE[0], COLOR_CAFE[1], COLOR_CAFE[2], 255 * (1 - progress));
  strokeWeight(2);
  let radius = map(progress, 0, 1, 0, maxRadius);
  ellipse(0, 0, radius * 2);
  
  // Draw particles
  noStroke();
  fill(COLOR_CAFE[0], COLOR_CAFE[1], COLOR_CAFE[2], 255 * (1 - progress));
  for (let i = 0; i < numParticles; i++) {
    let angle = TWO_PI * i / numParticles;
    let r = radius * 0.8;
    let px = cos(angle) * r;
    let py = sin(angle) * r;
    let size = map(progress, 0, 1, 4, 0);
    ellipse(px, py, size, size);
  }
  
  // Draw steam effect
  stroke(255, 255, 255, 100 * (1 - progress));
  strokeWeight(1);
  for (let i = 0; i < 3; i++) {
    let steamX = (i - 1) * 10;
    let waveOffset = sin(frameCount * 0.1 + i) * 5;
    let steamHeight = map(progress, 0, 1, 0, -20);
    beginShape();
    vertex(steamX, 0);
    vertex(steamX + waveOffset, steamHeight * 0.5);
    vertex(steamX - waveOffset, steamHeight);
    endShape();
  }
  
  pop();
}

// Generate a new café at a random unoccupied position
function generarCafe() {
  let attempts = 0;
  const maxAttempts = 50;
  
  // Define margins to keep coffee away from edges
  const MARGIN = 60; // Margin from edges of the screen
  const HEADER_MARGIN = 80; // Extra margin from the top for the header
  
  while (attempts < maxAttempts) {
    let pos = {
      x: random(MARGIN, width - MARGIN),
      y: random(HEADER_MARGIN, height - MARGIN)
    };
    
    // Check if position is far enough from snake and baches
    let validPosition = true;
    
    // Check distance from snake
    for (let part of snake) {
      if (dist(pos.x, pos.y, part.x, part.y) < SNAKE_SIZE * 2) {
        validPosition = false;
        break;
      }
    }
    
    // Check distance from baches
    for (let bache of baches) {
      if (dist(pos.x, pos.y, bache.x, bache.y) < SNAKE_SIZE * 2) {
        validPosition = false;
        break;
      }
    }
    
    if (validPosition) {
      // Update current neighborhood based on screen quadrants
      currentNeighborhood = getNeighborhoodFromPosition(pos.x, pos.y);
      return pos;
    }
    
    attempts++;
  }
  
  // Fallback position if no valid position found - use center with margins
  return {
    x: width/2,
    y: height/2 + 40 // Offset from center to avoid header
  };
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
  if (!cafe) return;
  
  if (cafeIcon) {
    let iconSize = SNAKE_SIZE * 1.2;
    let bounce = sin(frameCount * 0.05) * 1.5;
    
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'rgba(255, 220, 150, 0.5)';
    
    push();
    imageMode(CENTER);
    image(cafeIcon, cafe.x, cafe.y + bounce, iconSize, iconSize);
    pop();
    
    // Name panel
    let panelWidth = textWidth(cafeActual) + 40;
    let panelHeight = 24;
    let panelY = cafe.y + SNAKE_SIZE * 1.5;
    
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.4)';
    
    let gradient = drawingContext.createLinearGradient(
      cafe.x - panelWidth/2, panelY - panelHeight/2,
      cafe.x + panelWidth/2, panelY + panelHeight/2
    );
    gradient.addColorStop(0, 'rgba(35, 35, 45, 0.95)');
    gradient.addColorStop(0.5, 'rgba(45, 45, 55, 0.95)');
    gradient.addColorStop(1, 'rgba(35, 35, 45, 0.95)');
    drawingContext.fillStyle = gradient;
    
    rect(cafe.x, panelY, panelWidth, panelHeight, 12);
    
    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(BOLD);
    fill(255, 255, 240);
    text(cafeActual, cafe.x, panelY);
  } else {
    drawCoffeeCup(cafe.x, cafe.y, SNAKE_SIZE * 1.2);
  }
  
  drawingContext.shadowBlur = 0;
}

// Generate a new bache at a random unoccupied position - Simplified version
function generarBache() {
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    let pos = {
      x: random(SNAKE_SIZE, width - SNAKE_SIZE),
      y: random(SNAKE_SIZE, height - SNAKE_SIZE)
    };
    
    // Check if position is far enough from snake, cafe, and other baches
    let validPosition = true;
    
    // Check distance from snake
    for (let part of snake) {
      if (dist(pos.x, pos.y, part.x, part.y) < SNAKE_SIZE * 3) {
        validPosition = false;
        break;
      }
    }
    
    // Check distance from cafe
    if (cafe && dist(pos.x, pos.y, cafe.x, cafe.y) < SNAKE_SIZE * 3) {
      validPosition = false;
    }
    
    // Check distance from other baches
    for (let bache of baches) {
      if (dist(pos.x, pos.y, bache.x, bache.y) < SNAKE_SIZE * 3) {
        validPosition = false;
        break;
      }
    }
    
    if (validPosition) return pos;
    attempts++;
  }
  
  return null;
}

// Draw the baches on the canvas
function dibujarBaches() {
  for (let bache of baches) {
    if (bacheIcon) {
      let iconSize = SNAKE_SIZE * 1.2;
      
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = 'rgba(0, 0, 0, 0.4)';
      
      push();
      imageMode(CENTER);
      image(bacheIcon, bache.x, bache.y, iconSize, iconSize);
      pop();
      
      drawingContext.shadowBlur = 0;
    } else {
      // Fallback circle rendering
      noStroke();
      fill(COLOR_BACHE);
      let size = SNAKE_SIZE * 1.2;
      
      ellipse(bache.x, bache.y, size, size);
      
      // Add texture details
      fill(60);
      for (let i = 0; i < 3; i++) {
        let detailSize = 3;
        let angle = random(TWO_PI);
        let distance = random(size/4);
        let detailX = bache.x + cos(angle) * distance;
        let detailY = bache.y + sin(angle) * distance;
        ellipse(detailX, detailY, detailSize, detailSize);
      }
    }
  }
}

// Initialize YouTube player
function initYoutubePlayer() {
  let iframe = document.getElementById('youtube-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'youtube-iframe';
    iframe.style.position = 'fixed';
    iframe.style.visibility = 'hidden';
    iframe.style.pointerEvents = 'none';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.src = YOUTUBE_EMBED_URL;
    iframe.allow = "autoplay; encrypted-media";
    document.body.appendChild(iframe);

    // Add event listener for iframe load
    iframe.onload = () => {
      console.log('YouTube iframe loaded');
      // Initialize YouTube API
      if (window.YT) {
        youtubePlayer = new YT.Player('youtube-iframe', {
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
    };

    // Add YouTube API script if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }
}

// YouTube API callbacks
function onPlayerReady(event) {
  event.target.playVideo();
  isPlaying = true;
}

function onPlayerStateChange(event) {
  // If video ends, replay it
  if (event.data === YT.PlayerState.ENDED) {
    event.target.playVideo();
  }
}

// Main game loop function
function jugar() {
  push();
  
  // Draw the header UI
  drawGameUI();
  
  // Translate everything below the header
  translate(0, 60);
  
  // Update game state
  if (frameCount % 2 === 0) { // Slow down updates for smoother gameplay
    moverViborita();
    
    // Check for self collision
    if (!drinkingCoffee && checkSelfCollision()) {
      juegoTerminado = true;
      gameOverReason = 'self';
      return;
    }
    
    // Check for bache collision
    if (!drinkingCoffee && checkBacheCollision()) {
      juegoTerminado = true;
      gameOverReason = 'bache';
      return;
    }
  }
  
  // Draw game elements
  dibujarTablero();
  
  pop();
}

// Draw the game UI with player name and score
function drawGameUI() {
  // Header dimensions
  let headerHeight = 60;
  
  // Draw header background with space theme
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
  
  // Header background with gradient
  let headerGradient = drawingContext.createLinearGradient(
    0, 0,
    0, headerHeight
  );
  headerGradient.addColorStop(0, 'rgba(30, 30, 40, 0.95)');
  headerGradient.addColorStop(1, 'rgba(20, 20, 30, 0.95)');
  drawingContext.fillStyle = headerGradient;
  
  // Draw header rectangle
  rect(width/2, headerHeight/2, width, headerHeight);
  
  // Add subtle line separator
  stroke(100, 200, 255, 100);
  strokeWeight(2);
  line(0, headerHeight, width, headerHeight);
  noStroke();
  
  // Reset shadow
  drawingContext.shadowBlur = 0;
  
  // Current neighborhood (center)
  let currentNeighborhood = getNeighborhoodFromPosition(snake[0].x, snake[0].y);
  textAlign(CENTER, CENTER);
  
  // Neighborhood label
  fill(180, 180, 180);
  textSize(14);
  textStyle(NORMAL);
  text("BARRIO ACTUAL", width/2, headerHeight/2 - 12);
  
  // Neighborhood name with glow
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
  fill(255);
  textSize(24);
  textStyle(BOLD);
  text(currentNeighborhood, width/2, headerHeight/2 + 12);
  drawingContext.shadowBlur = 0;
  
  // Player section (left)
  textAlign(LEFT, CENTER);
  
  // Player label
  fill(180, 180, 180);
  textSize(14);
  textStyle(NORMAL);
  text("JUGADOR", 30, headerHeight/2 - 12);
  
  // Player name
  fill(255);
  textSize(20);
  textStyle(BOLD);
  text(nombreJugador, 30, headerHeight/2 + 12);
  
  // Score section (right)
  textAlign(RIGHT, CENTER);
  
  // Score label
  fill(180, 180, 180);
  textSize(14);
  textStyle(NORMAL);
  text("PUNTAJE", width - 120, headerHeight/2 - 12);
  
  // Score value with glow
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(255, 255, 220, 0.3)';
  fill(255, 255, 220);
  textSize(24);
  textStyle(BOLD);
  text(puntaje, width - 120, headerHeight/2 + 12);
  drawingContext.shadowBlur = 0;
  
  // Draw YouTube control in header
  let buttonSize = 40;
  let x = width - 45;
  let y = headerHeight/2;
  
  // Check if mouse is over button
  let mouseOverButton = dist(mouseX, mouseY, x, y) < buttonSize/2;
  
  // Enhanced button shadow
  drawingContext.shadowBlur = mouseOverButton ? 20 : 15;
  drawingContext.shadowColor = 'rgba(255, 0, 0, 0.4)'; // YouTube red shadow
  
  // Improved gradient for YouTube-style button
  let buttonGradient = drawingContext.createRadialGradient(
    x, y, 0,
    x, y, buttonSize/2
  );
  buttonGradient.addColorStop(0, mouseOverButton ? 'rgba(255, 40, 40, 1)' : 'rgba(255, 0, 0, 1)'); // YouTube red
  buttonGradient.addColorStop(1, mouseOverButton ? 'rgba(220, 0, 0, 1)' : 'rgba(200, 0, 0, 1)');
  drawingContext.fillStyle = buttonGradient;
  
  // Draw button with slight scale effect on hover
  let currentSize = mouseOverButton ? buttonSize * 1.05 : buttonSize;
  ellipse(x, y, currentSize, currentSize);
  
  // Draw pause/play icon
  fill(255);
  noStroke();
  if (isPlaying) {
    // Pause icon
    let barWidth = 4;
    let barHeight = 12;
    let spacing = 3;
    let leftBarX = x - spacing/2 - barWidth;
    let rightBarX = x + spacing/2;
    rectMode(CORNER);
    rect(leftBarX, y - barHeight/2, barWidth, barHeight, 2);
    rect(rightBarX, y - barHeight/2, barWidth, barHeight, 2);
    rectMode(CENTER);
  } else {
    // Play icon
    let triangleSize = 12;
    beginShape();
    vertex(x - triangleSize/2, y - triangleSize);
    vertex(x + triangleSize, y);
    vertex(x - triangleSize/2, y + triangleSize);
    endShape(CLOSE);
  }
  
  drawingContext.shadowBlur = 0;
}

// Update drawSpaceBackground to accept an opacity parameter
function drawSpaceBackground(opacity = 255) {
  // Update color transition based on score
  let targetSpaceIndex = Math.floor(puntaje / 10) % SPACE_COLORS.length;
  if (targetSpaceIndex !== currentSpaceIndex) {
    spaceTransitionProgress += 0.02;
    if (spaceTransitionProgress >= 1) {
      currentSpaceIndex = targetSpaceIndex;
      spaceTransitionProgress = 0;
    }
  }

  // Interpolate between current and next space color
  let currentColor = SPACE_COLORS[currentSpaceIndex];
  let nextColor = SPACE_COLORS[(currentSpaceIndex + 1) % SPACE_COLORS.length];
  let r = lerp(currentColor[0], nextColor[0], spaceTransitionProgress);
  let g = lerp(currentColor[1], nextColor[1], spaceTransitionProgress);
  let b = lerp(currentColor[2], nextColor[2], spaceTransitionProgress);
  
  // Create gradient background
  let gradient = drawingContext.createRadialGradient(
    width/2, height/2, 0,
    width/2, height/2, max(width, height)
  );
  gradient.addColorStop(0, `rgba(${r+20}, ${g+20}, ${b+20}, ${opacity/255})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${opacity/255})`);
  drawingContext.fillStyle = gradient;
  rect(0, 0, width*2, height*2);
  
  // Draw stars with twinkle effect
  for (let star of stars) {
    let twinkle = sin(frameCount * 0.05 + star.x * 0.01) * 0.5 + 0.5;
    let alpha = map(twinkle, -1, 1, 100, 255) * (opacity/255);
    let size = map(twinkle, -1, 1, star.size * 0.5, star.size * 1.2);
    
    // Star glow
    drawingContext.shadowBlur = size * 2;
    drawingContext.shadowColor = `rgba(255, 255, 255, ${alpha/255})`;
    
    fill(255, 255, 255, alpha);
    noStroke();
    ellipse(star.x, star.y, size, size);
  }
  drawingContext.shadowBlur = 0;

  // Draw thin lines to separate neighborhoods
  stroke(255, 255, 255, 40 * (opacity/255));
  strokeWeight(1);
  // Vertical divider
  line(width/2, 0, width/2, height);
  // Horizontal divider
  line(0, height/2, width, height/2);
  
  // Draw subtle neighborhood labels
  textAlign(CENTER, CENTER);
  textSize(24);
  textStyle(NORMAL);
  fill(255, 255, 255, 100 * (opacity/255)); // More visible white
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = `rgba(255, 255, 255, ${0.3 * (opacity/255)})`;
  noStroke();
  
  // Position labels near the center of each quadrant
  let offsetX = width * 0.2;
  let offsetY = height * 0.2;
  
  // Draw each neighborhood name with subtle background
  function drawNeighborhoodName(name, x, y) {
    // Background pill
    fill(0, 0, 0, 40 * (opacity/255));
    rect(x, y, textWidth(name) + 40, 40, 20);
    // Text
    fill(255, 255, 255, 100 * (opacity/255));
    text(name, x, y);
  }
  
  // Draw each neighborhood name
  drawNeighborhoodName("RECOLETA", width * 0.25, offsetY);
  drawNeighborhoodName("PALERMO", width * 0.75, offsetY);
  drawNeighborhoodName("COLEGIALES", width * 0.25, height - offsetY);
  drawNeighborhoodName("CHACARITA", width * 0.75, height - offsetY);
  
  drawingContext.shadowBlur = 0;
}

// Add the missing function for multiplayer collisions
function checkPlayerCollisions(cabeza) {
  let collidedPlayer = null;
  otherPlayers.forEach((player, playerName) => {
    if (player.snake) {
      // Check head-to-head collision
      if (player.snake[0] && 
          dist(cabeza.x, cabeza.y, player.snake[0].x, player.snake[0].y) < SNAKE_SIZE) {
        collidedPlayer = playerName;
        return;
      }
      // Check collision with other player's body
      for (let i = 1; i < player.snake.length; i++) {
        if (dist(cabeza.x, cabeza.y, player.snake[i].x, player.snake[i].y) < SNAKE_SIZE) {
          collidedPlayer = playerName;
          return;
        }
      }
    }
  });
  return collidedPlayer;
}

// Add function to handle WebSocket initialization
function initializeWebSocket(startX, startY) {
  try {
    ws = new WebSocket('wss://evening-peridot-screw.glitch.me');
    
    ws.onopen = () => {
      console.log('Connected to game server');
      ws.send(JSON.stringify({
        type: 'join',
        name: nombreJugador,
        position: {x: startX, y: startY},
        snake: snake,
        score: puntaje
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
      console.log('WebSocket error:', error);
      ws = null;
      otherPlayers.clear();
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      ws = null;
      otherPlayers.clear();
    };
  } catch (error) {
    console.log('Failed to initialize WebSocket:', error);
    ws = null;
    otherPlayers.clear();
  }
}

// Update handleWebSocketMessage function to better handle position updates
function handleWebSocketMessage(data) {
  switch(data.type) {
    case 'gameState':
      otherPlayers.clear();
      data.players.forEach(player => {
        if (player.name !== nombreJugador) {
          otherPlayers.set(player.name, {
            ...player,
            lastUpdate: Date.now()
          });
        } else {
          myColor = player.color;
        }
      });
      break;
      
    case 'playerLeft':
      otherPlayers.delete(data.name);
      break;
      
    case 'update':
      if (data.name !== nombreJugador) {
        const existingPlayer = otherPlayers.get(data.name);
        if (existingPlayer) {
          otherPlayers.set(data.name, {
            ...existingPlayer,
            snake: data.snake,
            position: data.position,
            score: data.score,
            lastUpdate: Date.now()
          });
        }
      }
      break;
      
    case 'playerRestart':
      if (data.name !== nombreJugador) {
        otherPlayers.set(data.name, {
          name: data.name,
          snake: [{x: data.position.x, y: data.position.y}],
          color: data.color,
          score: 0,
          lastUpdate: Date.now()
        });
      }
      break;
  }
}

// Update sendPlayerUpdate to include more data
function sendPlayerUpdate(cabeza) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const now = Date.now();
    if (now - lastUpdateTime > UPDATE_INTERVAL) {
      lastUpdateTime = now;
      ws.send(JSON.stringify({
        type: 'update',
        name: nombreJugador,
        position: cabeza,
        snake: snake,
        score: puntaje,
        direction: direction
      }));
    }
  }
}

// Add cleanup of inactive players
function cleanupInactivePlayers() {
  const now = Date.now();
  const timeout = 5000; // Remove players after 5 seconds of inactivity
  
  otherPlayers.forEach((player, name) => {
    if (now - player.lastUpdate > timeout) {
      otherPlayers.delete(name);
    }
  });
}

// Helper function to determine neighborhood based on screen position
function getNeighborhoodFromPosition(x, y) {
  // Simple quadrant check
  if (x < width/2) {
    if (y < height/2) {
      return 'RECOLETA';
    } else {
      return 'COLEGIALES';
    }
  } else {
    if (y < height/2) {
      return 'PALERMO';
    } else {
      return 'CHACARITA';
    }
  }
}

// Add new function to check for collisions
function verificarColisiones() {
  let cabeza = snake[0];
  
  // Skip ALL collision checks during coffee drinking animation
  if (drinkingCoffee) {
    return;
  }

  // Check self collision only when not drinking
  for (let i = 4; i < snake.length; i++) {  // Start from 4 to give more forgiveness
    if (dist(cabeza.x, cabeza.y, snake[i].x, snake[i].y) < SNAKE_SIZE * 0.7) {
      juegoTerminado = true;
      gameOverReason = 'self';
      return;
    }
  }
  
  // Check bache collision
  for (let bache of baches) {
    if (dist(cabeza.x, cabeza.y, bache.x, bache.y) < SNAKE_SIZE * 0.7) {
      juegoTerminado = true;
      gameOverReason = 'bache';
      return;
    }
  }
}

// Add the missing dibujarTablero function
function dibujarTablero() {
  // Draw game elements
  dibujarViborita();
  dibujarCafes();
  dibujarBaches();
  dibujarPuntaje();
  dibujarNombre();
}

// Add the missing dibujarCafes function
function dibujarCafes() {
  // Draw the cafe (coffee)
  dibujarCafe();
}

// Add the missing dibujarPuntaje function
function dibujarPuntaje() {
  // This function is not needed as the score is now displayed in the header UI
}

// Add the missing dibujarNombre function
function dibujarNombre() {
  // This function is not needed as the player name is now displayed in the header UI
}

// P5.js Draw Function - Main game loop
function draw() {
  // Draw space background
  drawSpaceBackground();

  if (ingresandoNombre) {
    drawNombreIngreso();
  } else if (juegoTerminado) {
    drawGameOver();
  } else {
    jugar();
  }
}

// Window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Update star positions for new window size
  for (let star of stars) {
    star.x = random(width);
    star.y = random(height);
  }
}

// New function to set up mobile controls
function setupMobileControls() {
  hasTouchControls = true;
  
  // Set up touch event listeners for mobile control buttons
  let btnUp = document.getElementById('btn-up');
  let btnDown = document.getElementById('btn-down');
  let btnLeft = document.getElementById('btn-left');
  let btnRight = document.getElementById('btn-right');
  
  if (btnUp) {
    btnUp.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (direction.y >= 0 && !ingresandoNombre && !juegoTerminado) {
        direction = {x: 0, y: -MOVE_SPEED};
      }
    });
  }
  
  if (btnDown) {
    btnDown.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (direction.y <= 0 && !ingresandoNombre && !juegoTerminado) {
        direction = {x: 0, y: MOVE_SPEED};
      }
    });
  }
  
  if (btnLeft) {
    btnLeft.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (direction.x >= 0 && !ingresandoNombre && !juegoTerminado) {
        direction = {x: -MOVE_SPEED, y: 0};
      }
    });
  }
  
  if (btnRight) {
    btnRight.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (direction.x <= 0 && !ingresandoNombre && !juegoTerminado) {
        direction = {x: MOVE_SPEED, y: 0};
      }
    });
  }
}

// Add the missing checkSelfCollision function
function checkSelfCollision() {
  // Get the snake's head
  let cabeza = snake[0];
  
  // Check collision with own body (starting from segment 2 to avoid false positives)
  for (let i = 2; i < snake.length; i++) {
    if (dist(cabeza.x, cabeza.y, snake[i].x, snake[i].y) < SNAKE_SIZE * 0.8) {
      return true;
    }
  }
  
  return false;
}

// Add the missing checkBacheCollision function
function checkBacheCollision() {
  // Get the snake's head
  let cabeza = snake[0];
  
  // Check collision with baches (potholes)
  for (let bache of baches) {
    if (dist(cabeza.x, cabeza.y, bache.x, bache.y) < SNAKE_SIZE * 0.8) {
      return true;
    }
  }
  
  return false;
} 