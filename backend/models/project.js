const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true 
    },
    description: String, deadline: Date,      
    
    status: { type: String, default: 'Pending' 
    }, 
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // tracks who created the project board as specified by collaboration criteria
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // explicitly tracks invited workspace members along with their specific project permission metrics
    members: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            role: { type: String, enum: ['Admin', 'Member'], default: 'Member' }
        }
    ],

    comments: [
        {text: String,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // links comments directly to specific users
            createdAt: { type: Date, default: Date.now } 
        }
    ],

    createdAt: { type: Date, default: Date.now 
    }
});
module.exports = mongoose.model('Project', ProjectSchema);
