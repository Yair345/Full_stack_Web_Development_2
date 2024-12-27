import { userStorage } from '../storage/userStorage.js';

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
            throw new Error('הסיסמאות אינן תואמות');
        }

        // Validate password strength
        if (password.length < 6) {
            throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים');
        }

        // Validate username
        if (username.length < 3) {
            throw new Error('שם המשתמש חייב להכיל לפחות 3 תווים');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('כתובת האימייל אינה תקינה');
        }

        // Create user
        userStorage.addUser({
            username,
            password, // In a real app, you'd hash the password
            email,
            fullname
        });

        // Redirect to login
        window.location.href = 'login.html';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
