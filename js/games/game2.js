import { userStorage } from '../storage/user-storage.js';
import { gameStorage } from '../storage/games-storage.js';

const GAME_ID = 'Tic-Tac-Toe';
const currentUser = userStorage.getCurrentUser();


// Game state
const gameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    gameActive: false,
    startTime: null,
    timerInterval: null,
    scores: {
        wins: 0,
        losses: 0,
        ties: 0
    }
};

// DOM Elements
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const statusMessage = document.getElementById('status-message');
const gameTimer = document.getElementById('game-timer');

// Winning combinations
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Event Listeners
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetBoard);
cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(cell));
});

// Game Timer Function
function updateTimer() {
    if (!gameState.startTime || !gameState.gameActive) return;
    
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    gameTimer.textContent = `${minutes}:${seconds}`;
}

// Start Game Function
function startGame() {
    gameState.gameActive = true;
    gameState.startTime = new Date();
    gameState.board = Array(9).fill('');
    gameState.currentPlayer = 'X';
    cells.forEach(cell => cell.textContent = '');
    statusMessage.textContent = 'Game Started! Your turn (X)';
    
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

// Reset Board Function
function resetBoard() {
    gameState.gameActive = false;
    clearInterval(gameState.timerInterval);
    gameTimer.textContent = '00:00';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning');
    });
    statusMessage.textContent = 'Press Start to begin a new game';
}

// Handle Cell Click Function
function handleCellClick(cell) {
    if (!gameState.gameActive) return;
    
    const index = cell.dataset.cellIndex;
    if (gameState.board[index] !== '') return;
    
    makeMove(index, 'X');
    if (checkWinner()) return;
    if (gameState.board.includes('')) {
        setTimeout(() => botMove(), 500);
    }
}

// Make Move Function
function makeMove(index, player) {
    gameState.board[index] = player;
    cells[index].textContent = player;
    gameState.currentPlayer = player === 'X' ? 'O' : 'X';
}

// Bot Move Function
function botMove() {
    if (!gameState.gameActive) return;
    
    const difficulty = difficultySelect.value;
    let move;
    
    switch (difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
    }
    
    if (move !== null) {
        makeMove(move, 'O');
        checkWinner();
    }
}

// Get Random Move Function
function getRandomMove() {
    const emptyCells = gameState.board
        .map((cell, index) => cell === '' ? index : null)
        .filter(cell => cell !== null);
    
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Get Best Move Function (Minimax Algorithm)
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = 'O';
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax Algorithm
function minimax(board, depth, isMaximizing) {
    const result = checkGameResult();
    if (result !== null) {
        return result === 'O' ? 1 : result === 'X' ? -1 : 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
                board[i] = '';
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
                board[i] = '';
            }
        }
        return bestScore;
    }
}

// Check Winner Function
function checkWinner() {
    const result = checkGameResult();
    if (result !== null) {
        gameState.gameActive = false;
        clearInterval(gameState.timerInterval);
        
        const endTime = new Date();
        
        updateScores(result);
        highlightWinningCombination();
        updateGameStorage(result === 'X' ? 1 : result === 'O' ? -1 : 0, difficultySelect.value);
        
        return true;
    }
    return false;
}

// Check Game Result Function
function checkGameResult() {
    // Check for winner
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            return gameState.board[a];
        }
    }
    
    // Check for tie
    if (!gameState.board.includes('')) {
        return 'tie';
    }
    
    return null;
}

// Highlight Winning Combination Function
function highlightWinningCombination() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            break;
        }
    }
}

// Update Scores Function
function updateScores(result) {
    if (result === 'X') {
        gameState.scores.wins++;
        statusMessage.textContent = 'You won!';
    } else if (result === 'O') {
        gameState.scores.losses++;
        statusMessage.textContent = 'Bot won!';
    } else {
        gameState.scores.ties++;
        statusMessage.textContent = "It's a tie!";
    }
    
    document.getElementById('wins').textContent = gameState.scores.wins;
    document.getElementById('losses').textContent = gameState.scores.losses;
    document.getElementById('ties').textContent = gameState.scores.ties;
}

function updateGameStorage(result, difficulty) {
    if (currentUser) {
        gameStorage.saveScore(currentUser.id, GAME_ID, result, difficulty);
    }
}

// Initialize the game
resetBoard();