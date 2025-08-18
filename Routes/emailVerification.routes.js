import express from "express";
import { 
    sendEmailOTP, 
    verifyEmailOTP, 
    resendEmailOTP, 
    checkEmailVerification 
} from "../controllers/emailVerification.controller.js";

const router = express.Router();

// Send OTP for email verification
router.post("/send-otp", sendEmailOTP);

// Verify OTP
router.post("/verify-otp", verifyEmailOTP);

// Resend OTP
router.post("/resend-otp", resendEmailOTP);

// Check email verification status
router.get("/status/:email", checkEmailVerification);

export default router; 