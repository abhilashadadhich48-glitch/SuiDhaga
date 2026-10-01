import { Schema, model } from 'mongoose';

const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tailor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    designReferences: [
      {
        type: String,
      },
    ],
    selectedMeasurements: {
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
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Fabric Sourcing',
        'Cutting & Preparation',
        'Hand-stitching',
        'Final Pressing',
        'Dispatched',
        'Delivered',
      ],
      default: 'Pending',
    },
    milestoneTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        mediaUrl: { type: String, default: '' },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ customer: 1 });
OrderSchema.index({ tailor: 1 });

export const Order = model('Order', OrderSchema);
