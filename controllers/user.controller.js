 import { User } from "../models/user.model.js";
import { EmailVerification } from "../models/emailVerification.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { apiresponse } from "../utils/responsehandler.js";
import { apierror } from "../utils/apierror.js";
import { Reservation } from "../models/reservation.model.js";
import { sendemailverification } from "../middelwares/Email.js";
import { Deposit } from "../models/deposit.model.js";
import cloudinary from '../middelwares/cloudinary.middelware.js'
import { ReferralProfitLog } from "../models/referralProfitLog.model.js";
import { History } from "../models/history.model.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { passwordChangeOTPTemplate } from "../libs/email.template.js";
import { emailChangeOTPTemplate } from "../libs/email.template.js";
import { walletChangeOTPTemplate } from "../libs/email.template.js";
// Function to generate unique 6-digit UID
const generateUniqueUID = async () => {
    let uid;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    do {
        // Generate a random 6-digit number (100000 to 999999)
        uid = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Ensure it's exactly 6 digits
        if (uid.length === 6) {
            // Check if this UID already exists
            const existingUser = await User.findOne({ uid: uid });
            if (!existingUser) {
                isUnique = true;
            }
        }
        
        attempts++;
        if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique UID after maximum attempts');
        }
    } while (!isUnique);
    
    return uid;
};

const delunverifiedusers=asynchandler(async(req,res)=>{

    const users=await User.deleteMany({verified:false})
    if (users) {
        return res.json({users_deleted:users})
    }else{
        return res.json({message:"no users to delete"})
    }


})

const generateacctoken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accestoken = user.generateaccesstoken()


        
        await user.save({ validateBeforeSave: false })


        return { accestoken}

    } catch (error) {
        throw new apierror(500, "something went wrong while genreating token")
    }
}
 
