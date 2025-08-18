import mongoose, { Schema } from "mongoose";

const withdrawSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
 fees:{
  type:Number
 },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
    rejectedAt: {
        type: Date,
        default: null
    },
  historyId: {
    type: Schema.Types.ObjectId,
    ref: 'History',
    default: null
  },
}, { timestamps: true });

export const Withdraw = mongoose.model("Withdraw", withdrawSchema);
