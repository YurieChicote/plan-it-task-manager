const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: String, 
    status: { type: String, 
        default: 'Pending' 
    },
    progress: { type: Number, default: 0 
    },
    priority: { type: String, default: 'Low' 
    },

    deadline: Date, 
    
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, 

    comments: [String], 
    createdAt: { type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Task', TaskSchema);
