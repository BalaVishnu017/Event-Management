const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const eventController = require('../controllers/eventController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/events — List all events for current user
router.get('/', eventController.getAllEvents);

// GET /api/events/past — List past/completed events
router.get('/past', eventController.getPastEvents);

// GET /api/events/stats — Dashboard statistics
router.get('/stats', eventController.getStats);

// POST /api/events — Create a new event
router.post('/', eventController.createEvent);

// GET /api/events/:id — Get single event by ID
router.get('/:id', eventController.getEventById);

// PUT /api/events/:id — Update an event
router.put('/:id', eventController.updateEvent);

// DELETE /api/events/:id — Delete an event
router.delete('/:id', eventController.deleteEvent);

// POST /api/events/:id/analyze — Trigger weather analysis for an event
router.post('/:id/analyze', eventController.analyzeWeather);

// GET /api/events/:id/recommendations — Get date recommendations
router.get('/:id/recommendations', eventController.getRecommendations);

module.exports = router;
