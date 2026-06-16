const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS — fixes "querySrv ECONNREFUSED" on restrictive networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MAX_RETRIES = 10;

const connectDB = async (attempt = 1) => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-event-planner';

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);

    if (attempt >= MAX_RETRIES) {
      console.error('Max retries reached. Shutting down.');
      process.exit(1);
    }

    const delay = Math.min(5000 * attempt, 30000); // exponential backoff up to 30s
    console.log(`Retrying in ${delay / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectDB(attempt + 1);
  }
};

module.exports = connectDB;
