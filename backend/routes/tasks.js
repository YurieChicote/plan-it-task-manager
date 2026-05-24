const Task = require('../models/tasks');
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     description: Fetch all tasks with optional filters by status, title, or assignee.
 *     responses:
 *       200:
 *         description: Success
 */

// Fetch tasks + search filters niu
router.get('/', protect, async (req, res) => {
    try {
        let filter = {}; 

        if (req.query.status) filter.status = req.query.status;
        if (req.query.title) filter.title = { $regex: req.query.title, $options: 'i' };
        if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
        if (req.query.project) filter.project = req.query.project;

        const tasks = await Task.find(filter).sort({ createdAt: -1 }); 
        res.json(tasks);
    } catch (err) {
        console.error("GET TASKS ERROR:", err);
        res.status(500).json({ message: "Can't load tasks right now" });
    }
});



/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */

// get single task
router.get('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'name');
        if (!task) return res.status(404).json({ message: "Task is missing" });
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: "Invalid Task ID" });
    }
});


/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
// make a task
router.post('/', protect, async (req, res) => {
    const { title, description, status } = req.body;
    
    try {
       const { title, description, status, project } = req.body;
       const newTask = new Task({title,
        description,
        status: status || "Pending",
        project
});
        const saved = await newTask.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: "Check title and inputs" });
    }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
// edit task 
router.put('/:id', protect, async (req, res) => {
    try {
        const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Update failed" });
    }
});

// quick complete toggle
router.patch('/:id/complete', protect, async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status: "Completed", progress: 100 },
            { new: true }
        );
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: "Couldn't mark as done" });
    }
});


/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */

// delete task 
router.delete('/:id', protect, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task is gone" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
});

// comment on task
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        task.comments.push(req.body.text); 
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: "Comment failed to post" });
    }
});

// assign users to task
router.patch('/:id/assign', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'No task found' });

    task.assignedTo = req.body.userIds;
    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');
    res.json(populatedTask);
  } catch (err) {
    res.status(400).json({ message: "Assignment error" });
  }
});

module.exports = router;
