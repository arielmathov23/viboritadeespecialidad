The following steps break down the project into structured tasks, creating a roadmap for the AI Agent to execute the code while staying aligned with the overall development flow.

### Step 1: Set Up the Project
Create a folder named viborita_indie_ba_web.
Inside it, create two files:
index.html:

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Viborita Indie BA</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #333;
            font-family: 'Montserrat', sans-serif;
        }
        canvas {
            display: block;
            border: 2px solid white;
        }
    </style>
</head>
<body>
    <script src="sketch.js"></script>
</body>
</html>
sketch.js: The main game script (detailed below).

### Step 2: Define Constants in sketch.js
Add constants at the top of sketch.js:

const TAMANIO_CUADRA = 30;
const GRILLA_ANCHO = 20;
const GRILLA_ALTO = 20;
const VENTANA_ANCHO = TAMANIO_CUADRA * GRILLA_ANCHO; // 600
const VENTANA_ALTO = TAMANIO_CUADRA * GRILLA_ALTO;   // 600
const COLOR_RECOLETA = [245, 245, 245];
const COLOR_PALERMO = [220, 237, 220];
const COLOR_COLEGIALES = [220, 230, 240];
const COLOR_CHACARITA = [240, 230, 220];
const COLOR_VIBORITA = [50, 168, 82];
const COLOR_CAFE = [255, 255, 255];
const COLOR_BACHE = [80, 80, 80];
const COLOR_UI = [65, 105, 225];
const COLOR_MODAL_BG = [0, 0, 0, 180];
const COLOR_BUTTON = [65, 105, 225];
const COLOR_BUTTON_HOVER = [100, 149, 237];

### Step 3: Initialize Game Variables
Add global variables in sketch.js:

let viborita = [];
let direccion;
let cafe;
let baches = [];
let puntaje = 0;
let nombreJugador = "";
let ingresandoNombre = true;
let textoNombre = "";
let juegoTerminado = false;
let velocidadInicial = 6; // Slower initial speed
let velocidadActual = velocidadInicial;

### Step 4: Implement Setup and Draw Functions
Set up the canvas and main game loop:

function setup() {
  createCanvas(VENTANA_ANCHO, VENTANA_ALTO);
  frameRate(velocidadInicial);
  textFont('Montserrat');
  rectMode(CENTER);
  ellipseMode(CENTER);
}

function draw() {
  if (ingresandoNombre) {
    dibujarModalNombre();
  } else if (juegoTerminado) {
    dibujarModalFinJuego();
  } else {
    jugar();
  }
}

### Step 5: Implement the "Ingresá tu Nombre" Modal with Modern UI
Create a stylish welcome screen:

function dibujarModalNombre() {
  background(20);
  
  // Modal background
  fill(COLOR_MODAL_BG);
  rect(width/2, height/2, 400, 250);
  
  // Title and subtitle
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("VIBORITA INDIE BA", width/2, height/2 - 80);
  
  textSize(16);
  textStyle(NORMAL);
  text("Una aventura por los barrios porteños", width/2, height/2 - 50);
  
  // Input field and text
  fill(40);
  rect(width/2, height/2, 300, 40);
  
  fill(255);
  textSize(18);
  text(textoNombre + (frameCount % 30 < 15 ? "|" : ""), width/2, height/2);
  
  // Button and instructions
  if (textoNombre.length > 0) {
    let buttonX = width/2;
    let buttonY = height/2 + 60;
    let buttonWidth = 200;
    let buttonHeight = 40;
    
    fill(mouseX > buttonX - buttonWidth/2 && 
         mouseX < buttonX + buttonWidth/2 && 
         mouseY > buttonY - buttonHeight/2 && 
         mouseY < buttonY + buttonHeight/2 ? 
         COLOR_BUTTON_HOVER : COLOR_BUTTON);
    rect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    fill(255);
    textSize(16);
    text("COMENZAR", buttonX, buttonY);
  }
}

### Step 6: Implement Mouse Interaction
Add mouse click handling for buttons:

