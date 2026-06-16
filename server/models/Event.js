const mongoose = require('mongoose');

// ─── Sub-schemas ────────────────────────────────────────────

const weatherConditionSchema = new mongoose.Schema(
  {
    text: String,
    icon: String,
    code: Number,
  },
  { _id: false }
);

const hourlyForecastSchema = new mongoose.Schema(
  {
    time: String,
    temp_c: Number,
    feelslike_c: Number,
    humidity: Number,
    precip_mm: Number,
    wind_kph: Number,
    cloud: Number,
    chance_of_rain: Number,
    condition: weatherConditionSchema,
    uv: Number,
  },
  { _id: false }
);

const weatherDataSchema = new mongoose.Schema(
  {
    date: String,
    temp_c: Number,
    temp_f: Number,
    mintemp_c: Number,
    maxtemp_c: Number,
    feelslike_c: Number,
    condition: weatherConditionSchema,
    wind_kph: Number,
    wind_mph: Number,
    precip_mm: Number,
    precip_in: Number,
    humidity: Number,
    cloud: Number,
    uv: Number,
    sunrise: String,
    sunset: String,
    hourly: [hourlyForecastSchema],
  },
  { _id: false }
);

const dateRiskSchema = new mongoose.Schema(
  {
    date: String,
    riskScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
    },
    summary: String,
    suggestions: [String],
    weatherData: weatherDataSchema,
  },
  { _id: false }
);

const historicalWeatherSchema = new mongoose.Schema(
  {
    date: String,
    temp_c: Number,
    humidity: Number,
    precip_mm: Number,
    wind_kph: Number,
    condition: String,
  },
  { _id: false }
);

// ─── Main Event Schema ─────────────────────────────────────

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      required: true,
      enum: ['outdoor', 'indoor', 'wedding', 'party', 'sports', 'business', 'other'],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    startDateRange: {
      type: String,
      required: true,
    },
    endDateRange: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 168, // max 1 week in hours
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    expectedAttendees: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    weatherData: [weatherDataSchema],
    recommendations: [dateRiskSchema],
    historicalData: [historicalWeatherSchema],
    bestDate: {
      type: String,
      default: '',
    },
    overallRiskScore: {
      type: Number,
      default: 0,
    },
    overallRiskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', ''],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user's events sorted by date
eventSchema.index({ userId: 1, createdAt: -1 });
eventSchema.index({ userId: 1, status: 1 });
eventSchema.index({ endDateRange: 1 }); // For finding past events

module.exports = mongoose.model('Event', eventSchema);