let registeruser = asynchandler(async (req, res) => {
 
    const { email, password, username, referralCode, otp } = req.body;

    // Validate input fields
    if (!email || !password || !username || !otp) {
        throw new apierror(400, "Email, password, username, and OTP are required");
    }

    // Check for existing email
    const existedEmail = await User.findOne({ email });
    if (existedEmail) {
        if (!existedEmail.verified) {
            throw new apierror(400, "Email already exists and user is not verified");
        } else {
            throw new apierror(400, "Email already exists, please proceed to login");
        }
    }
    let validreferralcode= await User.findOne({referralCode:referralCode})
    if (!validreferralcode) {
        throw new apierror(400, "Invalid referral code");
    }
    // Check for existing username
    const existedUsername = await User.findOne({ username });
    if (existedUsername) {
        throw new apierror(400, "Username already exists");
    }

    // Validate referral code if provided
    if (referralCode) {
        const referrer = await User.findOne({ referralCode: referralCode });
        if (!referrer) {
            throw new apierror(400, "Invalid referral code");
        }
    }

    // Verify OTP immediately
    const emailVerification = await EmailVerification.findOne({ email });
    if (!emailVerification) {
        throw new apierror(400, "Please send OTP to your email first");
    }

    // Check if email is blocked
    if (emailVerification.checkIfBlocked()) {
        const remainingTime = Math.ceil((emailVerification.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }

    // Check if OTP is expired
    if (emailVerification.isExpired()) {
        await emailVerification.incrementAttempts();
        throw new apierror(400, "OTP has expired. Please request a new one");
    }

    // Verify OTP
    if (emailVerification.otp !== otp) {
        await emailVerification.incrementAttempts();
        throw new apierror(400, "Invalid OTP");
    }

    // Generate a unique random referral code with letters and numbers mixed (7 characters)
    let referralCodeGenerated;
    let isUnique = false;
    do {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const allChars = letters + numbers;
        
        // Generate 7 random characters (letters and numbers mixed)
        let code = '';
        for (let i = 0; i < 7; i++) {
            code += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        
        referralCodeGenerated = code;
        
        const existingUser = await User.findOne({ referralCode: referralCodeGenerated });
        if (!existingUser) {
            isUnique = true;
        }
    } while (!isUnique);

   
    let user;
     
    

    try {
        // Generate unique 6-digit UID
        const uniqueUID = await generateUniqueUID();
        
        // Create the user
        user = await User.create({
            uid: uniqueUID,
            email,
            password,
            username,
           
            referralCode: referralCodeGenerated,
            referralCount: 0,
            referredBy: referralCode ? referralCode : null,
            verified: true, // Set to true since OTP is verified
            role: "user",
        });

        // Always set registration bonus on registration
        user.amount = 5;
        await user.save();
        await History.create({
            userid: user._id,
            type: 'registration',
            amount: 5,
            status: 'credit',
            description: 'Registration bonus'
        });

        // Handle referral bonus if applicable
        if (user.referredBy) {
            const referrer = await User.findOne({ referralCode: user.referredBy });
            if (referrer) {
                referrer.referralCount += 1;
                referrer.team_A_members.push({
                    userid: user._id
                });
                await referrer.save();
            }
        }

        // Remove the email verification record since user is now registered
        await EmailVerification.findOneAndDelete({ email });

        const registeredUser = await User.findById(user._id).select('-password');

        return res.status(201).json(
            new apiresponse(201, registeredUser, null, "User registered successfully")
        );
    } catch (error) {
        throw new apierror(500, "Error creating user");
    }
});

const resendotp = asynchandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (user.verified) {
        return res.json({ message: "Already verified, please login" });
    } else {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationcode = verificationCode;
        await user.save();

        await sendemailverification(user.email, user.verificationcode);

        return res.json({ message: "Verify using the OTP sent to your email", otp: user.verificationcode });
    }
});

const login = asynchandler(async (req, res) => {
    const { email, password, username, uid } = req.body;

    if ((!email && !username && !uid) || !password) {
        return res.status(400).json({
            statusCode: 400,
            message: "Email, username, or UID is required, and password is required"
        });
    }

    // Validate UID format if provided
    if (uid && (uid.length !== 6 || !/^\d{6}$/.test(uid))) {
        return res.status(400).json({
            statusCode: 400,
            message: "UID must be exactly 6 digits"
        });
    }

    // Debug: Log the query being used
    console.log('Database query:', {
        $or: [{ email }, { username }, { uid }]
    });
    
    // Fix the query logic - only include defined values
    const queryConditions = [];
    if (email) queryConditions.push({ email });
    if (username) queryConditions.push({ username });
    if (uid) queryConditions.push({ uid });
    
    console.log('Fixed query conditions:', queryConditions);
    
    const user = await User.findOne({
        $or: queryConditions
    });

    if (!user) {
        return res.status(404).json({
            statusCode: 404,
            message: "User does not exist with the provided email, username, or UID"
        });
    }
    
    // Debug: Check if there are multiple users with the same email
    const allUsersWithEmail = await User.find({ email });
    console.log('All users with this email:', allUsersWithEmail.map(u => ({
        _id: u._id,
        email: u.email,
        username: u.username,
        password: u.password
    })));
    
    // Debug: Check which field actually matched
    let matchedField = 'none';
    if (email && user.email === email) matchedField = 'email';
    else if (username && user.username === username) matchedField = 'username';
    else if (uid && user.uid === uid) matchedField = 'uid';
    
    console.log('Matched field:', matchedField);
    
    // Debug: Log the entire user object to see what's being fetched
    console.log('User fetched from database:', {
        _id: user._id,
        email: user.email,
        username: user.username,
        uid: user.uid,
        password: user.password,
        verified: user.verified,
        blocked: user.blocked,
        matchedField: matchedField
    });
    
    if (user.blocked) {
        return res.status(403).json({
            statusCode: 403,
            message: "You are blocked please contact support"
        });
    }

    const isPasswordValid = user.password === password;
    
    // Debug logging
    console.log('Login attempt:', { 
        email: email || 'not provided', 
        username: username || 'not provided', 
        uid: uid || 'not provided',
        storedPassword: user.password,
        inputPassword: password,
        passwordMatch: isPasswordValid,
        passwordType: typeof user.password,
        inputType: typeof password
    });

    if (!isPasswordValid) {
        return res.status(401).json({
            statusCode: 401,
            message: "Password is not valid"
        });
    }
    if (!user.verified) {
        return res.status(403).json({
            statusCode: 403,
            message: "User is not verified"
        });
    }
    const { accestoken } = await generateacctoken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");
    return res.cookie("accesstoken", accestoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "strict", // Adjust as needed
    })
    .json(new apiresponse(200, loggedInUser, accestoken, "User Logged in successfully"));
});

