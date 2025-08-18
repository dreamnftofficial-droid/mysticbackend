import mongoose, { Schema } from "mongoose";

const depositSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    payment_id: {
        type: Number,
    },
    invoice_id: {
        type: Number,
    },
    payment_status: {
        type: String,
        enum: ['waiting', 'finished', 'failed'],
        default: 'waiting',
    },
    pay_address: {
        type: String,
    },
    payin_extra_id: {
        type: String,
    },
    price_amount: {
        type: Number,
    },
    price_currency: {
        type: String,
    },
    pay_amount: {
        type: Number,
    },
    actually_paid: {
        type: Number,
    },
    pay_currency: {
        type: String,
    },
    order_id: {
        type: String,
        unique: true,
        required: true,
    },
    order_description: {
        type: String,
    },
    purchase_id: {
        type: Number,
    },
    outcome_amount: {
        type: Number,
    },
    outcome_currency: {
        type: String,
    },
    payout_hash: {
        type: String,
    },
    payin_hash: {
        type: String,
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date,
    },
    amount: {
        type: Number,
        required: true,
    },
    total_deposit: {
        type: Number,
        default: 0,
    },
},{timestamps:true});

depositSchema.methods.calculateTotalDeposit = async function () {
    const deposits = await this.constructor.find({ userId: this.userId });
    const total = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    this.total_deposit = total;
    return this.total_deposit;
}

export const Deposit=mongoose.model("Deposit", depositSchema);

