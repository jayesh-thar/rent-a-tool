const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/modules/auth/user.model');
const Tool = require('../src/modules/tools/tool.model');
const Booking = require('../src/modules/bookings/booking.model');
const Payment = require('../src/modules/payments/payment.model');
const Notification = require('../src/modules/notifications/notification.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI env variable is missing! Configure server/.env first.');
  process.exit(1);
}

async function seed() {
  try {
    console.log('🔄 Connecting to database to clear dummy data...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected. Clearing collections...');

    // Wipe database tables completely
    await Promise.all([
      User.deleteMany({}),
      Tool.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('🧹 Wiped all tools, bookings, payments, and notifications.');

    // Seed ONLY the Administrator account (so the system can still be managed if needed)
    console.log('🛡️ Creating clean System Administrator account...');
    const saltRounds = 12;
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);

    await User.create({
      fullName: 'System Administrator',
      email: 'admin@rentatool.com',
      passwordHash: adminPasswordHash,
      roles: ['renter', 'admin'],
      phoneNumber: '+91 99999 88888',
      userType: 'individual',
      verificationStatus: 'verified',
      authProvider: 'local',
    });

    console.log('✅ Clean setup complete! Seeded only admin@rentatool.com / admin123');
  } catch (error) {
    console.error('❌ Clean database script failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected database connection.');
    process.exit(0);
  }
}

seed();
