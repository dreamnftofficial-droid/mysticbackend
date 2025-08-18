import { Router } from "express";
import {
    getQualifiedNFTs,
    buyNFT,
    getUserNFTs,
    getUserStakes,
    getActiveStakes,
    getCompletedStakes,
    getStakeStats,
    testStakeConfig
} from "../controllers/stake.controller.js";
import { verifyjwt } from "../middelwares/auth.middelware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyjwt);

// Get qualified NFTs for user (based on level)
router.get("/qualified-nfts", getQualifiedNFTs);

// Buy NFT with immediate staking
router.post("/buy-nft", buyNFT);

// Get user's NFT collection (shows staked NFTs with remaining time)
router.get("/my-nfts", getUserNFTs);

// Get user's all stakes
router.get("/my-stakes", getUserStakes);

// Get user's active stakes
router.get("/active", getActiveStakes);

// Get user's completed stakes
router.get("/completed", getCompletedStakes);

// Get stake statistics
router.get("/stats", getStakeStats);

// Test endpoint to verify stake configuration
router.get("/test-config", testStakeConfig);

export default router; 