const verifyemail = asynchandler(async (req, res) => {
    try {
        const { code,email } = req.body;
        const user = await User.findOne({ verificationcode: code,email:email });
        if (!user) {
            throw new apierror(404, "Invalid or expired code");
        } else {
            user.verified = true;
            // Set initial amount to 5
            user.verificationcode = undefined; // Clear the verification code
            await user.save();
            const verifiedUser = await User.findById(user._id).select('-password');
            if(verifiedUser.referredBy){
                const referrer = await User.findOne({ referralCode: verifiedUser.referredBy });
                if (referrer) {
                    referrer.referralCount += 1; // Increment referral count
                    referrer.team_A_members.push({
                        userid: verifiedUser._id
                    })}
                }
            return res.json(new apiresponse(200, verifiedUser, "Verified user"));
        }
    } catch (error) {
        console.error("Verification code error:", error);
        return res.status(500).json({ message: "Error verifying code" });
    }
});

 
 

const forgotpassword = asynchandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
        const verificationcode = Math.floor(100000 + Math.random() * 900000).toString();
        user.forgetpasswordotp = verificationcode;
        await user.save();
        await sendemailverification(user.email, user.forgetpasswordotp);

        res.status(200).json({ message: "Please verify the OTP we have sent to your email",otp:user.forgetpasswordotp });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});
export const resendforgotpassotp = asynchandler(async (req, res) => {
    const { email} = req.body;
    const user = await User.findOne({email});
    if (user) {
        const verificationcode = Math.floor(100000 + Math.random() * 900000).toString();
        user.forgetpasswordotp = verificationcode;
        await user.save();
        await sendemailverification(user.email, user.forgetpasswordotp);

        res.status(200).json({ message: "Please verify the OTP we have sent to your email", otp: user.forgetpasswordotp });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

const verifyforgetpassotp = asynchandler(async (req, res) => {
    const { otp, newpassword,email } = req.body;

    const user = await User.findOne({ $and: [{ forgetpasswordotp: otp }, { email: email }] });

    if (user) {
        user.password = newpassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } else {
        res.status(401).json({ message: "Please provide a valid OTP" });
    }
});

const updateprofile=asynchandler(async(req,res)=>{
    const { email, password,username } = req.body;
    const { _id } = req.user; // Assuming you have user ID in req.user after authentication

    const user= await User.findById(_id);
    if (!user) {
        return res.status(404).json({ message: "User not found" }); 
    }
    // Validate input fields
    if(email){
        user.email = email;
    }
    if(username){
        user.username = username;
    }
    if(password){
        user.password = password;
    }
    let cloudinaryImageId = null;
    let cloudinaryImageUrl = null;
    if (req.file) {
        // If a new profile picture is uploaded, upload it to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile_pictures",
        });
        if (cloudinaryResponse) {
            await cloudinary.uploader.destroy(user.profilePictureId); // Delete old image from Cloudinary
        }
        cloudinaryImageId = cloudinaryResponse.public_id;
        cloudinaryImageUrl = cloudinaryResponse.secure_url;

        // Update the user's profile picture and ID
        user.profilePicture = cloudinaryImageUrl;
        user.profilePictureId = cloudinaryImageId;
    }

    try {
        await user.save();
        const updatedUser = await User.findById(_id).select("-password");
        return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Error updating user", error: error.message });
    }
});


       

const getallusers=asynchandler(async(req,res)=>{
const users= await User.find({})
for (const user of users){

}

res.json({users:users})
})
const deleteuser=asynchandler(async(req,res)=>{
    const {id}=req.body

    const deleteduser=await User.findByIdAndDelete(id)

    if (deleteduser) {
        res.json({mesaage:"user deleted Successfully",
            user:deleteduser
        })
    }
})

export const logout = asynchandler(async (req, res) => {
    res.clearCookie("accesstoken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "strict", // Adjust as needed
    }).json(new apiresponse(200, null, "User logged out successfully"));
});

