import { transporter } from "./email.config.middelware.js"; // Fixed the typo in the filename if needed
import { Verification_Email_Template } from "../libs/email.template.js";

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
    mailOptions = {
      to: email,
      subject: 'MysticNft: Email Verification',
      html: `<p>Hello,</p>
             <p>Your OTP for registration/verification is: <b>${otp}</b></p>
             <p>This OTP is valid for 10 minutes.</p>
             <p>Thank you,<br/>MysticNft Team</p>`
    };
  }
  try {
    const response = await transporter.sendMail({
      from: `"MysticNft" <${process.env.USER_SENDER_EMAIL}>`, // Sender address
      ...mailOptions,
    });

    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
