# Email Verification System Guide

This guide explains how to use the new OTP-based email verification system.

## Overview

The new email verification system works in two steps:
1. **Email Verification**: User provides email and receives OTP
2. **Registration**: User can only register after email is verified

## API Endpoints

### 1. Send OTP for Email Verification
```
POST /api/v1/email-verification/send-otp
```

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "statusCode": 200,
    "data": {
        "email": "user@example.com"
    },
    "message": "OTP sent successfully"
}
```

### 2. Verify OTP
```
POST /api/v1/email-verification/verify-otp
```

**Request Body:**
```json
{
    "email": "user@example.com",
    "otp": "123456"
}
```

**Response:**
```json
{
    "statusCode": 200,
    "data": {
        "email": "user@example.com",
        "verified": true
    },
    "message": "Email verified successfully"
}
```

### 3. Resend OTP
```
POST /api/v1/email-verification/resend-otp
```

**Request Body:**
```json
{
    "email": "user@example.com"
}
```

### 4. Check Verification Status
```
GET /api/v1/email-verification/status/:email
```

**Response:**
```json
{
    "statusCode": 200,
    "data": {
        "email": "user@example.com",
        "isVerified": true,
        "isExpired": false,
        "isBlocked": false,
        "attempts": 0,
        "expiresAt": "2024-01-01T12:00:00.000Z"
    },
    "message": "Verification status retrieved successfully"
}
```

## Registration Flow

### Step 1: Send OTP
User provides email → OTP is sent to email

### Step 2: Verify OTP
User enters OTP → Email is marked as verified

### Step 3: Register User
User can now register with the verified email

```
POST /api/v1/user/register
```

**Request Body:**
```json
{
    "email": "user@example.com", // Must be verified
    "password": "password123",
    "username": "username123",
    "referralCode": "optional_referral_code"
}
```

## Security Features

1. **OTP Expiry**: OTP expires after 10 minutes
2. **Attempt Limiting**: Maximum 3 attempts before blocking
3. **Blocking**: Email is blocked for 15 minutes after 3 failed attempts
4. **Automatic Cleanup**: Expired records are automatically deleted

## Error Responses

### Email Already Verified
```json
{
    "statusCode": 400,
    "message": "Email already exists and is verified"
}
```

### Email Not Verified
```json
{
    "statusCode": 400,
    "message": "Please verify your email first using OTP"
}
```

### Invalid OTP
```json
{
    "statusCode": 400,
    "message": "Invalid OTP"
}
```

### Too Many Attempts
```json
{
    "statusCode": 429,
    "message": "Too many attempts. Please try again in X minutes"
}
```

## Frontend Integration Example

```javascript
// Step 1: Send OTP
const sendOTP = async (email) => {
    const response = await fetch('/api/v1/email-verification/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return response.json();
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
    const response = await fetch('/api/v1/email-verification/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return response.json();
};

// Step 3: Register User
const registerUser = async (userData) => {
    const response = await fetch('/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
};
``` 