export const block_unblockuser = asynchandler(async (req, res) => {
    const { id } = req.body;

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.blocked = !user.blocked; // Toggle the blocked status
    if (user.blocked) {
        user.forgetpasswordotp = undefined; // Clear forget password OTP if blocking
    }
    if (user.blocked) {
        user.verificationcode = undefined; // Clear verification code if blocking
    }

    await user.save();
    if (user.blocked) {
        return res.status(200).json({ message: "User blocked successfully", user });
    }

    return res.status(200).json({ message: "User unblocked successfully", user });
});
export const adjustTeamsForUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user || !user.referredBy) return;
  
    const deposits = await Deposit.find({ userId, payment_status: 'finished' });
    const totalDeposit = deposits.reduce((sum, d) => sum + (Number(d.actually_paid) || 0), 0);
    const validMember = deposits.length > 0 && totalDeposit >= 45;
  
    const updateTeam = async (referrerCode, teamField) => {
      const ref = await User.findOne({ referralCode: referrerCode });
      if (!ref) return null;
  
      const idx = ref[teamField].findIndex(m => m.userid.toString() === userId.toString());
      if (idx === -1) {
        ref[teamField].push({ userid: user._id, validmember: validMember });
      } else {
        ref[teamField][idx].validmember = validMember;
      }
      ref.markModified(teamField);
      await ref.save();
      return ref;
    };
  
    const levelA = await updateTeam(user.referredBy, 'team_A_members');
    if (levelA?.referredBy) {
      const levelB = await updateTeam(levelA.referredBy, 'team_B_members');
      if (levelB?.referredBy) {
        await updateTeam(levelB.referredBy, 'team_C_members');
      }
    }
  };
  
  // === Level Adjustment for Single User ===
  export const adjustLevelsForUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;
  
    const deposits = await Deposit.find({ userId, payment_status: 'finished' });
    const totalDeposit = deposits.reduce((sum, d) => sum + (Number(d.actually_paid) || 0), 0);
  
    const validA = user.team_A_members.filter(m => m.validmember).length;
    const validB = user.team_B_members.filter(m => m.validmember).length;
    const validC = user.team_C_members.filter(m => m.validmember).length;
    const totalValidBandC = validB + validC;
  
    let newLevel = 0;
    if (totalDeposit >= 30000 && validA >= 35 && totalValidBandC >= 180) newLevel = 6;
    else if (totalDeposit >= 10000 && validA >= 25 && totalValidBandC >= 70) newLevel = 5;
    else if (totalDeposit >= 5000 && validA >= 15 && totalValidBandC >= 35) newLevel = 4;
    else if (totalDeposit >= 2000 && validA >= 6 && totalValidBandC >= 20) newLevel = 3;
    else if (totalDeposit >= 500 && validA >= 3 && totalValidBandC >= 5) newLevel = 2;
    else if (totalDeposit >= 45) newLevel = 1;
  
    if (user.level !== newLevel) {
      user.level = newLevel;
      await user.save();
    }
  };
  
  // === Profit Distribution for Single User ===
  export const distributeProfitsForUser = async (userId) => {
    const upline = await User.findById(userId);
    if (!upline) return;

    // Only distribute profits if user has level > 1
    if (upline.level <= 1) return;

    const teamTypes = [
      { team: upline.team_A_members, percent: 0.13, type: "A" },
      { team: upline.team_B_members, percent: 0.08, type: "B" },
      { team: upline.team_C_members, percent: 0.06, type: "C" }
    ];

    let totalCommission = 0;

    for (const { team, percent, type } of teamTypes) {
      for (const member of team) {
        // Only process valid members
        if (!member.validmember) continue;
        
        // Find all sold reservations for this member that haven't been processed for team income
        const reservations = await Reservation.find({
          userid: member.userid,
          status: "sold",
          referralProfitDistributed: false
        });

        for (const reservation of reservations) {
          // Only credit if no ReferralProfitLog exists for this reservation/upline
          const exists = await ReferralProfitLog.findOne({
            uplineUser: userId,
            reservationId: reservation._id
          });
          if (exists || !reservation.profit) continue;
          
          const commission = reservation.profit * percent;
          totalCommission += commission;
          
          // Create referral profit log
          await ReferralProfitLog.create({
            uplineUser: userId,
            downlineUser: member.userid,
            reservationId: reservation._id,
            date: new Date(),
            teamType: type,
            profit: reservation.profit,
            percentage: percent,
            commission
          });
        }
      }
    }

    if (totalCommission > 0) {
      upline.amount += totalCommission;
      
      await History.create({
        userid: upline._id,
        type: 'income',
        amount: Number(totalCommission).toFixed(2),
        status: 'credit',
        description: `Team income`
      });
  
      await upline.save();
    }
  };
