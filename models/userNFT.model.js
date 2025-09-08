import mongoose, { Schema } from "mongoose";

const userNFTSchema = new Schema({
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
    purchasePrice: {
        type: Number,
        required: true,
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['collection', 'staked', 'sold', 'claimed', 'completed'],
        default: 'collection'
    },
    stakeId: {
        type: Schema.Types.ObjectId,
        ref: 'Stake',
        default: null,
    },
    soldPrice: {
        type: Number,
        default: null,
    },
    soldDate: {
        type: Date,
        default: null,
    },
    purchaseSource: {
        type: String,
        enum: ['free_zone', 'options_area'],
        required: true
    },
    purchaseStakeNo: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Method to check if NFT is available for staking
userNFTSchema.methods.isAvailableForStaking = function() {
    return this.status === 'collection';
};

// Method to check if NFT is available for selling
userNFTSchema.methods.isAvailableForSelling = function() {
    return this.status === 'collection';
};

// Method to mark NFT as staked
userNFTSchema.methods.markAsStaked = function(stakeId) {
    this.status = 'staked';
    this.stakeId = stakeId;
    return this;
};

// Method to mark NFT as sold
userNFTSchema.methods.markAsSold = function(soldPrice) {
    this.status = 'sold';
    this.soldPrice = soldPrice;
    this.soldDate = new Date();
    return this;
};

// Method to mark NFT as claimed (when stake profit is claimed)
userNFTSchema.methods.markAsClaimed = function() {
    this.status = 'claimed';
    return this;
};

export const UserNFT = mongoose.model('UserNFT', userNFTSchema); 