import { Router } from "express";
import {
    getAllStakes,
    getAdminStakeStats,
    getStakesByUser,
    forceCompleteStake,
    forceClaimProfit,
    adminCancelStake,
    getStakeDetails,
    getStakesByDateRange
} from "../controllers/adminStake.controller.js";
import { verifyjwt } from "../middelwares/auth.middelware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyjwt);

// Admin middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }
    next();
};

// Apply admin middleware to all routes
router.use(isAdmin);

// Get all stakes with pagination and filters
router.get("/all", getAllStakes);

// Get stake statistics
router.get("/stats", getAdminStakeStats);

// Get stakes by user
router.get("/user/:userId", getStakesByUser);

// Get stake details
router.get("/details/:stakeId", getStakeDetails);

// Get stakes by date range
router.get("/date-range", getStakesByDateRange);

// Force complete a stake
router.post("/force-complete/:stakeId", forceCompleteStake);

// Force claim profit for a stake
router.post("/force-claim/:stakeId", forceClaimProfit);

// Cancel a stake (admin only)
router.post("/cancel/:stakeId", adminCancelStake);

export default router; 