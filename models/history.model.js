// models/history.model.js
import mongoose, { Schema } from "mongoose";

const historySchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
  },
  withdrawStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: null
  },
}, { timestamps: true });

export const History = mongoose.model("History", historySchema);
