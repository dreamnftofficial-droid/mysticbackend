import mongoose, { Schema } from "mongoose";

const stakeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    nftId: {
        type: Schema.Types.ObjectId,
        ref: 'NFT',
        required: true,
    },
    stakeType: {
        type: String,
        enum: ['options_area', 'free_zone'],
        required: true,
    },
    stakeNo: {
        type: Number,
        required: true,
        // For options_area: 1-6, for free_zone: 1-3
    },
    stakeAmount: {
        type: Number,
        required: true,
    },
    stakePeriod: {
        type: Number,
        required: true,
        // For options_area: 7-30 days, for free_zone: 3-30 days
    },
    dailyProfitPercentage: {
        type: Number,
        required: true,
    },
    totalProfit: {
        type: Number,
        required: true,
    },
    stakeStartDate: {
        type: Date,
        default: Date.now,
    },
    stakeEndDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    profitClaimed: {
        type: Boolean,
        default: false,
    },
    userLevel: {
        type: Number,
        required: true,
        // For options_area: 2-6, for free_zone: 0-6
    },
    // Daily profit tracking
    dailyProfits: [{
        day: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        profitAmount: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        }
    }],
    // Track current day
    currentDay: {
        type: Number,
        default: 1
    },
    // Track if daily profit was calculated today
    lastProfitCalculation: {
        type: Date
    }
}, { timestamps: true });

// Static method to get stake configuration
stakeSchema.statics.getStakeConfig = function() {
    return {
        options_area: {
            minLevel: 2,
            maxLevel: 6,
            stakes: {
                1: { minAmount: 199, maxAmount: 1000, dailyProfit: 1.5, minPeriod: 7, maxPeriod: 30 },
                2: { minAmount: 499, maxAmount: 2000, dailyProfit: 1.8, minPeriod: 7, maxPeriod: 30 },
                3: { minAmount: 799, maxAmount: 3000, dailyProfit: 2.1, minPeriod: 7, maxPeriod: 30 },
                4: { minAmount: 999, maxAmount: 4000, dailyProfit: 2.5, minPeriod: 7, maxPeriod: 30 },
                5: { minAmount: 1499, maxAmount: 5000, dailyProfit: 3.0, minPeriod: 7, maxPeriod: 30 },
                6: { minAmount: 1999, maxAmount: 6000, dailyProfit: 3.5, minPeriod: 7, maxPeriod: 30 }
            }
        },
        free_zone: {
            minLevel: 0,
            maxLevel: 6,
            stakes: {
                1: { minAmount: 200, maxAmount: 499, dailyProfit: 1.2, minPeriod: 3, maxPeriod: 30 },
                2: { minAmount: 500, maxAmount: 799, dailyProfit: 1.5, minPeriod: 3, maxPeriod: 30 },
                3: { minAmount: 800, maxAmount: 1200, dailyProfit: 1.7, minPeriod: 3, maxPeriod: 30 }
            }
        }
    };
};

// Method to calculate total profit
stakeSchema.methods.calculateTotalProfit = function() {
    return (this.stakeAmount * this.dailyProfitPercentage * this.stakePeriod) / 100;
};

// Method to get remaining days
stakeSchema.methods.getRemainingDays = function() {
    const now = new Date();
    const endDate = new Date(this.stakeEndDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

// Method to check if stake is completed
stakeSchema.methods.checkIfCompleted = function() {
    const now = new Date();
    const endDate = new Date(this.stakeEndDate);
    return now >= endDate;
};

// Method to calculate daily profit
stakeSchema.methods.calculateDailyProfit = function() {
    return (this.stakeAmount * this.dailyProfitPercentage) / 100;
};

// Method to add daily profit to log
stakeSchema.methods.addDailyProfit = function() {
    const today = new Date();
    const startDate = new Date(this.stakeStartDate);
    const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if we already calculated profit for today
    const todayProfit = this.dailyProfits.find(profit => 
        profit.date.toDateString() === today.toDateString()
    );
    
    if (!todayProfit && dayDiff <= this.stakePeriod) {
        const dailyProfitAmount = this.calculateDailyProfit();
        
        this.dailyProfits.push({
            day: dayDiff,
            date: today,
            profitAmount: dailyProfitAmount,
            isPaid: false
        });
        
        this.currentDay = dayDiff;
        this.lastProfitCalculation = today;
    }
    
    return this;
};

// Method to get total accumulated profit
stakeSchema.methods.getTotalAccumulatedProfit = function() {
    return this.dailyProfits.reduce((total, profit) => total + profit.profitAmount, 0);
};

// Method to get today's profit
stakeSchema.methods.getTodayProfit = function() {
    const today = new Date();
    const todayProfit = this.dailyProfits.find(profit => 
        profit.date.toDateString() === today.toDateString()
    );
    return todayProfit ? todayProfit.profitAmount : 0;
};

export const Stake = mongoose.model('Stake', stakeSchema); 