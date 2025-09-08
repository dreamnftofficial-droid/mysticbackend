import { Router } from "express";
import { createnft,deletenft,getnft,getnfts, updatenft } from "../controllers/nft.controller.js";
import { upload } from "../middelwares/multer.middelware.js";

const router=Router()

router.route('/').post(upload.single('file'),createnft).get(getnfts)
router.route('/:id').put(upload.single('file'),updatenft).delete(deletenft).get(getnft)

export default router;