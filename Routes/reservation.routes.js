import  {Router} from 'express';
<<<<<<< HEAD
import { buyNFT, getTodayReservation, reserveNFT, sellNFT, getExpectedIncome, getAvailableNFTs}from '../controllers/reservation.controller.js';
=======
import { buyNFT, getTodayReservation, reserveNFT, sellNFT, getExpectedIncome}from '../controllers/reservation.controller.js';
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
import { verifyjwt } from '../middelwares/auth.middelware.js';

const router = Router();

<<<<<<< HEAD
router.post('/reserve',verifyjwt, reserveNFT);
router.get('/available', verifyjwt, getAvailableNFTs);
=======
router.get('/reserve',verifyjwt, reserveNFT);
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
router.get('/today', verifyjwt, getTodayReservation);
router.get('/buy',verifyjwt,buyNFT)
router.get('/sell', verifyjwt, sellNFT);
router.get('/expected-income', verifyjwt, getExpectedIncome);
 

export default router;