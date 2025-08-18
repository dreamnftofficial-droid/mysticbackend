import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import {NFT} from "../models/nft.model.js";
import { User } from "../models/user.model.js";
import { Reservation } from "../models/reservation.model.js";
import { ReferralProfitLog } from "../models/referralProfitLog.model.js";
import { Withdraw } from "../models/withdraw.model.js";
import { DailyOrderLog } from "../models/dailyorderlog.model.js";
import { Reward } from "../models/reward.model.js";
import { Deposit } from "../models/deposit.model.js";
import { History } from "../models/history.model.js";
import { Stake } from "../models/stake.model.js";
import { UserNFT } from "../models/userNFT.model.js";


export const getTeamMemberStats = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).lean();
    if (!user) throw new apierror(404, "User not found");

    const teamA = Array.isArray(user.team_A_members) ? user.team_A_members : [];
    const teamB = Array.isArray(user.team_B_members) ? user.team_B_members : [];
    const teamC = Array.isArray(user.team_C_members) ? user.team_C_members : [];

    // Build unique set of member IDs across all teams
    const allIds = new Set();
    for (const m of [...teamA, ...teamB, ...teamC]) {
        if (m && m.userid) allIds.add(m.userid.toString());
    }

    // Only count members that actually exist in DB (prevents stale/removed users)
    const existingUsers = await User.find({ _id: { $in: Array.from(allIds) } }).select('_id').lean();
    const existingSet = new Set(existingUsers.map(u => u._id.toString()));

    // Filter each team to existing users and dedupe by userId
    function filterAndDedupe(team) {
        const seen = new Set();
        const result = [];
        for (const m of team) {
            const id = m && m.userid ? m.userid.toString() : null;
            if (!id) continue;
            if (!existingSet.has(id)) continue;
            if (seen.has(id)) continue;
            seen.add(id);
            result.push(m);
        }
        return result;
    }

    const teamAFiltered = filterAndDedupe(teamA);
    const teamBFiltered = filterAndDedupe(teamB);
    const teamCFiltered = filterAndDedupe(teamC);

    const validA = teamAFiltered.filter(m => m.validmember).length;
    const validB = teamBFiltered.filter(m => m.validmember).length;
    const validC = teamCFiltered.filter(m => m.validmember).length;

    const totalA = teamAFiltered.length;
    const totalB = teamBFiltered.length;
    const totalC = teamCFiltered.length;

    return res.status(200).json(new apiresponse(200, {
        valid_A_members: validA,
        total_A_members: totalA,
        valid_B_and_C_members: validB + validC,
        total_B_and_C_members: totalB + totalC
    }, "Team member stats retrieved"));
});


export const getReferralIncomeBreakdown = asynchandler(async (req, res) => {
    const userId = req.user._id;

    const logs = await ReferralProfitLog.find({ uplineUser: userId });

    let total = 0;
    let fromA = 0;
    let fromB = 0;
    let fromC = 0;

    for (const log of logs) {
        total += log.commission;

        if (log.teamType === "A") fromA += log.commission;
        else if (log.teamType === "B") fromB += log.commission;
        else if (log.teamType === "C") fromC += log.commission;
    }

    return res.status(200).json(new apiresponse(200, {
        totalReferralIncome: total.toFixed(2),
        fromTeamA: fromA.toFixed(2),
        fromTeamB: fromB.toFixed(2),
        fromTeamC: fromC.toFixed(2)
    }, "Referral income breakdown retrieved successfully"));
});


// Mask email to show only first 3 characters
function maskEmail(email) {
  const [name, domain] = email.split("@");
  return name.slice(0, 3) + "*****@" + domain;
}

// Format date as "08:30 25/07/26"
function formatDateTime(date) {
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("en-GB").split("/").reverse().join("/");
  return `${time} ${day}`;
}

export const getValidTeamMemberinfo = asynchandler(async (req, res) => {
  const user = req.user;

  const teamTiers = [
    { label: "A", team: user.team_A_members },
    { label: "B", team: user.team_B_members },
    { label: "C", team: user.team_C_members }
  ];

  const result = {};

  for (const { label, team } of teamTiers) {
    const members = [];

    for (const member of team) {
      if (!member.validmember) continue;

      const memberUser = await User.findById(member.userid);
      if (!memberUser) continue;

      members.push({
        email: maskEmail(memberUser.email),
        amount: `$${memberUser.amount.toFixed(2)}`,
        time: formatDateTime(memberUser.createdAt)
      });
    }

    result[`Team_${label}`] = members;
  }

  return res.status(200).json(new apiresponse(200, result, "Valid team member account balances retrieved"));
});

