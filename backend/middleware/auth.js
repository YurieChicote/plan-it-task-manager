const jwt = require('jsonwebtoken');
const JWT_SECRET = "secret123";

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the header even exists
    if (!authHeader) {
        return res.status(401).json({ message: "Please log in to continue" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("Token verification failed:", err.message);
        res.status(401).json({ message: "Session invalid" });
    }
};

const managementOnly = (req, res, next) => {
    next();
};

module.exports = { protect, managementOnly };
