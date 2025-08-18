import { Router } from "express";
import { uploadPDF, getAllPDFs, getPDFById, updatePDF, deletePDF } from "../controllers/pdf.controller.js";
import { upload } from "../middelwares/multer.middelware.js";

const router = Router();

// PDF routes
 
router.route('/upload').post(upload.single('pdf'), uploadPDF);
router.route('/').get(getAllPDFs);
router.route('/:id').get(getPDFById);
router.route('/:id').put(upload.single('pdf'), updatePDF);
router.route('/:id').delete(deletePDF);
 
export default router; 