export const editamount=asynchandler(async (req, res) => {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.amount = amount;
    await user.save();
    return res.status(200).json({ message: "Amount updated successfully", user });
});


export const enable2FA = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) throw new apierror(404, "User not found");

  const secret = speakeasy.generateSecret({
    name: `MysticNft (${user.email})`
  });

  user.twoFASecret = secret.base32;
  await user.save();

  const qrCodeImage = await qrcode.toDataURL(secret.otpauth_url);

  return res.status(200).json(
    new apiresponse(200, {
      qrCode: qrCodeImage,
      manualCode: secret.base32
    }, "Scan this QR with Google Authenticator")
  );
});

 


export const updateProfilePicture = asynchandler(async (req, res) => {
    const userId = req.user._id;
    if (!req.file) {
        throw new apierror(400, "No file uploaded");
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pictures",
    });

    // Update user
    const user = await User.findById(userId);
    if (!user) {
        throw new apierror(404, "User not found");
    }
    user.profilePicture = cloudinaryResponse.secure_url;
    user.profilePictureId = cloudinaryResponse.public_id;
    await user.save();

    return res.status(200).json(
        new apiresponse(200, {
            profilePicture: user.profilePicture,
            profilePictureId: user.profilePictureId
        }, null, "Profile picture updated successfully")
    );
});

// Controller: Send OTP for password change
export const sendChangePasswordOTP = asynchandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new apierror(400, "Email is required");
    const user = await User.findOne({ email });
    if (!user) throw new apierror(404, "User not found");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let verification = await EmailVerification.findOne({ email });
    if (!verification) {
        verification = await EmailVerification.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false,
            attempts: 0,
            maxAttempts: 3,
            isBlocked: false,
            blockedUntil: null
        });
    } else {
        verification.otp = otp;
        verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        verification.isVerified = false;
        verification.attempts = 0;
        verification.isBlocked = false;
        verification.blockedUntil = null;
        await verification.save();
    }
    // Send OTP using password change template
    const { subject, html } = passwordChangeOTPTemplate(email, otp);
    await sendemailverification(email, otp, subject, html);
    return res.status(200).json(new apiresponse(200, null, null, "OTP sent to email for password change"));
});

