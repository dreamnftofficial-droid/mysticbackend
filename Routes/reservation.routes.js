import  {Router} from 'express';
import { buyNFT, getTodayReservation, reserveNFT, sellNFT, getExpectedIncome}from '../controllers/reservation.controller.js';
import { verifyjwt } from '../middelwares/auth.middelware.js';

const router = Router();

router.get('/reserve',verifyjwt, reserveNFT);
router.get('/today', verifyjwt, getTodayReservation);
router.get('/buy',verifyjwt,buyNFT)
router.get('/sell', verifyjwt, sellNFT);
router.get('/expected-income', verifyjwt, getExpectedIncome);
 

export default router;