// Import the UserStorage instance
import { userStorage } from '../storage/user-storage.js';
import { gameStorage } from '../storage/games-storage.js';

// Elements
const userDisplayElement = document.getElementById('userDisplay');
const logoutButton = document.getElementById('logoutBtn');

// Function to update header display
function updateHeaderDisplay() {
    const currentUser = userStorage.getCurrentUser();
    const isLoggedIn = userStorage.isUserLoggedIn();

    if (isLoggedIn && currentUser) {
        // Show username and logout button
        userDisplayElement.textContent = `Welcome, ${currentUser.username}!`;
        logoutButton.style.display = 'inline-block';
    } else {
        // Clear username and hide logout button
        userDisplayElement.textContent = '';
        logoutButton.style.display = 'none';
    }
}

// Handle logout
logoutButton.addEventListener('click', () => {
    userStorage.logout();
    updateHeaderDisplay();
    // Redirect to login page or update UI as needed
    window.location.href = '../../pages/login.html'; // Adjust the path as needed
});

// Initial header update
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderDisplay();
});

// This is useful if you have multiple tabs open
window.addEventListener('storage', (e) => {
    if (e.key === userStorage.sessionKey || e.key === userStorage.userTokenKey) {
        updateHeaderDisplay();
    }
});

function initUserStats() {
    const statsContainer = document.getElementById('userStats');
    const currentUser = userStorage.getCurrentUser();

    // Clear existing content
    while (statsContainer.firstChild) {
        statsContainer.removeChild(statsContainer.firstChild);
    }

    if (!currentUser) {
        const noStatsMessage = document.createElement('p');
        noStatsMessage.className = 'no-stats';
        noStatsMessage.textContent = 'Please log in to view your statistics';
        statsContainer.appendChild(noStatsMessage);
        return;
    }

    // Get user stats from game storage
    const stats = gameStorage.getUserStats(currentUser.id);
    
    if (Object.keys(stats).length === 0) {
        const noStatsMessage = document.createElement('p');
        noStatsMessage.className = 'no-stats';
        noStatsMessage.textContent = 'No statistics available';
        statsContainer.appendChild(noStatsMessage);
        return;
    }

    // Create stats cards for each game
    Object.entries(stats).forEach(([gameId, gameStats]) => {
        const statCard = createGameStatCard(gameId, gameStats);
        statsContainer.appendChild(statCard);
    });
}

function createStatItem(label, value) {
    const statItem = document.createElement('div');
    statItem.className = 'stat-item';

    const statLabel = document.createElement('span');
    statLabel.className = 'stat-label';
    statLabel.textContent = label;

    const statValue = document.createElement('span');
    statValue.className = 'stat-value';
    statValue.textContent = value;

    statItem.appendChild(statLabel);
    statItem.appendChild(statValue);

    return statItem;
}