// Controller: Change password with OTP
export const changePasswordWithOTP = asynchandler(async (req, res) => {
    const { email, otp, oldPassword, newPassword } = req.body;
    if (!email || !otp || !oldPassword || !newPassword) {
        throw new apierror(400, "Email, OTP, old password, and new password are required");
    }
    const user = await User.findOne({ email });
    if (!user) throw new apierror(404, "User not found");
    const verification = await EmailVerification.findOne({ email });
    if (!verification) throw new apierror(404, "No verification record found");
    if (verification.checkIfBlocked()) {
        const remainingTime = Math.ceil((verification.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }
    if (verification.isExpired()) {
        await verification.incrementAttempts();
        throw new apierror(400, "OTP has expired");
    }
    if (verification.otp !== otp) {
        await verification.incrementAttempts();
        throw new apierror(400, "Invalid OTP");
    }
    // Check old password
    const isPasswordCorrect = user.password === oldPassword;
    if (!isPasswordCorrect) {
        throw new apierror(400, "Old password is incorrect");
    }
    user.password = newPassword;
    await user.save();
    await EmailVerification.findOneAndDelete({ email });
    return res.status(200).json(new apiresponse(200, null, null, "Password changed successfully"));
});

export const updateUserProfileFields = asynchandler(async (req, res) => {
    const userId = req.user._id;
    const {
        nationality,
        
        username,
        number,
        email,
        gender,
        birthDate
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new apierror(404, "User not found");
    }

    // If email is being changed
    if (email && email !== user.email) {
        // Check if new email is verified in EmailVerification
        const verification = await EmailVerification.findOne({ email, isVerified: true });
        if (!verification) {
            throw new apierror(400, "New email is not verified. Please verify the new email first.");
        }
        // Passed verification, update email
        user.email = email;
        await EmailVerification.findOneAndDelete({ email });
    }

    // Update other fields if provided, else keep old value
    if (nationality !== undefined) user.nationality = nationality;
    
    if (username !== undefined) user.username = username;
    if (number !== undefined) user.number = number;
    if (gender !== undefined) user.gender = gender;
    if (birthDate !== undefined) user.birthdate = birthDate;

    await user.save();
    const updatedUser = await User.findById(userId).select("-password");
    return res.status(200).json(new apiresponse(200, updatedUser, null, "Profile updated successfully"));
});

// Controller: Send OTP for email change
export const sendEmailChangeOTP = asynchandler(async (req, res) => {
    const { oldEmail, newEmail } = req.body;
    if (!oldEmail || !newEmail) throw new apierror(400, "Old email and new email are required");
    const user = await User.findOne({ email: oldEmail });
    if (!user) throw new apierror(404, "User not found");
    // Check if new email is already used
    const existing = await User.findOne({ email: newEmail });
    if (existing) throw new apierror(400, "New email is already in use");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let verification = await EmailVerification.findOne({ email: newEmail });
    if (!verification) {
        verification = await EmailVerification.create({
            email: newEmail,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false,
            attempts: 0,
            maxAttempts: 3,
            isBlocked: false,
            blockedUntil: null
        });
    } else {
        verification.otp = otp;
        verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        verification.isVerified = false;
        verification.attempts = 0;
        verification.isBlocked = false;
        verification.blockedUntil = null;
        await verification.save();
    }
    // Send OTP using email change template
    const { subject, html } = emailChangeOTPTemplate(newEmail, otp);
    await sendemailverification(newEmail, otp, subject, html);
    return res.status(200).json(new apiresponse(200, null, null, "OTP sent to new email for email change"));
});

// Controller: Verify OTP for email change
export const verifyEmailChangeOTP = asynchandler(async (req, res) => {
    const { oldEmail, newEmail, otp } = req.body;
    if (!oldEmail || !newEmail || !otp) throw new apierror(400, "Old email, new email, and OTP are required");
    const user = await User.findOne({ email: oldEmail });
    if (!user) throw new apierror(404, "User not found");
    const verification = await EmailVerification.findOne({ email: newEmail });
    if (!verification) throw new apierror(404, "No verification record found for new email");
    if (verification.checkIfBlocked()) {
        const remainingTime = Math.ceil((verification.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }
    if (verification.isExpired()) {
        await verification.incrementAttempts();
        throw new apierror(400, "OTP has expired");
    }
    if (verification.otp !== otp) {
        await verification.incrementAttempts();
        throw new apierror(400, "Invalid OTP");
    }
    verification.isVerified = true;
    verification.attempts = 0;
    verification.isBlocked = false;
    verification.blockedUntil = null;
    await verification.save();
    return res.status(200).json(new apiresponse(200, null, null, "New email verified successfully. You can now update your profile with this email."));
});

// Controller: Initiate enabling 2FA
export const initiateEnable2FA = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new apierror(404, "User not found");
    // Generate secret for Google Authenticator
    const secret = speakeasy.generateSecret({ name: `MysticNft (${user.email})` });
    // Generate QR code
    const qrCodeImage = await qrcode.toDataURL(secret.otpauth_url);
    // Store secret in EmailVerification for this user (use email as key)
    let verification = await EmailVerification.findOne({ email: user.email });
    if (!verification) {
        verification = await EmailVerification.create({
            email: user.email,
            otp: "dummy", // Not used
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false,
            attempts: 0,
            maxAttempts: 3,
            isBlocked: false,
            blockedUntil: null,
            twoFASecret: secret.base32
        });
    } else {
        verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        verification.isVerified = false;
        verification.attempts = 0;
        verification.isBlocked = false;
        verification.blockedUntil = null;
        verification.twoFASecret = secret.base32;
        await verification.save();
    }
    return res.status(200).json(new apiresponse(200, {
        qrCode: qrCodeImage,
        manualCode: secret.base32
    }, null, "Scan the QR code with Google Authenticator and enter the code to enable 2FA"));
});

// Controller: Confirm enabling 2FA
export const confirmEnable2FA = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new apierror(404, "User not found");
    const { totp } = req.body;
    if (!totp) throw new apierror(400, "Google Authenticator code is required");
    const verification = await EmailVerification.findOne({ email: user.email });
    if (!verification) throw new apierror(404, "No verification record found");
    if (verification.checkIfBlocked()) {
        const remainingTime = Math.ceil((verification.blockedUntil - new Date()) / (1000 * 60));
        throw new apierror(429, `Too many attempts. Please try again in ${remainingTime} minutes`);
    }
    if (verification.isExpired()) {
        await verification.incrementAttempts();
        throw new apierror(400, "Setup has expired. Please initiate 2FA setup again");
    }
    // Verify TOTP
    const isTotpValid = speakeasy.totp.verify({
        secret: verification.twoFASecret,
        encoding: 'base32',
        token: totp
    });
    if (!isTotpValid) {
        await verification.incrementAttempts();
        throw new apierror(400, "Invalid Google Authenticator code");
    }
    // Save secret to user and enable 2FA
    user.twoFASecret = verification.twoFASecret;
    user.twoFAEnabled = true;
    await user.save();
    await EmailVerification.findOneAndDelete({ email: user.email });
    return res.status(200).json(new apiresponse(200, null, null, "2FA enabled successfully"));
});