export const getReferralTeamStats = asynchandler(async (req, res) => {
  const user = req.user;

  // Parse start and end date from query
  const { start, end } = req.query;
  let startDate, endDate;
  if (start) {
    startDate = new Date(start);
  }
  if (end) {
    endDate = new Date(end);
  }

  // Helper to format date
  function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    const day = d.toLocaleDateString("en-GB");
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${time} ${day}`;
  }

  // Helper to mask email
  function maskEmail(email) {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return name.slice(0, 3) + "*****@" + domain;
  }

  // Optimized: Get all team member IDs and fetch them in one query
  let teamA = user.team_A_members || [];
  let teamB = user.team_B_members || [];
  let teamC = user.team_C_members || [];

  // Dedupe members per team by userid to keep counts consistent across endpoints
  function dedupeTeam(team) {
    const seen = new Set();
    return (team || []).filter(m => {
      const id = m && m.userid ? m.userid.toString() : null;
      if (!id) return false;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  teamA = dedupeTeam(teamA);
  teamB = dedupeTeam(teamB);
  teamC = dedupeTeam(teamC);

  // Collect all unique user IDs from all teams
  const allUserIds = new Set();
  teamA.forEach(member => allUserIds.add(member.userid.toString()));
  teamB.forEach(member => allUserIds.add(member.userid.toString()));
  teamC.forEach(member => allUserIds.add(member.userid.toString()));

  // Fetch all team members in one query
  const allTeamMembers = await User.find({ 
    _id: { $in: Array.from(allUserIds) } 
  }).select('email createdAt').lean();

  // Create a map for quick lookup
  const userMap = new Map();
  allTeamMembers.forEach(user => {
    userMap.set(user._id.toString(), user);
  });

  // Helper to get member info from the map with date filtering
  function getMembersInfo(team) {
    return team.map(member => {
      const memberUser = userMap.get(member.userid.toString());
      if (!memberUser) return null;
      
      const joinDate = memberUser.createdAt ? memberUser.createdAt.toISOString().slice(0, 10) : null;
      
      // Apply date filtering
      if (startDate && joinDate < startDate.toISOString().slice(0, 10)) {
        return null; // Skip members before start date
      }
      if (endDate && joinDate > endDate.toISOString().slice(0, 10)) {
        return null; // Skip members after end date
      }
      
      return {
        email: maskEmail(memberUser.email),
        valid: !!member.validmember,
        joinedAt: formatDate(memberUser.createdAt),
        joinDate: joinDate
      };
    }).filter(Boolean); // Remove null entries
  }

  // Helper to count members by join date
  function getDateCounts(members) {
    const counts = {};
    for (const m of members) {
      if (m.joinDate) {
        counts[m.joinDate] = (counts[m.joinDate] || 0) + 1;
      }
    }
    return counts;
  }

  // Get member info for each team (now using the map)
  const [teamAInfo, teamBInfo, teamCInfo] = [
    getMembersInfo(teamA),
    getMembersInfo(teamB),
    getMembersInfo(teamC)
  ];

  // Also get ALL members (unfiltered) for comparison
  const [teamAAll, teamBAll, teamCAll] = [
    teamA.map(member => {
      const memberUser = userMap.get(member.userid.toString());
      if (!memberUser) return null;
      
      return {
        email: maskEmail(memberUser.email),
        valid: !!member.validmember,
        joinedAt: formatDate(memberUser.createdAt),
        joinDate: memberUser.createdAt ? memberUser.createdAt.toISOString().slice(0, 10) : null
      };
    }).filter(Boolean),
    teamB.map(member => {
      const memberUser = userMap.get(member.userid.toString());
      if (!memberUser) return null;
      
      return {
        email: maskEmail(memberUser.email),
        valid: !!member.validmember,
        joinedAt: formatDate(memberUser.createdAt),
        joinDate: memberUser.createdAt ? memberUser.createdAt.toISOString().slice(0, 10) : null
      };
    }).filter(Boolean),
    teamC.map(member => {
      const memberUser = userMap.get(member.userid.toString());
      if (!memberUser) return null;
      
      return {
        email: maskEmail(memberUser.email),
        valid: !!member.validmember,
        joinedAt: formatDate(memberUser.createdAt),
        joinDate: memberUser.createdAt ? memberUser.createdAt.toISOString().slice(0, 10) : null
      };
    }).filter(Boolean)
  ];

  // --- Date-wise cumulative summary ---
  // Gather all join dates
  const allDatesSet = new Set([
    ...teamAInfo.map(m => m.joinDate),
    ...teamBInfo.map(m => m.joinDate),
    ...teamCInfo.map(m => m.joinDate)
  ].filter(Boolean));
  let allDates = Array.from(allDatesSet).sort();

  // If start/end provided, filter/generate date range
  if (startDate && endDate) {
    // Generate all dates in the range
    const rangeDates = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      rangeDates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    allDates = rangeDates;
  } else if (startDate) {
    allDates = allDates.filter(date => date >= startDate.toISOString().slice(0, 10));
  } else if (endDate) {
    allDates = allDates.filter(date => date <= endDate.toISOString().slice(0, 10));
  }

  // Optimized: Pre-calculate cumulative counts for each team
  function preCalculateCumulativeCounts(members) {
    const counts = {};
    const sortedDates = [...new Set(members.map(m => m.joinDate).filter(Boolean))].sort();
    
    let runningTotal = 0, runningValid = 0;
    for (const date of sortedDates) {
      const dayMembers = members.filter(m => m.joinDate === date);
      runningTotal += dayMembers.length;
      runningValid += dayMembers.filter(m => m.valid).length;
      counts[date] = { total: runningTotal, valid: runningValid };
    }
    return counts;
  }

  const teamACumulative = preCalculateCumulativeCounts(teamAInfo);
  const teamBCumulative = preCalculateCumulativeCounts(teamBInfo);
  const teamCCumulative = preCalculateCumulativeCounts(teamCInfo);

  // Build the dateSummary object
  const dateSummary = {};
  for (const date of allDates) {
    const a = teamACumulative[date] || { total: 0, valid: 0 };
    const b = teamBCumulative[date] || { total: 0, valid: 0 };
    const c = teamCCumulative[date] || { total: 0, valid: 0 };
    
    dateSummary[date] = {
      A: a,
      B: b,
      C: c,
      all: {
        total: a.total + b.total + c.total,
        valid: a.valid + b.valid + c.valid
      }
    };
  }

  // Calculate team totals based on filtered date range
  const team_A_total = teamAInfo.length;
  const team_A_valid = teamAInfo.filter(member => member.valid).length;

  const team_B_total = teamBInfo.length;
  const team_B_valid = teamBInfo.filter(member => member.valid).length;

  const team_C_total = teamCInfo.length;
  const team_C_valid = teamCInfo.filter(member => member.valid).length;

  const total_registered = team_A_total + team_B_total + team_C_total;
  const total_valid = team_A_valid + team_B_valid + team_C_valid;

  // Calculate ALL members totals (unfiltered)
  const team_A_all_total = teamAAll.length;
  const team_A_all_valid = teamAAll.filter(member => member.valid).length;

  const team_B_all_total = teamBAll.length;
  const team_B_all_valid = teamBAll.filter(member => member.valid).length;

  const team_C_all_total = teamCAll.length;
  const team_C_all_valid = teamCAll.filter(member => member.valid).length;

  const total_all_registered = team_A_all_total + team_B_all_total + team_C_all_total;
  const total_all_valid = team_A_all_valid + team_B_all_valid + team_C_all_valid;

  // Date-wise counts
  const teamA_dateCounts = getDateCounts(teamAInfo);
  const teamB_dateCounts = getDateCounts(teamBInfo);
  const teamC_dateCounts = getDateCounts(teamCInfo);

  const stats = {
    total_registered,
    total_valid,
    total_all_registered,
    total_all_valid,
    dateSummary,
    team_A: {
      total: team_A_total,
      valid: team_A_valid,
      all_total: team_A_all_total,
      all_valid: team_A_all_valid,
      members: teamAInfo,
      dateCounts: teamA_dateCounts
    },
    team_B: {
      total: team_B_total,
      valid: team_B_valid,
      all_total: team_B_all_total,
      all_valid: team_B_all_valid,
      members: teamBInfo,
      dateCounts: teamB_dateCounts
    },
    team_C: {
      total: team_C_total,
      valid: team_C_valid,
      all_total: team_C_all_total,
      all_valid: team_C_all_valid,
      members: teamCInfo,
      dateCounts: teamC_dateCounts
    }
  };

  return res.status(200).json(new apiresponse(200, stats, "Referral team statistics with member info and dates fetched successfully"));
});


function getReservationRange(level) {
  if (level === 6) return "$30,000 – $500,000";
  if (level === 5) return "$10,000 – $300,000";
  if (level === 4) return "$5,000 – $100,000";
  if (level === 3) return "$2,000 – $5,000";
  if (level === 2) return "$500 – $2,000";
  if (level === 1) return "$50 – $1,000";
  return "$0.00";
}

export const getReservationStats = asynchandler(async (req, res) => {
  const user = req.user;

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  // All sold reservations
  const allReservations = await Reservation.find({
    userid: user._id,
    status: 'sold'
  });

  // Today's sold reservations
  const todayReservations = allReservations.filter(r => r.sellDate >= todayStart && r.sellDate <= todayEnd);

  const totalProfit = allReservations.reduce((sum, r) => sum + (r.profit || 0), 0);
  const todayProfit = todayReservations.reduce((sum, r) => sum + (r.profit || 0), 0);
 

  const reservationRange = getReservationRange(user.level);

  return res.status(200).json(new apiresponse(200, {
    todayProfit: `$${todayProfit.toFixed(2)}`,
    totalProfit: `$${totalProfit.toFixed(2)}`,
    totalamountforreservation: `$${user.amount.toFixed(2)}`,
    userBalance: `$${user.amount.toFixed(2)}`,
    reservationRange
  }, "Reservation and profit stats retrieved successfully"));
});

export const getUserAccountSummary = asynchandler(async (req, res) => {
  const userId = req.user._id;

  // Get user to access balance
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Profit from sold NFTs
  const reservations = await Reservation.find({ userid: userId, status: "sold" });
  const nftProfit = reservations.reduce((sum, r) => sum + (r.profit || 0), 0);

  // Profit from referral commission
  const referralLogs = await ReferralProfitLog.find({ uplineUser: userId });
  const referralProfit = referralLogs.reduce((sum, r) => sum + (r.commission || 0), 0);
  const rewards = await Reward.find({ userid: userId });
  const activityTotal = rewards.reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalEarning = nftProfit + referralProfit + activityTotal;

  // Total withdrawn (approved only)
  const withdrawals = await Withdraw.find({ userid: userId, status: "approved" });
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  // notWithdrawn = current account amount - totalWithdrawn
  const notWithdrawn = user.amount - totalWithdrawn;

  return res.status(200).json(new apiresponse(200, {
    totalEarning,
    totalWithdrawn,
    notWithdrawn
  }, "Account summary fetched successfully"));
});


export const getUserEarningSummary = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json(new apiresponse(404, null, "User not found"));
  }

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  let dailyNFTProfit = 0;
  let totalNFTProfit = 0;

  // Own reservation profits
  const reservations = await Reservation.find({ userid: user._id, status: "sold" });
  for (const resv of reservations) {
    totalNFTProfit += resv.profit || 0;
    if (resv.sellDate >= todayStart && resv.sellDate <= todayEnd) {
      dailyNFTProfit += resv.profit || 0;
    }
  }

  // Stake income calculation
  let dailyStakeIncome = 0;
  let totalStakeIncome = 0;
  
  // Get all stakes that have been claimed (completed and auto-sold)
  const claimedStakes = await Stake.find({ userId: user._id, profitClaimed: true });
  for (const stake of claimedStakes) {
    const totalAccumulatedProfit = stake.getTotalAccumulatedProfit();
    totalStakeIncome += totalAccumulatedProfit;
    
    // Check if stake was completed today
    if (stake.stakeEndDate >= todayStart && stake.stakeEndDate <= todayEnd) {
      dailyStakeIncome += totalAccumulatedProfit;
    }
  }

  // --- Optimized Referral Profit Calculation ---
  function getDownlineUserIds(team) {
    return (team || []).filter(m => m.validmember).map(m => m.userid);
  }

  // Get all valid downline user IDs for each team
  const [aDownlineIds, bDownlineIds, cDownlineIds] = [
    getDownlineUserIds(user.team_A_members),
    getDownlineUserIds(user.team_B_members),
    getDownlineUserIds(user.team_C_members)
  ];

  // Batch fetch all sold reservations for each team
  const [aResvs, bResvs, cResvs] = await Promise.all([
    aDownlineIds.length ? Reservation.find({ userid: { $in: aDownlineIds }, status: "sold" }) : [],
    bDownlineIds.length ? Reservation.find({ userid: { $in: bDownlineIds }, status: "sold" }) : [],
    cDownlineIds.length ? Reservation.find({ userid: { $in: cDownlineIds }, status: "sold" }) : []
  ]);

  // Helper to sum profits for a batch of reservations
  function sumProfits(resvs, percent) {
    let today = 0, total = 0;
    for (const r of resvs) {
      if (!r.profit) continue;
      const profit = r.profit * percent;
      total += profit;
      if (r.sellDate >= todayStart && r.sellDate <= todayEnd) {
        today += profit;
      }
    }
    return { today, total };
  }

  // Team income only counts from level 2+
  let a = { today: 0, total: 0 };
  let b = { today: 0, total: 0 };
  let c = { today: 0, total: 0 };
  if (user.level >= 2) {
    a = sumProfits(aResvs, 0.13);
    b = sumProfits(bResvs, 0.08);
    c = sumProfits(cResvs, 0.06);
  }

  const rewards = await Reward.find({ userid: user._id });
  const referralBonuses = await History.find({ userid: user._id, type: 'referral_bonus' });
  const referralBonusTotal = referralBonuses.reduce((sum, r) => sum + (r.amount || 0), 0);
  const referralBonusToday = referralBonuses.reduce((sum, r) => {
    const createdAt = r.createdAt || r.date || r.timestamp;
    if (createdAt) {
      const date = new Date(createdAt);
      if (date >= todayStart && date <= todayEnd) {
        return sum + (r.amount || 0);
      }
    }
    return sum;
  }, 0);
  const activityTotal = rewards.reduce((sum, r) => sum + (r.amount || 0), 0) + referralBonusTotal;
  const activityToday = rewards.reduce((sum, r) => {
    const createdAt = r.createdAt || r.created_at || r.timestamp;
    if (createdAt) {
      const date = new Date(createdAt);
      if (date >= todayStart && date <= todayEnd) {
        return sum + (r.amount || 0);
      }
    }
    return sum;
  }, 0) + referralBonusToday;
  const dailyReferralProfit = a.today + b.today + c.today;
  const totalReferralProfit = a.total + b.total + c.total;

  const dailyTotal = dailyNFTProfit + dailyReferralProfit + activityToday + dailyStakeIncome;
  const totalEarning = totalNFTProfit + totalReferralProfit + activityTotal + totalStakeIncome;

  // Calculate activity (admin rewards)


  return res.status(200).json(new apiresponse(200, {
    dailyEarning: dailyTotal,
    totalEarning,
    activity: {
      today: activityToday,
      total: activityTotal
    },
    breakdown: {
      nft: {
        today: dailyNFTProfit,
        total: totalNFTProfit,
      },
      stake: {
        today: dailyStakeIncome,
        total: totalStakeIncome,
      },
      referral: {
        today: dailyReferralProfit,
        total: totalReferralProfit,
        teamA: a,
        teamB: b,
        teamC: c,
      }
    }
  }, "User earnings summary"));
});
export const getUserOrderStatsWithDailyIncrement = asynchandler(async (req, res) => {
  const userId = req.user._id;

  // Get all reservations for the user
  const allReservations = await Reservation.find({ userid: userId });

  // Calculate total purchased and sold (all time)
  const totalPurchased = allReservations.length;
  const totalSold = allReservations.filter(r => r.status === "sold").length;
  const openOrders = Math.max(totalPurchased - totalSold, 0);

  const user = await User.findById(userId);
  const validTeamAMembers = user.team_A_members.filter(m => m.validmember).length;
  const validTeamBMembers = user.team_B_members.filter(m => m.validmember).length;
  const validTeamCMembers = user.team_C_members.filter(m => m.validmember).length;
  const validTeamBandCMembers = validTeamBMembers + validTeamCMembers;

  return res.status(200).json(new apiresponse(200, {
    totalOrders: totalPurchased + totalSold,
    purchased: totalPurchased,
    sold: totalSold,
    openOrders,
    validTeamAMembers,
    validTeamBandCMembers
  }, "User order and team statistics retrieved"));
});

export const getValidMembersIncome = asynchandler(async (req, res) => {
  const user = req.user;
  const { start, end } = req.query;
  let startDate, endDate;
  if (start) {
    startDate = new Date(start);
    // Normalize to UTC start of day
    startDate.setUTCHours(0, 0, 0, 0);
  }
  if (end) {
    endDate = new Date(end);
    // Normalize to UTC end of day
    endDate.setUTCHours(23, 59, 59, 999);
  }

  function maskEmail(email) {
    if (!email) return "";
    const [name, domain] = email.split("@");
    return name.slice(0, 3) + "*****@" + domain;
  }

  function formatDateTime(date) {
    if (!date) return null;
    const d = new Date(date);
    const day = d.toLocaleDateString("en-GB");
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${time} ${day}`;
  }

  function inRange(date) {
    if (!date) return false;
    const d = new Date(date);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  }

  // Collect all valid member IDs for all tiers
  const eligible = user.level >= 2;
  const tierDefs = [
    { key: 'A', members: (user.team_A_members || []).filter(m => m.validmember), percent: eligible ? 0.13 : 0 },
    { key: 'B', members: (user.team_B_members || []).filter(m => m.validmember), percent: eligible ? 0.08 : 0 },
    { key: 'C', members: (user.team_C_members || []).filter(m => m.validmember), percent: eligible ? 0.06 : 0 },
  ];
  const allMemberIds = tierDefs.flatMap(t => t.members.map(m => m.userid));

  // Batch fetch all users (project only needed fields)
  const users = await User.find(
    { _id: { $in: allMemberIds } },
    'username email createdAt amount'
  ).lean();
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  // Use aggregation to compute per-user total profits (ALL and filtered)
  const allMatch = { userid: { $in: allMemberIds }, status: 'sold' };
  const allGrouped = await Reservation.aggregate([
    { $match: allMatch },
    { $group: { _id: '$userid', totalProfit: { $sum: { $ifNull: ['$profit', 0] } } } }
  ]);
  const allProfitByUser = Object.fromEntries(allGrouped.map(d => [d._id.toString(), d.totalProfit]));

  let filteredProfitByUser = null;
  if (startDate || endDate) {
    const filterMatch = { userid: { $in: allMemberIds }, status: 'sold' };
    if (startDate) filterMatch.sellDate = { $gte: startDate };
    if (endDate) filterMatch.sellDate = { ...(filterMatch.sellDate || {}), $lte: endDate };
    const filteredGrouped = await Reservation.aggregate([
      { $match: filterMatch },
      { $group: { _id: '$userid', totalProfit: { $sum: { $ifNull: ['$profit', 0] } } } }
    ]);
    filteredProfitByUser = Object.fromEntries(filteredGrouped.map(d => [d._id.toString(), d.totalProfit]));
  }

  // Prepare data for each tier (ALL data - main response)
  const tiers = { A: { members: [], tierIncome: 0 }, B: { members: [], tierIncome: 0 }, C: { members: [], tierIncome: 0 } };
  let totalIncome = 0;

  // Also prepare filtered data (if dates provided)
  const tiersFiltered = { A: { members: [], tierIncome: 0 }, B: { members: [], tierIncome: 0 }, C: { members: [], tierIncome: 0 } };
  let totalIncomeFiltered = 0;

  for (const tier of tierDefs) {
    for (const member of tier.members) {
      const memberIdStr = member.userid ? member.userid.toString() : null;
      const memberUser = userMap[memberIdStr];
      if (!memberUser) continue;
      
      // Calculate ALL income (unfiltered)
      const memberAllProfit = allProfitByUser[memberIdStr] || 0;
      const income = memberAllProfit * tier.percent;
      
      // Calculate filtered income (within date range)
      const memberFilteredProfit = filteredProfitByUser ? (filteredProfitByUser[memberIdStr] || 0) : 0;
      const incomeFiltered = memberFilteredProfit * tier.percent;
      
      // Add to main tiers (ALL data)
      tiers[tier.key].members.push({
        username: memberUser.username,
        email: maskEmail(memberUser.email),
        dateTime: formatDateTime(memberUser.createdAt),
        income,
        amount: memberUser.amount ? Number(memberUser.amount).toFixed(2) : "0.00"
      });
      tiers[tier.key].tierIncome += income;
      totalIncome += income;
      
      // Add to filtered tiers (if dates provided)
      if (startDate || endDate) {
        tiersFiltered[tier.key].members.push({
          username: memberUser.username,
          email: maskEmail(memberUser.email),
          dateTime: formatDateTime(memberUser.createdAt),
          income: incomeFiltered,
          amount: memberUser.amount ? Number(memberUser.amount).toFixed(2) : "0.00"
        });
        tiersFiltered[tier.key].tierIncome += incomeFiltered;
        totalIncomeFiltered += incomeFiltered;
      }
    }
  }

  // Add 10% referral bonuses from first deposits (do not include in totalIncome)
  const referralBonuses = await History.find({ userid: user._id, type: 'referral_bonus' });
  const referralBonusTotal = referralBonuses.reduce((sum, r) => sum + (r.amount || 0), 0);

  const response = {
    // Main data (ALL - unfiltered)
    A: tiers.A,
    B: tiers.B,
    C: tiers.C,
    totalIncome,
    referralBonus: referralBonusTotal
  };

  // Add filtered data if dates were provided
  if (startDate || endDate) {
    response.filtered = {
      A: tiersFiltered.A,
      B: tiersFiltered.B,
      C: tiersFiltered.C,
      totalIncome: totalIncomeFiltered
    };
  }

  return res.status(200).json(new apiresponse(200, response, "Valid members and income by tier retrieved successfully"));
});

