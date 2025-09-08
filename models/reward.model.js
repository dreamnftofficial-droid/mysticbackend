import mongoose,{Schema} from "mongoose";

const rewardSchema = new Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    remarks: { type: String, required: true }
},{
    timestamps: true});

export const Reward = mongoose.model("Reward", rewardSchema);
 