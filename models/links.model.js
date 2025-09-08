import { Schema } from "mongoose";
import mongoose from "mongoose";

const linkSchema = new Schema({
    t_channeklink:{
        type: String,
        required: true,
    },
    t_helplinelink:{
        type: String,
        required: true,
    },
    t_groupLink:{
        type: String,
        required: true,
    }

 },{timestamps:true})


 export const Link = mongoose.model('Link', linkSchema);