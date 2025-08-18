import { EmailVerification } from "../models/emailVerification.model.js";
import { User } from "../models/user.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import { sendemailverification } from "../middelwares/Email.js";

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for email verification
export const sendEmailOTP = asynchandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new apierror(400, "Email is required");
    }

    // Check if email already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified) {
        throw new apierror(400, "Email already exists and is verified");
    }

    // Check if there's an existing verification record
    let verificationRecord = await EmailVerification.findOne({ email });

    // If verification record exists, check if it's blocked
    if (verificationRecord && verificationRecord.checkIfBlocked()) {
        const remainingTime = Math.ceil((verificationRecord.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (verificationRecord) {
        // Update existing record
        verificationRecord.otp = otp;
        verificationRecord.expiresAt = expiresAt;
        verificationRecord.isVerified = false;
        verificationRecord.attempts = 0;
        verificationRecord.isBlocked = false;
        verificationRecord.blockedUntil = null;
        await verificationRecord.save();
    } else {
        // Create new record
        verificationRecord = await EmailVerification.create({
            email,
            otp,
            expiresAt,
        });
    }

    // Send OTP via email
    try {
        await sendemailverification(email, otp);
    } catch (error) {
        throw new apierror(500, "Failed to send OTP email");
    }

    return res.status(200).json(
        new apiresponse(200, { email }, null, "OTP sent successfully")
    );
});

// Verify OTP
export const verifyEmailOTP = asynchandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new apierror(400, "Email and OTP are required");
    }

    // Find verification record
    const verificationRecord = await EmailVerification.findOne({ email });

    if (!verificationRecord) {
        throw new apierror(404, "No verification record found for this email");
    }

    // Check if email is blocked
    if (verificationRecord.checkIfBlocked()) {
        const remainingTime = Math.ceil((verificationRecord.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }

    // Check if OTP is expired
    if (verificationRecord.isExpired()) {
        await verificationRecord.incrementAttempts();
        throw new apierror(400, "OTP has expired");
    }

    // Verify OTP
    if (verificationRecord.otp !== otp) {
        await verificationRecord.incrementAttempts();
        throw new apierror(400, "Invalid OTP");
    }

    // Mark as verified
    verificationRecord.isVerified = true;
    verificationRecord.attempts = 0;
    verificationRecord.isBlocked = false;
    verificationRecord.blockedUntil = null;
    await verificationRecord.save();

    return res.status(200).json(
        new apiresponse(200, { email, verified: true }, null, "Email verified successfully")
    );
});

// Resend OTP
export const resendEmailOTP = asynchandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new apierror(400, "Email is required");
    }

    // Check if there's an existing verification record
    let verificationRecord = await EmailVerification.findOne({ email });

    if (!verificationRecord) {
        throw new apierror(404, "No verification record found. Please send OTP first");
    }

    // Check if email is blocked
    if (verificationRecord.checkIfBlocked()) {
        const remainingTime = Math.ceil((verificationRecord.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update record
    verificationRecord.otp = otp;
    verificationRecord.expiresAt = expiresAt;
    verificationRecord.isVerified = false;
    verificationRecord.attempts = 0;
    verificationRecord.isBlocked = false;
    verificationRecord.blockedUntil = null;
    await verificationRecord.save();

    // Send OTP via email
    try {
        await sendemailverification(email, otp);
    } catch (error) {
        throw new apierror(500, "Failed to send OTP email");
    }

    return res.status(200).json(
        new apiresponse(200, { email }, null, "OTP resent successfully")
    );
});

// Check email verification status
export const checkEmailVerification = asynchandler(async (req, res) => {
    const { email } = req.params;

    if (!email) {
        throw new apierror(400, "Email is required");
    }

    const verificationRecord = await EmailVerification.findOne({ email });

    if (!verificationRecord) {
        throw new apierror(404, "No verification record found");
    }

    return res.status(200).json(
        new apiresponse(200, {
            email: verificationRecord.email,
            isVerified: verificationRecord.isVerified,
            isExpired: verificationRecord.isExpired(),
            isBlocked: verificationRecord.checkIfBlocked(),
            attempts: verificationRecord.attempts,
            expiresAt: verificationRecord.expiresAt
        }, null, "Verification status retrieved successfully")
    );
}); 