function mousePressed() {
  if (ingresandoNombre && textoNombre.length > 0) {
    let buttonX = width/2;
    let buttonY = height/2 + 60;
    let buttonWidth = 200;
    let buttonHeight = 40;
    
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
    let buttonY = height/2 + 60;
    let buttonWidth = 200;
    let buttonHeight = 40;
    
    if (mouseX > buttonX - buttonWidth/2 && 
        mouseX < buttonX + buttonWidth/2 && 
        mouseY > buttonY - buttonHeight/2 && 
        mouseY < buttonY + buttonHeight/2) {
      reiniciarJuego();
    }
  }
}

### Step 7: Enhance Keyboard Input
Improve keyboard handling with direction constraints and game restart:

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
    // Prevent 180-degree turns
    if (keyCode === UP_ARROW && direccion.y !== 1) direccion = {x: 0, y: -1};
    else if (keyCode === DOWN_ARROW && direccion.y !== -1) direccion = {x: 0, y: 1};
    else if (keyCode === LEFT_ARROW && direccion.x !== 1) direccion = {x: -1, y: 0};
    else if (keyCode === RIGHT_ARROW && direccion.x !== -1) direccion = {x: 1, y: 0};
  }
}

### Step 8: Start and Restart Game Functions
Implement game initialization and restart:

function iniciarJuego() {
  viborita = [{x: 10, y: 10}];
  direccion = {x: 1, y: 0};
  baches = [];
  cafe = generarCafe();
  for (let i = 0; i < 5; i++) {
    baches.push(generarBache());
  }
  puntaje = 0;
  juegoTerminado = false;
  velocidadActual = velocidadInicial;
  frameRate(velocidadActual);
  loop();
}

function reiniciarJuego() {
  iniciarJuego();
}

### Step 9: Draw the "Mapa de Barrios" with Modern Styling
Enhance the map with grid lines and labels:

function dibujarMapaBarrios() {
  background(30);
  
  // Draw grid lines
  stroke(50);
  strokeWeight(1);
  for (let i = 0; i <= GRILLA_ANCHO; i++) {
    line(i * TAMANIO_CUADRA, 0, i * TAMANIO_CUADRA, VENTANA_ALTO);
  }
  for (let i = 0; i <= GRILLA_ALTO; i++) {
    line(0, i * TAMANIO_CUADRA, VENTANA_ANCHO, i * TAMANIO_CUADRA);
  }
  
  // Draw neighborhoods with centered rectangles
  noStroke();
  fill(COLOR_RECOLETA);
  rect(150, 150, 300, 300);
  fill(COLOR_PALERMO);
  rect(450, 150, 300, 300);
  fill(COLOR_COLEGIALES);
  rect(150, 450, 300, 300);
  fill(COLOR_CHACARITA);
  rect(450, 450, 300, 300);
  
  // Neighborhood labels
  fill(80);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("RECOLETA", 150, 30);
  text("PALERMO", 450, 30);
  text("COLEGIALES", 150, 570);
  text("CHACARITA", 450, 570);
}

### Step 10: Implement Enhanced "Viborita" Logic
Improve the snake with gradient body segments and eyes:

function moverViborita() {
  let cabeza = {x: viborita[0].x + direccion.x, y: viborita[0].y + direccion.y};
  viborita.unshift(cabeza);
  if (cabeza.x === cafe.x && cabeza.y === cafe.y) {
    puntaje++;
    cafe = generarCafe();
    
    // Increase speed slightly with each café collected
    if (velocidadActual < 12) {
      velocidadActual += 0.2;
      frameRate(velocidadActual);
    }
  } else {
    viborita.pop();
  }
}

function dibujarViborita() {
  noStroke();
  
  // Draw body segments with gradient
  for (let i = viborita.length - 1; i > 0; i--) {
    let segmento = viborita[i];
    let alpha = map(i, 0, viborita.length - 1, 255, 150);
    fill(COLOR_VIBORITA[0], COLOR_VIBORITA[1], COLOR_VIBORITA[2], alpha);
    
    let x = segmento.x * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
    let y = segmento.y * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
    let size = map(i, 0, viborita.length - 1, TAMANIO_CUADRA - 2, TAMANIO_CUADRA - 8);
    
    rect(x, y, size, size, 4);
  }
  
  // Draw head with eyes
  let cabeza = viborita[0];
  fill(COLOR_VIBORITA);
  let x = cabeza.x * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
  let y = cabeza.y * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
  rect(x, y, TAMANIO_CUADRA - 2, TAMANIO_CUADRA - 2, 6);
  
  // Draw eyes that look in direction of movement
  fill(255);
  let eyeOffsetX = direccion.x * 5;
  let eyeOffsetY = direccion.y * 5;
  ellipse(x - 5 + eyeOffsetX, y - 5 + eyeOffsetY, 4, 4);
  ellipse(x + 5 + eyeOffsetX, y - 5 + eyeOffsetY, 4, 4);
}

