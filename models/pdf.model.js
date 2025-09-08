import mongoose, { Schema } from "mongoose";

const pdfSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const PDF = mongoose.model('PDF', pdfSchema); 