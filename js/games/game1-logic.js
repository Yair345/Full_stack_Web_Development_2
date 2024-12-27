import { userStorage } from '../storage/userStorage.js';
import { gameStorage } from '../storage/gameStorage.js';

class ObstacleGame {
    constructor() {
        // Game elements
        this.gameArea = document.getElementById('gameArea');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.levelElement = document.getElementById('level');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');

        // Game state
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.isGameOver = false;
        this.obstacles = [];
        this.collectibles = [];
        this.playerPos = { x: 0, y: 0 };
        this.playerSpeed = 5;
        this.keys = {};

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
        this.updateTimer = this.updateTimer.bind(this);

        // Initialize game
        this.init();
    }

    init() {
        // Set up event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.restartBtn.addEventListener('click', () => this.restart());

        // Initialize player position
        this.resetPlayerPosition();
        
        // Create initial obstacles and collectibles
        this.createObstacles();
        this.createCollectibles();

        // Start game loops
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        this.timerInterval = setInterval(this.updateTimer, 1000);
    }

    resetPlayerPosition() {
        const areaRect = this.gameArea.getBoundingClientRect();
        this.playerPos = {
            x: areaRect.width / 2 - 15,
            y: areaRect.height - 50
        };
        this.updatePlayerPosition();
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    createObstacles() {
        // Clear existing obstacles
        this.obstacles.forEach(obs => obs.element.remove());
        this.obstacles = [];

        // Create new obstacles based on level
        const numObstacles = 3 + this.level * 2;
        for (let i = 0; i < numObstacles; i++) {
            this.createObstacle();
        }
    }

    createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        const width = 30 + Math.random() * 50;
        const height = 30 + Math.random() * 50;
        
        const areaRect = this.gameArea.getBoundingClientRect();
        const x = Math.random() * (areaRect.width - width);
        const y = Math.random() * (areaRect.height - height);

        obstacle.style.width = width + 'px';
        obstacle.style.height = height + 'px';
        obstacle.style.left = x + 'px';
        obstacle.style.top = y + 'px';

        this.gameArea.appendChild(obstacle);

        const speed = 1 + Math.random() * this.level;
        const angle = Math.random() * Math.PI * 2;
        
        this.obstacles.push({
            element: obstacle,
            width,
            height,
            x,
            y,
            speed,
            angle,
            direction: { x: Math.cos(angle), y: Math.sin(angle) }
        });
    }

    createCollectibles() {
        // Clear existing collectibles
        this.collectibles.forEach(col => col.element.remove());
        this.collectibles = [];

        // Create new collectibles
        const numCollectibles = 5;
        for (let i = 0; i < numCollectibles; i++) {
            this.createCollectible();
        }
    }

    createCollectible() {
        const collectible = document.createElement('div');
        collectible.className = 'collectible';
        
        const areaRect = this.gameArea.getBoundingClientRect();
        const x = Math.random() * (areaRect.width - 20);
        const y = Math.random() * (areaRect.height - 20);

        collectible.style.left = x + 'px';
        collectible.style.top = y + 'px';

        this.gameArea.appendChild(collectible);

        this.collectibles.push({
            element: collectible,
            x,
            y,
            width: 20,
            height: 20
        });
    }

    updatePlayerPosition() {
        this.player.style.transform = `translate(${this.playerPos.x}px, ${this.playerPos.y}px)`;
    }

    movePlayer(deltaTime) {
        const moveSpeed = this.playerSpeed * deltaTime;

        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.playerPos.x = Math.max(0, this.playerPos.x - moveSpeed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            const maxX = this.gameArea.clientWidth - this.player.clientWidth;
            this.playerPos.x = Math.min(maxX, this.playerPos.x + moveSpeed);
        }
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.playerPos.y = Math.max(0, this.playerPos.y - moveSpeed);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            const maxY = this.gameArea.clientHeight - this.player.clientHeight;
            this.playerPos.y = Math.min(maxY, this.playerPos.y + moveSpeed);
        }

        this.updatePlayerPosition();
    }

    moveObstacles(deltaTime) {
        const areaRect = this.gameArea.getBoundingClientRect();

        this.obstacles.forEach(obstacle => {
            obstacle.x += obstacle.direction.x * obstacle.speed * deltaTime;
            obstacle.y += obstacle.direction.y * obstacle.speed * deltaTime;

            // Bounce off walls
            if (obstacle.x <= 0 || obstacle.x + obstacle.width >= areaRect.width) {
                obstacle.direction.x *= -1;
            }
            if (obstacle.y <= 0 || obstacle.y + obstacle.height >= areaRect.height) {
                obstacle.direction.y *= -1;
            }

            obstacle.element.style.left = obstacle.x + 'px';
            obstacle.element.style.top = obstacle.y + 'px';
        });
    }

    checkCollisions() {
        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            if (this.isColliding(
                { ...this.playerPos, width: 30, height: 30 },
                collectible
            )) {
                this.collectibles.splice(i, 1);
                collectible.element.remove();
                this.score += 10;
                this.scoreElement.textContent = this.score;

                if (this.collectibles.length === 0) {
                    this.levelUp();
                }
            }
        }

        // Check obstacle collisions
        for (const obstacle of this.obstacles) {
            if (this.isColliding(
                { ...this.playerPos, width: 30, height: 30 },
                obstacle
            )) {
                this.gameOver();
                return;
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    levelUp() {
        this.level++;
        this.levelElement.textContent = this.level;
        this.createObstacles();
        this.createCollectibles();
    }

    updateTimer() {
        if (this.isGameOver) return;

        this.timeLeft--;
        this.timeElement.textContent = this.timeLeft;

        if (this.timeLeft <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverlay.classList.remove('hidden');

        // Save score
        const currentUser = userStorage.getCurrentUser();
        if (currentUser) {
            gameStorage.saveScore(currentUser.id, 'game1', this.score);
        }
    }

    restart() {
        // Reset game state
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.isGameOver = false;

        // Reset UI
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.timeElement.textContent = this.timeLeft;
        this.gameOverlay.classList.add('hidden');

        // Reset game elements
        this.resetPlayerPosition();
        this.createObstacles();
        this.createCollectibles();

        // Restart timer
        this.timerInterval = setInterval(this.updateTimer, 1000);
    }

    gameLoop(timestamp) {
        if (this.isGameOver) return;

        const deltaTime = (timestamp - this.lastTime) / 16; // Normalize to ~60fps
        this.lastTime = timestamp;

        this.movePlayer(deltaTime);
        this.moveObstacles(deltaTime);
        this.checkCollisions();

        requestAnimationFrame(this.gameLoop);
    }
}

// Check authentication
const currentUser = userStorage.getCurrentUser();
if (!currentUser) {
    window.location.href = '../login.html';
}

// Start game
new ObstacleGame();
