import express from 'express';
import { requestWithdraw, getAllWithdraws, updateWithdrawStatus, getUserWithdrawRequests } from "../controllers/withdraw.controller.js";
import { verifyjwt } from '../middelwares/auth.middelware.js';

const router = express.Router();

router.post("/withdraw", verifyjwt, requestWithdraw);
router.get("/withdraws",  verifyjwt, getAllWithdraws);
router.get("/my-withdraws", verifyjwt, getUserWithdrawRequests);
router.put("/withdraw/:id", verifyjwt, updateWithdrawStatus);

export default router;
