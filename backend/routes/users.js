const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const JWT_SECRET = "secret123"; 

// Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Simple check to see if user exists niu
        const checkUser = await User.findOne({ email });
        if (checkUser) return res.status(400).json({ message: "Email already in use" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword,
            role: role || 'Team Member'
        });

        await newUser.save();
        console.log(`User created: ${name}`); 
        
        res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
        console.error("Reg error:", err.message);
        res.status(400).json({ message: "Failed to register" });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "No user found with that email" });
        }

        // Compare hashed passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong credentials" });
        }

        // Create a REAL token (replaces the fake one)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            user: { id: user._id, name: user.name, role: user.role },
            token 
        });
    } catch (err) {
        res.status(500).json({ message: "Login server error" });
    }
});

// Fetch all users but hide passwords
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Could not fetch users" });
    }
});

module.exports = router;
