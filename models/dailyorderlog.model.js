import mongoose, { Schema } from "mongoose";

const dailyOrderLogSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  purchased: {
    type: Number,
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  openOrders: {
    type: Number,
    default: 0
  }
});

export const DailyOrderLog = mongoose.model("DailyOrderLog", dailyOrderLogSchema);
