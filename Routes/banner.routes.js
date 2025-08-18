import { Router } from "express";

import { createBanner,getAllBanners,deletebanner } from "../controllers/banner.controller.js";
import { upload } from "../middelwares/multer.middelware.js";

const router = Router();

// Route to create a new banner 
router.route('/create').post(upload.single('file'),createBanner);
// Route to get all banners
router.route('/all').get(getAllBanners);
// Route to delete a banner by ID
router.route('/delete/:id').delete(deletebanner);

export default router;