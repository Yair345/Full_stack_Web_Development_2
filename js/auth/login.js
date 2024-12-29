import { userStorage } from '../storage/user-storage.js';
import { generateSHA256Hash } from '../utils/crypto.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        // Check if the user is blocked
        if (userStorage.isUserBlocked(username)) {
            throw new Error('The account is temporarily blocked due to multiple login attempts. Please try again in 30 minutes.');
        }

        // Get user
        const user = userStorage.getUserByUsername(username);
        if (!user) {
            throw new Error('Incorrect username or password.');
        }

        // Verify password
        if (user.password !== await generateSHA256Hash(password)) {
            const attempt = userStorage.recordLoginAttempt(username);
            if (attempt.blocked) {
                throw new Error('The account has been blocked due to multiple login attempts. Please try again in 30 minutes.');
            } else {
                throw new Error('Incorrect username or password.');
            }
        }

        // Login successful
        userStorage.setCurrentUser(user);
        window.location.href = '/';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
