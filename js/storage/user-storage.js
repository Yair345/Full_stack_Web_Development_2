class UserStorage {
    constructor() {
        this.storageKey = 'gameUsers';
        this.sessionKey = 'currentUser';
        this.loginAttemptsKey = 'loginAttempts';
        this.userTokenKey = 'userToken';
        this.initStorage();
    }

    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.loginAttemptsKey)) {
            localStorage.setItem(this.loginAttemptsKey, JSON.stringify({}));
        }
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    getUserByUsername(username) {
        const users = this.getAllUsers();
        return users.find(user => user.username === username);
    }

    addUser(user) {
        const users = this.getAllUsers();
        if (this.getUserByUsername(user.username)) {
            throw new Error('username already exists');
        }
        users.push({
            ...user,
            id: Date.now(),
            created: new Date().toISOString(),
            scores: [],
            lastLogin: null
        });
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    updateUser(username, updates) {
        const users = this.getAllUsers();
        const index = users.findIndex(user => user.username === username);
        if (index === -1) return false;

        users[index] = { ...users[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(users));
        return true;
    }

    setCurrentUser(user) {
        const sessionUser = {
            ...user,
            sessionStart: new Date().toISOString()
        };
        const token = this.generateToken(user.username);
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionUser));
        localStorage.setItem(this.userTokenKey, token);
        this.updateUser(user.username, { lastLogin: new Date().toISOString() });
    }

    getCurrentUser() {
        const user = localStorage.getItem(this.sessionKey);
        return user ? JSON.parse(user) : null;
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.userTokenKey); // Clear token on logout
    }

    recordLoginAttempt(username) {
        const attempts = JSON.parse(localStorage.getItem(this.loginAttemptsKey));
        if (!attempts[username]) {
            attempts[username] = {
                count: 0,
                lastAttempt: null,
                blocked: false
            };
        }

        const now = new Date();
        const lastAttempt = attempts[username].lastAttempt ? new Date(attempts[username].lastAttempt) : null;

        // Reset attempts if last attempt was more than 30 minutes ago
        if (lastAttempt && (now - lastAttempt) > 30 * 60 * 1000) {
            attempts[username].count = 0;
            attempts[username].blocked = false;
        }

        attempts[username].count++;
        attempts[username].lastAttempt = now.toISOString();

        if (attempts[username].count >= 5) {
            attempts[username].blocked = true;
        }

        localStorage.setItem(this.loginAttemptsKey, JSON.stringify(attempts));
        return attempts[username];
    }

    isUserBlocked(username) {
        const attempts = JSON.parse(localStorage.getItem(this.loginAttemptsKey));
        if (!attempts[username]) return false;

        const lastAttempt = new Date(attempts[username].lastAttempt);
        const now = new Date();

        // Unblock after 30 minutes
        if (attempts[username].blocked && (now - lastAttempt) > 30 * 60 * 1000) {
            attempts[username].blocked = false;
            attempts[username].count = 0;
            localStorage.setItem(this.loginAttemptsKey, JSON.stringify(attempts));
            return false;
        }

        return attempts[username].blocked;
    }

    isUserLoggedIn() {
        return !!localStorage.getItem(this.userTokenKey);
    }    

    generateToken(username) {
        return `${username}-${Date.now()}`; // Simplified token generation
    }    
}

export const userStorage = new UserStorage();
