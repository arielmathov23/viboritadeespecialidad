// Snake Bot Implementation
// This bot simulates a player in the multiplayer snake game

class SnakeBot {
  constructor(name = 'SnakeBot') {
    console.log(`Initializing bot: ${name}`);
    this.name = name;
    this.snake = [];
    this.direction = { x: 8, y: 0 }; // Start moving right
    this.score = 0;
    this.color = [255, 87, 51]; // Fixed coral color for visibility
    this.drinkingCoffee = false;
    this.drinkingStartTime = 0;
    this.lastUpdateTime = 0;
    this.coffeeTarget = null;
    this.coffeesToDrink = 0;
    this.currentCoffees = 0;
    this.isPlaying = false;
    this.snakeLength = 5; // Initial snake length
    
    // Initialize snake immediately in constructor
    this.initializeSnake();
    console.log(`Bot ${name} initial state:`, {
      position: this.snake[0],
      direction: this.direction,
      color: this.color
    });
  }

  initializeSnake() {
    // Start in the middle of the screen
    const startX = 300;
    const startY = 300;
    
    this.snake = [];
    for (let i = 0; i < this.snakeLength; i++) {
      this.snake.push({
        x: startX - (i * 20), // Space segments horizontally
        y: startY
      });
    }
    
    console.log(`Bot ${this.name} snake initialized at:`, {
      head: this.snake[0],
      length: this.snake.length
    });
  }

  getRandomColor() {
    // Always return coral color for better visibility
    return [255, 87, 51];
  }

  startPlaying() {
    console.log(`Bot ${this.name} starting to play`);
    this.isPlaying = true;
    this.coffeesToDrink = Math.floor(Math.random() * 7) + 2; // Random number between 2 and 8
    this.currentCoffees = 0;
    this.score = 0;
    
    // Reset snake position
    this.initializeSnake();
    
    // Start update loop
    this.updateBot();
    console.log(`Bot ${this.name} initialized with position:`, this.snake[0]);
  }

  stopPlaying() {
    console.log(`Bot ${this.name} stopping`);
    this.isPlaying = false;
  }

  updateBot() {
    if (!this.isPlaying) return;

    // Check if we need to drink more coffee
    if (this.currentCoffees >= this.coffeesToDrink) {
      console.log(`Bot ${this.name} resetting after drinking ${this.currentCoffees} coffees`);
      this.currentCoffees = 0;
      this.coffeesToDrink = Math.floor(Math.random() * 7) + 2;
      this.score = 0;
      this.initializeSnake();
    }

    // If we're not drinking coffee, move towards the target
    if (!this.drinkingCoffee) {
      if (!this.coffeeTarget) {
        // Generate a new random target position
        this.coffeeTarget = {
          x: Math.random() * 600,
          y: Math.random() * 600
        };
        console.log(`Bot ${this.name} new target:`, this.coffeeTarget);
      }

      // Calculate direction to target
      const dx = this.coffeeTarget.x - this.snake[0].x;
      const dy = this.coffeeTarget.y - this.snake[0].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If we're close enough to the target, simulate drinking coffee
      if (distance < 20) {
        this.drinkingCoffee = true;
        this.drinkingStartTime = Date.now();
        this.coffeeTarget = null;
        this.currentCoffees++;
        this.score++;
        this.snakeLength++; // Grow snake when drinking coffee
        console.log(`Bot ${this.name} drinking coffee #${this.currentCoffees}`);
      } else {
        // Move towards target with smooth direction changes
        const targetDirection = {
          x: (dx / distance) * 8,
          y: (dy / distance) * 8
        };
        
        // Smoothly interpolate current direction towards target direction
        this.direction.x += (targetDirection.x - this.direction.x) * 0.1;
        this.direction.y += (targetDirection.y - this.direction.y) * 0.1;
        
        // Normalize direction vector
        const dirLength = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        if (dirLength > 0) {
          this.direction.x = (this.direction.x / dirLength) * 8;
          this.direction.y = (this.direction.y / dirLength) * 8;
        }
      }
    } else {
      // Check if we're done drinking coffee
      const drinkingDuration = Date.now() - this.drinkingStartTime;
      if (drinkingDuration >= 1000) { // 1 second drinking animation
        this.drinkingCoffee = false;
      }
    }

    // Update snake position
    if (!this.drinkingCoffee) {
      const newHead = {
        x: this.snake[0].x + this.direction.x,
        y: this.snake[0].y + this.direction.y
      };

      // Keep snake within bounds with some margin
      const margin = 40;
      newHead.x = Math.max(margin, Math.min(600 - margin, newHead.x));
      newHead.y = Math.max(margin, Math.min(600 - margin, newHead.y));

      this.snake.unshift(newHead);
      while (this.snake.length > this.snakeLength) {
        this.snake.pop();
      }
    }

    // Schedule next update
    setTimeout(() => this.updateBot(), 50); // Match server update rate (20fps)
  }
}

// Export the SnakeBot class
module.exports = { SnakeBot }; 