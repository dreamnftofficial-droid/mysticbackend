import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import {NFT} from "../models/nft.model.js";
import { User } from "../models/user.model.js";
import { Reservation } from "../models/reservation.model.js";
import { History } from "../models/history.model.js";
import { getUKStartOfDay, getUKEndOfDay, getUKDate } from "../utils/timezone.js";

export const reserveNFT = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const todayStart = getUKStartOfDay();
    const todayEnd = getUKEndOfDay();

    const existing = await Reservation.findOne({
        userid: userId,
        reservationDate: { $gte: todayStart, $lte: todayEnd }
    });

    if (existing) {
        return res.status(400).json(new apiresponse(400, null, "You have already reserved today's NFT"));
    }

    const user = await User.findById(userId);
    const userBalance = user.amount;

    if (userBalance < 50) {
        throw new apierror(400, "You need at least 50 balance to reserve an NFT");
    }

    // Get all NFTs
    const allNFTs = await NFT.find({});
    
    if (allNFTs.length === 0) {
        throw new apierror(404, "No NFTs available");
    }

    // Get NFTs that are already reserved today
    const reservedNFTs = await Reservation.find({
        reservationDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['reserved', 'bought'] }
    }).select('nftid');

    const reservedNFTIds = reservedNFTs.map(r => r.nftid.toString());
    
    // Filter out reserved NFTs
    const availableNFTs = allNFTs.filter(nft => !reservedNFTIds.includes(nft._id.toString()));

    if (availableNFTs.length === 0) {
        throw new apierror(400, "No NFTs available for reservation today");
    }

    // Select a random available NFT
    const selectedNFT = availableNFTs[Math.floor(Math.random() * availableNFTs.length)];

    // Calculate a price that's less than user's balance (80-95% of balance)
    const pricePercentage = 0.8 + (Math.random() * 0.15); // Random between 80% and 95%
    const nftPrice = Math.floor(userBalance * pricePercentage);
    
    // Ensure minimum price of 50
    const finalPrice = Math.max(50, nftPrice);

    const profitPercent = calculateProfitPercent(user.level, finalPrice);
    const profit = (finalPrice * profitPercent) / 100;

    const reservation = await Reservation.create({
        nftid: selectedNFT._id,
        userid: userId,
        reservationtime: getUKDate().toLocaleTimeString(),
        reservationDate: getUKDate(),
        status: "reserved",
        buyAmount: finalPrice,
        profit,
        nftname: selectedNFT.name
    });

    return res.status(200).json(new apiresponse(200, reservation, "NFT reserved successfully"));
});


export const getTodayReservation = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const todayStart = getUKStartOfDay();
    const todayEnd = getUKEndOfDay();

    const reservation = await Reservation.findOne({
        userid: userId,
        reservationDate: { $gte: todayStart, $lte: todayEnd }
    }).populate("nftid");

    return res.status(200).json(new apiresponse(200, reservation, "Today's reservation retrieved"));
});

export const getAvailableNFTs = asynchandler(async (req, res) => {
    const todayStart = getUKStartOfDay();
    const todayEnd = getUKEndOfDay();

    // Get all NFTs
    const allNFTs = await NFT.find({});
    
    // Get NFTs that are already reserved today
    const reservedNFTs = await Reservation.find({
        reservationDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['reserved', 'bought'] }
    }).select('nftid');

    const reservedNFTIds = reservedNFTs.map(r => r.nftid.toString());
    
    // Filter out reserved NFTs
    const availableNFTs = allNFTs.filter(nft => !reservedNFTIds.includes(nft._id.toString()));

    return res.status(200).json(new apiresponse(200, availableNFTs, "Available NFTs for reservation retrieved"));
});


export const buyNFT = asynchandler(async (req, res) => {
    const user = req.user;

    const reservation = await Reservation.findOne({
        userid: user._id,
        status: 'reserved'
    });

    if (!reservation) {
        throw new apierror(404, "No reserved NFT to buy");
    }

    const balance = user.amount;
    const nftPrice = reservation.buyAmount;
    
    if (balance < nftPrice) {
        throw new apierror(400, `Insufficient balance. You need ${nftPrice} to buy this NFT but have ${balance}`);
    }

    reservation.status = 'bought';
    reservation.buyDate = getUKDate();
    await reservation.save();

    // Deduct only the NFT price from user's balance
    user.amount = balance - nftPrice;
    await user.save();

    return res.status(200).json(new apiresponse(200, reservation, "NFT bought with full balance"));
});


function calculateProfitPercent(level, amount) {
    if (level === 6 && amount >= 30000) return 4.5;
    if (level === 5 && amount >= 10000 && amount <= 29999) return 3.8;
    if (level === 4 && amount >= 5000 && amount <= 9999) return 3.5;
    if (level === 3 && amount >= 2000 && amount <= 4999) return 2.9;
    if (level === 2 && amount >= 500 && amount <= 1999) return 2.5;
    if (level === 1 && amount >= 50 && amount <= 499) return 2.0;
    return 0;
}

export const sellNFT = asynchandler(async (req, res) => {
    const user = req.user;

    const reservation = await Reservation.findOne({
        userid: user._id,
        status: 'bought'
    });

    if (!reservation) {
        throw new apierror(404, "No NFT available to sell");
    }

    const invested = Number(reservation.buyAmount) || 0;
    const level = user.level;

    const profitPercent = calculateProfitPercent(level, invested);
    const profit = (Number(invested) * profitPercent) / 100;
    const totalReturn = Number(invested) + Number(profit);

    user.amount += Number(totalReturn);
    await user.save();

    reservation.status = 'sold';
    reservation.sellDate = getUKDate();
    reservation.profit = profit;
    await History.create({
  userid: user._id,
  type: 'Reservation',
  amount: Number(profit).toFixed(2),
  status: 'credit',
  description: 'Reservation profit'
});

    await reservation.save();

    return res.status(200).json(new apiresponse(200, {
        returned: totalReturn,
        profit,
        reservation
    }, "NFT sold successfully"));
});

export const getExpectedIncome = asynchandler(async (req, res) => {
    const user = req.user;
    const userBalance = user.amount;
    const level = user.level;

    if (userBalance < 50) {
        return res.status(400).json(new apiresponse(400, null, "You need at least 50 balance to reserve an NFT"));
    }

    // Calculate expected NFT price range (80-95% of user's balance)
    const minPrice = Math.max(50, Math.floor(userBalance * 0.8));
    const maxPrice = Math.floor(userBalance * 0.95);

    // Calculate profit for both min and max prices
    const minProfitPercent = calculateProfitPercent(level, minPrice);
    const maxProfitPercent = calculateProfitPercent(level, maxPrice);
    
    if (minProfitPercent === 0) {
        return res.status(400).json(new apiresponse(400, null, "User does not qualify for profit at current level"));
    }

    const minProfit = (minPrice * minProfitPercent) / 100;
    const maxProfit = (maxPrice * maxProfitPercent) / 100;

    return res.status(200).json(new apiresponse(200, {
        userBalance,
        expectedNFTPriceRange: `${minPrice}~${maxPrice}`,
        expectedProfitRange: `${minProfit.toFixed(2)}~${maxProfit.toFixed(2)}`,
        level,
        profitPercentRange: `${minProfitPercent}%~${maxProfitPercent}%`
    }, "Expected income calculated successfully"));
});
