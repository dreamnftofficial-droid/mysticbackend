# NFT Staking System Guide

## Overview
The NFT staking system allows users to purchase NFTs and then choose to either sell them or stake them for daily profits. The system supports two types of staking areas: Options Area and Free Zone.

## Staking Areas

### Options Area
- **Level Requirement**: 2-6
- **Stake Options**: 6 different stakes (1-6)
- **Stake Period**: 7-30 days

| Stake No | Amount Range | Daily Profit % |
|----------|--------------|----------------|
| 1        | 199 - 1000   | 1.5%           |
| 2        | 499 - 2000   | 1.8%           |
| 3        | 799 - 3000   | 2.1%           |
| 4        | 999 - 4000   | 2.5%           |
| 5        | 199 - 5000   | 3.0%           |
| 6        | 1999 - 6000  | 3.5%           |

### Free Zone
- **Level Requirement**: 0-6
- **Stake Options**: 3 different stakes (1-3)
- **Stake Period**: 3-30 days

| Stake No | Amount Range | Daily Profit % |
|----------|--------------|----------------|
| 1        | 200 - 3444   | 1.2%           |
| 2        | 500 - 799    | 1.5%           |
| 3        | 800 - 1200   | 1.7%           |

## User Flow

### 1. Get Qualified NFTs
User gets NFTs they are qualified to purchase based on their level.

### 2. Buy NFT
User purchases an NFT which gets added to their collection.

### 3. Choose Action
User can either:
- **Sell the NFT** - Get immediate profit/loss
- **Stake the NFT** - Earn daily profits over time

### 4. Daily Profit Calculation
- Daily profits are calculated and logged each day
- Profits are accumulated but not paid until stake completion
- User can see accumulated profits in real-time

### 5. Profit Collection
- On stake completion, all accumulated profits are paid at once
- NFT is returned to user's collection (available for selling or staking again)

## API Endpoints

### User Endpoints

#### 1. Get Qualified NFTs
```
GET /api/v1/stake/qualified-nfts?stakeType=options_area&stakeNo=1
```
Returns 5 random NFTs with random prices within the stake range, user balance, and stake configuration.

**Query Parameters:**
- `stakeType`: `options_area` or `free_zone`
- `stakeNo`: 1-6 (options_area) or 1-3 (free_zone)

**Response:**
```json
{
  "nfts": [
    {
      "_id": "nft_id",
      "name": "NFT Name",
      "picture": "image_url",
      "price": 450,
      "dailyProfit": 1.5,
      "minPeriod": 7,
      "maxPeriod": 30
    }
  ],
  "userBalance": 1000,
  "stakeConfig": {
    "minAmount": 199,
    "maxAmount": 1000,
    "dailyProfit": 1.5,
    "minPeriod": 7,
    "maxPeriod": 30
  }
}
```

#### 2. Buy NFT
```
POST /api/v1/stake/buy-nft
Body: {
  "nftId": "nft_id",
  "stakeType": "options_area",
  "stakeNo": 1,
  "price": 450
}
```
Purchases an NFT and adds it to user's collection.

#### 3. Get User's NFT Collection
```
GET /api/v1/stake/my-nfts
```
Returns all NFTs owned by the user.

#### 4. Stake NFT
```
POST /api/v1/stake/stake-nft
Body: {
  "userNFTId": "user_nft_id",
  "stakeType": "options_area",
  "stakeNo": 1,
  "stakePeriod": 15
}
```
Stakes an NFT from user's collection for the specified period.

#### 5. Sell NFT
```
POST /api/v1/stake/sell-nft
Body: {
  "userNFTId": "user_nft_id",
  "soldPrice": 500
}
```
Sells an NFT from user's collection.

#### 6. Get User Stakes
```
GET /api/v1/stake/my-stakes
```
Returns all stakes created by the user with daily profit information.

#### 7. Get Active Stakes
```
GET /api/v1/stake/active
```
Returns only active stakes with accumulated profit information.

#### 8. Get Completed Stakes
```
GET /api/v1/stake/completed
```
Returns completed stakes.

#### 9. Claim Profit
```
POST /api/v1/stake/claim/:stakeId
```
Claims profit from a completed stake.

#### 10. Cancel Stake
```
POST /api/v1/stake/cancel/:stakeId
```
Cancels an active stake and returns NFT to collection.

#### 11. Get Stake Statistics
```
GET /api/v1/stake/stats
```
Returns user's stake statistics.

### Admin Endpoints

#### 1. Get All Stakes
```
GET /api/v1/admin/stake/all?page=1&limit=10&status=active&stakeType=options_area
```
Returns all stakes with pagination and filters.

#### 2. Get Admin Statistics
```
GET /api/v1/admin/stake/stats
```
Returns comprehensive stake statistics.

#### 3. Get Stakes by User
```
GET /api/v1/admin/stake/user/:userId
```
Returns all stakes for a specific user.

#### 4. Get Stake Details
```
GET /api/v1/admin/stake/details/:stakeId
```
Returns detailed information about a specific stake.

#### 5. Get Stakes by Date Range
```
GET /api/v1/admin/stake/date-range?startDate=2024-01-01&endDate=2024-12-31
```
Returns stakes within a date range.

#### 6. Force Complete Stake
```
POST /api/v1/admin/stake/force-complete/:stakeId
```
Force completes a stake (admin only).

#### 7. Force Claim Profit
```
POST /api/v1/admin/stake/force-claim/:stakeId
```
Force claims profit for a stake (admin only).

