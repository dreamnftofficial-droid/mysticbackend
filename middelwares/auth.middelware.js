import { apierror } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyjwt=asynchandler(async(req,res,next)=>{
 try {
    const token=   req.cookies?.accesstoken || req.header("authorization")?.replace("bearer ","")
    if (!token) {
       throw new apierror(401,"unauthorized request")
    }
   
    const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
   const user= await User.findById(decodedtoken?._id).select("-password -verificationcode -forgetpasswordotp")
   
   if (!user) {
       throw new apierror(401,"invalid acces token")
   }
   req.user=user
   next()
 } catch (error) {
    throw new apierror(401,"Invalid acces token")
 }
})