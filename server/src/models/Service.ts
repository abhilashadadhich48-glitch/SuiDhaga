import { Schema, model } from 'mongoose';

const ServiceSchema = new Schema(
  {
    tailor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    baseTimeDays: {
      type: Number,
      required: true,
      default: 7,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

ServiceSchema.index({ tailor: 1, category: 1 });

export const Service = model('Service', ServiceSchema);
