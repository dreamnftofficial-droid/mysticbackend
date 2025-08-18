import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
   
    uid: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
        minlength: 6,
        maxlength: 6
    },
    email: {
        type: String,
        
        lowercase: true,
        unique: true, // Ensure uniqueness
    },
    username: {
        type: String,
       
        lowercase: true,
        unique: true, // Ensure uniqueness
    },
    nationality:{
        type:String
    },
    password: {
        type: String,
        required: true,
    },
    twoFASecret: {
  type: String
},
twoFAEnabled: {
    type: Boolean,
    default: false,
},

   
    verified: {
        type: Boolean,
        default: false,
    },
    amount:{
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    profilePicture: {
        type: String,
    },
    profilePictureId: {
        type: String,
    },
    level: {
        type: Number,
        default: 0,
        min: 0,
        max:6   
    },
    referralCode: {
        type: String,
        unique: true,
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    referredBy: {
        type: String,
    },
    referralCount: {
        type: Number,
        default: 0,
    },
    verificationcode: {
        type: String,
    },
    forgetpasswordotp: {
        type: String,
    },
    team_A_members: [{
         userid: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        validmember: {
            type: Boolean,
            default: false,
        }
    }],
    team_B_members: [{
        userid: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        validmember: {
            type: Boolean,
            default: false,
        }
    }],
    team_C_members: [{
        userid: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        validmember: {
            type: Boolean,
            default: false,
        }
    }],
    walletAddress:{
        type:String,
        default:""
    },
    walletChangeOTP: {
        type: String
    },
    walletChangeOTPExpires: {
        type: Date
    },
    pendingWalletAddress: {
        type: String
    },
    gender:{
        type:String
    },
    birthdate:{
        type:Date
    },
    phoneNumber:{
        type:String
    } 
}, { timestamps: true });

 
 


userSchema.methods.generateaccesstoken= function(){
 return   jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        role:this.role,
        level:this.level,
        uid:this.uid,
    }
,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCES_TOKEN_EXPIRY})
}

export const User = mongoose.model('User', userSchema);
