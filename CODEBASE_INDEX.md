# MysticNFT Backend - Complete Codebase Index

## 🏗️ Project Overview

**MysticNFT** is a comprehensive NFT staking platform backend built with Node.js, Express, and MongoDB. The platform allows users to purchase NFTs, stake them for daily profits, manage referrals, and handle cryptocurrency transactions.

## 📋 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Payment Processing**: NowPayments integration
- **Queue Management**: BullMQ with Redis
- **Security**: 2FA with Speakeasy, QR codes
- **Deployment**: Vercel

## 🗂️ Project Structure

```
mysticbackend-main/
├── 📁 controllers/          # Business logic handlers
├── 📁 models/              # Database schemas
├── 📁 Routes/              # API route definitions
├── 📁 middelwares/         # Custom middleware
├── 📁 utils/               # Utility functions
├── 📁 libs/                # Email templates
├── 📁 db/                  # Database connection
├── 📁 scripts/             # Background services
├── 📄 app.js               # Express app configuration
├── 📄 index.js             # Application entry point
├── 📄 constants.js         # Application constants
├── 📄 package.json         # Dependencies and scripts
└── 📄 vercel.json          # Deployment configuration
```

## 🗄️ Database Models

### Core Models

#### 1. **User Model** (`user.model.js`)
- **Purpose**: User account management
- **Key Fields**:
  - `uid`: Unique 6-digit identifier
  - `email`, `username`: Authentication credentials
  - `password`: User password
  - `amount`: Account balance
  - `level`: User level (0-6) for staking eligibility
  - `referralCode`: Unique referral code
  - `referredBy`: Referrer's code
  - `team_A_members`, `team_B_members`, `team_C_members`: Referral teams
  - `twoFASecret`, `twoFAEnabled`: 2FA security
  - `walletAddress`: Crypto wallet binding
  - `profilePicture`: Cloudinary image URL

#### 2. **NFT Model** (`nft.model.js`)
- **Purpose**: NFT metadata storage
- **Key Fields**:
  - `name`: NFT name
  - `picture`: Cloudinary image URL
  - `pictureId`: Cloudinary public ID

#### 3. **Stake Model** (`stake.model.js`)
- **Purpose**: NFT staking system
- **Key Fields**:
  - `userId`, `nftId`: References
  - `stakeType`: 'options_area' or 'free_zone'
  - `stakeNo`: Stake number (1-6 for options, 1-3 for free)
  - `stakeAmount`, `stakePeriod`: Investment details
  - `dailyProfitPercentage`: Daily return rate
  - `totalProfit`: Calculated total profit
  - `stakeStartDate`, `stakeEndDate`: Time period
  - `isActive`, `isCompleted`, `profitClaimed`: Status flags
  - `dailyProfits[]`: Daily profit tracking array
  - `currentDay`: Current day counter

#### 4. **UserNFT Model** (`userNFT.model.js`)
- **Purpose**: User's NFT collection
- **Key Fields**:
  - `userId`, `nftId`: References
  - `purchasePrice`: Purchase amount
  - `status`: 'staked', 'sold', 'available'
  - `purchaseSource`: Where NFT was bought
  - `stakeId`: Link to active stake
  - `soldPrice`, `soldDate`: Sale information

#### 5. **Deposit Model** (`deposit.model.js`)
- **Purpose**: Payment processing
- **Key Fields**:
  - `userId`: User reference
  - `order_id`: Unique order identifier
  - `amount`: Deposit amount
  - `payment_status`: 'waiting', 'finished', 'failed'
  - `actually_paid`: Actual payment amount
  - `pay_currency`: Payment currency
  - NowPayments integration fields

#### 6. **Withdraw Model** (`withdraw.model.js`)
- **Purpose**: Withdrawal requests
- **Key Fields**:
  - `userid`: User reference
  - `amount`: Withdrawal amount
  - `address`: Crypto wallet address
  - `status`: 'pending', 'approved', 'rejected'
  - `fees`: Withdrawal fees

#### 7. **History Model** (`history.model.js`)
- **Purpose**: Transaction history
- **Key Fields**:
  - `userid`: User reference
  - `type`: Transaction type
  - `amount`: Transaction amount
  - `status`: 'credit' or 'debit'
  - `description`: Transaction description

### Supporting Models

- **Reward Model**: Admin reward distribution
- **Banner Model**: Marketing banners
- **Reservation Model**: NFT reservations
- **Links Model**: Social media links
- **EmailVerification Model**: OTP verification system
- **ReferralProfitLog Model**: Referral commission tracking

## 🛣️ API Routes