#### 8. Cancel Stake (Admin)
```
POST /api/v1/admin/stake/cancel/:stakeId
```
Cancels a stake and returns NFT to user's collection (admin only).

## How It Works

### 1. User Flow
1. User calls `/api/v1/stake/qualified-nfts` to get NFTs they can buy
2. User selects an NFT and calls `/api/v1/stake/buy-nft` to purchase it
3. NFT is added to user's collection
4. User can view their collection with `/api/v1/stake/my-nfts`
5. User chooses to either:
   - **Sell**: Call `/api/v1/stake/sell-nft` for immediate profit
   - **Stake**: Call `/api/v1/stake/stake-nft` for daily profits
6. **Daily profit calculation** happens automatically when user calls `/api/v1/user/me`
7. Profits accumulate daily but are only paid on stake completion
8. On completion, all accumulated profits are paid at once

### 2. Daily Profit Calculation
```
Daily Profit = (Stake Amount × Daily Profit %) / 100
Total Accumulated Profit = Sum of all daily profits
```

### 3. Stake States
- **Active**: Stake is running and earning daily profits
- **Completed**: Stake period has ended (0 days remaining), accumulated profits ready to claim
- **Claimed**: All accumulated profits have been paid
- **Cancelled**: Stake was cancelled, NFT returned to collection

**Note**: Status automatically changes from "Active" to "Completed" when remaining days reach 0.

### 4. Daily Profit Tracking
- Daily profits are calculated and logged each day
- Profits accumulate but are not paid until stake completion
- User can see accumulated profits in real-time
- All profits are paid at once when stake completes
- **Automatic Status Update**: When remaining days reach 0, stake status automatically changes to "completed"

## Database Schema

### UserNFT Model (User's NFT Collection)
```javascript
{
  userId: ObjectId,
  nftId: ObjectId,
  purchasePrice: Number,
  purchaseDate: Date,
  isStaked: Boolean,
  stakeId: ObjectId,
  isSold: Boolean,
  soldPrice: Number,
  soldDate: Date
}
```

### Stake Model
```javascript
{
  userId: ObjectId,
  nftId: ObjectId,
  stakeType: 'options_area' | 'free_zone',
  stakeNo: Number,
  stakeAmount: Number,
  stakePeriod: Number,
  dailyProfitPercentage: Number,
  totalProfit: Number,
  stakeStartDate: Date,
  stakeEndDate: Date,
  isActive: Boolean,
  isCompleted: Boolean,
  profitClaimed: Boolean,
  userLevel: Number,
  dailyProfits: [{
    day: Number,
    date: Date,
    profitAmount: Number,
    isPaid: Boolean
  }],
  currentDay: Number,
  lastProfitCalculation: Date
}
```

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Admin Authorization**: Admin endpoints require admin role
3. **Level Validation**: Users can only access stakes appropriate for their level
4. **Amount Validation**: NFT prices must be within configured ranges
5. **Period Validation**: Stake periods must be within allowed ranges
6. **Balance Validation**: Users must have sufficient balance to purchase NFTs
7. **NFT Ownership**: Users can only stake/sell NFTs they own

## Error Handling

The system includes comprehensive error handling for:
- Invalid stake configurations
- Insufficient user balance
- Invalid user levels
- Non-existent NFTs
- Already completed/claimed stakes
- Unauthorized access
- NFT not available for staking/selling

## Monitoring and Maintenance

### Automatic Daily Profit Calculation
- Integrated into `/api/v1/user/me` endpoint
- Calculates daily profits for active stakes
- Logs profits but doesn't pay until completion
- Updates accumulated profit totals
- **Automatic Status Updates**: Automatically marks stakes as completed when days reach 0

### Automatic Profit Collection
- Integrated into `/api/v1/user/me` endpoint
- Automatically collects profits from completed stakes
- Updates user balance with accumulated profits
- Returns NFTs to user's collection

### Statistics Tracking
The system tracks:
- Total NFTs purchased
- Total NFTs sold
- Total stakes created
- Active stakes
- Completed stakes
- Total profit generated
- Total profit claimed
- Pending profit amounts

## Usage Examples

### Getting Qualified NFTs
```javascript
// Get qualified NFTs for options area stake 1
const response = await fetch('/api/v1/stake/qualified-nfts?stakeType=options_area&stakeNo=1');
const data = await response.json();
// data.nfts contains 5 NFTs with random prices
```

### Buying an NFT
```javascript
// Buy an NFT
const response = await fetch('/api/v1/stake/buy-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nftId: 'nft_id',
    stakeType: 'options_area',
    stakeNo: 1,
    price: 450
  })
});
```

### Staking an NFT
```javascript
// Stake an NFT from collection
const response = await fetch('/api/v1/stake/stake-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userNFTId: 'user_nft_id',
    stakeType: 'options_area',
    stakeNo: 1,
    stakePeriod: 15
  })
});
```

### Selling an NFT
```javascript
// Sell an NFT from collection
const response = await fetch('/api/v1/stake/sell-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userNFTId: 'user_nft_id',
    soldPrice: 500
  })
});
```

### Daily Profit Calculation
```javascript
// Daily profits are automatically calculated when calling /me
const response = await fetch('/api/v1/user/me');
// Daily profits are calculated and logged for active stakes
```

This staking system provides a complete NFT marketplace with staking capabilities, allowing users to purchase, sell, or stake NFTs with daily profit accumulation and automatic collection. 