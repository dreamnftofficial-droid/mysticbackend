import { User } from "../models/user.model.js";
import { Deposit } from "../models/deposit.model.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/responsehandler.js";
import { asynchandler } from "../utils/asynchandler.js";
import { History } from "../models/history.model.js";


function generateOrderId(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
  let order_id = '';
  for (let i = 0; i < length; i++) {
    order_id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return order_id;
}

export const createDeposit = asynchandler(async (req, res) => {
    const { _id } = req.user;
    const { amount } = req.body;

    let order_id;
    let existing;

    // Keep generating until a unique order_id is found
    do {
        order_id = generateOrderId();
        existing = await Deposit.findOne({ order_id });
    } while (existing);

    const depositData = {
        userId: _id,
        order_id,
        amount,
        created_at: new Date(),
        order_description: `Deposit for order ${order_id}`,
    };

    let deposit = await Deposit.create(depositData);

    if (!deposit) {
        throw new apierror(500, "Failed to create deposit");
    }

   

    return res
    .status(201)
    .json(   new apiresponse(201,deposit,null,"Deposit created successfully"))
});
function mapNowPaymentStatus(nowStatus) {
    switch (nowStatus) {
      case 'waiting':
      case 'confirming':
      case 'partially_paid':
        return 'waiting';
      case 'finished':
        return 'finished';
      case 'failed':
      case 'expired':
      case 'refunded':
        return 'failed';
      default:
        return 'waiting';
    }
  }
  export const updatedeDeposit = asynchandler(async (req, res) => {
    const {
      order_id,
      pay_amount,
      actually_paid,
      pay_currency,
      outcome_amount,
      outcome_currency,
      payout_hash,
      payin_hash,
      payment_id,
      payment_status,
      pay_address,
      purchase_id,
      price_amount,
      price_currency,
      order_description,
      created_at,
      updated_at,
    } = req.body;
  
    const deposit = await Deposit.findOne({ order_id });
    if (!deposit) {
      throw new apierror(404, "Deposit not found");
    }
  
    // ✅ Map to your enum status
    const mappedStatus = mapNowPaymentStatus(payment_status);
  
    // ✅ Update only NowPayments IPN fields
    deposit.pay_amount = pay_amount;
    deposit.actually_paid = actually_paid;
    deposit.pay_currency = pay_currency;
    deposit.outcome_amount = outcome_amount;
    deposit.outcome_currency = outcome_currency;
    deposit.payout_hash = payout_hash;
    deposit.payin_hash = payin_hash;
    deposit.payment_id = payment_id;
    deposit.payment_status = mappedStatus;
    deposit.pay_address = pay_address;
    deposit.purchase_id = purchase_id;
    deposit.price_amount = price_amount;
    deposit.price_currency = price_currency;
    deposit.order_description = order_description;
    if (created_at) deposit.created_at = created_at;
    deposit.updated_at = updated_at ? updated_at : new Date();
  
    await deposit.save();
  
    // Optionally update total deposit
    if (typeof deposit.calculateTotalDeposit === 'function') {
      await deposit.calculateTotalDeposit();
      await deposit.save();
    }
  
    // ✅ Credit user only if payment is complete
    if (mappedStatus === "finished") {
      const user = await User.findById(deposit.userId);
      if (!user) {
        throw new apierror(404, "User not found");
      }
      user.amount = (user.amount || 0) + (Number(actually_paid) || 0);
      await user.save();

      // Create a history record for the deposit
      await History.create({
        userid: user._id,
        type: 'deposit',
        amount: Number(Number(actually_paid).toFixed(2)) || 0,
        status: 'credit',
        description: `Deposit`
      });

      // --- Referral Bonus Logic ---
      // Only if this is the user's first finished deposit
      const finishedDeposits = await Deposit.countDocuments({ userId: user._id, payment_status: 'finished' });
      if (finishedDeposits === 1 && user.referredBy) {
        // Find the referrer by referralCode
        const referrer = await User.findOne({ referralCode: user.referredBy });
        if (referrer) {
          const bonus = Number(((Number(actually_paid) || 0) * 0.10).toFixed(2));
          referrer.amount = (referrer.amount || 0) + bonus;
          await referrer.save();
          // Create a history record for the referrer
          await History.create({
            userid: referrer._id,
            type: 'referral_bonus',
            amount: Number(bonus).toFixed(2),
            status: 'credit',
            description: `Activity Reward`
          });
        }
      }
    }
  
    return res
      .status(200)
      .json(new apiresponse(200, deposit, null, "Deposit updated successfully"));
  });
export const getDepositById = asynchandler(async (req, res) => {
    const { order_id } = req.params;

    const deposit = await Deposit.findOne({ order_id });

    if (!deposit) {
        throw new apierror(404, "Deposit not found");
    }

    return res
        .status(200)
        .json(new apiresponse(200, deposit, null, "Deposit retrieved successfully"));
});

export const getAllDeposits = asynchandler(async (req, res) => {
    const deposits = await Deposit.find({}).sort({ created_at: -1 });

    if (!deposits || deposits.length === 0) {
        throw new apierror(404, "No deposits found");
    }

    return res
        .status(200)
        .json(new apiresponse(200, deposits, null, "Deposits retrieved successfully"));
});

export const deleteDeposit = asynchandler(async (req, res) => {

    const {order_id} =req.params

    const deposit = await Deposit.findOneAndDelete({ order_id });

    if (!deposit) {
        throw new apierror(404, "Deposit not found");
    }
    return res
        .status(200)
        .json(new apiresponse(200, null, null, "Deposit deleted successfully"));
}
);


