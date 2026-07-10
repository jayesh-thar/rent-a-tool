const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    ownershipType: {
      type: String,
      enum: ['personal', 'community'],
      default: 'personal',
    },
    name: {
      type: String,
      required: [true, 'Tool name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'worn'],
      required: [true, 'Condition is required'],
    },
    rentPerDay: {
      type: Number,
      required: [true, 'Rent per day rate is required'],
      min: [0, 'Rent rate cannot be negative'],
    },
    depositAmount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
    },
    customLateFeePerDay: {
      type: Number,
      default: 0,
      min: [0, 'Custom late fee cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tool', toolSchema);
