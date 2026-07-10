const mongoose = require('mongoose');
const env = require('./env');

// Connects to MongoDB Atlas using the URI from .env.
// Called once at server startup — logs success or exits on failure.
async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
