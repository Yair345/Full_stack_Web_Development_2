import { userStorage } from '../storage/user-storage.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        // Check if user is blocked
        if (userStorage.isUserBlocked(username)) {
            throw new Error('החשבון חסום זמנית עקב ניסיונות כניסה מרובים. נסה שוב בעוד 30 דקות');
        }

        // Get user
        const user = userStorage.getUserByUsername(username);
        if (!user) {
            throw new Error('שם משתמש או סיסמה שגויים');
        }

        // Verify password (in a real app, you'd use proper password hashing)
        if (user.password !== password) {
            const attempt = userStorage.recordLoginAttempt(username);
            if (attempt.blocked) {
                throw new Error('החשבון נחסם עקב ניסיונות כניסה מרובים. נסה שוב בעוד 30 דקות');
            } else {
                throw new Error('שם משתמש או סיסמה שגויים');
            }
        }

        // Login successful
        userStorage.setCurrentUser(user);
        window.location.href = '../pages/games.html';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
