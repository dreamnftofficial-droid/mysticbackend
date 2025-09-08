import {Router} from 'express';

import {getReferralIncomeBreakdown, getReferralTeamStats, getReservationStats,getUserOrderStatsWithDailyIncrement, getTeamMemberStats, getUserAccountSummary, getUserEarningSummary,   getValidTeamMemberinfo, getValidMembersIncome, getUserFullHistory, debugReservations}from '../controllers/Record.controller.js'
import { verifyjwt } from '../middelwares/auth.middelware.js';
import { getUserHistory } from '../controllers/history.controller.js';
 


const router = Router();

router.route('/valid-team-counts').get(verifyjwt,getTeamMemberStats);
router.route('/referral-income-breakdown').get(verifyjwt,getReferralIncomeBreakdown);
router.route('/get-valid-teammembersinfo').get(verifyjwt,getValidTeamMemberinfo);
router.route('/get-referal-team-stats').get(verifyjwt,getReferralTeamStats);
router.route('/getreservationstats').get(verifyjwt,getReservationStats);
router.route('/get-account-summary').get(verifyjwt,getUserAccountSummary);
router.get("/history", verifyjwt, getUserHistory);
router.get("/earning-summary", verifyjwt, getUserEarningSummary);
router.get("/order-stats", verifyjwt, getUserOrderStatsWithDailyIncrement);
router.get('/valid-members-income', verifyjwt, getValidMembersIncome);
router.get("/full-history", verifyjwt, getUserFullHistory);
router.get("/debug-reservations", verifyjwt, debugReservations);

export default router;