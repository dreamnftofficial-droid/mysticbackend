import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse} from "../utils/responsehandler.js";
import { Stake } from "../models/stake.model.js";
import { User } from "../models/user.model.js";
import { NFT } from "../models/nft.model.js";
import { UserNFT } from "../models/userNFT.model.js";

// Get qualified NFTs for user based on their level
const getQualifiedNFTs = asynchandler(async (req, res) => {
    const { stakeType, stakeNo } = req.query;
    const userId = req.user._id;
    
    if (!stakeType || !stakeNo) {
        throw new apierror(400, "Stake type and stake number are required");
    }
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
        throw new apierror(404, "User not found");
    }
    
    // Get stake configuration
    const config = Stake.getStakeConfig();
    const stakeConfig = config[stakeType]?.stakes[stakeNo];
    
    if (!stakeConfig) {
        throw new apierror(400, "Invalid stake configuration");
    }
    
    // Validate user level
    if (stakeType === 'options_area' && (user.level < config.options_area.minLevel || user.level > config.options_area.maxLevel)) {
        throw new apierror(400, "User level not eligible for options area staking");
    }
    
    if (stakeType === 'free_zone' && (user.level < config.free_zone.minLevel || user.level > config.free_zone.maxLevel)) {
        throw new apierror(400, "User level not eligible for free zone staking");
    }
    
    // Generate 15 random NFTs with prices based on stake range
    const nfts = [];
    const userBalance = user.amount;
    const stakeMinAmount = stakeConfig.minAmount;
    const stakeMaxAmount = stakeConfig.maxAmount;
    
    // Get 15 random NFTs from database
    const availableNFTs = await NFT.aggregate([
        { $sample: { size: 15 } }
    ]);
    
    if (availableNFTs.length === 0) {
        throw new apierror(404, "No NFTs available in database");
    }
    
    // Always use the stake range from configuration, regardless of user balance
    const priceRange = { 
        min: stakeConfig.minAmount, 
        max: stakeConfig.maxAmount 
    };
    
    // Validate that we have a valid price range
    if (priceRange.min >= priceRange.max) {
        throw new apierror(400, "Invalid stake configuration: min amount must be less than max amount");
    }
    
    // Generate varied prices within the range
    for (let i = 0; i < Math.min(15, availableNFTs.length); i++) {
        const nft = availableNFTs[i];
        
        // Create realistic price variations within the range
        let price;
        const range = priceRange.max - priceRange.min;
        
        if (range <= 0) {
            price = priceRange.min;
        } else {
            // Create 5 different price tiers within the range for variety
            const tier = i % 5; // 5 different tiers
            
            // Define realistic price points within the range
            const pricePoints = [
                priceRange.min + Math.floor(range * 0.1),  // 10% from min (budget)
                priceRange.min + Math.floor(range * 0.3),  // 30% from min (economy)
                priceRange.min + Math.floor(range * 0.5),  // 50% from min (mid-range)
                priceRange.min + Math.floor(range * 0.7),  // 70% from min (premium)
                priceRange.min + Math.floor(range * 0.9)   // 90% from min (luxury)
            ];
            
            const basePrice = pricePoints[tier];
            
            // Add small random variation (±3% of the range) for realism
            const variationRange = Math.floor(range * 0.03); // 3% variation
            const randomVariation = Math.floor((Math.random() - 0.5) * variationRange * 2);
            price = basePrice + randomVariation;
            
            // Ensure price stays within the exact range bounds
            price = Math.max(priceRange.min, Math.min(priceRange.max, price));
        }
        
        nfts.push({
            ...nft,
            price: price,
            dailyProfit: stakeConfig.dailyProfit,
            minPeriod: stakeConfig.minPeriod,
            maxPeriod: stakeConfig.maxPeriod
        });
    }
    
    if (nfts.length === 0) {
        throw new apierror(404, "No NFTs available for purchase");
    }
    
    res.status(200).json(
        new apiresponse(200, {
            nfts,
            userBalance: user.amount,
            stakeConfig: {
                minAmount: stakeConfig.minAmount,
                maxAmount: stakeConfig.maxAmount,
                dailyProfit: stakeConfig.dailyProfit,
                minPeriod: stakeConfig.minPeriod,
                maxPeriod: stakeConfig.maxPeriod
            },
            priceRange: {
                actualMin: priceRange.min,
                actualMax: priceRange.max,
                userBalance: userBalance,
                stakeMinAmount: stakeMinAmount,
                stakeMaxAmount: stakeMaxAmount,
                range: priceRange.max - priceRange.min,
                note: "Prices are based on stake range configuration, not user balance"
            }
        }, "Qualified NFTs retrieved successfully")
    );
});

