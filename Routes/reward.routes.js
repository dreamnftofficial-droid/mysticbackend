import { Router } from "express";   

import { createReward,getAllRewards } from "../controllers/reward.controller.js";

const router = Router();        

// Route to create a new reward
router.route('/create').post(createReward);
// Route to get all rewards
router.route('/all').get(getAllRewards);

export default router;