# Implementation Guide and Plan for "Viborita Indie BA" (Web Version)

This document includes the **Implementation Guide** for developing "Viborita Indie BA," a snake-like game set in Buenos Aires, Argentina, designed to run in a web browser using P5.js. The guide provides general conditions for the AI to understand how to work, while the plan offers a structured roadmap for implementation.

---

## Implementation Guide

### Tech Stack
- Use **HTML5** for structure, **JavaScript** for logic, and **P5.js** for game rendering and interaction.
- **Node.js** and **Express** for the server-side implementation.
- No external dependencies beyond the P5.js library (loaded via CDN) and Express for the server.

### Project Setup
- The project is set up as a Node.js application with Express serving the static files.
- To run the project:
  1. Install dependencies: `npm install`
  2. Start the development server: `npm run dev`
  3. Access the game at http://localhost:3005

### Naming Conventions
- All variable and function names must be in **Argentine Spanish** to reflect the local flavor. Examples:
  - `"viborita"` instead of `"snake"`.
  - `"café"` instead of `"coffee"`.
  - `"bache"` for potholes.
- Use camelCase for variables and functions (e.g., `dibujarMapa`, `posicionesOcupadas`).

### Code Structure
- Use a single `sketch.js` file with P5.js functions:
  - `setup()`: Initialize the game canvas, viborita, cafés, and baches.
  - `draw()`: Main game loop to render and update the game state.
  - Helper functions for game logic (e.g., `moverViborita`, `generarCafé`).
- Store the viborita's body as an array of position objects (e.g., `{x: 10, y: 10}`).
- Server-side code is in `server.js` which serves the static files.

### User Input
- Implement a modal at startup within the P5.js canvas to capture the player's name using `keyPressed()` and a text input state.
- Allow keyboard input for the name, confirming with Enter ("Enter" key).

### UI Guidelines
- The game map is a **20x20 grid** (600x600 pixels, 30px per cell) representing Buenos Aires neighborhoods ("barrios"):
  - Recoleta: Light gray (`fill(200, 200, 200)`).
  - Palermo: Light green (`fill(144, 238, 144)`).
  - Colegiales: Light blue (`fill(173, 216, 230)`).
  - Chacarita: Light orange (`fill(255, 160, 122)`).
- Use **celeste** (`fill(135, 206, 235)`) and white (`fill(255, 255, 255)`) for UI elements (e.g., score) to reflect the Argentine flag.

### Data Source: Cafés from Google Maps
- **Initial Approach**: Café positions are randomly generated within the 20x20 grid. Each café is assigned to one of four predefined "barrios".
- **Future Enhancement**: Implement a backend API to fetch real café locations from a database.

### General Behavior
- The viborita moves continuously in one of four directions (up, down, left, right) based on arrow key input.
- Eating a café increases the viborita's length and spawns a new café in a random, unoccupied spot.
- End game: The game ends if the viborita hits the grid boundaries, itself, or a bache.

### Future Enhancements
- Add a high score system using the Express backend to store scores in a database.
- Implement user authentication to track individual player progress.
- Add sound effects and background music for a more immersive experience.