import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import {NFT} from "../models/nft.model.js";
import { User } from "../models/user.model.js";
import { Reservation } from "../models/reservation.model.js";
import { History } from "../models/history.model.js";

export const reserveNFT = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const existing = await Reservation.findOne({
        userid: userId,
        reservationDate: { $gte: todayStart, $lte: todayEnd }
    });

    if (existing) {
        return res.status(400).json(new apiresponse(400, null, "You have already reserved today's NFT"));
    }

    const allNFTs = await NFT.find({});
    if (!allNFTs.length) {
        return res.status(404).json(new apiresponse(404, null, "No NFTs available"));
    }

    const totalReservations = await Reservation.countDocuments({ userid: userId });
    const nftToReserve = allNFTs[totalReservations % allNFTs.length];

    const user = await User.findById(userId); // get user for amount and level
    const buyAmount = user.amount;
    const profitPercent = calculateProfitPercent(user.level, buyAmount);
    const profit = (buyAmount * profitPercent) / 100;

    const reservation = await Reservation.create({
        nftid: nftToReserve._id,
        userid: userId,
        reservationtime: new Date().toLocaleTimeString(),
        reservationDate: new Date(),
        status: "reserved",
        buyAmount:buyAmount,
        profit,
        nftname: nftToReserve.name
    });

    return res.status(200).json(new apiresponse(200, reservation, "NFT reserved successfully"));
});


export const getTodayReservation = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const reservation = await Reservation.findOne({
        userid: userId,
        reservationDate: { $gte: todayStart, $lte: todayEnd }
    }).populate("nftid");

    return res.status(200).json(new apiresponse(200, reservation, "Today's reservation retrieved"));
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
    if (balance < 50) {
        throw new apierror(400, "You need at least 50 to buy NFT");
    }

    reservation.status = 'bought';
    reservation.buyAmount = balance;
    reservation.buyDate = new Date();
    await reservation.save();

    user.amount = 0;
    await user.save();

    return res.status(200).json(new apiresponse(200, reservation, "NFT bought with full balance"));
});


function calculateProfitPercent(level, amount) {
    if (level === 6 && amount >= 30000 && amount <= 500000) return 4.5;
    if (level === 5 && amount >= 10000 && amount <= 300000) return 3.8;
    if (level === 4 && amount >= 5000 && amount <= 100000) return 3.5;
    if (level === 3 && amount >= 2000 && amount <= 5000) return 2.9;
    if (level === 2 && amount >= 500 && amount <= 2000) return 2.5;
    if (level === 1 && amount >= 50 && amount <= 1000) return 2.0;
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
    reservation.sellDate = new Date();
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
    const amount = user.amount;
    const level = user.level;

    // Calculate profit percent for the user's amount and level
    const profitPercent = calculateProfitPercent(level, amount);
    if (profitPercent === 0) {
        return res.status(400).json(new apiresponse(400, null, "User does not qualify for profit at current amount/level"));
    }

    // Calculate expected income range (±4% of the calculated profit)
    const profit = (amount * profitPercent) / 100;
    const min = (profit * 0.96).toFixed(2); // -4%
    const max = (profit * 1.04).toFixed(2); // +4%
    const expectedIncome = `${min}~${max}`;

    return res.status(200).json(new apiresponse(200, {
        amount,
        profit,
        profitPercent,
        expectedIncome
    }, "Expected income calculated successfully"));
});
