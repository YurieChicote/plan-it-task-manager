const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config({ quiet: true });

const app = express();

// MIDWARE
// this must be above the routes?
app.use(express.json()); 
app.use(cors());         

// --- AUTOMATED SWAGGER DOCUMENTATION CONFIG ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Plan-It Project Management API',
            version: '1.0.0',
            description: 'Core REST API handling user workspaces, role collaboration workflows, and text features.',
        },
        servers: [
            {
                url: 'https://plan-it-backend-yg9b.onrender.com',
            },
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ['./routes/*.js', './server.js'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
        persistAuthorization: true,
    }
}));

// --- MONGOOSE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// *routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/project');
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
    res.send("Task Manager API is officially running and connected!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on http://localhost:${PORT}`);
    console.log(`📑 API Documentation live at http://localhost:${PORT}/api-docs`);
});
