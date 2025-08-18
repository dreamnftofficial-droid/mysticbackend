// controllers/history.controller.js
import { History } from "../models/history.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";

export const getUserHistory = asynchandler(async (req, res) => {
  const userId = req.user._id;

  const history = await History.find({ userid: userId }).sort({ createdAt: -1 });

  return res.status(200).json(new apiresponse(200, history, "Transaction history fetched successfully"));
});