export const getUserFullHistory = asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { start, end } = req.query;
  let startDate, endDate; // <-- Ensure these are always declared
  
 
  
  if (start) {
    // Create UTC date to avoid timezone issues
    if (typeof start === 'string' && start.length === 10) {
      startDate = new Date(start + 'T00:00:00.000Z');
    } else {
      startDate = new Date(start);
    }
  }
  if (end) {
    // Create UTC date to avoid timezone issues
    if (typeof end === 'string' && end.length === 10) {
      endDate = new Date(end + 'T23:59:59.999Z');
    } else {
      endDate = new Date(end);
    }
    // Debug: Log the actual end date
 
  }
  
 
  // Helper to build date filter
  const buildDateFilter = (field = 'createdAt') => {
    const filter = {};
    if (startDate && endDate) {
      filter[field] = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter[field] = { $gte: startDate };
    } else if (endDate) {
      filter[field] = { $lte: endDate };
    }
  
    return filter;
  };

  // Withdraws
  const withdraws = await Withdraw.find({
    userid: userId,
    ...buildDateFilter('createdAt')
  }).sort({ createdAt: -1 });

  // Deposits
  const deposits = await Deposit.find({
    userId: userId,
    payment_status: 'finished',
    ...buildDateFilter('created_at')
  }).sort({ created_at: -1 });

  // Reservations
  const reservationFilter = {
    userid: userId,
    ...buildDateFilter('reservationDate')
  };
  
  
  // Populate nftid to get full NFT info
  const reservations = await Reservation.find(reservationFilter)
    .sort({ reservationDate: -1 })
    .populate('nftid');
 
  
  // Debug: Test date comparison manually
  if (startDate || endDate) {
    const testReservation = await Reservation.findOne({ userid: userId });
    if (testReservation) {
      console.log('Test reservation date:', testReservation.reservationDate);
      
    }
  }

  // Rewards
  const rewards = await Reward.find({
    userid: userId,
    ...buildDateFilter('createdAt')
  }).sort({ createdAt: -1 });

  return res.status(200).json(new apiresponse(200, {
    withdraws,
    deposits,
    // Map reservations to include full NFT info under 'nft' key
    reservations: reservations.map(r => ({
      ...r.toObject(),
      nft: r.nftid || null
    })),
    rewards
  }, "User full history fetched successfully"));
});

