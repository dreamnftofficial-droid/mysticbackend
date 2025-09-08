import mongoose, { Schema } from "mongoose";

const emailVerificationSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    maxAttempts: {
        type: Number,
        default: 3,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockedUntil: {
        type: Date,
    },
    twoFASecret: {
        type: String,
    }
}, { timestamps: true });

// Index for faster queries and automatic cleanup
emailVerificationSchema.index({ email: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if OTP is expired
emailVerificationSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt;
};

// Method to check if email is blocked (renamed to avoid conflict)
emailVerificationSchema.methods.checkIfBlocked = function() {
    if (!this.isBlocked) return false;
    if (!this.blockedUntil) return false;
    return new Date() < this.blockedUntil;
};

// Method to increment attempts
emailVerificationSchema.methods.incrementAttempts = function() {
    this.attempts += 1;
    if (this.attempts >= this.maxAttempts) {
        this.isBlocked = true;
        this.blockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Block for 15 minutes
    }
    return this.save();
};

// Method to reset attempts
emailVerificationSchema.methods.resetAttempts = function() {
    this.attempts = 0;
    this.isBlocked = false;
    this.blockedUntil = null;
    return this.save();
};

export const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema); 