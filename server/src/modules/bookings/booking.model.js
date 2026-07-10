const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    toolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: [true, 'Tool ID is required'],
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower ID is required'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    bookingStatus: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'active', 'returned'],
      default: 'requested',
    },
    amount: {
      type: Number,
      required: [true, 'Rental amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    deposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    damageFine: {
      type: Number,
      default: 0,
    },
    isDamaged: {
      type: Boolean,
      default: false,
    },
    damageNotes: {
      type: String,
      default: '',
    },
    returnTime: {
      type: String,
      default: '18:00',
    },
    overdueAlertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
