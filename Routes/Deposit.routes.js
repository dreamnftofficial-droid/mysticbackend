import { Router } from "express";
import {createDeposit,deleteDeposit,getAllDeposits,getDepositById,updatedeDeposit}from '../controllers/Deposit.controller.js'
import { verifyjwt } from "../middelwares/auth.middelware.js";

const router=Router()
router.route('/create').post(verifyjwt,createDeposit)
router.route('/update').post(updatedeDeposit)
router.route('/get/:order_id').get(verifyjwt,getDepositById)
router.route('/get').get(getAllDeposits)
router.route('/:order_id').delete(verifyjwt,deleteDeposit)


export default router
