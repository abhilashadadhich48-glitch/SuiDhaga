import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'tailor', 'admin'],
      default: 'customer',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    // Tailor specific fields
    bio: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Customer specific measurement profile
    measurements: {
      upperBody: {
        chest: { type: Number, default: 0 },
        shoulder: { type: Number, default: 0 },
        waist: { type: Number, default: 0 },
        sleeveLength: { type: Number, default: 0 },
      },
      lowerBody: {
        hip: { type: Number, default: 0 },
        inseam: { type: Number, default: 0 },
        outseam: { type: Number, default: 0 },
        waist: { type: Number, default: 0 },
      },
      accents: {
        neck: { type: Number, default: 0 },
        wrist: { type: Number, default: 0 },
        ankle: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
UserSchema.index({ role: 1, city: 1 });

export const User = model('User', UserSchema);
