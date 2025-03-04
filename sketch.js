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

// Bot variables
let franBot = null;
let botUpdateTime = 0;

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
let spaceTransitionProgress = 0;

// Add new variables for YouTube integration
let isPlaying = true; // Start with music playing
const YOUTUBE_PLAYLIST = [
  "DTZKSgR9aEc", // Original song
  "C2lExkboJnA", // Mi Amigo Invencible
  "qgSGmEUncNE", // Vinocio
  "O8BLUzAxNmQ"  // Nathy Peluso
];

// Start with a random song index
let currentSongIndex = Math.floor(Math.random() * YOUTUBE_PLAYLIST.length);
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_PLAYLIST[currentSongIndex]}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1`;
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
    
    // Remove any existing input fields first to prevent duplication
    let existingInputs = document.querySelectorAll('input:not([data-system-input])');
    existingInputs.forEach(input => {
      if (input.parentNode) {
        input.remove();
      }
    });
    
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
  
  // Initialize Fran bot directly
  console.log("Initializing Fran bot in setup");
  initializeFranBot();
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
  
  // Also check for and remove any other input fields that might have been created
  let allInputs = document.querySelectorAll('input:not([id="mobileNameInput"])');
  allInputs.forEach(input => {
    if (input.parentNode && !input.hasAttribute('data-system-input')) {
      input.remove();
    }
  });
  
  // Create a new input field
  let inputField = document.createElement('input');
  inputField.id = 'mobileNameInput';
  inputField.type = 'text';
  inputField.maxLength = 15;
  inputField.placeholder = 'Tu nombre';
  inputField.style.position = 'fixed'; // Use fixed positioning for better mobile handling
  inputField.style.left = '-1000px'; // Hide it off-screen initially
  inputField.style.top = '0';
  inputField.style.zIndex = '2000'; // Higher z-index to ensure it's above everything
  inputField.style.fontSize = '18px'; // Larger font size for better visibility
  inputField.style.padding = '12px';
  inputField.style.borderRadius = '8px';
  inputField.style.border = '3px solid #4286f4'; // Thicker border for better visibility
  inputField.style.backgroundColor = '#2a3a5a';
  inputField.style.color = 'white';
  inputField.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)'; // Add shadow for better visibility
  inputField.style.outline = 'none'; // Remove default focus outline
  inputField.style.webkitAppearance = 'none'; // Remove default iOS styling
  inputField.style.touchAction = 'manipulation'; // Optimize for touch
  inputField.style.width = '280px'; // Set a fixed width
  inputField.style.height = '45px'; // Set a fixed height
  
  // Add event listeners
  inputField.addEventListener('input', function() {
    textoNombre = this.value.substring(0, 15);
  });
  
  inputField.addEventListener('blur', function() {
    // Hide the input when not in focus, but with a delay to allow for taps
    setTimeout(() => {
      this.style.left = '-1000px';
      this.style.display = 'none'; // Also hide it completely
    }, 300);
  });
  
  // Add to document
  document.body.appendChild(inputField);
  
  // Return the input field for reference
  return inputField;
}

// Show the mobile input field
function showMobileInput(x, y) {
  let inputField = document.getElementById('mobileNameInput');
  if (inputField) {
    // First, hide any system keyboard that might be showing
    if (document.activeElement && document.activeElement !== inputField) {
      document.activeElement.blur();
    }
    
    // Hide any existing HTML input fields that might be showing
    let allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
      if (input.id !== 'mobileNameInput') {
        input.style.display = 'none';
      }
    });
    
    // Calculate position to center the input field - fixed position in the center
    // Adjust for the modal being moved up by 50px
    let centerY = height/2 - 50; // Adjusted center point
    let inputY = centerY + 25; // Updated to match the new position in the modal
    
    let inputWidth = 280;
    let inputHeight = 45;
    
    let leftPos = Math.max(10, Math.min(windowWidth - inputWidth - 10, width/2 - inputWidth/2));
    let topPos = Math.max(10, Math.min(windowHeight - inputHeight - 10, inputY - inputHeight/2));
    
    // Apply styles to make it more visible and easier to tap
    inputField.style.position = 'fixed'; // Use fixed positioning
    inputField.style.left = leftPos + 'px';
    inputField.style.top = topPos + 'px';
    inputField.style.width = inputWidth + 'px';
    inputField.style.height = inputHeight + 'px';
    inputField.style.opacity = '1';
    inputField.style.visibility = 'visible';
    inputField.style.display = 'block';
    inputField.style.zIndex = '2000'; // Ensure it's above everything
    inputField.value = textoNombre;
    
    // Clear any existing focus timeouts to prevent multiple focus attempts
    if (window.inputFocusTimeout) {
      clearTimeout(window.inputFocusTimeout);
    }
    
    // Force focus with a slight delay to ensure it works on all mobile browsers
    window.inputFocusTimeout = setTimeout(function() {
      // Blur any active element first to prevent double input fields
      if (document.activeElement && document.activeElement !== inputField) {
        document.activeElement.blur();
      }
      
      // Now focus our input field
      inputField.focus();
      
      // Some mobile browsers need a click event to show keyboard
      try {
        inputField.click();
      } catch (e) {
        console.log("Click simulation failed, trying alternative focus method");
        // Alternative focus method for problematic browsers
        inputField.readOnly = false;
        inputField.focus();
      }
    }, 100); // Shorter delay since we're already handling cleanup
    
    // Add a one-time blur handler to properly hide the input when done
    inputField.onblur = function onBlurHandler() {
      setTimeout(() => {
        if (document.activeElement !== inputField) {
          inputField.style.left = '-1000px';
          inputField.style.display = 'none';
          // Remove the one-time handler
          inputField.onblur = null;
        }
      }, 300);
    };
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
  
  // Calculate modal dimensions - make it appropriate for mobile
  let modalWidth = isMobile ? min(width * 0.85, 400) : min(550, width * 0.9);
  let modalHeight = isMobile ? min(height * 0.45, 350) : min(480, height * 0.75);
  let inputWidth = modalWidth * 0.8; // Wider input on mobile
  
  // Draw modal background with rounded corners and stronger border
  rectMode(CENTER);
  fill(25, 25, 40, 240);
  strokeWeight(3);
  stroke(100, 100, 200, 200);
  rect(width/2, height/2 - 50, modalWidth, modalHeight, 20); // Move modal up by 50px
  
  // Add a subtle inner glow to the modal
  noFill();
  stroke(100, 100, 200, 50);
  strokeWeight(1);
  rect(width/2, height/2 - 50, modalWidth - 10, modalHeight - 10, 15); // Move modal up by 50px
  
  // Simple, evenly spaced layout - adjusted for mobile
  let centerY = height/2 - 50; // Adjusted center point
  let titleY = centerY - modalHeight * 0.28;
  let subtitleY = titleY + (isMobile ? 45 : 55); // Increased space between title and subtitle
  
  // For mobile, increase space between elements
  let labelY = centerY - (isMobile ? 15 : 30); // Moved up for mobile
  let inputY = centerY + (isMobile ? 25 : 20); // Moved down for mobile
  let buttonY = centerY + (isMobile ? modalHeight * 0.32 : modalHeight * 0.25); // Moved down for mobile
  
  // Draw title with clean, elegant styling - smaller on mobile
  noStroke();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
  fill(255);
  textSize(isMobile ? 22 : 28); // Reduced size for mobile
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text('¡Viborita de Especialidad!', width/2, titleY + (isMobile ? 12 : 20));
  
  // Draw subtitle - appropriate size for mobile
  drawingContext.shadowBlur = 5;
  textSize(isMobile ? 13 : 16);
  textStyle(NORMAL);
  fill(200, 200, 200);
  text('El juego de cafetería en Buenos Aires', width/2, subtitleY);
  
  // Draw input label - appropriate size for mobile
  fill(255);
  textSize(isMobile ? 16 : 18);
  textStyle(NORMAL);
  text('Ingresá tu nombre:', width/2, labelY);
  
  // Draw input box with clean styling - appropriate size for mobile
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(100, 100, 255, 0.3)';
  fill(35, 35, 55);
  stroke('#4286f4');
  strokeWeight(2);
  let inputHeight = isMobile ? 45 : 50;
  rect(width/2, inputY, inputWidth, inputHeight, 10);
  
  // Draw text input content - only if HTML input is not active on mobile
  drawingContext.shadowBlur = 0;
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 20 : 20);
  
  let inputField = document.getElementById('mobileNameInput');
  let isHTMLInputActive = isMobile && inputField && 
    (inputField.style.display === 'block' || document.activeElement === inputField);
  
  // Only draw the input box and cursor if HTML input is not active
  if (!isHTMLInputActive) {
    // Draw input box with clean styling
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'rgba(100, 100, 255, 0.3)';
    fill(35, 35, 55);
    stroke('#4286f4');
    strokeWeight(2);
    let inputHeight = isMobile ? 45 : 50;
    rect(width/2, inputY, inputWidth, inputHeight, 10);
    
    // Draw text with cursor
    drawingContext.shadowBlur = 0;
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(isMobile ? 20 : 20);
    text(textoNombre + (frameCount % 60 < 30 ? '|' : ''), width/2, inputY);
  }
  
  if (isMobile) {
    // More aggressive check for input field visibility
    if (frameCount % 15 === 0) {
      if (inputField && 
          inputField.style.display === 'block' && 
          document.activeElement !== inputField) {
        inputField.style.left = '-1000px';
        inputField.style.display = 'none';
        // Force blur to ensure keyboard is hidden
        inputField.blur();
      }
    }
  }
  
  // Draw start button with clean styling - appropriate size for mobile
  let buttonWidth = modalWidth * 0.7; // Increased from 0.5 to 0.7 for better text fit
  let buttonHeight = isMobile ? 50 : 55;
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
  
  // Button text
  drawingContext.shadowBlur = 0;
  fill(255);
  noStroke();
  textSize(isMobile ? 20 : 20);
  textStyle(BOLD);
  text('JUGAR', width/2, buttonY);
  
  // Add validation message if name is empty
  if (isMobile && textoNombre.length === 0) {
    fill(255, 200, 200);
    textSize(14); // Smaller text
    textStyle(NORMAL);
    text('Por favor, ingresa un nombre para continuar', width/2, buttonY + 35);
  }
  
  // Reset drawing settings
  pop();
  
  // Make sure mobile controls are visible during onboarding
  if (isMobile) {
    let controlsDiv = document.querySelector('.mobile-controls');
    if (controlsDiv) {
      controlsDiv.style.display = 'block';
      controlsDiv.style.zIndex = '50'; // Lower than modal but still visible
    }
  }
}

// Update mousePressed function to handle the mobile input field and fix JUGAR button
function mousePressed() {
  if (ingresandoNombre) {
    let modalWidth = isMobile ? min(width * 0.85, 400) : min(550, width * 0.9);
    let modalHeight = isMobile ? min(height * 0.45, 350) : min(480, height * 0.75);
    let centerY = height/2 - 50; // Adjusted center point
    let inputWidth = modalWidth * 0.8;
    let inputHeight = isMobile ? 45 : 50;
    let inputY = centerY + (isMobile ? 25 : 20); // Updated to match drawNombreIngreso
    let buttonWidth = inputWidth * 0.55;
    let buttonHeight = isMobile ? 45 : 55;
    let buttonY = centerY + (isMobile ? modalHeight * 0.32 : modalHeight * 0.25); // Updated to match drawNombreIngreso
    
    // Check if input field was clicked
    if (isMobile && 
        mouseX > width/2 - inputWidth/2 && 
        mouseX < width/2 + inputWidth/2 && 
        mouseY > inputY - inputHeight/2 && 
        mouseY < inputY + inputHeight/2) {
      
      // Hide any existing visible input fields first
      let allInputs = document.querySelectorAll('input');
      allInputs.forEach(input => {
        if (input.id !== 'mobileNameInput') {
          input.style.display = 'none';
        }
      });
      
      // Blur any active element to prevent keyboard conflicts
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      // Show the mobile input field with a delay to prevent double activation
      setTimeout(() => {
        showMobileInput(width/2, inputY);
      }, 100);
      return;
    }
    
    // Check if button was clicked
    if (mouseX > width/2 - buttonWidth/2 && 
        mouseX < width/2 + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      
      // Only proceed if name is not empty
      if (textoNombre.length > 0) {
        nombreJugador = textoNombre;
        ingresandoNombre = false;
        iniciarJuego();
        
        // Hide the mobile input field
        let inputField = document.getElementById('mobileNameInput');
        if (inputField) {
          inputField.style.left = '-1000px';
          inputField.style.display = 'none';
        }
        
        // Hide any other input fields that might be showing
        let allInputs = document.querySelectorAll('input');
        allInputs.forEach(input => {
          if (input.id !== 'mobileNameInput') {
            input.style.display = 'none';
          }
        });
      } else if (isMobile) {
        // If name is empty on mobile, show the input field
        showMobileInput(width/2, inputY);
      }
    }
  } else if (juegoTerminado) {
    let modalWidth = isMobile ? min(400, width * 0.85) : min(500, width * 0.9);
    let modalHeight = isMobile ? min(350, height * 0.6) : min(400, height * 0.7);
    let centerY = height/2 - 50; // Adjusted center point
    let buttonWidth = modalWidth * 0.5;
    let buttonHeight = isMobile ? 45 : 55;
    let buttonY = centerY + modalHeight * 0.25;
    
    // Check if restart button was clicked
    if (mouseX > width/2 - buttonWidth/2 && 
        mouseX < width/2 + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      reiniciarJuego();
    }
  } else {
    // Check for sound control button click in header
    let headerHeight = isMobile ? 50 : 60;
    let buttonSize = isMobile ? 32 : 40;
    let x = width - (isMobile ? 35 : 45);
    let y = headerHeight/2;
    
    if (dist(mouseX, mouseY, x, y) < buttonSize/2) {
      // Toggle sound on/off
      isPlaying = !isPlaying;
      
      // Toggle YouTube player
      if (isPlaying) {
        if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
          youtubePlayer.playVideo();
        }
      } else {
        if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
          youtubePlayer.pauseVideo();
        }
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
  
  // Initialize Fran bot
  initializeFranBot();
}

// Initialize the Fran bot
function initializeFranBot() {
  console.log("Initializing Fran bot");
  
  // Define minimum snake length
  const minSnakeLength = 5;
  
  franBot = {
    name: "Fran",
    snake: [],
    direction: { x: MOVE_SPEED, y: 0 }, // Use MOVE_SPEED constant for consistency
    score: 0,
    color: [255, 0, 0], // Bright red
    drinkingCoffee: false,
    drinkingStartTime: 0,
    coffeeTarget: null,
    coffeesToDrink: Math.floor(random(2, 9)), // Random number between 2 and 8
    currentCoffees: 0,
    snakeLength: minSnakeLength // Always start with minimum length
  };
  
  // Initialize snake in the middle of the screen
  const startX = 300;
  const startY = 300;
  franBot.snake = [];
  for (let i = 0; i < franBot.snakeLength; i++) {
    franBot.snake.push({
      x: startX - (i * 20), // Space segments horizontally
      y: startY
    });
  }
  
  console.log("Fran bot initialized with snake:", franBot.snake);
  console.log("Bot will be drawn at position:", franBot.snake[0]);
  
  // Set initial bot update time
  botUpdateTime = millis();
}

// Update the Fran bot
function updateFranBot() {
  if (!franBot) return;
  
  // Check if we need to drink more coffee
  if (franBot.currentCoffees >= franBot.coffeesToDrink) {
    console.log(`Bot Fran resetting after drinking ${franBot.currentCoffees} coffees`);
    franBot.currentCoffees = 0;
    franBot.coffeesToDrink = Math.floor(random(2, 9));
    franBot.score = 0;
    franBot.snakeLength = 5; // Reset to minimum size
    
    // Reset snake position
    const startX = 300;
    const startY = 300;
    franBot.snake = [];
    for (let i = 0; i < franBot.snakeLength; i++) {
      franBot.snake.push({
        x: startX - (i * 20),
        y: startY
      });
    }
    franBot.direction = { x: MOVE_SPEED, y: 0 }; // Start moving right
  }

  // If we're not drinking coffee, move towards the target
  if (!franBot.drinkingCoffee) {
    if (!franBot.coffeeTarget) {
      // Generate a new random target position
      franBot.coffeeTarget = {
        x: random(40, 560),
        y: random(40, 560)
      };
    }

    // Calculate direction to target
    const dx = franBot.coffeeTarget.x - franBot.snake[0].x;
    const dy = franBot.coffeeTarget.y - franBot.snake[0].y;
    const distance = dist(franBot.snake[0].x, franBot.snake[0].y, franBot.coffeeTarget.x, franBot.coffeeTarget.y);

    // If we're close enough to the target, simulate drinking coffee
    if (distance < 20) {
      franBot.drinkingCoffee = true;
      franBot.drinkingStartTime = millis();
      franBot.coffeeTarget = null;
      franBot.currentCoffees++;
      franBot.score++;
      franBot.snakeLength++; // Grow snake when drinking coffee
    } else {
      // Decide which direction to move based on the target position
      // Only move in one of the four cardinal directions (up, down, left, right)
      
      // Determine if we should move horizontally or vertically
      // If we're more off horizontally than vertically, move horizontally first
      if (abs(dx) > abs(dy)) {
        // Move horizontally
        if (dx > 0) {
          // Move right
          franBot.direction = { x: MOVE_SPEED, y: 0 };
        } else {
          // Move left
          franBot.direction = { x: -MOVE_SPEED, y: 0 };
        }
      } else {
        // Move vertically
        if (dy > 0) {
          // Move down
          franBot.direction = { x: 0, y: MOVE_SPEED };
        } else {
          // Move up
          franBot.direction = { x: 0, y: -MOVE_SPEED };
        }
      }
      
      // Occasionally change direction randomly to make movement less predictable
      if (random() < 0.02) { // 2% chance each frame to change direction
        const directions = [
          { x: MOVE_SPEED, y: 0 },   // right
          { x: -MOVE_SPEED, y: 0 },  // left
          { x: 0, y: MOVE_SPEED },   // down
          { x: 0, y: -MOVE_SPEED }   // up
        ];
        franBot.direction = directions[Math.floor(random(directions.length))];
      }
    }
  } else {
    // Check if we're done drinking coffee
    const drinkingDuration = millis() - franBot.drinkingStartTime;
    if (drinkingDuration >= 1000) { // 1 second drinking animation
      franBot.drinkingCoffee = false;
    }
  }

  // Update snake position
  if (!franBot.drinkingCoffee) {
    const newHead = {
      x: franBot.snake[0].x + franBot.direction.x,
      y: franBot.snake[0].y + franBot.direction.y
    };

    // Keep snake within bounds with some margin
    const margin = 40;
    newHead.x = constrain(newHead.x, margin, width - margin);
    newHead.y = constrain(newHead.y, margin, height - margin);

    franBot.snake.unshift(newHead);
    while (franBot.snake.length > franBot.snakeLength) {
      franBot.snake.pop();
    }
  }
}

// Draw the viborita on the canvas
function dibujarViborita() {
  // Draw Fran bot if it exists
  console.log("Drawing viborita, franBot:", franBot ? "exists" : "null");
  if (franBot) {
    console.log("Bot snake:", franBot.snake ? `length ${franBot.snake.length}` : "null");
  }
  
  if (franBot && franBot.snake && franBot.snake.length > 0) {
    console.log("Drawing Fran bot at position:", franBot.snake[0]);
    noStroke();
    
    // Draw body segments
    for (let i = franBot.snake.length - 1; i > 0; i--) {
      let segmento = franBot.snake[i];
      let alpha = map(i, 0, franBot.snake.length - 1, 255, 150);
      fill(franBot.color[0], franBot.color[1], franBot.color[2], alpha);
      rect(segmento.x, segmento.y, SNAKE_SIZE, SNAKE_SIZE, 5);
    }
    
    // Draw head with player name
    let cabeza = franBot.snake[0];
    fill(franBot.color[0], franBot.color[1], franBot.color[2]);
    rect(cabeza.x, cabeza.y, SNAKE_SIZE, SNAKE_SIZE, 8);
    
    // Draw player name above head
    fill(255);
    textSize(14);
    textAlign(CENTER, BOTTOM);
    text(franBot.name, cabeza.x, cabeza.y - SNAKE_SIZE);
    
    // Draw drinking animation if applicable
    if (franBot.drinkingCoffee) {
      const progress = (millis() - franBot.drinkingStartTime) / 1000; // 0 to 1 over 1 second
      drawCoffeeEffect(cabeza.x, cabeza.y, progress);
    }
  } else {
    // If bot doesn't exist or is invalid, reinitialize it
    console.log("Bot is invalid, reinitializing...");
    initializeFranBot();
  }
  
  // Draw other players' snakes
  console.log('Drawing other players:', Array.from(otherPlayers.keys()));
  
  otherPlayers.forEach((player, playerName) => {
    console.log('Drawing player:', playerName, player);
    if (player.snake && player.snake.length > 0) {
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
    } else {
      console.log('Player has no snake or empty snake:', playerName);
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
      // Add a small delay before collision detection resumes
      // This prevents false collisions right after drinking coffee
      setTimeout(() => {
        // This empty callback ensures the timeout completes
      }, 100);
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
      
      // Draw coffee effect at the last coffee position
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

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// YouTube API callbacks
function onPlayerReady(event) {
  event.target.playVideo();
  isPlaying = true;
}

function onPlayerStateChange(event) {
  // If video ends, play the next song in the playlist
  if (event.data === YT.PlayerState.ENDED) {
    // Move to next song, wrapping around to beginning if needed
    currentSongIndex = (currentSongIndex + 1) % YOUTUBE_PLAYLIST.length;
    if (youtubePlayer && typeof youtubePlayer.loadVideoById === 'function') {
      youtubePlayer.loadVideoById(YOUTUBE_PLAYLIST[currentSongIndex]);
    }
  }
}

// Main game loop function
function jugar() {
  push();
  
  // Draw the header UI
  drawGameUI();
  
  // Translate everything below the header - adjusted for mobile
  let headerHeight = isMobile ? 50 : 60;
  translate(0, headerHeight);
  
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
  // Header dimensions - smaller on mobile
  let headerHeight = isMobile ? 50 : 60;
  
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
  
  if (isMobile) {
    // Mobile layout - simplified header
    
    // Neighborhood name with glow - centered
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'rgba(100, 200, 255, 0.5)';
    fill(255);
    textSize(18);
    textStyle(BOLD);
    text(currentNeighborhood, width/2, headerHeight/2);
    drawingContext.shadowBlur = 0;
    
    // Player name - left
    textAlign(LEFT, CENTER);
    fill(255);
    textSize(16);
    textStyle(BOLD);
    text(nombreJugador, 15, headerHeight/2);
    
    // Score - right
    textAlign(RIGHT, CENTER);
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = 'rgba(255, 255, 220, 0.3)';
    fill(255, 255, 220);
    textSize(18);
    textStyle(BOLD);
    text(puntaje, width - 80, headerHeight/2);
    drawingContext.shadowBlur = 0;
  } else {
    // Desktop layout - full header
    
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
  }
  
  // Draw sound control in header (changed from YouTube control)
  let buttonSize = isMobile ? 32 : 40;
  let x = width - (isMobile ? 35 : 45);
  let y = headerHeight/2;
  
  // Check if mouse is over button
  let mouseOverButton = dist(mouseX, mouseY, x, y) < buttonSize/2;
  
  // Draw button circle
  noFill();
  stroke(100, 150, 255, mouseOverButton ? 180 : 120);
  strokeWeight(2);
  ellipse(x, y, buttonSize, buttonSize);
  
  // Draw sound icon
  noStroke();
  fill(255, mouseOverButton ? 255 : 200);
  
  // Draw speaker icon
  let iconSize = buttonSize * 0.5;
  let speakerX = x - iconSize/4;
  let speakerY = y;
  
  // Speaker base
  rect(speakerX - iconSize/4, speakerY, iconSize/3, iconSize/2);
  
  // Speaker cone
  beginShape();
  vertex(speakerX - iconSize/4, speakerY);
  vertex(speakerX + iconSize/4, speakerY - iconSize/3);
  vertex(speakerX + iconSize/4, speakerY + iconSize/3);
  vertex(speakerX - iconSize/4, speakerY);
  endShape();
  
  // Sound waves (if playing)
  if (isPlaying) {
    noFill();
    stroke(255, mouseOverButton ? 255 : 200);
    strokeWeight(2);
    let waveSize = iconSize * 0.4;
    arc(speakerX + iconSize/4, speakerY, waveSize, waveSize, -PI/3, PI/3);
    arc(speakerX + iconSize/4, speakerY, waveSize * 1.5, waveSize * 1.5, -PI/3, PI/3);
  } else {
    // X mark when muted
    stroke(255, mouseOverButton ? 255 : 200);
    strokeWeight(2);
    let xSize = iconSize * 0.3;
    line(x + xSize, y - xSize, x + xSize * 2, y + xSize);
    line(x + xSize * 2, y - xSize, x + xSize, y + xSize);
  }
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
  console.log('Received WebSocket message:', data);
  
  switch(data.type) {
    case 'gameState':
      console.log('Game state received with players:', data.players);
      otherPlayers.clear();
      data.players.forEach(player => {
        if (player.name !== nombreJugador) {
          console.log('Adding other player to map:', player);
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
        console.log('Received update for player:', data.name);
        const existingPlayer = otherPlayers.get(data.name);
        if (existingPlayer) {
          otherPlayers.set(data.name, {
            ...existingPlayer,
            snake: data.snake,
            position: data.position,
            score: data.score,
            lastUpdate: Date.now()
          });
        } else {
          console.log('Adding new player from update:', data.name);
          otherPlayers.set(data.name, {
            name: data.name,
            snake: data.snake,
            position: data.position,
            color: data.color || [255, 87, 51], // Default to coral if no color
            score: data.score || 0,
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

// Add the missing drawGameOver function
function drawGameOver() {
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
  
  // Calculate modal dimensions
  let modalWidth = isMobile ? min(400, width * 0.85) : min(500, width * 0.9);
  let modalHeight = isMobile ? min(350, height * 0.6) : min(400, height * 0.7);
  
  // Draw modal background with rounded corners and stronger border
  rectMode(CENTER);
  fill(25, 25, 40, 240);
  strokeWeight(3);
  stroke(200, 70, 70, 200);
  rect(width/2, height/2 - 50, modalWidth, modalHeight, 20); // Move modal up by 50px
  
  // Add a subtle inner glow to the modal
  noFill();
  stroke(200, 70, 70, 50);
  strokeWeight(1);
  rect(width/2, height/2 - 50, modalWidth - 10, modalHeight - 10, 15); // Move modal up by 50px
  
  // Simple, evenly spaced layout
  let centerY = height/2 - 50; // Adjusted center point
  let titleY = centerY - modalHeight * 0.3;
  let reasonY = titleY + (isMobile ? 50 : 70);
  let scoreY = reasonY + (isMobile ? 50 : 70);
  let buttonY = centerY + modalHeight * 0.25;
  
  // Game Over text with glow effect
  noStroke();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 100, 100, 0.5)';
  textAlign(CENTER, CENTER);
  textSize(isMobile ? 32 : 38);
  textStyle(BOLD);
  fill(255);
  text('¡GAME OVER!', width/2, titleY);
  
  // Game over reason with icon
  drawingContext.shadowBlur = 0;
  textSize(isMobile ? 18 : 22);
  fill(220, 220, 220);
  textStyle(NORMAL);
  
  if (colisionJugador) {
    text(`¡Chocaste con ${colisionJugador}!`, width/2, reasonY);
  } else {
    switch(gameOverReason) {
      case 'border':
        text('¡Te saliste del mapa!', width/2, reasonY);
        break;
      case 'self':
        text('¡Te chocaste con vos mismo!', width/2, reasonY);
        break;
      case 'bache':
        text('¡Caíste en un bache!', width/2, reasonY);
        break;
    }
  }
  
  // Score display with enhanced styling
  textSize(isMobile ? 16 : 18);
  fill(180, 180, 180);
  text('PUNTAJE FINAL', width/2, scoreY - 20);
  
  textSize(isMobile ? 36 : 42);
  textStyle(BOLD);
  fill(255, 255, 220);
  text(puntaje, width/2, scoreY + 15);
  
  // Restart button with hover effect
  let buttonWidth = modalWidth * 0.5; // Same width for both mobile and desktop
  let buttonHeight = isMobile ? 45 : 55;
  
  // Check if mouse is over button
  let mouseOverButton = mouseX > width/2 - buttonWidth/2 &&
                       mouseX < width/2 + buttonWidth/2 &&
                       mouseY > buttonY - buttonHeight/2 &&
                       mouseY < buttonY + buttonHeight/2;
  
  // Button shadow and glow
  drawingContext.shadowBlur = mouseOverButton ? 15 : 10;
  drawingContext.shadowColor = 'rgba(50, 120, 200, 0.4)';
  
  // Button with clean styling
  fill(mouseOverButton ? '#4286f4' : '#2a5298');
  stroke(100, 100, 200);
  strokeWeight(2);
  rect(width/2, buttonY, buttonWidth, buttonHeight, 10);
  
  // Button text
  drawingContext.shadowBlur = 0;
  fill(255);
  noStroke();
  textSize(isMobile ? 18 : 20);
  textStyle(BOLD);
  text('JUGAR DE NUEVO', width/2, buttonY);
  
  // Add different instructions for mobile vs desktop
  textSize(isMobile ? 14 : 16);
  textStyle(NORMAL);
  fill(150, 150, 150);
  if (isMobile) {
    text('Toca el botón para jugar de nuevo', width/2, buttonY + 35);
  } else {
    text('Presioná ENTER para jugar de nuevo', width/2, buttonY + 45);
  }
  
  // Make sure mobile controls are visible during game over
  if (isMobile) {
    let controlsDiv = document.querySelector('.mobile-controls');
    if (controlsDiv) {
      controlsDiv.style.display = 'block';
      controlsDiv.style.zIndex = '50'; // Lower than modal but still visible
    }
  }
  
  // Reset drawing settings
  pop();
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
  
  // Update Fran bot at a fixed interval
  if (millis() - botUpdateTime > 50) { // 20fps update rate
    console.log("Updating Fran bot, current state:", franBot ? "exists" : "null");
    if (franBot) {
      console.log("Bot position:", franBot.snake[0]);
    }
    updateFranBot();
    botUpdateTime = millis();
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
  
  // Check collision with own body (starting from segment 3 to avoid false positives)
  // Increased from segment 2 to segment 3 to prevent false collisions after drinking coffee
  for (let i = 3; i < snake.length; i++) {
    // Reduced collision threshold from 0.8 to 0.7 for more accurate detection
    if (dist(cabeza.x, cabeza.y, snake[i].x, snake[i].y) < SNAKE_SIZE * 0.7) {
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

// Move the viborita based on current direction
function moverViborita() {
  // Calculate new head position
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
    
    // Much more aggressive speed increase logic:
    // 1. Use a significantly higher multiplier (1.12 instead of 1.08) for much faster speed increase
    // 2. Higher cap (30 instead of 25) to allow for even faster maximum speed
    // 3. Add larger bonus speed for milestone achievements
    // 4. Add direct speed increase for each coffee
    
    // Base speed calculation with higher multiplier
    velocidadActual = min(velocidadInicial * Math.pow(1.12, puntaje), 30);
    
    // Add direct speed increase for each coffee
    velocidadActual += 0.5; // Add 0.5 to speed for EVERY coffee
    
    // Add larger bonus speed at milestone points
    if (puntaje % 5 === 0) {
      velocidadActual += 2; // Bigger speed boost every 5 coffees (2 instead of 1)
    }
    
    // Add even larger boost at major milestones
    if (puntaje % 10 === 0) {
      velocidadActual += 3; // Major speed boost every 10 coffees
    }
    
    // Apply the new speed
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
  
  // Reinitialize the Fran bot to ensure it's at minimum size
  initializeFranBot();
} 