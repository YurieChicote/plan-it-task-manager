const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const Task = require('../models/tasks');
const { protect, managementOnly } = require('../middleware/auth');

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Retrieve all projects
 *     description: Fetches a list of all project boards including member profiles and linked tasks.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, async (req, res) => {
    try {
        const data = await Project.find()
            .populate('assignees', 'name role') 
            .populate('tasks');
        res.json(data);
    } catch (e) {
        console.error("Fetch error:", e);
        res.status(500).json({ error: "Could not load projects" });
    }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a specific project board by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const proj = await Project.findById(req.params.id).populate('tasks');
        if (!proj) return res.status(404).json({ message: 'Wala dito yung project' });
        res.json(proj);
    } catch (err) {
        res.status(400).json({ message: "Invalid ID format" }); 
    }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project workspace
 *     description: Initializes a tracking workspace board and automatically tags the creator as the absolute owner.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', protect, managementOnly, async (req, res) => {
    const { name, description, deadline } = req.body;
    try {
        const savedProject = await Project.create({
            name,
            description,
            deadline,
            owner: req.user.id
        });
        res.status(201).json(savedProject);
    } catch (err) {
        res.status(400).json({ message: "Check your inputs niu" });
    }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project workspace specifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', protect, managementOnly, async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Purge a project board and clear child tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', protect, managementOnly, async (req, res) => {
    try {
        const projectToDelete = await Project.findById(req.params.id);
        if (!projectToDelete) return res.status(404).json({ message: 'not found' });
        await Task.deleteMany({ project: req.params.id }); 
        await projectToDelete.deleteOne();
        res.json({ message: 'Project and its tasks cleared' });
    } catch (err) {
        res.status(500).json({ message: "failed to delete" });
    }
});

/**
 * @swagger
 * /api/projects/{id}/assign-task:
 *   post:
 *     summary: Relate a tracking task directly to its parent project target
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assigned
 */
router.post('/:id/assign-task', protect, managementOnly, async (req, res) => {
    try {
        const { taskId } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project.tasks.includes(taskId)) {
            project.tasks.push(taskId);
            await project.save();
        }
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: "Task assignment failed" });
    }
});

/**
 * @swagger
 * /api/projects/{id}/comments:
 *   post:
 *     summary: Post a live comment text entry to the active workspace project chatbox
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: "Bearer eyJhbG..."
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment Posted
 */
router.post('/:id/comments', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            user: req.user.id 
        };
        project.comments.push(newComment);
        await project.save();
        res.json(project);
    } catch (err) {
        res.status(400).json({ message: "Comment didnt post" });
    }
});

module.exports = router;