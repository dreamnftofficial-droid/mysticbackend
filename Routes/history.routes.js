import { Router } from "express";

import { getUserHistory } from "../controllers/history.controller.js";
import {verifyjwt} from  '../middelwares/auth.middelware.js'


let router= Router();

router.route('/').get(verifyjwt, getUserHistory);

export default router;