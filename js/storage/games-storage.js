class GameStorage {
    constructor() {
        this.storageKey = 'gameScores';
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({}));
        }
    }

    saveScore(userId, gameId, score, difficulty = null) {
        const scores = this.getAllScores() || {};
    
        // Ensure the user data exists
        if (!scores[userId]) {
            scores[userId] = {};
        }
    
        // Ensure the game data exists
        if (!scores[userId][gameId]) {
            // If the game has difficulty levels, initialize as an object
            scores[userId][gameId] = difficulty !== null ? {} : [];
        }
    
        // If difficulty is provided, initialize and update the specific difficulty level
        if (difficulty !== null) {
            if (!scores[userId][gameId][difficulty]) {
                scores[userId][gameId][difficulty] = [];
            }
    
            scores[userId][gameId][difficulty].push({
                score,
                timestamp: new Date().toISOString()
            });
        } else {
            // If no difficulty, treat as a simple game (e.g., Snake)
            scores[userId][gameId].push({
                score,
                timestamp: new Date().toISOString()
            });
        }
    
        console.log('scores', scores);
        localStorage.setItem(this.storageKey, JSON.stringify(scores));
    }
    

    getUserScores(userId) {
        const scores = this.getAllScores();
        return scores[userId] || {};
    }

    getGameHighScores(gameId, limit = 10) {
        const scores = this.getAllScores();
        let allGameScores = [];

        // Collect all scores for this game
        Object.entries(scores).forEach(([userId, userScores]) => {
            if (userScores[gameId]) {
                userScores[gameId].forEach(score => {
                    allGameScores.push({
                        userId,
                        ...score
                    });
                });
            }
        });

        // Sort by score (descending) and take top N
        return allGameScores
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    getUserStats(userId) {
        const scores = this.getUserScores(userId);
        const stats = {};

        Object.entries(scores).forEach(([gameId, gameScores]) => {
            stats[gameId] = this.calculateGameStats(gameId, gameScores);
            
            /* stats[gameId] = {
                gamesPlayed: gameScores.length,
                highScore: Math.max(...gameScores.map(s => s.score)),
                averageScore: gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length,
                lastPlayed: gameScores[gameScores.length - 1].timestamp
            }; */
        });
        console.log('stats', stats);
        return stats;
    }

    calculateGameStats(gameId, gameScores) {
        console.log('gameScores', gameScores);
        if (gameId === 'snake') {
            const scores = gameScores || [];
            const gamesPlayed = scores.length;
            const highScore = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
            const averageScore = scores.length
                ? scores.reduce((sum, s) => sum + s.score, 0) / gamesPlayed
                : 0;
            const lastPlayed = scores.length ? scores[scores.length - 1].timestamp : null;
    
            return {
                gamesPlayed,
                highScore,
                averageScore,
                lastPlayed
            };
        } else if (gameId === 'Tic-Tac-Toe') {
            const ticTacToeStats = {};
            Object.entries(gameScores || {}).forEach(([difficulty, games]) => {
                const gamesPlayed = games.length;
                const wins = games.filter(game => game.score === 1).length;
                const losses = games.filter(game => game.score === -1).length;
                const ties = games.filter(game => game.score === 0).length;
                const lastPlayed = games.length ? games[games.length - 1].timestamp : null;
    
                ticTacToeStats[difficulty] = {
                    gamesPlayed,
                    wins,
                    losses,
                    ties,
                    lastPlayed
                };
            });
            return ticTacToeStats;
        }
    
        return null;
    }
    

    getAllScores() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    countTotalGamesPlayed(userId) {
        let totalGamesPlayed = 0;
        
        const gameScores = this.getUserScores(userId);

        // Count games played for Snake
        if (gameScores.snake) {
            totalGamesPlayed += gameScores.snake.length;
        }
    
        // Count games played for Tic-Tac-Toe by summing games across all difficulties
        if (gameScores.ticTacToe) {
            Object.values(gameScores.ticTacToe).forEach(difficultyScores => {
                totalGamesPlayed += difficultyScores.length;
            });
        }
    
        return totalGamesPlayed;
    }
}

export const gameStorage = new GameStorage();
