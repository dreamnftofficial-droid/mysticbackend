import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import { Withdraw } from "../models/withdraw.model.js";
import { User } from "../models/user.model.js";
import { History } from "../models/history.model.js";
import { EmailVerification } from "../models/emailVerification.model.js";
import { sendemailverification } from "../middelwares/Email.js";
import { withdrawalOTPTemplate } from "../libs/email.template.js";
import speakeasy from "speakeasy";

// ⏳ User requests withdraw OTP (Step 1: Send OTP only)
export const requestWithdrawOTP = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Check if 2FA is enabled
  if (!user.twoFASecret || !user.twoFAEnabled) {
    throw new apierror(400, "You must enable 2FA before withdrawing");
  }

  // Check if user has a wallet bound
  if (!user.walletAddress || user.walletAddress.trim() === "") {
    throw new apierror(400, "You must bind a wallet address before withdrawing");
  }

  // Generate OTP for withdrawal verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in EmailVerification for this user
  let verification = await EmailVerification.findOne({ email: user.email });
  if (!verification) {
    verification = await EmailVerification.create({
      email: user.email,
      otp,
      expiresAt: expires,
      isVerified: false,
      attempts: 0,
      maxAttempts: 3,
      isBlocked: false,
      blockedUntil: null
    });
  } else {
    verification.otp = otp;
    verification.expiresAt = expires;
    verification.isVerified = false;
    verification.attempts = 0;
    verification.isBlocked = false;
    verification.blockedUntil = null;
    await verification.save();
  }

  // Send OTP email using withdrawal template
  const emailTemplate = withdrawalOTPTemplate(user.email, otp);
  await sendemailverification(user.email, otp, emailTemplate.subject, emailTemplate.html);

  // Check if user has a wallet configured
  const hasWallet = user.walletAddress && user.walletAddress.trim() !== "";

  return res.status(200).json(
    new apiresponse(200, {
      message: "OTP sent to your email for withdrawal verification",
      hasWallet: hasWallet
    }, "Please check your email and enter the OTP to proceed with withdrawal")
  );
});

// ⏳ User confirms withdraw with OTP (Step 2: Verify OTP and process withdrawal)
export const confirmWithdraw = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { amount, googleAuthCode, otp } = req.body;

  if (!amount || !googleAuthCode || !otp) {
    throw new apierror(400, "Amount, Google Authenticator code, and OTP are required");
  }

  if (amount < 20) throw new apierror(400, "Minimum withdraw amount is 20");
  if (user.amount < amount) throw new apierror(400, "Insufficient balance");

  // Prevent multiple pending withdraws
  const pendingWithdraw = await Withdraw.findOne({ userid: user._id, status: 'pending' });
  if (pendingWithdraw) {
    throw new apierror(400, "You already have a pending withdraw request. Please wait until it is processed.");
  }

  // Verify OTP
  const verification = await EmailVerification.findOne({ email: user.email });
  if (!verification) {
    throw new apierror(404, "No verification record found");
  }

  if (verification.checkIfBlocked()) {
    const remainingTime = Math.ceil((verification.blockedUntil - new Date()) / (1000 * 60));
    throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
  }

  if (verification.isExpired()) {
    await verification.incrementAttempts();
    throw new apierror(400, "OTP has expired");
  }

  if (verification.otp !== otp) {
    await verification.incrementAttempts();
    throw new apierror(400, "Invalid OTP");
  }

  // Verify Google Authenticator code
  const isVerified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: 'base32',
    token: googleAuthCode,
    window: 1
  });

  if (!isVerified) {
    throw new apierror(401, "Invalid Google Authenticator code");
  }

  // Get the wallet address
  const walletAddress = user.walletAddress;

  // Calculate amount after 5% fee
  const feeAmount = amount * 0.05;
  const amountAfterFee = amount - feeAmount;

  // Lock amount (deduct the full requested amount from user balance)
  user.amount -= amount;
  await user.save();

  const withdraw = await Withdraw.create({
    userid: user._id,
    email: user.email,
    fees: feeAmount,
    amount: amountAfterFee, // Amount user will receive (after fee)
    address: walletAddress,
  });

  // Create History record for withdrawal request
  const historyRecord = await History.create({
    userid: user._id,
    type: 'withdraw',
    amount: Number(Number(amount).toFixed(2)), // Store full amount deducted (including fees)
    status: 'debit',
    description: 'Requested',
    withdrawStatus: 'pending'
  });

  // Store the history record ID in the withdraw record for reference
  withdraw.historyId = historyRecord._id;
  await withdraw.save();

  // Clear the verification record
  await EmailVerification.findOneAndDelete({ email: user.email });

  return res.status(200).json(
    new apiresponse(200, {
      withdraw,
      requestedAmount: amount,
      amountToReceive: amountAfterFee,
      feeAmount: feeAmount,
      walletAddress: walletAddress
    }, "Withdraw request submitted successfully. You will receive " + amountAfterFee + " (after 5% fee deduction)")
  );
});
// 🧾 Admin sees all requests
export const getAllWithdraws = asynchandler(async (req, res) => {
  const withdraws = await Withdraw.find().populate("userid", "username email");
  return res.status(200).json(new apiresponse(200, withdraws, "All withdraws fetched"));
});

// ✅ Admin approves or rejects request
export const updateWithdrawStatus = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new apierror(400, "Status must be 'approved' or 'rejected'");
  }

  // Only update the status of the existing withdrawal record
  const withdraw = await Withdraw.findById(id);
  if (!withdraw) throw new apierror(404, "Withdraw request not found");

  if (withdraw.status !== 'pending') {
    throw new apierror(400, "Withdraw already processed");
  }

  withdraw.status = status;
  if(status === 'approved') {
    withdraw.approvedAt = Date.now();
    if (withdraw.historyId) {
      await History.findByIdAndUpdate(withdraw.historyId, {
        description: 'Approved',
        withdrawStatus: 'approved',
        amount: Number(Number(withdraw.amount).toFixed(2))
      });
    }
  }
  if(status === 'rejected') {
    withdraw.rejectedAt = Date.now();
    if (withdraw.historyId) {
      await History.findByIdAndUpdate(withdraw.historyId, {
        description: 'Rejected - No fees deducted',
        withdrawStatus: 'rejected',
        status: 'credit',
        amount: Number(Number(withdraw.amount + withdraw.fees).toFixed(2)) // Refund full amount including fees
      });
    }
    // Do NOT update user.amount here; sync function will handle the refund
  }

  // Save the updated withdrawal record (do not create a new one)
  await withdraw.save();

  return res.status(200).json(new apiresponse(200, withdraw, `Withdraw ${status}`));
});

// Get all withdraw requests for the authenticated user
export const getUserWithdrawRequests = asynchandler(async (req, res) => {
  const userId = req.user._id;
  const withdraws = await Withdraw.find({ userid: userId }).populate('historyId').sort({ createdAt: -1 });
  
  return res.status(200).json({
    statusCode: 200,
    data: withdraws,
    message: "User withdraw requests fetched successfully"
  });
});
