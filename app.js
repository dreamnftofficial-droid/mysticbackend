import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import userrouter from './Routes/user.routes.js'
import depositrouter from './Routes/Deposit.routes.js'
import nftrouter from './Routes/nft.routes.js'
import reservevationrouter from './Routes/reservation.routes.js'
import recordrouter from './Routes/Record.routes.js'
import withdrawrouter from './Routes/withdraw.routes.js'
import linkrouter from './Routes/link.routes.js'
import rewardrouter from './Routes/reward.routes.js'
import bannerouter from './Routes/banner.routes.js'
import historyrouter from './Routes/history.routes.js'
import emailVerificationRouter from './Routes/emailVerification.routes.js'
import stakerouter from './Routes/stake.routes.js'
import adminStakerouter from './Routes/adminStake.routes.js'
import pdfrouter from './Routes/pdf.routes.js'
 
const app=express()

app.use(express.json())
const allowedOrigins = ["https://mystick.online", "https://dashboard.mystick.online","https://mysticnfts.xyz","http://localhost:5173","http://localhost:5174"];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or Postman)
            if (!origin) return callback(null, true);

            if (!allowedOrigins.includes(origin)) {
                const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
                return callback(new Error(msg), false);
            }

            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie']
    })
);
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.use('/api/v1/user',userrouter)
app.use('/api/v1/deposit',depositrouter)
app.use('/api/v1/nft',nftrouter)
app.use('/api/v1/reservation',reservevationrouter)
app.use('/api/v1/record',recordrouter)
app.use('/api/v1/withdraw',withdrawrouter)
app.use('/api/v1/links',linkrouter)
app.use('/api/v1/reward',rewardrouter)  
app.use('/api/v1/banner',bannerouter)
app.use('/api/v1/history',historyrouter)
app.use('/api/v1/email-verification',emailVerificationRouter)
app.use('/api/v1/stake',stakerouter)
app.use('/api/v1/admin/stake',adminStakerouter)
app.use('/api/v1/pdf',pdfrouter)
 
app.get('/',(req,res)=>{
    res.send("Welcome to the API")
})
app.post('/ipn',(req,res)=>{
     const payementStatus = req.body;
        console.log(payementStatus);

    res.status(200).send("IPN received successfully");
    
})


export {app}