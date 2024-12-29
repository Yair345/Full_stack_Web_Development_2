import { userStorage } from '../storage/user-storage.js';
import { gameStorage } from '../storage/games-storage.js';
import { update as updateSnake, draw as drawSnake, SNAKE_SPEED, getSnakeHead, snakeIntersection } from './snakeFiles/snake.js'
import { update as updateFood, draw as drawFood, score as playerScore } from './snakeFiles/food.js'
import { outsideGrid } from './snakeFiles/grid.js'

const GAME_ID = 'snake'
let lastRenderTime = 0
let gameOver = false
const gameBoard = document.getElementById('gameArea')
const gameOverlay = document.getElementById('gameOverlay')
const scoreDisplay = document.getElementById('score')
const highScoreDisplay = document.getElementById('highScore')
const finalScoreDisplay = document.getElementById('finalScore')
const finalHighScoreDisplay = document.getElementById('finalHighScore')
const currentUser = userStorage.getCurrentUser()

function main(currentTime) {
    if (gameOver) {
        gameOverlay.classList.remove('hidden');
        finalScoreDisplay.textContent = playerScore
        if (currentUser) {
            gameStorage.saveScore(currentUser.id, GAME_ID, playerScore);
            finalHighScoreDisplay.textContent = getHighScore(currentUser.id)
        }
        return
    }

    window.requestAnimationFrame(main)
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return

    lastRenderTime = currentTime

    update()
    draw()
}

window.requestAnimationFrame(main)

function update() {
    updateSnake()
    updateFood()
    updateScore()
    checkDeath()
}

function draw() {
    gameBoard.innerHTML = ''
    drawSnake(gameBoard)
    drawFood(gameBoard)
}

function checkDeath() {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection()
}

function updateScore() {
    scoreDisplay.textContent = playerScore
    if (currentUser) {
        let high = getHighScore(currentUser.id)
        highScoreDisplay.textContent = high > playerScore ? high : playerScore
    }
}

function getHighScore(userId) {
    const highScores = gameStorage.getUserScores(userId)[GAME_ID]
    try {
        const userHighScore = Math.max(...highScores.map(s => s.score))
        return userHighScore ? userHighScore : 0
    } catch (e) {
        return 0
    }
}