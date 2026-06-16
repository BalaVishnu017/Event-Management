const Event = require('../models/Event');
const weatherService = require('../services/weatherService');

/**
 * GET /api/events
 * List all events for current user
 */
exports.getAllEvents = async (req, res) => {
  try {
    const { status, type, search, sort = '-createdAt' } = req.query;

    const filter = { userId: req.user.uid };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter).sort(sort).lean();

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch events' });
  }
};

/**
 * GET /api/events/past
 * List past/completed events
 */
exports.getPastEvents = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const events = await Event.find({
      userId: req.user.uid,
      $or: [
        { endDateRange: { $lt: today } },
        { status: 'completed' },
      ],
    })
      .sort('-endDateRange')
      .lean();

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch past events' });
  }
};

/**
 * GET /api/events/stats
 * Dashboard statistics
 */
exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [total, upcoming, completed, highRisk] = await Promise.all([
      Event.countDocuments({ userId: req.user.uid }),
      Event.countDocuments({
        userId: req.user.uid,
        endDateRange: { $gte: today },
        status: { $nin: ['completed', 'cancelled'] },
      }),
      Event.countDocuments({
        userId: req.user.uid,
        $or: [{ status: 'completed' }, { endDateRange: { $lt: today } }],
      }),
      Event.countDocuments({
        userId: req.user.uid,
        overallRiskLevel: 'high',
        endDateRange: { $gte: today },
      }),
    ]);

    res.json({
      success: true,
      data: { total, upcoming, completed, highRisk },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

/**
 * POST /api/events
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      startDateRange,
      endDateRange,
      duration,
      description,
      expectedAttendees,
    } = req.body;

    // Validation
    if (!name || !type || !location || !startDateRange || !endDateRange || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, location, startDateRange, endDateRange, duration',
      });
    }

    if (startDateRange > endDateRange) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date',
      });
    }

    const event = await Event.create({
      userId: req.user.uid,
      name,
      type,
      location,
      startDateRange,
      endDateRange,
      duration,
      description: description || '',
      expectedAttendees: expectedAttendees || 0,
      status: 'upcoming',
    });

    // Trigger weather analysis asynchronously
    weatherService
      .analyzeEventWeather(event)
      .then(async (analyzed) => {
        await Event.findByIdAndUpdate(event._id, {
          weatherData: analyzed.weatherData,
          recommendations: analyzed.recommendations,
          historicalData: analyzed.historicalData,
          bestDate: analyzed.bestDate,
          overallRiskScore: analyzed.overallRiskScore,
          overallRiskLevel: analyzed.overallRiskLevel,
        });
      })
      .catch((err) => console.error('Background weather analysis failed:', err));

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, error: 'Failed to create event' });
  }
};

/**
 * GET /api/events/:id
 * Get single event by ID
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.uid,
    }).lean();

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event' });
  }
};

/**
 * PUT /api/events/:id
 * Update an event
 */
exports.updateEvent = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'type', 'location', 'startDateRange', 'endDateRange',
      'duration', 'description', 'expectedAttendees', 'status',
      'weatherData', 'recommendations', 'historicalData',
      'bestDate', 'overallRiskScore', 'overallRiskLevel',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, error: 'Failed to update event' });
  }
};

/**
 * DELETE /api/events/:id
 * Delete an event
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.uid,
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({
      success: true,
      data: { id: req.params.id, message: 'Event deleted successfully' },
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete event' });
  }
};

/**
 * POST /api/events/:id/analyze
 * Trigger weather analysis for an event
 */
exports.analyzeWeather = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.uid,
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const analyzed = await weatherService.analyzeEventWeather(event);

    event.weatherData = analyzed.weatherData;
    event.recommendations = analyzed.recommendations;
    event.historicalData = analyzed.historicalData;
    event.bestDate = analyzed.bestDate;
    event.overallRiskScore = analyzed.overallRiskScore;
    event.overallRiskLevel = analyzed.overallRiskLevel;
    await event.save();

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Analyze weather error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze weather' });
  }
};

/**
 * GET /api/events/:id/recommendations
 * Get date recommendations for an event
 */
exports.getRecommendations = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      userId: req.user.uid,
    }).lean();

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (!event.recommendations || event.recommendations.length === 0) {
      // Generate fresh recommendations
      const analyzed = await weatherService.analyzeEventWeather(event);

      await Event.findByIdAndUpdate(event._id, {
        weatherData: analyzed.weatherData,
        recommendations: analyzed.recommendations,
        historicalData: analyzed.historicalData,
        bestDate: analyzed.bestDate,
        overallRiskScore: analyzed.overallRiskScore,
        overallRiskLevel: analyzed.overallRiskLevel,
      });

      return res.json({
        success: true,
        data: analyzed.recommendations,
      });
    }

    res.json({
      success: true,
      data: event.recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};