export const debugReservations = asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { start, end } = req.query;

  // Get all reservations without date filtering
  const allReservations = await Reservation.find({ userid: userId }).sort({ reservationDate: -1 });

  // Test date filtering
  let filteredReservations = [];
  if (start || end) {
    let startDate, endDate;
    if (start) {
      // Create UTC date to avoid timezone issues
      if (typeof start === 'string' && start.length === 10) {
        startDate = new Date(start + 'T00:00:00.000Z');
      } else {
        startDate = new Date(start);
      }
    }
    if (end) {
      // Create UTC date to avoid timezone issues
      if (typeof end === 'string' && end.length === 10) {
        endDate = new Date(end + 'T23:59:59.999Z');
      } else {
        endDate = new Date(end);
      }
    }

    const filter = {};
    if (startDate && endDate) {
      filter.reservationDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.reservationDate = { $gte: startDate };
    } else if (endDate) {
      filter.reservationDate = { $lte: endDate };
    }

    filteredReservations = await Reservation.find({
      userid: userId,
      ...filter
    }).sort({ reservationDate: -1 });
  }

  return res.status(200).json(new apiresponse(200, {
    totalReservations: allReservations.length,
    reservations: allReservations,
    dateFilterParams: { start, end },
    filteredReservations: filteredReservations,
    filteredCount: filteredReservations.length
  }, "Debug: All reservations for user"));
});