### User Management (`/api/v1/user`)
- `POST /register` - User registration with OTP verification
- `POST /login` - User authentication (email/username/UID)
- `GET /me` - Get user profile (triggers background tasks)
- `PUT /updateprofile` - Update user profile
- `POST /logout` - User logout
- `POST /forgetpassword` - Password reset
- `POST /verifyotp` - OTP verification
- `POST /enable2fa` - Enable 2FA
- `POST /wallet-binding` - Bind crypto wallet
- `GET /uid/:uid` - Get user by UID
- `POST /editamount` - Admin: Adjust user balance

### NFT Management (`/api/v1/nft`)
- `POST /` - Create NFT (admin)
- `GET /` - Get all NFTs
- `GET /:id` - Get specific NFT
- `PUT /:id` - Update NFT
- `DELETE /:id` - Delete NFT

### Staking System (`/api/v1/stake`)
- `GET /qualified-nfts` - Get NFTs user can stake
- `POST /buy-nft` - Purchase and immediately stake NFT
- `GET /my-nfts` - Get user's NFT collection
- `GET /my-stakes` - Get all user stakes
- `GET /active` - Get active stakes
- `GET /completed` - Get completed stakes
- `GET /stats` - Get staking statistics

### Payment System (`/api/v1/deposit`)
- `POST /create` - Create deposit request
- `POST /update` - Update deposit (NowPayments webhook)
- `GET /get/:order_id` - Get deposit by order ID
- `GET /get` - Get all deposits
- `DELETE /:order_id` - Delete deposit

### Withdrawal System (`/api/v1/withdraw`)
- `POST /withdraw` - Request withdrawal
- `GET /withdraws` - Get all withdrawals
- `GET /my-withdraws` - Get user withdrawals
- `PUT /withdraw/:id` - Update withdrawal status

### Additional Routes
- **History**: `GET /api/v1/history` - Transaction history
- **Rewards**: `POST /api/v1/reward/create` - Create rewards
- **Banners**: `POST /api/v1/banner/create` - Create banners
- **Email Verification**: OTP-based email verification system

## 🔧 Controllers

### User Controller (`user.controller.js`)
**Key Functions**:
- `registeruser()` - User registration with referral system
- `login()` - Multi-field authentication (email/username/UID)
- `updateprofile()` - Profile updates with image upload
- `adjustTeamsForUser()` - Referral team management
- `adjustLevelsForUser()` - User level calculation
- `distributeProfitsForUser()` - Referral profit distribution
- `bindWallet()` - Crypto wallet binding with 2FA
- `enable2FA()` - Two-factor authentication setup

### Stake Controller (`stake.controller.js`)
**Key Functions**:
- `getQualifiedNFTs()` - Get NFTs based on user level
- `buyNFT()` - Purchase and stake NFT immediately
- `getUserNFTs()` - Get user's NFT collection
- `getUserStakes()` - Get all user stakes
- `autoCompleteStakesBackground()` - Auto-complete finished stakes
- `calculateDailyProfits()` - Calculate daily staking profits

### Deposit Controller (`Deposit.controller.js`)
**Key Functions**:
- `createDeposit()` - Create deposit request
- `updatedeDeposit()` - Handle NowPayments webhook
- Referral bonus distribution on first deposit

### NFT Controller (`nft.controller.js`)
**Key Functions**:
- `createnft()` - Create NFT with Cloudinary upload
- `getnfts()` - Get all NFTs
- `updatenft()` - Update NFT with image replacement

## 🛡️ Middleware

### Authentication (`auth.middelware.js`)
- JWT token verification
- Cookie and header token support
- User context injection

### File Upload (`multer.middelware.js`)
- Disk storage configuration
- Image upload handling

### Cloudinary (`cloudinary.middelware.js`)
- Image upload and management
- Automatic image optimization

### Email (`Email.js`)
- Nodemailer configuration
- Email template system

## 🔄 Background Services

### Stake Completion Service (`stakeCompletionService.js`)
- Automated stake completion
- Daily profit calculation
- Auto-sell completed stakes

### Referral Queue (`referralQueue.js`)
- Background referral processing
- Team and level adjustments
- Profit distribution

## 💰 Staking System

### Stake Types

#### Options Area (Level 2-6)
| Stake | Amount Range | Daily Profit | Period |
|-------|-------------|--------------|---------|
| 1     | 199-1000    | 1.5%         | 7-30 days |
| 2     | 499-2000    | 1.8%         | 7-30 days |
| 3     | 799-3000    | 2.1%         | 7-30 days |
| 4     | 999-4000    | 2.5%         | 7-30 days |
| 5     | 1499-5000   | 3.0%         | 7-30 days |
| 6     | 1999-6000   | 3.5%         | 7-30 days |

#### Free Zone (Level 0-6)
| Stake | Amount Range | Daily Profit | Period |
|-------|-------------|--------------|---------|
| 1     | 200-499     | 1.2%         | 3-30 days |
| 2     | 500-799     | 1.5%         | 3-30 days |
| 3     | 800-1200    | 1.7%         | 3-30 days |

