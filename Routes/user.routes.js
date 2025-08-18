import { Router } from "express";
import {  block_unblockuser, deleteuser, delunverifiedusers,distributeProfitsForUser,adjustLevelsForUser,adjustTeamsForUser, forgotpassword, getallusers, login ,logout,registeruser, resendforgotpassotp, resendotp, updateprofile, verifyemail, verifyforgetpassotp,editamount, enable2FA, updateProfilePicture, sendChangePasswordOTP, changePasswordWithOTP, grantMissingRegistrationBonuses, sendEmailChangeOTP, verifyEmailChangeOTP, updateUserProfileFields, initiateEnable2FA, confirmEnable2FA, bindWallet, getWalletBindingStatus, getusernamebyreferralcode, getUserByUID, checkUIDExists, getUserInfoByUID, requestWalletChange, confirmWalletChange, debugUser } from "../controllers/user.controller.js";
import { calculateDailyProfits, autoCompleteStakesBackground } from "../controllers/stake.controller.js";
import {upload}from '../middelwares/multer.middelware.js'
import {verifyjwt}from '../middelwares/auth.middelware.js'
// import { referralQueue } from "../referralQueue.js";
import { getUserEarningDebug, syncUserEarning } from "../controllers/Record.controller.js";
import { syncUserAccountAmount } from "../controllers/Record.controller.js";
const router=Router()

router.route('/register').post(registeruser)
router.route('/login').post(login)
router.route('/debug-user').post(debugUser)
router.route('/logout').get(logout)
router.route('/verifyemail').post(verifyemail)
router.route('/forgetpassword').post(forgotpassword)
router.route('/resendforgetpassotp').post(resendforgotpassotp)
router.route('/verifyotp').post(verifyforgetpassotp)
router.route('/resendotp').post(resendotp)
router.route('/delunverifiedusers').delete(delunverifiedusers)
router.route('/updateprofile').put(verifyjwt,updateprofile)
router.route('/getallusers').get(getallusers)
router.route('/deleteuser').delete(deleteuser)
router.route('/block_unblock_user').put( verifyjwt, block_unblockuser )
// router.route('/adjustteams').get(adjustteams)
// router.route('/adjustlevels').get(adjustlevels)
// router.route('/dailyprofit').get(distributeReferralProfits)
router.route('/editamount').post(editamount)
router.route('/enable2fa').post(verifyjwt, enable2FA )
router.route('/profile-picture').patch(verifyjwt, upload.single('profilePicture'), updateProfilePicture);
router.route('/me').get(verifyjwt, async (req, res) => {
    const userId = req.user._id;
    // await referralQueue.add('adjust-teams', { userId, task: 'adjustteams' });
    // await referralQueue.add('adjust-levels', { userId, task: 'adjustlevels' });
    // await referralQueue.add('distribute', { userId, task: 'distribute' });

    // syncUserAccountAmount(userId);
    res.status(200).json({
        message: "User is authenticated",
        user: req.user  
    });

    const retryTask = async (taskFn, taskName, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await taskFn();
                console.log(`${taskName} succeeded on attempt ${attempt}`);
                break;
            } catch (err) {
                console.error(`${taskName} failed on attempt ${attempt}:`, err);
                if (attempt === retries) {
                    console.error(`${taskName} failed after ${retries} attempts.`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // exponential backoff
            }
        }
    };

    // Run all tasks in background
    setImmediate(() => {
        retryTask(() => adjustTeamsForUser(userId), 'AdjustTeams', 3);
        retryTask(() => adjustLevelsForUser(userId), 'AdjustLevels',3);
        retryTask(() => distributeProfitsForUser(userId), 'DistributeReferralProfits', 3);
        retryTask(()=>syncUserAccountAmount(userId),'accountsync',3)
        retryTask(() => calculateDailyProfits(userId), 'CalculateDailyProfits', 3);
        retryTask(() => autoCompleteStakesBackground(userId), 'AutoCompleteStakes', 3);
    });

});
router.route('/send-change-password-otp').post(sendChangePasswordOTP);
router.route('/change-password-with-otp').post(changePasswordWithOTP);
router.route('/send-email-change-otp').post(sendEmailChangeOTP);
router.route('/verify-email-change-otp').post(verifyEmailChangeOTP);
router.route('/update-profile-fields').put(verifyjwt, updateUserProfileFields);
router.route('/initiate-enable-2fa').post(verifyjwt, initiateEnable2FA);
router.route('/confirm-enable-2fa').post(verifyjwt, confirmEnable2FA);

// Wallet binding routes
router.route('/wallet-binding').post(verifyjwt, bindWallet);
router.route('/wallet-binding/status').get(verifyjwt, getWalletBindingStatus);
router.post('/request-wallet-change', verifyjwt, requestWalletChange);
router.post('/confirm-wallet-change', verifyjwt, confirmWalletChange);
 
router.route('/getusernamebyreferralcode').post(getusernamebyreferralcode)
router.route('/uid/:uid').get(getUserByUID)
router.route('/uid/:uid/check').get(checkUIDExists)
router.route('/uid/:uid/info').get(getUserInfoByUID)

// Add debug, sync, and admin grant routes
router.get('/earning-debug', verifyjwt, getUserEarningDebug);
router.post('/earning-sync', verifyjwt, syncUserEarning);
router.post('/grant-missing-registration-bonuses', verifyjwt, grantMissingRegistrationBonuses);

export default router