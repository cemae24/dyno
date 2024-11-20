// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const speedControl = document.getElementById('speed');
const densityControl = document.getElementById('density');
const startButton = document.getElementById('startButton');
const jumpButton = document.getElementById('jumpButton');
const exitButton = document.getElementById('exitButton'); // Exit Button

let gameSpeed = parseInt(speedControl.value);
let obstacleDensity = parseInt(densityControl.value);

// Initialize obstacleInterval based on initial density
let obstacleInterval = 2000 / obstacleDensity; // Adjusted for slower speed

// Variables for Long Jump
let spacePressed = false;
let jumpStartTime = 0;
const maxJumpDuration = 1000; // Maximum duration in milliseconds
const minJumpDuration = 200;  // Minimum duration in milliseconds
let currentJumpDuration = 0;

// Preload obstacle types with varying heights
const obstacleTypes = [
    { width: 20, height: 20 }, // Standard obstacle
    { width: 20, height: 30 }, // Taller obstacle requiring long jump
    { width: 20, height: 25 }, // Medium obstacle
    { width: 20, height: 35 }, // Very tall obstacle
    // Add more types as needed
];

// Handle Jump Button Click
jumpButton.addEventListener('click', () => {
    if (dino.onGround) {
        initiateJump();
    }
});

// Handle Exit Button Click
exitButton.addEventListener('click', exitGame);

// Handle Speed Control
speedControl.addEventListener('input', () => {
    gameSpeed = parseInt(speedControl.value);
    // Recalculate obstacleInterval based on density
    obstacleInterval = 2000 / obstacleDensity;
});

// Handle Density Control
densityControl.addEventListener('input', () => {
    obstacleDensity = parseInt(densityControl.value);
    obstacleInterval = 2000 / obstacleDensity;
});

// Handle Start Button Click
startButton.addEventListener('click', startGame);

// Dino Object
let dino = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    dy: 0,
    gravity: 0.5,          // Fixed gravity
    baseJumpStrength: -10, // Base jump strength
    maxJumpStrength: -15,  // Maximum jump strength
    onGround: true
};

// Obstacles Array
let obstacles = [];
let obstacleTimer = 0;
let gameOver = false;

// Start Game Function
function startGame() {
    // Retrieve the current values from the sliders
    gameSpeed = parseInt(speedControl.value);
    obstacleDensity = parseInt(densityControl.value);

    // Recalculate obstacleInterval based on the current density
    obstacleInterval = 2000 / obstacleDensity; // Adjust as needed for game balance

    // Reset game state
    obstacles = [];
    obstacleTimer = 0;
    gameOver = false;
    dino.y = 150;
    dino.dy = 0;
    dino.onGround = true;

    // Reset jump variables
    spacePressed = false;
    jumpStartTime = 0;
    currentJumpDuration = 0;

    // Disable controls during the game
    speedControl.disabled = true;
    densityControl.disabled = true;
    startButton.disabled = true;
    exitButton.disabled = false; // Enable Exit button during the game

    // Clear any existing messages
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Start the game loop
    requestAnimationFrame(update);
}

// Exit Game Function
function exitGame() {
    // Stop the game loop by setting gameOver to true
    gameOver = true;

    // Re-enable controls after exiting the game
    speedControl.disabled = false;
    densityControl.disabled = false;
    startButton.disabled = false;
    exitButton.disabled = true; // Disable Exit button when not in game

    // Clear the canvas and display an exit message
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Exited', canvas.width / 2, canvas.height / 2);
}

// Handle Keydown Event for Space Bar
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent default behavior like scrolling
        if (!spacePressed && dino.onGround) {
            spacePressed = true;
            jumpStartTime = Date.now();
            initiateJump();
        }
    }
});

// Handle Keyup Event for Space Bar
document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent default behavior
        if (spacePressed) {
            spacePressed = false;
            // Optionally, you can handle actions upon releasing the space bar
        }
    }
});

// Initiate Jump Function
function initiateJump() {
    jumpStartTime = Date.now();
    currentJumpDuration = 0;
    dino.dy = dino.baseJumpStrength;
    dino.onGround = false;
}

// Perform Jump Function
function performJump() {
    if (spacePressed && currentJumpDuration < maxJumpDuration) {
        // Allow the jump to be extended by holding the Space bar
        dino.dy += -0.05; // Apply additional upward acceleration
        currentJumpDuration += 16; // Approximate frame duration (16ms)
    }
}

// Update Function (Game Loop)
function update() {
    if (gameOver) {
        displayGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ground
    drawGround();

    // Update Dino's Position
    dino.dy += dino.gravity; // Apply gravity
    dino.y += dino.dy;       // Update vertical position

    // Apply additional jump force if Space bar is held
    performJump();

    // Check if Dino has landed on the ground
    if (dino.y >= 150) {     // Ground level
        dino.y = 150;
        dino.dy = 0;
        dino.onGround = true;
    }

    // Draw Dino
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Handle Obstacles
    obstacleTimer += gameSpeed;
    if (obstacleTimer > obstacleInterval) {
        // Randomly select an obstacle type
        const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacles.push({ 
            x: canvas.width, 
            y: 170 - obstacleType.height, // Position based on obstacle height
            width: obstacleType.width, 
            height: obstacleType.height 
        });
        obstacleTimer = 0;
    }

    // Draw Obstacles and Handle Collision
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed;
        ctx.fillStyle = '#ff0000'; // Obstacle color
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

        // Collision Detection
        if (
            dino.x < obstacles[i].x + obstacles[i].width &&
            dino.x + dino.width > obstacles[i].x &&
            dino.y < obstacles[i].y + obstacles[i].height &&
            dino.y + dino.height > obstacles[i].y
        ) {
            gameOver = true;
        }
    }

    // Remove Off-Screen Obstacles
    obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

    // Continue the Game Loop
    requestAnimationFrame(update);
}

// Display Game Over Function
function displayGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);

    // Re-enable controls after the game
    speedControl.disabled = false;
    densityControl.disabled = false;
    startButton.disabled = false;
    exitButton.disabled = true; // Disable Exit button when not in game
}

// Draw Ground Function
function drawGround() {
    ctx.fillStyle = '#8B4513'; // Brown color
    ctx.fillRect(0, 170, canvas.width, 30); // Draw a ground area
}
