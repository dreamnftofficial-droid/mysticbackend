import mongoose,{Schema} from "mongoose";

const bannerSchema = new Schema({
    image: {
        type: String,
        required: true,
    },
    imageid:{
        type:String,
        required:true
    }

}, { timestamps: true });

export const Banner=mongoose.model('Banner',bannerSchema)