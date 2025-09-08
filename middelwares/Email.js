import { transporter } from "./email.config.middelware.js"; // Fixed the typo in the filename if needed
import { Verification_Email_Template } from "../libs/email.template.js";
<<<<<<< HEAD
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
=======
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7

export async function sendemailverification(email, otp, subject, html) {
  // If subject and html are provided, use them (for password change, etc)
  // Otherwise, use the default registration/verification template
  let mailOptions;
  if (subject && html) {
    mailOptions = {
      to: email,
      subject,
      html
    };
  } else {
<<<<<<< HEAD
    // Use the styled template and replace the placeholder with actual OTP
    const styledHtml = Verification_Email_Template.replace('{verificationCode}', otp);
    mailOptions = {
      to: email,
      subject: 'Treasure Star: Email Verification',
      html: styledHtml,
      attachments: [{
        filename: 'logo.png',
        path: path.join(__dirname, '../public/logo.png'),
        cid: 'logo'
      }]
=======
    mailOptions = {
      to: email,
      subject: 'MysticNft: Email Verification',
      html: `<p>Hello,</p>
             <p>Your OTP for registration/verification is: <b>${otp}</b></p>
             <p>This OTP is valid for 10 minutes.</p>
             <p>Thank you,<br/>MysticNft Team</p>`
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
    };
  }
  try {
    const response = await transporter.sendMail({
<<<<<<< HEAD
      from: `"Treasure Star" <${process.env.USER_SENDER_EMAIL}>`, // Sender address
=======
      from: `"MysticNft" <${process.env.USER_SENDER_EMAIL}>`, // Sender address
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
      ...mailOptions,
    });

    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