// Controller: Single wallet binding (checks 2FA and binds wallet)
export const bindWallet = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new apierror(404, "User not found");
    
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
        throw new apierror(400, "Wallet address is required");
    }
    
    // Debug log for walletAddress
    console.log("User walletAddress before binding:", user.walletAddress, typeof user.walletAddress);
    
    // Check if 2FA is enabled
    if (!user.twoFAEnabled || !user.twoFASecret) {
        throw new apierror(400, "2FA must be enabled before binding a wallet address");
    }
    
    // Robust check: treat null, undefined, empty string, and whitespace-only as not bound
    if (typeof user.walletAddress === 'string' && user.walletAddress.trim() !== "") {
        throw new apierror(400, "Wallet address is already bound to this account");
    }
    if (user.walletAddress && typeof user.walletAddress !== 'string') {
        throw new apierror(400, "Wallet address is already bound to this account");
    }
    
    // Validate wallet address format (basic validation)
    if (!walletAddress.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/) && 
        !walletAddress.match(/^0x[a-fA-F0-9]{40}$/) &&
        !walletAddress.match(/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/)) {
        throw new apierror(400, "Invalid wallet address format");
    }
    
    // Check if wallet address is already used by another user
    const existingWallet = await User.findOne({ walletAddress: walletAddress });
    if (existingWallet && existingWallet._id.toString() !== user._id.toString()) {
        throw new apierror(400, "This wallet address is already bound to another account");
    }
    
    // Bind wallet address to user
    user.walletAddress = walletAddress;
    await user.save();
    
    return res.status(200).json(new apiresponse(200, {
        walletAddress: user.walletAddress
    }, null, "Wallet address bound successfully"));
});

// Controller: Get wallet binding status
export const getWalletBindingStatus = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new apierror(404, "User not found");
    
    return res.status(200).json(new apiresponse(200, {
        twoFAEnabled: user.twoFAEnabled,
        walletAddress: user.walletAddress || null,
        isWalletBound: !!(user.walletAddress && user.walletAddress.trim() !== "")
    }, null, "Wallet binding status retrieved successfully"));
});




export  const getusernamebyreferralcode=asynchandler(async(req,res)=>{
    const {referralCode}=req.body
    const user=await User.findOne({referralCode:referralCode})
    if(!user) throw new apierror(404,"User not found")
    return res.status(200).json(new apiresponse(200,user.username,null,"Username retrieved successfully"))
})

// Get user by UID
export const getUserByUID = asynchandler(async (req, res) => {
    const { uid } = req.params;
    
    if (!uid || uid.length !== 6) {
        throw new apierror(400, "UID must be exactly 6 digits");
    }
    
    const user = await User.findOne({ uid: uid }).select('-password');
    if (!user) {
        throw new apierror(404, "User not found with this UID");
    }
    
    return res.status(200).json(
        new apiresponse(200, user, null, "User retrieved successfully by UID")
    );
});

