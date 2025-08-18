import { Stake } from "../models/stake.model.js";
import { User } from "../models/user.model.js";

// Function to check and complete stakes
export const checkAndCompleteStakes = async () => {
    try {
        console.log("Checking for completed stakes...");
        
        // Find all active stakes that have reached their end date or have 0 remaining days
        const activeStakes = await Stake.find({
            isActive: true,
            isCompleted: false
        }).populate('userId');
        
        let completedCount = 0;
        
        for (const stake of activeStakes) {
            try {
                const remainingDays = stake.getRemainingDays();
                const isCompleted = stake.checkIfCompleted();
                
                // Mark stake as completed if days reach 0 or end date has passed
                if (remainingDays === 0 || isCompleted) {
                    stake.isCompleted = true;
                    await stake.save();
                    completedCount++;
                    
                    console.log(`Stake ${stake._id} marked as completed (${remainingDays} days remaining)`);
                }
                
            } catch (error) {
                console.error(`Error processing stake ${stake._id}:`, error);
            }
        }
        
        console.log(`Found and marked ${completedCount} completed stakes`);
        console.log("Stake completion check finished");
        
    } catch (error) {
        console.error("Error in stake completion service:", error);
    }
};

// Function to get stake statistics for admin
export const getStakeStatistics = async () => {
    try {
        const totalStakes = await Stake.countDocuments();
        const activeStakes = await Stake.countDocuments({ isActive: true, isCompleted: false });
        const completedStakes = await Stake.countDocuments({ isCompleted: true });
        const claimedStakes = await Stake.countDocuments({ profitClaimed: true });
        
        const totalStakedAmount = await Stake.aggregate([
            { $group: { _id: null, total: { $sum: "$stakeAmount" } } }
        ]);
        
        const totalProfitGenerated = await Stake.aggregate([
            { $group: { _id: null, total: { $sum: "$totalProfit" } } }
        ]);
        
        const totalProfitClaimed = await Stake.aggregate([
            { $match: { profitClaimed: true } },
            { $group: { _id: null, total: { $sum: "$totalProfit" } } }
        ]);
        
        return {
            totalStakes,
            activeStakes,
            completedStakes,
            claimedStakes,
            totalStakedAmount: totalStakedAmount.length > 0 ? totalStakedAmount[0].total : 0,
            totalProfitGenerated: totalProfitGenerated.length > 0 ? totalProfitGenerated[0].total : 0,
            totalProfitClaimed: totalProfitClaimed.length > 0 ? totalProfitClaimed[0].total : 0
        };
        
    } catch (error) {
        console.error("Error getting stake statistics:", error);
        throw error;
    }
};

// Function to get pending profit amount (completed but not claimed)
export const getPendingProfitAmount = async () => {
    try {
        const pendingProfit = await Stake.aggregate([
            { $match: { isCompleted: true, profitClaimed: false } },
            { $group: { _id: null, total: { $sum: "$totalProfit" } } }
        ]);
        
        return pendingProfit.length > 0 ? pendingProfit[0].total : 0;
        
    } catch (error) {
        console.error("Error getting pending profit amount:", error);
        throw error;
    }
}; 