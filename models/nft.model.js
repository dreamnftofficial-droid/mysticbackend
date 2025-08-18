import mongoose,{Schema} from "mongoose";
 


const nftSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
         
    },
    picture: {
        type: String,
        required: true,
        
    },
    pictureId: {
        type: String,
        required: true,
        
    }
}, {
    timestamps: true,
     
});

export const NFT= mongoose.model("NFT", nftSchema);