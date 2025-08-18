import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse} from "../utils/responsehandler.js";
import { Stake } from "../models/stake.model.js";
import { User } from "../models/user.model.js";
import { getStakeStatistics, getPendingProfitAmount } from "../scripts/stakeCompletionService.js";

// Get all stakes (admin only)
const getAllStakes = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, status, stakeType } = req.query;
    
    const filter = {};
    
    if (status) {
        if (status === 'active') {
            filter.isActive = true;
            filter.isCompleted = false;
        } else if (status === 'completed') {
            filter.isCompleted = true;
        } else if (status === 'claimed') {
            filter.profitClaimed = true;
        }
    }
    
    if (stakeType) {
        filter.stakeType = stakeType;
    }
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
            { path: 'userId', select: 'username email level' },
            { path: 'nftId', select: 'name picture' }
        ],
        sort: { createdAt: -1 }
    };
    
    const stakes = await Stake.paginate(filter, options);
    
    res.status(200).json(
        new apiresponse(200, stakes, "All stakes retrieved successfully")
    );
});

// Get stake statistics (admin only)
const getAdminStakeStats = asynchandler(async (req, res) => {
    const stats = await getStakeStatistics();
    const pendingProfit = await getPendingProfitAmount();
    
    const fullStats = {
        ...stats,
        pendingProfit
    };
    
    res.status(200).json(
        new apiresponse(200, fullStats, "Stake statistics retrieved successfully")
    );
});

// Get stakes by user (admin only)
const getStakesByUser = asynchandler(async (req, res) => {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new apierror(404, "User not found");
    }
    
    const stakes = await Stake.find({ userId })
        .populate('nftId')
        .populate('userId', 'username email level')
        .sort({ createdAt: -1 });
    
    // Add remaining days and completion status, auto-update if needed
    const stakesWithDetails = stakes.map(stake => {
        const stakeObj = stake.toObject();
        const remainingDays = stake.getRemainingDays();
        const isCompleted = stake.checkIfCompleted();
        
        // Auto-update stake status if days reach 0
        if (remainingDays === 0 && !stake.isCompleted) {
            stake.isCompleted = true;
            stake.save();
        }
        
        stakeObj.remainingDays = remainingDays;
        stakeObj.isCompleted = isCompleted || remainingDays === 0;
        return stakeObj;
    });
    
    res.status(200).json(
        new apiresponse(200, stakesWithDetails, "User stakes retrieved successfully")
    );
});

// Force complete a stake (admin only)
const forceCompleteStake = asynchandler(async (req, res) => {
    const { stakeId } = req.params;
    
    const stake = await Stake.findById(stakeId);
    if (!stake) {
        throw new apierror(404, "Stake not found");
    }
    
    if (stake.isCompleted) {
        throw new apierror(400, "Stake is already completed");
    }
    
    stake.isCompleted = true;
    await stake.save();
    
    res.status(200).json(
        new apiresponse(200, stake, "Stake force completed successfully")
    );
});

// Force claim profit for a stake (admin only)
const forceClaimProfit = asynchandler(async (req, res) => {
    const { stakeId } = req.params;
    
    const stake = await Stake.findById(stakeId).populate('userId');
    if (!stake) {
        throw new apierror(404, "Stake not found");
    }
    
    if (!stake.isCompleted) {
        throw new apierror(400, "Stake is not completed yet");
    }
    
    if (stake.profitClaimed) {
        throw new apierror(400, "Profit already claimed");
    }
    
    // Update user balance
    const user = await User.findById(stake.userId._id);
    user.amount += stake.totalProfit;
    await user.save();
    
    // Mark profit as claimed
    stake.profitClaimed = true;
    stake.isActive = false;
    await stake.save();
    
    res.status(200).json(
        new apiresponse(200, { 
            claimedAmount: stake.totalProfit,
            newBalance: user.amount 
        }, "Profit force claimed successfully")
    );
});

// Cancel a stake (admin only)
const adminCancelStake = asynchandler(async (req, res) => {
    const { stakeId } = req.params;
    
    const stake = await Stake.findById(stakeId).populate('userId');
    if (!stake) {
        throw new apierror(404, "Stake not found");
    }
    
    if (stake.isCompleted) {
        throw new apierror(400, "Cannot cancel completed stake");
    }
    
    if (stake.profitClaimed) {
        throw new apierror(400, "Cannot cancel stake with claimed profit");
    }
    
    // Return stake amount to user
    const user = await User.findById(stake.userId._id);
    user.amount += stake.stakeAmount;
    await user.save();
    
    // Deactivate stake
    stake.isActive = false;
    await stake.save();
    
    res.status(200).json(
        new apiresponse(200, { 
            returnedAmount: stake.stakeAmount,
            newBalance: user.amount 
        }, "Stake cancelled by admin successfully")
    );
});

// Get stake details (admin only)
const getStakeDetails = asynchandler(async (req, res) => {
    const { stakeId } = req.params;
    
    const stake = await Stake.findById(stakeId)
        .populate('userId', 'username email level amount')
        .populate('nftId');
    
    if (!stake) {
        throw new apierror(404, "Stake not found");
    }
    
    // Add remaining days and completion status, auto-update if needed
    const remainingDays = stake.getRemainingDays();
    const isCompleted = stake.checkIfCompleted();
    
    // Auto-update stake status if days reach 0
    if (remainingDays === 0 && !stake.isCompleted) {
        stake.isCompleted = true;
        await stake.save();
    }
    
    const stakeObj = stake.toObject();
    stakeObj.remainingDays = remainingDays;
    stakeObj.isCompleted = isCompleted || remainingDays === 0;
    
    res.status(200).json(
        new apiresponse(200, stakeObj, "Stake details retrieved successfully")
    );
});

// Get stakes by date range (admin only)
    const getStakesByDateRange = asynchandler(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
    if (!startDate || !endDate) {
        throw new apierror(400, "Start date and end date are required");
    }
    
    const filter = {
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };
    
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [
            { path: 'userId', select: 'username email level' },
            { path: 'nftId', select: 'name picture' }
        ],
        sort: { createdAt: -1 }
    };
    
    const stakes = await Stake.paginate(filter, options);
    
    res.status(200).json(
        new apiresponse(200, stakes, "Stakes by date range retrieved successfully")
    );
});

export {
    getAllStakes,
    getAdminStakeStats,
    getStakesByUser,
    forceCompleteStake,
    forceClaimProfit,
    adminCancelStake,
    getStakeDetails,
    getStakesByDateRange
}; 