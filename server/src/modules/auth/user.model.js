const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be under 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      // Not required — Google-only accounts won't have a password (Phase 2).
    },
    roles: {
      type: [String],
      enum: ['renter', 'owner', 'admin'],
      default: ['renter', 'owner'],
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    userType: {
      type: String,
      enum: ['individual', 'community'],
      default: 'individual',
    },
    communityDetails: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      registrationId: { type: String, default: '' },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified'],
      default: 'unverified',
      // Not enforced at login yet — deferred per build plan decision.
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'both'],
      default: 'local',
    },
    profilePicture: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Never return passwordHash or __v in JSON responses.
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
