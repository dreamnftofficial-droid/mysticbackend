import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import { Withdraw } from "../models/withdraw.model.js";
import { User } from "../models/user.model.js";
import { History } from "../models/history.model.js";
import speakeasy from "speakeasy";

// ⏳ User requests withdraw
export const requestWithdraw = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { amount, googleAuthCode } = req.body;

  if (amount < 20) throw new apierror(400, "Minimum withdraw amount is 20");
  if (!amount || !googleAuthCode)
    throw new apierror(400, "Amount and Google Authenticator code are required");
  if (user.amount < amount) throw new apierror(400, "Insufficient balance");

  // Prevent multiple pending withdraws
  const pendingWithdraw = await Withdraw.findOne({ userid: user._id, status: 'pending' });
  if (pendingWithdraw) {
    throw new apierror(400, "You already have a pending withdraw request. Please wait until it is processed.");
  }

  // Check if 2FA is enabled
  if (!user.twoFASecret || !user.twoFAEnabled) {
    throw new apierror(400, "You must enable 2FA before withdrawing");
  }

  // Check if wallet is bound
  if (!user.walletAddress || user.walletAddress.trim() === "") {
    throw new apierror(400, "You must bind a wallet address before withdrawing");
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

  // Calculate amount after 8% fee
  const feeAmount = amount * 0.08;
  const amountAfterFee = amount - feeAmount;

  // Lock amount (deduct the full requested amount from user balance)
  user.amount -= amount;
  await user.save();

  const withdraw = await Withdraw.create({
    userid: user._id,
    email: user.email,
    fees:feeAmount,
    amount: amountAfterFee, // Original amount requested by user
    address: user.walletAddress, // Use bound wallet address
  });

  // Create History record for withdrawal request
  const historyRecord = await History.create({
    userid: user._id,
    type: 'withdraw',
    amount: Number(Number(amount).toFixed(2)), // Store full amount deducted (including fees)
    status: 'debit',
    description: 'Requested',
    withdrawStatus: 'pending' // Add custom field for withdrawal status
  });

  // Store the history record ID in the withdraw record for reference
  withdraw.historyId = historyRecord._id;
  await withdraw.save();

  return res.status(200).json(
    new apiresponse(200, {
      withdraw,
      requestedAmount: amount, // Amount user requested
      amountToReceive: amountAfterFee, // Amount user will actually receive (after 8% fee)
      feeAmount: feeAmount, // 8% fee deducted
      walletAddress: user.walletAddress
    }, "Withdraw request submitted successfully. You will receive " + amountAfterFee + " (after 8% fee deduction)")
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
        description: 'Rejected',
        withdrawStatus: 'rejected',
        status: 'credit',
        amount: Number(Number(withdraw.amount).toFixed(2))
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
