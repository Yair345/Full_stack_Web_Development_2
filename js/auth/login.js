import { userStorage } from '../storage/user-storage.js';
import { generateSHA256Hash } from '../utils/crypto.js';

const loginForm = document.getElementById('loginForm');

// Helper functions for cookie management
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

// Set the default value of the username field from the cookie
const usernameField = document.getElementById('username');
const lastUsername = getCookie('lastSignedInUser');
if (usernameField && lastUsername) {
    usernameField.value = lastUsername;
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameField.value;
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

            // Save the username in a cookie
            setCookie('lastSignedInUser', username, 7); // Cookie expires in 7 days

            window.location.href = '/';
        } catch (error) {
            errorMsg.textContent = error.message;
        }
    });
}