// Check if UID exists
export const checkUIDExists = asynchandler(async (req, res) => {
    const { uid } = req.params;
    
    if (!uid || uid.length !== 6) {
        throw new apierror(400, "UID must be exactly 6 digits");
    }
    
    const user = await User.findOne({ uid: uid }).select('_id uid username');
    const exists = !!user;
    
    return res.status(200).json(
        new apiresponse(200, { 
            uid, 
            exists, 
            user: exists ? user : null 
        }, null, exists ? "UID exists" : "UID does not exist")
    );
});

// Get user info by UID (public endpoint for login forms)
export const getUserInfoByUID = asynchandler(async (req, res) => {
    const { uid } = req.params;
    
    if (!uid || uid.length !== 6 || !/^\d{6}$/.test(uid)) {
        throw new apierror(400, "UID must be exactly 6 digits");
    }
    
    const user = await User.findOne({ uid: uid }).select('_id uid username email');
    if (!user) {
        throw new apierror(404, "User not found with this UID");
    }
    
    return res.status(200).json(
        new apiresponse(200, { 
            uid: user.uid,
            username: user.username,
            email: user.email
        }, null, "User info retrieved successfully")
    );
});

// Admin endpoint: Grant registration bonus to users who don't have it
export const grantMissingRegistrationBonuses = asynchandler(async (req, res) => {
  const users = await User.find({});
  let updated = 0;
  for (const user of users) {
    const hasBonus = await History.findOne({ userid: user._id, type: 'registration' });
    if (!hasBonus) {
      user.amount = (user.amount || 0) + 5;
      await user.save();
      await History.create({
        userid: user._id,
        type: 'registration',
        amount: 5,
        status: 'credit',
        description: 'Registration bonus'
      });
      updated++;
    }
  }
  return res.status(200).json({ message: `Registration bonus granted to ${updated} users.` });
});

// Request wallet address change: send OTP to provided email
export const requestWalletChange = asynchandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new apierror(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new apierror(404, "User not found");

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.walletChangeOTP = otp;
  user.walletChangeOTPExpires = expires;
  await user.save();

  // Prepare email template (no address yet)
  const { subject, html } = walletChangeOTPTemplate(user.email, "(to be provided)", otp);
  await sendemailverification(user.email, otp, subject, html);

  return res.status(200).json(new apiresponse(200, null, "OTP sent to your email for wallet address change"));
});

// Confirm wallet address change: verify OTP and update wallet address
export const confirmWalletChange = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new apierror(404, "User not found");

  const { otp, newWalletAddress } = req.body;
  if (!otp || !newWalletAddress) throw new apierror(400, "OTP and new wallet address required");

  if (
    user.walletChangeOTP !== otp ||
    !user.walletChangeOTPExpires ||
    user.walletChangeOTPExpires < new Date()
  ) {
    throw new apierror(400, "Invalid or expired OTP");
  }

  // Check if wallet address is already used by another user
  const existingWallet = await User.findOne({ walletAddress: newWalletAddress });
  if (existingWallet && existingWallet._id.toString() !== user._id.toString()) {
    throw new apierror(400, "This wallet address is already bound to another account");
  }

  // Update wallet address
  user.walletAddress = newWalletAddress;
  user.walletChangeOTP = undefined;
  user.walletChangeOTPExpires = undefined;
  user.pendingWalletAddress = undefined;
  await user.save();

  return res.status(200).json(new apiresponse(200, { walletAddress: user.walletAddress }, "Wallet address updated successfully"));
});

// Debug endpoint to check user data (remove this in production)
const debugUser = asynchandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            statusCode: 400,
            message: "Email is required"
        });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        return res.status(404).json({
            statusCode: 404,
            message: "User not found"
        });
    }
    
    return res.status(200).json({
        statusCode: 200,
        data: {
            email: user.email,
            username: user.username,
            uid: user.uid,
            password: user.password,
            verified: user.verified,
            blocked: user.blocked
        },
        message: "User data retrieved for debugging"
    });
});

export { registeruser, verifyemail, login, forgotpassword, verifyforgetpassotp, resendotp,delunverifiedusers,updateprofile,getallusers,deleteuser, debugUser};
