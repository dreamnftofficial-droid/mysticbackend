import express from 'express';
<<<<<<< HEAD
import { requestWithdrawOTP, confirmWithdraw, getAllWithdraws, updateWithdrawStatus, getUserWithdrawRequests } from "../controllers/withdraw.controller.js";
=======
import { requestWithdraw, getAllWithdraws, updateWithdrawStatus, getUserWithdrawRequests } from "../controllers/withdraw.controller.js";
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
import { verifyjwt } from '../middelwares/auth.middelware.js';

const router = express.Router();

<<<<<<< HEAD
router.post("/otp", verifyjwt, requestWithdrawOTP);
router.post("/confirm", verifyjwt, confirmWithdraw);
=======
router.post("/withdraw", verifyjwt, requestWithdraw);
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
router.get("/withdraws",  verifyjwt, getAllWithdraws);
router.get("/my-withdraws", verifyjwt, getUserWithdrawRequests);
router.put("/withdraw/:id", verifyjwt, updateWithdrawStatus);

export default router;
