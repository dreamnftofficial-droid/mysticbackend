 import nodemailer from 'nodemailer'
 



 export const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.USER_AUTH_EMAIL,
      pass: process.env.USER_AUTH_PASS,
    },
    pool:true,
    maxConnections:5
  });

