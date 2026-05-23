const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "secret123";

// Registration logic
router.post('/register', async (req, res) => {
    try {const { name, email, password, role } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already taken, niu" });
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role || 'Team Member' 
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "Registered successfully!" });
    } catch (err) {
        console.log("Reg error:", err); 
        res.status(500).json({ error: "Something went wrong with the registration" });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Account doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Sign JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' } 
        );

        res.json({ token,
            user: { id: user._id, name: user.name, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }
});

module.exports = router;