### Staking Flow
1. **Get Qualified NFTs** → User selects stake type/number
2. **Buy NFT** → NFT purchased and immediately staked
3. **Daily Profits** → Calculated and accumulated daily
4. **Auto-Completion** → When period ends, profits + NFT value added to balance
5. **NFT Status** → Becomes "sold" in user's collection

## 👥 Referral System

### Team Structure
- **Team A**: Direct referrals
- **Team B**: Second-level referrals  
- **Team C**: Third-level referrals

### Level Requirements
| Level | Current Balance | Team A | Team B+C |
|-------|-----------------|--------|----------|
| 1     | $45+            | -      | -        |
| 2     | $500+           | 3+     | 5+       |
| 3     | $2000+          | 6+     | 20+      |
| 4     | $5000+          | 15+    | 35+      |
| 5     | $10000+         | 25+    | 70+      |
| 6     | $30000+         | 35+    | 180+     |

**Note**: User levels can only increase and never decrease. Once a user reaches a level, they maintain that level even if their balance or team requirements temporarily fall below the threshold.

### Commission Structure
- **Team A**: 13% of downline profits
- **Team B**: 8% of downline profits
- **Team C**: 6% of downline profits

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Cookie and header token support
- Password-based login (email/username/UID)

### Two-Factor Authentication
- Google Authenticator integration
- QR code generation
- TOTP verification

### Wallet Security
- 2FA required for wallet binding
- OTP verification for wallet changes
- Address format validation

### Email Verification
- OTP-based email verification
- Rate limiting (3 attempts)
- Temporary blocking (15 minutes)
- 10-minute OTP expiry

## 📧 Email System

### Templates
- **Verification**: Email verification OTP
- **Welcome**: New user welcome
- **Password Change**: Password change OTP
- **Email Change**: Email change OTP
- **2FA**: Two-factor authentication
- **Wallet**: Wallet binding/change OTP

### Features
- HTML email templates
- Automatic OTP generation
- Expiry and rate limiting
- Professional styling

## 💳 Payment Integration

### NowPayments
- Cryptocurrency payment processing
- Webhook integration
- Multiple currency support
- Automatic status updates

### Deposit Flow
1. User creates deposit request
2. NowPayments generates payment address
3. User sends cryptocurrency
4. Webhook updates payment status
5. User balance credited on completion
6. Referral bonus distributed (first deposit)

## 🚀 Deployment

### Vercel Configuration
- Node.js runtime
- Automatic builds
- Environment variables
- Custom routing

### Environment Variables
- `MONGODB_URI`: Database connection
- `ACCESS_TOKEN_SECRET`: JWT secret
- `CLOUDINARY_*`: Image storage
- `EMAIL_*`: Email service configuration
- `NOWPAYMENTS_*`: Payment integration

## 📊 Key Features

### User Management
- Multi-field login (email/username/UID)
- Profile management with image upload
- 2FA security
- Crypto wallet binding
- Referral system
- No registration bonus (users start with $0 balance)

### NFT System
- NFT creation and management
- Dynamic pricing based on stake configuration
- Immediate staking on purchase
- Collection management

### Staking System
- Level-based staking eligibility
- Daily profit calculation
- Automatic completion
- Real-time profit tracking

### Payment System
- Cryptocurrency deposits
- 10% deposit bonus on all deposits
- Withdrawal requests
- Transaction history
- 10% referral bonus on first deposit

### Admin Features
- User management
- Balance adjustments
- NFT management
- Banner management
- Reward distribution

## 🔄 Background Processing

### Automatic Tasks (via `/me` endpoint)
- Team adjustments
- Level calculations
- Profit distribution
- Account synchronization
- Daily profit calculation
- Stake auto-completion

### Queue System
- BullMQ with Redis
- Background job processing
- Retry mechanisms
- Error handling

## 📈 Monitoring & Analytics

### Statistics Tracking
- User staking statistics
- Profit calculations
- Referral performance
- Transaction history
- System performance

### Error Handling
- Comprehensive error responses
- Async error handling
- Validation middleware
- Database error handling

## 🛠️ Development

### Scripts
- `npm run dev` - Development server with nodemon
- Hot reloading with dotenv support
- ES modules configuration

### Code Quality
- Async/await pattern
- Error handling middleware
- Input validation
- Security best practices

---

## 📝 Summary

MysticNFT is a sophisticated NFT staking platform that combines:
- **User Management**: Complete authentication and profile system
- **NFT Marketplace**: Creation, purchase, and collection management
- **Staking System**: Level-based staking with daily profits
- **Referral Program**: Multi-level commission system
- **Payment Processing**: Cryptocurrency integration
- **Security**: 2FA, wallet binding, email verification
- **Background Processing**: Automated profit calculation and distribution

The platform is designed for scalability with proper separation of concerns, comprehensive error handling, and automated background processing for optimal user experience.
