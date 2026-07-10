const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
    },
    type: {
      type: String,
      enum: ['deposit', 'refund', 'fine'],
      required: [true, 'Transaction type is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
