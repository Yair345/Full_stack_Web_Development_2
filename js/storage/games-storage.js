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

    saveScore(userId, gameId, score) {
        const scores = this.getAllScores();
        
        if (!scores[userId]) {
            scores[userId] = {};
        }
        
        if (!scores[userId][gameId]) {
            scores[userId][gameId] = [];
        }

        scores[userId][gameId].push({
            score,
            timestamp: new Date().toISOString()
        });

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
            stats[gameId] = {
                gamesPlayed: gameScores.length,
                highScore: Math.max(...gameScores.map(s => s.score)),
                averageScore: gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length,
                lastPlayed: gameScores[gameScores.length - 1].timestamp
            };
        });

        return stats;
    }

    getAllScores() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }
}

export const gameStorage = new GameStorage();