// Buy NFT - goes to collection with immediate staking
const buyNFT = asynchandler(async (req, res) => {
    const { nftId, stakeType, stakeNo, price, stakePeriod } = req.body;
    const userId = req.user._id;
    
    if (!nftId || !stakeType || !stakeNo || !price || !stakePeriod) {
        throw new apierror(400, "All fields are required");
    }
    
    // Get user info
    const user = await User.findById(userId);
    if (!user) {
        throw new apierror(404, "User not found");
    }
    
    // Get stake configuration
    const config = Stake.getStakeConfig();
    const stakeConfig = config[stakeType]?.stakes[stakeNo];
    
    if (!stakeConfig) {
        throw new apierror(400, "Invalid stake configuration");
    }
    
    // Validate price
    if (price < stakeConfig.minAmount || price > stakeConfig.maxAmount) {
        throw new apierror(400, `Price must be between ${stakeConfig.minAmount} and ${stakeConfig.maxAmount}`);
    }
    
    // Validate stake period
    if (stakePeriod < stakeConfig.minPeriod || stakePeriod > stakeConfig.maxPeriod) {
        throw new apierror(400, `Stake period must be between ${stakeConfig.minPeriod} and ${stakeConfig.maxPeriod} days`);
    }
    
    // Check if user has sufficient balance
    if (user.amount < price) {
        throw new apierror(400, "Insufficient balance");
    }
    
    // Validate NFT
    const nft = await NFT.findById(nftId);
    if (!nft) {
        throw new apierror(404, "NFT not found");
    }
    
    // Deduct amount from user balance
    user.amount -= price;
    await user.save();
    
    // Calculate total profit
    const totalProfit = (price * stakeConfig.dailyProfit * stakePeriod) / 100;
    
    // Calculate stake end date
    const stakeStartDate = new Date();
    const stakeEndDate = new Date(stakeStartDate);
    stakeEndDate.setDate(stakeEndDate.getDate() + stakePeriod);
    
    // Create stake immediately
    const stake = await Stake.create({
        userId,
        nftId,
        stakeType,
        stakeNo,
        stakeAmount: price,
        stakePeriod,
        dailyProfitPercentage: stakeConfig.dailyProfit,
        totalProfit,
        stakeStartDate,
        stakeEndDate,
        isActive: true,
        isCompleted: false,
        profitClaimed: false,
        userLevel: user.level,
        currentDay: 1,
        lastProfitCalculation: stakeStartDate
    });
    
    // Add NFT to user's collection with status "staked" and link to stake
    const userNFT = await UserNFT.create({
        userId,
        nftId,
        purchasePrice: price,
        status: "staked", // NFT is immediately staked
        purchaseSource: stakeType,
        purchaseStakeNo: stakeNo,
        stakeId: stake._id // Link to the stake
    });
    
    const populatedUserNFT = await UserNFT.findById(userNFT._id)
        .populate('nftId')
        .populate('userId', 'username email level');
    
    res.status(201).json(
        new apiresponse(201, {
            userNFT: populatedUserNFT,
            stake: stake,
            newBalance: user.amount,
            totalProfit: totalProfit,
            stakeEndDate: stakeEndDate
        }, "NFT purchased and staked successfully")
    );
});

