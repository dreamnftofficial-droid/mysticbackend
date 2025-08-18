import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import { PDF } from "../models/pdf.model.js";
import fs from 'fs';
import cloudinary from '../middelwares/cloudinary.middelware.js';

// Upload PDF
export const uploadPDF = asynchandler(async (req, res) => {
    if (!req.file) {
        throw new apierror(400, "PDF file is required");
    }

    // Check if file is PDF
    if (!req.file.mimetype.includes('pdf')) {
        throw new apierror(400, "Only PDF files are allowed");
    }

    // Additional validation - check file extension
    if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
        throw new apierror(400, "File must have .pdf extension");
    }

    // Check file size (optional - limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
        throw new apierror(400, "File size must be less than 10MB");
    }

    try {
        // Upload to Cloudinary with public access and proper PDF handling
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'raw', // Use 'raw' for PDF files
            access_mode: 'public', // Make it completely public
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            invalidate: true,
            format: 'pdf', // Ensure PDF format
            public_id: `${req.file.originalname.replace('.pdf', '')}_${Date.now()}` // Simple public ID without nested folders
        });

        // Create PDF record in database with the direct Cloudinary URL
        const pdf = await PDF.create({
            url: result.secure_url, // Use the direct Cloudinary URL
            cloudinaryId: result.public_id
        });

        // Clean up temporary file
        if (req.file.path) {
            fs.unlinkSync(req.file.path);
        }

        res.status(201).json(
            new apiresponse(201, pdf, "PDF uploaded successfully")
        );
    } catch (error) {
        // Clean up temporary file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }
        }
        
        throw new apierror(500, "Error uploading PDF to Cloudinary: " + error.message);
    }
});


// Get all PDFs
export const getAllPDFs = asynchandler(async (req, res) => {
    const pdfs = await PDF.find({}).sort({ createdAt: -1 });
    
    res.status(200).json(
        new apiresponse(200, pdfs, "All PDFs retrieved successfully")
    );
});

// Get PDF by ID
export const getPDFById = asynchandler(async (req, res) => {
    const { id } = req.params;
    
    const pdf = await PDF.findById(id);
    if (!pdf) {
        throw new apierror(404, "PDF not found");
    }
    
    res.status(200).json(
        new apiresponse(200, pdf, "PDF retrieved successfully")
    );
});

// Update PDF
export const updatePDF = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        throw new apierror(400, "New PDF file is required");
    }

    if (!req.file.mimetype.includes("pdf")) {
        throw new apierror(400, "Only PDF files are allowed");
    }

    // Additional validation - check file extension
    if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
        throw new apierror(400, "File must have .pdf extension");
    }

    // Check file size (optional - limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
        throw new apierror(400, "File size must be less than 10MB");
    }

    const pdf = await PDF.findById(id);
    if (!pdf) {
        throw new apierror(404, "PDF not found");
    }

    try {
        // delete old file
        await cloudinary.uploader.destroy(pdf.cloudinaryId, { resource_type: "raw" });

        // upload new one with public access
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "raw",
            access_mode: "public", // Make it completely public
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            invalidate: true,
            format: "pdf",
            public_id: `${req.file.originalname.replace('.pdf', '')}_${Date.now()}` // Simple public ID without nested folders
        });

        // update DB with direct Cloudinary URL
        pdf.url = result.secure_url; // Use the direct Cloudinary URL
        pdf.cloudinaryId = result.public_id;
        await pdf.save();

        // Clean up temporary file
        if (req.file.path) {
            fs.unlinkSync(req.file.path);
        }

        res.status(200).json(
            new apiresponse(200, pdf, "PDF updated successfully")
        );
    } catch (error) {
        // Clean up temporary file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }
        }
        
        throw new apierror(500, "Error updating PDF: " + error.message);
    }
});



// Delete PDF
export const deletePDF = asynchandler(async (req, res) => {
    const { id } = req.params;
    
    const pdf = await PDF.findById(id);
    if (!pdf) {
        throw new apierror(404, "PDF not found");
    }

    try {
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(pdf.cloudinaryId, { resource_type: 'raw' });
        
        // Delete from database
        await PDF.findByIdAndDelete(id);

        res.status(200).json(
            new apiresponse(200, null, "PDF deleted successfully")
        );
    } catch (error) {
        throw new apierror(500, "Error deleting PDF: " + error.message);
    }
});

 