### Step 11: Implement Stylized "Café" and "Bache" Graphics
Add visual details to game elements:

function dibujarCafe() {
  fill(COLOR_CAFE);
  noStroke();
  let x = cafe.x * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
  let y = cafe.y * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
  
  // Coffee cup
  rect(x, y, TAMANIO_CUADRA - 10, TAMANIO_CUADRA - 10, 4);
  
  // Steam
  stroke(255, 150);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(x - 5, y - 10);
  vertex(x - 3, y - 15);
  vertex(x, y - 12);
  endShape();
  
  beginShape();
  vertex(x + 5, y - 10);
  vertex(x + 3, y - 15);
  vertex(x, y - 12);
  endShape();
}

function dibujarBaches() {
  noStroke();
  for (let bache of baches) {
    fill(COLOR_BACHE);
    let x = bache.x * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
    let y = bache.y * TAMANIO_CUADRA + TAMANIO_CUADRA/2;
    
    ellipse(x, y, TAMANIO_CUADRA - 6, TAMANIO_CUADRA - 6);
    
    // Add texture to the pothole
    fill(60);
    ellipse(x - 3, y - 3, 5, 5);
    ellipse(x + 4, y + 2, 4, 4);
  }
}

### Step 12: Implement Game Over Modal
Add a stylish game over screen with restart option:

function dibujarModalFinJuego() {
  // Semi-transparent overlay
  fill(COLOR_MODAL_BG);
  rect(width/2, height/2, width, height);
  
  // Modal background
  fill(30);
  rect(width/2, height/2, 400, 250);
  
  // Game over text and stats
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text("¡FIN DEL JUEGO, CHE!", width/2, height/2 - 60);
  
  textSize(18);
  textStyle(NORMAL);
  text(`Puntaje final: ${puntaje}`, width/2, height/2 - 20);
  text(`Jugador: ${nombreJugador}`, width/2, height/2 + 10);
  
  // Restart button
  let buttonX = width/2;
  let buttonY = height/2 + 60;
  let buttonWidth = 200;
  let buttonHeight = 40;
  
  fill(mouseX > buttonX - buttonWidth/2 && 
       mouseX < buttonX + buttonWidth/2 && 
       mouseY > buttonY - buttonHeight/2 && 
       mouseY < buttonY + buttonHeight/2 ? 
       COLOR_BUTTON_HOVER : COLOR_BUTTON);
  rect(buttonX, buttonY, buttonWidth, buttonHeight);
  
  fill(255);
  textSize(16);
  text("JUGAR DE NUEVO", buttonX, buttonY);
}

### Step 13: Main Game Loop and Enhanced UI
Implement the main game loop with modern UI elements:

function jugar() {
  dibujarMapaBarrios();
  moverViborita();
  
  let cabeza = viborita[0];
  if (cabeza.x < 0 || cabeza.x >= GRILLA_ANCHO || cabeza.y < 0 || cabeza.y >= GRILLA_ALTO ||
      viborita.slice(1).some(seg => seg.x === cabeza.x && seg.y === cabeza.y) ||
      baches.some(b => b.x === cabeza.x && b.y === cabeza.y)) {
    juegoTerminado = true;
    return;
  }
  
  dibujarBaches();
  dibujarCafe();
  dibujarViborita();
  
  // Draw UI panel
  fill(20, 20, 20, 200);
  rect(width/2, 20, width - 20, 40);
  
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`${nombreJugador}`, 20, 20);
  
  textAlign(RIGHT, CENTER);
  text(`Puntaje: ${puntaje}`, width - 20, 20);
}

### Step 14: Run the Node.js Server
Start the Express server to run the game:

```bash
npm run dev
```

Access the game at http://localhost:3005