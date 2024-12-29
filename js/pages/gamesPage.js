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
    
    // Create and add game title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = gameId.charAt(0).toUpperCase() + gameId.slice(1);
    card.appendChild(gameTitle);

    // Add stat items
    const stats = [
        {
            label: 'Games Played:',
            value: gameStats.gamesPlayed
        },
        {
            label: 'High Score:',
            value: gameStats.highScore.toLocaleString()
        },
        {
            label: 'Average Score:',
            value: Math.round(gameStats.averageScore).toLocaleString()
        },
        {
            label: 'Last Played:',
            value: new Date(gameStats.lastPlayed).toLocaleDateString()
        }
    ];

    stats.forEach(stat => {
        const statItem = createStatItem(stat.label, stat.value);
        card.appendChild(statItem);
    });

    return card;
}

// Add event listener for page load
document.addEventListener('DOMContentLoaded', initUserStats);

// Function to refresh stats
function refreshStats() {
    initUserStats();
}