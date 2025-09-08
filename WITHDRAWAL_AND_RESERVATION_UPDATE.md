# Withdrawal and Reservation System Updates

## Changes Made

### 1. **Withdrawal System Updates**

#### **OTP Verification for Withdrawals**
- **Before**: Single-step withdrawal with Google Authenticator only
- **After**: Two-step withdrawal process:
  1. **Step 1**: User requests withdrawal → OTP sent to email
  2. **Step 2**: User confirms with OTP + Google Authenticator code

#### **New Withdrawal Flow**
```
1. POST /api/v1/withdraw/withdraw
   Body: { "amount": 100 }
   Response: "OTP sent to your email"

2. POST /api/v1/withdraw/withdraw/confirm
   Body: { "amount": 100, "googleAuthCode": "123456", "otp": "789012" }
   Response: "Withdrawal request submitted"
```

#### **No Fees on Rejection**
- **Before**: Fees were deducted even on withdrawal rejection
- **After**: No fees deducted on rejection - full amount refunded
- **Implementation**: Updated withdrawal rejection logic to refund full amount including fees

### 2. **Reservation System Updates**

#### **NFT-Based Reservations**
- **Before**: Reservations were automatically assigned based on user's reservation count
- **After**: Users can choose specific NFTs to reserve
- **New Flow**:
  1. Get available NFTs: `GET /api/v1/reservation/available`
  2. Reserve specific NFT: `POST /api/v1/reservation/reserve` with `{ "nftId": "..." }`

#### **NFT Availability Check**
- Added validation to prevent multiple users from reserving the same NFT on the same day
- Only shows NFTs that haven't been reserved today

### 3. **UK Timezone Implementation**

#### **System-Wide UK Timezone**
- **Before**: System used server's local timezone
- **After**: All time operations use UK timezone (GMT/BST)
- **Implementation**: Created `utils/timezone.js` with UK timezone functions

#### **UK Timezone Functions**
- `getUKTime()` - Get current UK time
- `getUKDate()` - Get UK date object
- `getUKStartOfDay()` - Start of day in UK timezone
- `getUKEndOfDay()` - End of day in UK timezone
- `isUKToday()` - Check if date is today in UK timezone
- `formatUKDate()` - Format date for UK timezone

## Updated API Endpoints

### Withdrawal Endpoints

#### 1. Request Withdrawal (Step 1)
```
POST /api/v1/withdraw/withdraw
Body: { "amount": 100 }
Response: { "message": "OTP sent to your email for withdrawal verification" }
```

#### 2. Confirm Withdrawal (Step 2)
```
POST /api/v1/withdraw/withdraw/confirm
Body: { 
  "amount": 100, 
  "googleAuthCode": "123456", 
  "otp": "789012" 
}
Response: { "withdraw": {...}, "requestedAmount": 100, "amountToReceive": 92, "feeAmount": 8 }
```

#### 3. Get All Withdrawals
```
GET /api/v1/withdraw/withdraws
```

#### 4. Get User Withdrawals
```
GET /api/v1/withdraw/my-withdraws
```

#### 5. Update Withdrawal Status (Admin)
```
PUT /api/v1/withdraw/withdraw/:id
Body: { "status": "approved" | "rejected" }
```

### Reservation Endpoints

#### 1. Get Available NFTs
```
GET /api/v1/reservation/available
Response: [array of available NFTs for today]
```

#### 2. Reserve NFT
```
POST /api/v1/reservation/reserve
Body: { "nftId": "nft_id_here" }
Response: { "reservation": {...} }
```

#### 3. Get Today's Reservation
```
GET /api/v1/reservation/today
Response: { "reservation": {...} }
```

#### 4. Buy Reserved NFT
```
GET /api/v1/reservation/buy
```

#### 5. Sell NFT
```
GET /api/v1/reservation/sell
```

#### 6. Get Expected Income
```
GET /api/v1/reservation/expected-income
```

## Security Features

### Withdrawal Security
1. **Two-Factor Authentication**: Google Authenticator required
2. **Email OTP Verification**: OTP sent to registered email
3. **Rate Limiting**: OTP attempts limited to 3 with 15-minute block
4. **OTP Expiry**: OTP expires after 10 minutes
5. **Wallet Binding**: Wallet address must be bound before withdrawal

### Reservation Security
1. **One Reservation Per Day**: Users can only reserve one NFT per day
2. **NFT Availability**: Prevents multiple reservations of same NFT
3. **Authentication Required**: All endpoints require valid JWT token

## Database Changes