// Get user's NFT collection (shows staked NFTs with remaining time)
const getUserNFTs = asynchandler(async (req, res) => {
    const userId = req.user._id;
    
    const userNFTs = await UserNFT.find({ 
        userId, 
        status: "staked" // Show staked NFTs
    })
        .populate('nftId')
        .populate('userId', 'username email level')
        .populate('stakeId')
        .sort({ createdAt: -1 });
    
    // Add remaining days and profit info
    const nftsWithDetails = userNFTs.map(userNFT => {
        const nftObj = userNFT.toObject();
        if (userNFT.stakeId) {
            const stake = userNFT.stakeId;
            const remainingDays = stake.getRemainingDays();
            const isCompleted = stake.checkIfCompleted();
            
            // Auto-update stake status if days reach 0
            if (remainingDays === 0 && !stake.isCompleted) {
                stake.isCompleted = true;
                stake.save();
            }
            
            nftObj.remainingDays = Math.max(0, remainingDays);
            nftObj.isCompleted = isCompleted || remainingDays === 0;
            nftObj.totalAccumulatedProfit = stake.getTotalAccumulatedProfit();
            nftObj.todayProfit = stake.getTodayProfit();
            nftObj.stakeEndDate = stake.stakeEndDate;
        }
        return nftObj;
    });
    
    res.status(200).json(
        new apiresponse(200, nftsWithDetails, "User NFT collection retrieved successfully")
    );
});

// Get user's all stakes (staked, completed, claimed)
const getUserStakes = asynchandler(async (req, res) => {
    const userId = req.user._id;
    
    const stakes = await Stake.find({ userId })
        .populate('nftId')
        .populate('userId', 'username email level')
        .sort({ createdAt: -1 });
    
    // Add remaining days, completion status, and daily profit info
    const stakesWithDetails = stakes.map(stake => {
        const stakeObj = stake.toObject();
        const remainingDays = stake.getRemainingDays();
        const isCompleted = stake.checkIfCompleted();
        
        // Auto-update stake status if days reach 0
        if (remainingDays === 0 && !stake.isCompleted) {
            stake.isCompleted = true;
            stake.save();
        }
        
        // Determine status
        let status = "active";
        if (stake.isCompleted && stake.profitClaimed) {
            status = "claimed";
        } else if (stake.isCompleted && !stake.profitClaimed) {
            status = "completed";
        }
        
        stakeObj.remainingDays = Math.max(0, remainingDays); // Never go negative
        stakeObj.isCompleted = isCompleted || remainingDays === 0;
        stakeObj.status = status;
        stakeObj.totalAccumulatedProfit = stake.getTotalAccumulatedProfit();
        stakeObj.todayProfit = stake.getTodayProfit();
        return stakeObj;
    });
    
    res.status(200).json(
        new apiresponse(200, stakesWithDetails, "User stakes retrieved successfully")
    );
});

// Get active stakes only
const getActiveStakes = asynchandler(async (req, res) => {
    const userId = req.user._id;
    
    const activeStakes = await Stake.find({ 
        userId, 
        isActive: true,
        isCompleted: false 
    })
        .populate('nftId')
        .populate('userId', 'username email level')
        .sort({ createdAt: -1 });
    
    // Add remaining days and daily profit info, auto-update status
    const stakesWithDetails = activeStakes.map(stake => {
        const stakeObj = stake.toObject();
        const remainingDays = stake.getRemainingDays();
        
        // Auto-update stake status if days reach 0
        if (remainingDays === 0) {
            stake.isCompleted = true;
            stake.save();
        }
        
        stakeObj.remainingDays = Math.max(0, remainingDays); // Never go negative
        stakeObj.isCompleted = remainingDays === 0;
        stakeObj.status = remainingDays === 0 ? "completed" : "active";
        stakeObj.totalAccumulatedProfit = stake.getTotalAccumulatedProfit();
        stakeObj.todayProfit = stake.getTodayProfit();
        return stakeObj;
    });
    
    res.status(200).json(
        new apiresponse(200, stakesWithDetails, "Active stakes retrieved successfully")
    );
});

// Get completed stakes only
const getCompletedStakes = asynchandler(async (req, res) => {
    const userId = req.user._id;
    
    const completedStakes = await Stake.find({ 
        userId, 
        isCompleted: true 
    })
        .populate('nftId')
        .populate('userId', 'username email level')
        .sort({ stakeEndDate: -1 });
    
    // Add status information
    const stakesWithDetails = completedStakes.map(stake => {
        const stakeObj = stake.toObject();
        stakeObj.status = stake.profitClaimed ? "claimed" : "completed";
        stakeObj.remainingDays = 0; // Always 0 for completed stakes
        stakeObj.totalAccumulatedProfit = stake.getTotalAccumulatedProfit();
        return stakeObj;
    });
    
    res.status(200).json(
        new apiresponse(200, stakesWithDetails, "Completed stakes retrieved successfully")
    );
});

