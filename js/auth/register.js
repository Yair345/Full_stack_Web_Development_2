import { userStorage } from '../storage/user-storage.js';
import { generateSHA256Hash } from '../utils/crypto.js';


document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const fullname = document.getElementById('fullname').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        // Validate password match
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        // Validate password strength
        if (password.length < 6) {
            throw new Error('Password must contain at least 6 characters');
        }

        // Validate username
        if (username.length < 3) {
            throw new Error('Username must contain at least 3 characters');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email address');
        }

        // Hash the password
        const hashedPassword = await generateSHA256Hash(password);

        // Create user
        userStorage.addUser({
            username,
            password: hashedPassword,
            email,
            fullname
        });

        // Redirect to login
        window.location.href = 'login.html';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