// Debug endpoint: Compare user.amount, credited team income, withdrawn, and calculated summary
export const getUserEarningDebug = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // 1. Current account amount
  const accountAmount = user.amount;

  // 2. Total credited team income (History type 'income')
  const creditedIncome = await History.aggregate([
    { $match: { userid: user._id, type: 'income' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalCreditedIncome = creditedIncome[0]?.total || 0;

  // 3. Total withdrawn (from Withdraw table - only approved and pending)
  const approvedWithdrawals = await Withdraw.find({ 
    userid: user._id, 
    status: { $in: ['approved', 'pending'] }
  });
  const totalWithdrawn = approvedWithdrawals.reduce((sum, w) => sum + (w.amount + w.fees || 0), 0);

  // 4. Total calculated by earning summary (same as getUserEarningSummary)
  // Own reservation profits
  const reservations = await Reservation.find({ userid: user._id, status: "sold" });
  let totalNFTProfit = 0;
  for (const resv of reservations) {
    totalNFTProfit += resv.profit || 0;
  }
  // Downline profits
  function getDownlineUserIds(team) {
    return (team || []).filter(m => m.validmember).map(m => m.userid);
  }
  const [aDownlineIds, bDownlineIds, cDownlineIds] = [
    getDownlineUserIds(user.team_A_members),
    getDownlineUserIds(user.team_B_members),
    getDownlineUserIds(user.team_C_members)
  ];
  const [aResvs, bResvs, cResvs] = await Promise.all([
    aDownlineIds.length ? Reservation.find({ userid: { $in: aDownlineIds }, status: "sold" }) : [],
    bDownlineIds.length ? Reservation.find({ userid: { $in: bDownlineIds }, status: "sold" }) : [],
    cDownlineIds.length ? Reservation.find({ userid: { $in: cDownlineIds }, status: "sold" }) : []
  ]);
  function sumProfits(resvs, percent) {
    let total = 0;
    for (const r of resvs) {
      if (!r.profit) continue;
      total += r.profit * percent;
    }
    return total;
  }
  // Gate team income by level
  let a = 0, b = 0, c = 0;
  if (user.level >= 2) {
    a = sumProfits(aResvs, 0.13);
    b = sumProfits(bResvs, 0.08);
    c = sumProfits(cResvs, 0.06);
  }
  // Rewards and referral bonuses
  const rewards = await Reward.find({ userid: user._id });
  const referralBonuses = await History.find({ userid: user._id, type: 'referral_bonus' });
  const referralBonusTotal = referralBonuses.reduce((sum, r) => sum + (r.amount || 0), 0);
  const activityTotal = rewards.reduce((sum, r) => sum + (r.amount || 0), 0) + referralBonusTotal;
  
  // Get deposits and registration bonuses (same as syncUserAccountAmount)
  const deposits = await Deposit.find({ userId: user._id, payment_status: 'finished' });
  const depositTotal = deposits.reduce((sum, d) => sum + (Number(d.actually_paid) || 0), 0);
  const registrationBonuses = await History.find({ userid: user._id, type: 'registration' });
  const registrationBonusTotal = registrationBonuses.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  const totalCalculated = depositTotal + registrationBonusTotal + activityTotal + totalNFTProfit + a + b + c;

  return res.status(200).json({
    accountAmount,
    totalCreditedIncome,
    totalWithdrawn,
    totalCalculated,
    details: {
      totalNFTProfit,
      teamA: a,
      teamB: b,
      teamC: c,
      activityTotal
    }
  });
});

// Reusable function to sync user account amount to calculated earnings
export async function syncUserAccountAmount(userId) {
  const user = await User.findById(userId);
  if (!user) return { error: 'User not found' };
  
  // 1. Calculate all earnings (deposits, bonuses, profits, etc.)
  const deposits = await Deposit.find({ userId: user._id, payment_status: 'finished' });
  const depositTotal = deposits.reduce((sum, d) => sum + (Number(d.actually_paid) || 0), 0);
  
  const registrationBonuses = await History.find({ userid: user._id, type: 'registration' });
  const registrationBonusTotal = registrationBonuses.reduce((sum, r) => sum + (r.amount || 0), 0);
  
  const rewards = await Reward.find({ userid: user._id });
  const referralBonuses = await History.find({ userid: user._id, type: 'referral_bonus' });
  const referralBonusTotal = referralBonuses.reduce((sum, r) => sum + (r.amount || 0), 0);
  const activityTotal = rewards.reduce((sum, r) => sum + (r.amount || 0), 0) + referralBonusTotal;
  
  // NFT profits (from reservations)
  const reservations = await Reservation.find({ userid: user._id, status: "sold" });
  let totalNFTProfit = 0;
  for (const resv of reservations) {
    totalNFTProfit += resv.profit || 0;
  }
  
  // NFT staking profits (from completed and claimed stakes)
  const claimedStakes = await Stake.find({ userId: user._id, profitClaimed: true });
  let totalStakingProfit = 0;
  for (const stake of claimedStakes) {
    totalStakingProfit += stake.getTotalAccumulatedProfit();
  }
  
  // NFT selling profits (from UserNFT - manual sales)
  const soldNFTs = await UserNFT.find({ userId: user._id, status: "sold" });
  let totalNFTSellingProfit = 0;
  for (const userNFT of soldNFTs) {
    if (userNFT.soldPrice && userNFT.purchasePrice) {
      totalNFTSellingProfit += (userNFT.soldPrice - userNFT.purchasePrice);
    }
  }
  
  // Referral profits
  function getDownlineUserIds(team) {
    return (team || []).filter(m => m.validmember).map(m => m.userid);
  }
  const [aDownlineIds, bDownlineIds, cDownlineIds] = [
    getDownlineUserIds(user.team_A_members),
    getDownlineUserIds(user.team_B_members),
    getDownlineUserIds(user.team_C_members)
  ];
  const [aResvs, bResvs, cResvs] = await Promise.all([
    aDownlineIds.length ? Reservation.find({ userid: { $in: aDownlineIds }, status: "sold" }) : [],
    bDownlineIds.length ? Reservation.find({ userid: { $in: bDownlineIds }, status: "sold" }) : [],
    cDownlineIds.length ? Reservation.find({ userid: { $in: cDownlineIds }, status: "sold" }) : []
  ]);
  function sumProfits(resvs, percent) {
    let total = 0;
    for (const r of resvs) {
      if (!r.profit) continue;
      total += r.profit * percent;
    }
    return total;
  }
  // Gate team income by level
  let a = 0, b = 0, c = 0;
  if (user.level >= 2) {
    a = sumProfits(aResvs, 0.13);
    b = sumProfits(bResvs, 0.08);
    c = sumProfits(cResvs, 0.06);
  }
  
  // Total calculated earnings
  const totalCalculated = depositTotal + registrationBonusTotal + activityTotal + totalNFTProfit + totalStakingProfit + totalNFTSellingProfit + a + b + c;
  
  // 2. Get all withdrawals that affect the balance
  const allWithdrawals = await Withdraw.find({ userid: user._id });

  

  // 3. Calculate net withdrawal effect
  let netWithdrawalEffect = 0;
  for (const withdrawal of allWithdrawals) {
    if (withdrawal.status === 'pending' || withdrawal.status === 'approved') {
      netWithdrawalEffect += (withdrawal.amount + withdrawal.fees);
    } else if (withdrawal.status === 'rejected') {
      netWithdrawalEffect += withdrawal.fees;
    }
  }
  
  // 4. Calculate the correct balance (never allow negative)
  const calculatedBalance = totalCalculated - netWithdrawalEffect;
  const correctBalance = Math.max(0, calculatedBalance);
  
  // 5. Update user balance if needed
  const adjustment = correctBalance - user.amount;
  if (Math.abs(adjustment) > 0.0001) {
    user.amount = correctBalance;
    await user.save();
  }

  return {
    newAmount: correctBalance,
    adjustment,
    totalCalculated,
    netWithdrawalEffect,
    totalWithdrawn: netWithdrawalEffect,
    registrationBonusTotal,
    totalNFTProfit,
    totalStakingProfit,
    totalNFTSellingProfit,
    calculatedBalance, // Show the raw calculated balance before applying Math.max
    message: Math.abs(adjustment) > 0.0001 ? 'Account amount synced.' : 'No adjustment needed.'
  };
}

// POST endpoint: Sync user.amount to calculated earnings (minus withdrawals)
export const syncUserEarning = asynchandler(async (req, res) => {
  const result = await syncUserAccountAmount(req.user._id);
  return res.status(200).json(result);
});
