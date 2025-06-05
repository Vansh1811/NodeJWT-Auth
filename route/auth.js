// ab apna auth mein login aur authentication ke liye code likhennge
//const user =require('../models/users');
 // 'fs' module ko import kar rahe hain taki hum file system ke sath kaam kar sakein,
// jaise ki users.js file ko read karna ya update karna (new user add karne ke baad)
// Note: Ye tarika sirf temporary ya practice projects ke liye theek hai,
// real projects mein data ko save karne ke liye database (jaise MongoDB) use karte hain.
// auth.js

// auth.js

// Import required modules
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // JWT for secure token-based login
const users = require('./users');

// Define a secret key for signing tokens (in real apps, use env variables)
const JWT_SECRET = 'your_jwt_secret_key_here';

// ------------------------------
// ✅ SIGNUP ROUTE
// ------------------------------
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    const userExists = users.find((u) => u.username === username);
    if (userExists) {
        return res.status(400).json({ error: "Username already exists" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);

        users.push({ username, password: hashedPassword, email });

        const filePath = path.join(__dirname, 'users.js');
        const content = `const users = ${JSON.stringify(users, null, 4)};\n\nmodule.exports = users;`;

        fs.writeFile(filePath, content, (err) => {
            if (err) {
                return res.status(500).json({ error: "Failed to save user to file" });
            }
            return res.status(200).json({ message: "User registered successfully" });
        });
    } catch (err) {
        return res.status(500).json({ error: "Error hashing password" });
    }
});

// ------------------------------
// ✅ LOGIN ROUTE WITH JWT
// ------------------------------
router.post('/login', async (req, res) => {
    const { username, password, email } = req.body;

    const user = users.find((u) => u.username === username);
    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
    }

    if (user.email !== email) {
        return res.status(401).json({ error: "Email does not match" });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { username: user.username, email: user.email }, // payload
            JWT_SECRET,                                     // secret key
            { expiresIn: '1h' }                             // optional: token expiry
        );

        return res.status(200).json({
            message: "Login successful",
            token: token // send token to client
        });
    } catch (err) {
        return res.status(500).json({ error: "Error checking password" });
    }
});

// Export the router
module.exports = router;