### Withdrawal Model
- No changes to schema
- Updated logic for fee handling on rejection

### Reservation Model
- No changes to schema
- Updated logic for NFT-based reservations

### History Model
- Updated withdrawal rejection descriptions
- Added "Rejected - No fees deducted" description

## Timezone Handling

### UK Timezone Features
- **Automatic DST Handling**: Automatically switches between GMT and BST
- **Consistent Time Operations**: All date operations use UK timezone
- **Reservation Day Logic**: Reservations reset at UK midnight
- **Withdrawal Timestamps**: All withdrawal timestamps in UK timezone

### Timezone Functions Usage
```javascript
// Get UK start/end of day
const todayStart = getUKStartOfDay();
const todayEnd = getUKEndOfDay();

// Get current UK time
const ukTime = getUKDate();

// Check if date is today in UK
const isToday = isUKToday(someDate);
```

## Error Handling

### Withdrawal Errors
- **Insufficient Balance**: User doesn't have enough funds
- **Multiple Pending**: User already has pending withdrawal
- **2FA Not Enabled**: User must enable 2FA first
- **Wallet Not Bound**: User must bind wallet address
- **Invalid OTP**: OTP verification failed
- **OTP Expired**: OTP has expired
- **Too Many Attempts**: User blocked for 15 minutes

### Reservation Errors
- **NFT Not Found**: Specified NFT doesn't exist
- **Already Reserved**: User already reserved today
- **NFT Already Reserved**: NFT already reserved by someone else
- **Insufficient Balance**: User needs at least $50 to buy NFT

## Testing Recommendations

### Withdrawal Testing
1. **Test OTP Flow**: Verify OTP is sent and verified correctly
2. **Test 2FA Integration**: Ensure Google Authenticator works
3. **Test Fee Handling**: Verify no fees on rejection
4. **Test Rate Limiting**: Test OTP attempt limits
5. **Test Wallet Binding**: Ensure wallet is required

### Reservation Testing
1. **Test NFT Selection**: Verify users can choose specific NFTs
2. **Test Availability**: Ensure only available NFTs are shown
3. **Test Daily Limits**: Verify one reservation per day
4. **Test UK Timezone**: Verify reservations reset at UK midnight
5. **Test NFT Conflicts**: Ensure no duplicate reservations

### Timezone Testing
1. **Test DST Transitions**: Verify timezone changes work correctly
2. **Test Day Boundaries**: Verify day calculations are correct
3. **Test Date Comparisons**: Ensure UK timezone is used consistently

## Files Modified

1. **controllers/withdraw.controller.js**
   - Added OTP verification system
   - Updated fee handling for rejections
   - Added confirmWithdraw function

2. **controllers/reservation.controller.js**
   - Updated to NFT-based reservations
   - Added getAvailableNFTs function
   - Implemented UK timezone

3. **controllers/Record.controller.js**
   - Updated withdrawal rejection logic
   - Fixed fee calculations

4. **Routes/withdraw.routes.js**
   - Added confirmWithdraw route

5. **Routes/reservation.routes.js**
   - Added getAvailableNFTs route
   - Changed reserve to POST method

6. **utils/timezone.js**
   - Created UK timezone utility functions

## Migration Notes

### Existing Data
- **Withdrawals**: Existing withdrawal records remain unchanged
- **Reservations**: Existing reservations remain unchanged
- **Users**: No user data changes required

### New Features
- **OTP System**: Uses existing EmailVerification model
- **NFT Selection**: Requires frontend updates to show available NFTs
- **UK Timezone**: All new operations use UK timezone

## Frontend Integration

### Withdrawal Flow
```javascript
// Step 1: Request withdrawal
const response1 = await fetch('/api/v1/withdraw/withdraw', {
  method: 'POST',
  body: JSON.stringify({ amount: 100 })
});

// Step 2: Confirm with OTP and 2FA
const response2 = await fetch('/api/v1/withdraw/withdraw/confirm', {
  method: 'POST',
  body: JSON.stringify({ 
    amount: 100, 
    googleAuthCode: '123456', 
    otp: '789012' 
  })
});
```

### Reservation Flow
```javascript
// Get available NFTs
const availableNFTs = await fetch('/api/v1/reservation/available');

// Reserve specific NFT
const reservation = await fetch('/api/v1/reservation/reserve', {
  method: 'POST',
  body: JSON.stringify({ nftId: 'nft_id_here' })
});
```

This update significantly improves the security and user experience of both the withdrawal and reservation systems while implementing UK timezone consistency across the platform.
