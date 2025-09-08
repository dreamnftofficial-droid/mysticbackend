import express from 'express';
import { requestWithdrawOTP, confirmWithdraw, getAllWithdraws, updateWithdrawStatus, getUserWithdrawRequests } from "../controllers/withdraw.controller.js";
import { verifyjwt } from '../middelwares/auth.middelware.js';

const router = express.Router();

router.post("/otp", verifyjwt, requestWithdrawOTP);
router.post("/confirm", verifyjwt, confirmWithdraw);
router.get("/withdraws",  verifyjwt, getAllWithdraws);
router.get("/my-withdraws", verifyjwt, getUserWithdrawRequests);
router.put("/withdraw/:id", verifyjwt, updateWithdrawStatus);

export default router;
