import { Reward } from "../models/reward.model.js";
import { History } from "../models/history.model.js";
import { User } from "../models/user.model.js";



export const createReward = async (req, res) => {
    try {
        const { userid, amount, remarks } = req.body;
        const reward = new Reward({
            userid,
            amount,
            remarks
        });
        await reward.save();
        // Update user balance
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.amount = (user.amount || 0) + Number(amount);
        await user.save();
        // Create history entry
        const history = new History({
            userid,
            type: 'Reward',
            amount: Number(Number(amount).toFixed(2)),
            status: 'credit',
            description: remarks || ''
        });
        await history.save();
        res.status(201).json(reward);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward.find();
        if (!rewards || rewards.length === 0) {
            return res.status(404).json({ message: "No rewards found" });
        }
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