// Test endpoint to verify stake configuration
const testStakeConfig = asynchandler(async (req, res) => {
    const { stakeType, stakeNo } = req.query;
    
    if (!stakeType || !stakeNo) {
        throw new apierror(400, "Stake type and stake number are required");
    }
    
    const config = Stake.getStakeConfig();
    const stakeConfig = config[stakeType]?.stakes[stakeNo];
    
    if (!stakeConfig) {
        throw new apierror(400, "Invalid stake configuration");
    }
    
    res.status(200).json(
        new apiresponse(200, {
            stakeType,
            stakeNo,
            stakeConfig,
            fullConfig: config
        }, "Stake configuration retrieved successfully")
    );
});

// Get stake statistics
const getStakeStats = asynchandler(async (req, res) => {
    const userId = req.user._id;
    
    const totalStakes = await Stake.countDocuments({ userId });
    const activeStakes = await Stake.countDocuments({ userId, isActive: true, isCompleted: false });
    const completedStakes = await Stake.countDocuments({ userId, isCompleted: true, profitClaimed: false });
    const claimedStakes = await Stake.countDocuments({ userId, profitClaimed: true });
    const totalProfitEarned = await Stake.aggregate([
        { $match: { userId: userId, profitClaimed: true } },
        { $group: { _id: null, total: { $sum: "$totalProfit" } } }
    ]);
    
    const totalProfitEarnedValue = totalProfitEarned.length > 0 ? totalProfitEarned[0].total : 0;
    
    const stats = {
        totalStakes,
        activeStakes,
        completedStakes,
        claimedStakes,
        totalProfitEarned: totalProfitEarnedValue
    };
    
    res.status(200).json(
        new apiresponse(200, stats, "Stake statistics retrieved successfully")
    );
});

// Function to auto-complete stakes (called from /me endpoint)
export const autoCompleteStakesBackground = async (userId) => {
    try {
        // Find all completed stakes that haven't been auto-completed yet
        const completedStakes = await Stake.find({ 
            userId, 
            isCompleted: true,
            profitClaimed: false 
        }).populate('nftId');
        
        let completedCount = 0;
        
        for (const stake of completedStakes) {
            try {
                // Get user
                const user = await User.findById(userId);
                if (!user) continue;
                
                // Calculate total accumulated profit
                const totalAccumulatedProfit = stake.getTotalAccumulatedProfit();
                
                // Get the associated UserNFT
                const userNFT = await UserNFT.findOne({ stakeId: stake._id });
                if (!userNFT) continue;
                
                // Auto-sell the NFT (add purchase price back to user balance)
                const nftSaleAmount = userNFT.purchasePrice;
                
                // Add profit + NFT sale amount to user balance
                user.amount += totalAccumulatedProfit + nftSaleAmount;
                await user.save();
                
                // Mark stake as claimed
                stake.profitClaimed = true;
                stake.isActive = false;
                await stake.save();
                
                // Mark NFT as sold (auto-sold)
                userNFT.status = "sold";
                userNFT.soldPrice = nftSaleAmount;
                userNFT.soldDate = new Date();
                userNFT.stakeId = null;
                await userNFT.save();
                
                completedCount++;
                
            } catch (error) {
                console.error(`Error auto-completing stake ${stake._id}:`, error);
            }
        }
        
        return completedCount;
        
    } catch (error) {
        console.error("Error in auto-complete stakes background:", error);
        return 0;
    }
};

// Function to calculate daily profits for active stakes
export const calculateDailyProfits = async (userId) => {
    try {
        const activeStakes = await Stake.find({
            userId,
            isActive: true,
            isCompleted: false
        });
        
        for (const stake of activeStakes) {
            stake.addDailyProfit();
            await stake.save();
        }
        
        return activeStakes.length;
        
    } catch (error) {
        console.error("Error calculating daily profits:", error);
        return 0;
    }
};

export {
    getQualifiedNFTs,
    buyNFT,
    getUserNFTs,
    getUserStakes,
    getActiveStakes,
    getCompletedStakes,
    getStakeStats,
    testStakeConfig
}; 