function createGameStatCard(gameId, gameStats) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    // Game Title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = gameId.charAt(0).toUpperCase() + gameId.slice(1);
    card.appendChild(gameTitle);

    if (gameId === 'snake') {
        // Snake stats
        const statList = [
            { label: 'Games Played:', value: gameStats.gamesPlayed },
            { label: 'High Score:', value: gameStats.highScore.toLocaleString() },
            { label: 'Average Score:', value: Math.round(gameStats.averageScore).toLocaleString() },
            { label: 'Last Played:', value: gameStats.lastPlayed ? new Date(gameStats.lastPlayed).toLocaleDateString() : 'N/A' }
        ];

        statList.forEach(stat => {
            const statItem = createStatItem(stat.label, stat.value);
            card.appendChild(statItem);
        });
    } else if (gameId === 'Tic-Tac-Toe') {
        // Tic-Tac-Toe stats per difficulty
        Object.entries(gameStats).forEach(([difficulty, stats]) => {
            const difficultyTitle = document.createElement('h4');
            difficultyTitle.textContent = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}:`;
            card.appendChild(difficultyTitle);

            const statList = [
                { label: 'Games Played:', value: stats.gamesPlayed },
                { label: 'Wins:', value: stats.wins },
                { label: 'Losses:', value: stats.losses },
                { label: 'Ties:', value: stats.ties },
                { label: 'Last Played:', value: stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'N/A' }
            ];

            statList.forEach(stat => {
                const statItem = createStatItem(stat.label, stat.value);
                card.appendChild(statItem);
            });
        });
    } else {
        // Generic case for other games
        const genericStats = [
            { label: 'Games Played:', value: gameStats.gamesPlayed || 0 },
            { label: 'High Score:', value: gameStats.highScore ? gameStats.highScore.toLocaleString() : 'N/A' },
            { label: 'Average Score:', value: gameStats.averageScore ? Math.round(gameStats.averageScore).toLocaleString() : 'N/A' },
            { label: 'Last Played:', value: gameStats.lastPlayed ? new Date(gameStats.lastPlayed).toLocaleDateString() : 'N/A' }
        ];

        genericStats.forEach(stat => {
            const statItem = createStatItem(stat.label, stat.value);
            card.appendChild(statItem);
        });
    }

    return card;
}

function initAllUserStats() {
    const statsContainer = document.getElementById('allStats'); // The container for statistics
    const allUsers = userStorage.getAllUsers();

    // Clear existing content
    while (statsContainer.firstChild) {
        statsContainer.removeChild(statsContainer.firstChild);
    }

    if (!allUsers || allUsers.length === 0) {
        const noStatsMessage = document.createElement('p');
        noStatsMessage.className = 'no-stats';
        noStatsMessage.textContent = 'No users found to display statistics.';
        statsContainer.appendChild(noStatsMessage);
        return;
    }

    // Get aggregated stats for all users
    const summedStats = gameStorage.getSummedStats(); // Assuming the getSummedStats function from earlier is implemented

    if (!summedStats || Object.keys(summedStats).length === 0) {
        const noStatsMessage = document.createElement('p');
        noStatsMessage.className = 'no-stats';
        noStatsMessage.textContent = 'No statistics available for any user.';
        statsContainer.appendChild(noStatsMessage);
        return;
    }

    // Create stats cards for each game
    Object.entries(summedStats).forEach(([gameId, gameStats]) => {
        const statCard = createGameStatCardForAllUsers(gameId, gameStats);
        statsContainer.appendChild(statCard);
    });
}

function createGameStatCardForAllUsers(gameId, gameStats) {
    const card = document.createElement('div');
    card.className = 'stat-card';

    // Game Title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = gameId.charAt(0).toUpperCase() + gameId.slice(1);
    card.appendChild(gameTitle);

    if (gameId === 'snake') {
        // Snake stats
        const statList = [
            { label: 'Total Games Played:', value: gameStats.totalGamesPlayed },
            { label: 'Highest Score:', value: gameStats.totalHighScore.toLocaleString() },
            { label: 'Average Score:', value: Math.round(gameStats.totalAverageScore).toLocaleString() },
        ];

        statList.forEach(stat => {
            const statItem = createStatItem(stat.label, stat.value);
            card.appendChild(statItem);
        });
    } else if (gameId === 'Tic-Tac-Toe') {
        // Tic-Tac-Toe stats per difficulty
        Object.entries(gameStats).forEach(([difficulty, stats]) => {
            const difficultyTitle = document.createElement('h4');
            difficultyTitle.textContent = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}:`;
            card.appendChild(difficultyTitle);

            const statList = [
                { label: 'Total Games Played:', value: stats.totalGamesPlayed },
                { label: 'Total Wins:', value: stats.totalWins },
                { label: 'Total Losses:', value: stats.totalLosses },
                { label: 'Total Ties:', value: stats.totalTies },
            ];

            statList.forEach(stat => {
                const statItem = createStatItem(stat.label, stat.value);
                card.appendChild(statItem);
            });
        });
    } else {
        // Generic case for other games
        const genericStats = [
            { label: 'Total Games Played:', value: gameStats.totalGamesPlayed || 0 },
            { label: 'Highest Score:', value: gameStats.totalHighScore ? gameStats.totalHighScore.toLocaleString() : 'N/A' },
            { label: 'Average Score:', value: gameStats.totalAverageScore ? Math.round(gameStats.totalAverageScore).toLocaleString() : 'N/A' },
        ];

        genericStats.forEach(stat => {
            const statItem = createStatItem(stat.label, stat.value);
            card.appendChild(statItem);
        });
    }

    return card;
}


// Add event listener for page load
document.addEventListener('DOMContentLoaded', initUserStats);
document.addEventListener('DOMContentLoaded', initAllUserStats);

// Function to refresh stats
function refreshStats() {
    initUserStats();
}