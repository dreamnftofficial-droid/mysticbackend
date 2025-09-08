export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
<<<<<<< HEAD
      <title>Email Verification Code</title>
      <style>
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
              color: #333;
              line-height: 1.6;
          }
          .container {
              max-width: 400px;
              margin: 0 auto;
              background: #ffffff;
              padding: 0;
          }
          .logo-section {
              padding: 40px 20px 30px;
              text-align: center;
              background: #ffffff;
          }
          .logo {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              font-size: 20px;
              font-weight: 600;
              color: #333;
          }
          .logo-icon {
              width: 40px;
              height: 40px;
              border-radius: 8px;
              display: inline-block;
              vertical-align: middle;
          }
          .header {
              background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
              color: white;
              padding: 30px 20px;
              margin: 0 20px 20px;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 1px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
          }

          .content {
              padding: 0 20px 40px;
              text-align: left;
          }
          .greeting {
              font-size: 16px;
              color: #333;
              margin-bottom: 15px;
              font-weight: 500;
          }
          .message {
              font-size: 14px;
              color: #555;
              line-height: 1.6;
              margin-bottom: 30px;
          }
          .message strong {
              color: #333;
              font-weight: 600;
          }
          .verification-code {
                   display: block;
                   background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                   color: white;
                   font-size: 24px;
                   font-weight: 700;
                   letter-spacing: 4px;
                   padding: 15px 20px;
                   border-radius: 50px;
                   margin: 30px auto;
                   text-align: center;
                   max-width: 200px;
                   box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
               }
          .note {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
              line-height: 1.4;
              text-align: center;
          }
          @media (max-width: 480px) {
              body {
                  padding: 10px;
              }
              .header-box {
                  margin: 0 10px 15px;
                  padding: 25px 15px;
              }
              .content {
                  padding: 0 15px 30px;
              }
              .verification-code {
                  font-size: 20px;
                  letter-spacing: 3px;
                  padding: 12px 15px;
              }
=======
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
          }
      </style>
  </head>
  <body>
      <div class="container">
<<<<<<< HEAD
          <div class="logo-section">
              <div class="logo">
                  <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
              </div>
          </div>
          <div class="header">Email Verification Code</div>
          <div class="content">
              <div class="greeting">Dear User,</div>
              <div class="message">
                  Thank you for registering with <strong>TREASURE STAR</strong>.<br><br>
                  Please use the following code to verify your email address:
              </div>
              <div class="verification-code">{verificationCode}</div>
              <div class="note">
                  This verification code is valid for 10 minutes. If you did not request this, please ignore this email.
              </div>
=======
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
          </div>
      </div>
  </body>
  </html>
`;




export const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Community</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
<<<<<<< HEAD
              background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
              color: white;
              padding: 30px 20px;
              margin: 0 20px 20px;
              font-size: 22px;
              font-weight: 700;
              letter-spacing: 1px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
=======
              background-color: #007BFF;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
<<<<<<< HEAD
              border-radius: 50px;
=======
              border-radius: 5px;
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to Our Community!</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="#" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
          </div>
          <div class="footer">
<<<<<<< HEAD
              <p>&copy; ${new Date().getFullYear()} Treasure Star. All rights reserved.</p>
=======
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
          </div>
      </div>
  </body>
  </html>
`;

export function passwordChangeOTPTemplate(email, otp) {
  return {
<<<<<<< HEAD
    subject: 'Treasure Star: Change Password OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Change Verification</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 0;
              }
              .logo-section {
                  padding: 40px 20px 30px;
                  text-align: center;
                  background: #ffffff;
              }
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  font-size: 20px;
                  font-weight: 600;
                  color: #333;
              }
              .logo-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: inline-block;
                  vertical-align: middle;
              }
              .header-box {
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin: 0 20px 20px;
                  border-radius: 8px;
              }
              .header-box h1 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  color: white;
              }

              .content {
                  padding: 0 20px 40px;
                  text-align: left;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                  font-weight: 500;
              }
              .message {
                  font-size: 14px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 30px;
              }
              .verification-code {
                  display: block;
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 4px;
                  padding: 15px 20px;
                  border-radius: 50px;
                  margin: 30px auto;
                  text-align: center;
                  max-width: 200px;
                  box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
              }
              .note {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                  line-height: 1.4;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-section">
                  <div class="logo">
                      <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
                  </div>
              </div>
              <div class="header">Password Change Verification</div>
              <div class="content">
                  <div class="greeting">Dear User,</div>
                  <div class="message">
                      You requested to change your password for your <strong>Treasure Star</strong> account (${email}).<br><br>
                      Please use the following code to verify your password change:
                  </div>
                  <div class="verification-code">${otp}</div>
                  <div class="note">
                      This verification code is valid for 10 minutes. If you did not request this, please ignore this email.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
=======
    subject: 'MysticNft: Change Password OTP',
    html: `<p>Hello,</p>
           <p>You requested to change your password for your MysticNft account (${email}).</p>
           <p>Your OTP for password change is: <b>${otp}</b></p>
           <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
           <p>Thank you,<br/>MysticNft Team</p>`
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
  };
}

export function emailChangeOTPTemplate(newEmail, otp) {
  return {
<<<<<<< HEAD
    subject: 'Treasure Star: Email Change OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Change Verification</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 0;
              }
              .logo-section {
                  padding: 40px 20px 30px;
                  text-align: center;
                  background: #ffffff;
              }
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  font-size: 20px;
                  font-weight: 600;
                  color: #333;
              }
              .logo-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: inline-block;
                  vertical-align: middle;
              }
              .header-box {
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin: 0 20px 20px;
                  border-radius: 8px;
              }
              .header-box h1 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  color: white;
              }

              .content {
                  padding: 0 20px 40px;
                  text-align: left;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                  font-weight: 500;
              }
              .message {
                  font-size: 14px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 30px;
              }
              .verification-code {
                  display: block;
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 4px;
                  padding: 15px 20px;
                  border-radius: 50px;
                  margin: 30px auto;
                  text-align: center;
                  max-width: 200px;
                  box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
              }
              .note {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                  line-height: 1.4;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-section">
                  <div class="logo">
                      <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
                  </div>
              </div>
              <div class="header">Email Change Verification</div>
              <div class="content">
                  <div class="greeting">Dear User,</div>
                  <div class="message">
                      You requested to change your Treasure Star account email to: <strong>${newEmail}</strong>.<br><br>
                      Please use the following code to verify your email change:
                  </div>
                  <div class="verification-code">${otp}</div>
                  <div class="note">
                      This verification code is valid for 10 minutes. If you did not request this, please ignore this email.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
=======
    subject: 'MysticNft: Email Change OTP',
    html: `<p>Hello,</p>
           <p>You requested to change your MysticNft account email to: <b>${newEmail}</b>.</p>
           <p>Your OTP for email change is: <b>${otp}</b></p>
           <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
           <p>Thank you,<br/>MysticNft Team</p>`
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
  };
}

export function enable2FAEmailTemplate(email, otp) {
  return {
<<<<<<< HEAD
    subject: 'Treasure Star: Enable 2FA Verification',
    html: `<p>Hello,</p>
           <p>You requested to enable Two-Factor Authentication (2FA) for your Treasure Star account (${email}).</p>
           <p>Your OTP for enabling 2FA is: <b>${otp}</b></p>
           <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
           <p>Thank you,<br/>Treasure Star Team</p>`
  };
}

export function twoFAOTPTemplate(otp) {
  return {
    subject: 'Treasure Star: Two-Factor Authentication OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Two-Factor Authentication</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 0;
              }
              .logo-section {
                  padding: 40px 20px 30px;
                  text-align: center;
                  background: #ffffff;
              }
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  font-size: 20px;
                  font-weight: 600;
                  color: #333;
              }
              .logo-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: inline-block;
                  vertical-align: middle;
              }
              .header-box {
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin: 0 20px 20px;
                  border-radius: 8px;
              }
              .header-box h1 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  color: white;
              }

              .content {
                  padding: 0 20px 40px;
                  text-align: left;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                  font-weight: 500;
              }
              .message {
                  font-size: 14px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 30px;
              }
              .verification-code {
                  display: block;
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 4px;
                  padding: 15px 20px;
                  border-radius: 50px;
                  margin: 30px auto;
                  text-align: center;
                  max-width: 200px;
                  box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
              }
              .note {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                  line-height: 1.4;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-section">
                  <div class="logo">
                      <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
                  </div>
              </div>
              <div class="header">Two-Factor Authentication</div>
              <div class="content">
                  <div class="greeting">Dear User,</div>
                  <div class="message">
                      Your Two-Factor Authentication code for Treasure Star is ready.<br><br>
                      Please use the following code to complete your authentication:
                  </div>
                  <div class="verification-code">${otp}</div>
                  <div class="note">
                      This verification code is valid for 10 minutes. If you did not request this, please secure your account immediately.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
=======
    subject: 'MysticNft: Enable 2FA Verification',
    html: `<p>Hello,</p>
           <p>You requested to enable Two-Factor Authentication (2FA) for your MysticNft account (${email}).</p>
           <p>Your OTP for enabling 2FA is: <b>${otp}</b></p>
           <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
           <p>Thank you,<br/>MysticNft Team</p>`
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
  };
}

export function walletBindingOTPTemplate(email, otp) {
  return {
<<<<<<< HEAD
    subject: 'Treasure Star: Wallet Binding Verification',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Wallet Binding Verification</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 0;
              }
              .logo-section {
                  padding: 40px 20px 30px;
                  text-align: center;
                  background: #ffffff;
              }
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  font-size: 20px;
                  font-weight: 600;
                  color: #333;
              }
              .logo-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: inline-block;
                  vertical-align: middle;
              }
              .header-box {
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin: 0 20px 20px;
                  border-radius: 8px;
              }
              .header-box h1 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  color: white;
              }

              .content {
                  padding: 0 20px 40px;
                  text-align: left;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                  font-weight: 500;
              }
              .message {
                  font-size: 14px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 30px;
              }
              .verification-code {
                  display: block;
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 4px;
                  padding: 15px 20px;
                  border-radius: 50px;
                  margin: 30px auto;
                  text-align: center;
                  max-width: 200px;
                  box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
              }
              .note {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                  line-height: 1.4;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-section">
                  <div class="logo">
                      <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
                  </div>
              </div>
              <div class="header">Wallet Binding Verification</div>
              <div class="content">
                  <div class="greeting">Dear User,</div>
                  <div class="message">
                      You requested to bind a wallet address to your Treasure Star account (${email}).<br><br>
                      Please use the following code to complete your wallet binding:
                  </div>
                  <div class="verification-code">${otp}</div>
                  <div class="note">
                      This verification code is valid for 10 minutes. Please enter this OTP along with your Google Authenticator code to complete the wallet binding process. If you did not request this, please ignore this email and ensure your account is secure.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
=======
    subject: 'MysticNft: Wallet Binding Verification',
    html: `<p>Hello,</p>
           <p>You requested to bind a wallet address to your MysticNft account (${email}).</p>
           <p>Your OTP for wallet binding is: <b>${otp}</b></p>
           <p>This OTP is valid for 10 minutes. Please enter this OTP along with your Google Authenticator code to complete the wallet binding process.</p>
           <p>If you did not request this, please ignore this email and ensure your account is secure.</p>
           <p>Thank you,<br/>MysticNft Team</p>`
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
  };
}

export function walletChangeOTPTemplate(email, newWalletAddress, otp) {
  return {
<<<<<<< HEAD
    subject: 'Treasure Star: Wallet Address Change OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Wallet Change Verification</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 0;
              }
              .logo-section {
                  padding: 40px 20px 30px;
                  text-align: center;
                  background: #ffffff;
              }
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  font-size: 20px;
                  font-weight: 600;
                  color: #333;
              }
              .logo-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: inline-block;
                  vertical-align: middle;
              }
              .header-box {
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin: 0 20px 20px;
                  border-radius: 8px;
              }
              .header-box h1 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  color: white;
              }

              .content {
                  padding: 0 20px 40px;
                  text-align: left;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                  font-weight: 500;
              }
              .message {
                  font-size: 14px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 30px;
              }
              .verification-code {
                  display: block;
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 4px;
                  padding: 15px 20px;
                  border-radius: 50px;
                  margin: 30px auto;
                  text-align: center;
                  max-width: 200px;
                  box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
              }
              .note {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                  line-height: 1.4;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-section">
                  <div class="logo">
                      <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
                  </div>
              </div>
              <div class="header">Wallet Change Verification</div>
              <div class="content">
                  <div class="greeting">Dear User,</div>
                  <div class="message">
                      You requested to change your wallet address for your Treasure Star account (${email}).<br><br>
                      New wallet address: <strong>${newWalletAddress}</strong><br><br>
                      Please use the following code to complete your wallet change:
                  </div>
                  <div class="verification-code">${otp}</div>
                  <div class="note">
                      This verification code is valid for 10 minutes. If you did not request this, please ignore this email.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
  };
}

export function withdrawalOTPTemplate(email, otp) {
  return {
    subject: 'Treasure Star: Withdrawal Verification Code',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Withdrawal Verification Code</title>
          <style>
              body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #333;
                  line-height: 1.6;
              }
              .container {
                  max-width: 400px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 0;
              }
              .logo-section {
                  padding: 40px 20px 30px;
                  text-align: center;
                  background: #ffffff;
              }
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  font-size: 20px;
                  font-weight: 600;
                  color: #333;
              }
              .logo-icon {
                  width: 40px;
                  height: 40px;
                  border-radius: 8px;
                  display: inline-block;
                  vertical-align: middle;
              }
              .header-box {
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  padding: 30px 20px;
                  text-align: center;
                  margin: 0 20px 20px;
                  border-radius: 8px;
              }
              .header-box h1 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  color: white;
              }

              .content {
                  padding: 0 20px 40px;
                  text-align: left;
              }
              .greeting {
                  font-size: 16px;
                  color: #333;
                  margin-bottom: 15px;
                  font-weight: 500;
              }
              .message {
                  font-size: 14px;
                  color: #555;
                  line-height: 1.6;
                  margin-bottom: 30px;
              }
              .message strong {
                  color: #333;
                  font-weight: 600;
              }
              .verification-code {
                  display: block;
                  background: linear-gradient(to left, #64C9FC, #8FFCDE, #F4D4C5);
                  color: white;
                  font-size: 24px;
                  font-weight: 700;
                  letter-spacing: 4px;
                  padding: 15px 20px;
                  border-radius: 50px;
                  margin: 30px auto;
                  text-align: center;
                  max-width: 200px;
                  box-shadow: 0 4px 15px rgba(100, 201, 252, 0.3);
              }
              .warning {
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 8px;
                  padding: 15px;
                  margin: 20px 0;
                  font-size: 13px;
                  color: #856404;
              }
              .note {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                  line-height: 1.4;
                  text-align: center;
              }
              @media (max-width: 480px) {
                  body {
                      padding: 10px;
                  }
                  .header-box {
                      margin: 0 10px 15px;
                      padding: 25px 15px;
                  }
                  .content {
                      padding: 0 15px 30px;
                  }
                  .verification-code {
                      font-size: 20px;
                      letter-spacing: 3px;
                      padding: 12px 15px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="logo-section">
                  <div class="logo">
                      <img src="cid:logo" alt="Treasure Star" class="logo-icon" />
                      Treasure Star
                  </div>
              </div>
              <div class="header">Withdrawal Verification Code</div>
              <div class="content">
                  <div class="greeting">Dear User,</div>
                  <div class="message">
                      You have requested to withdraw funds from your <strong>TREASURE STAR</strong> account.<br><br>
                      Please use the following code to verify your withdrawal request:
                  </div>
                  <div class="verification-code">${otp}</div>
                  <div class="warning">
                      <strong>⚠️ Security Notice:</strong><br>
                      After entering this OTP, you will also need to provide your Google Authenticator code to complete the withdrawal.
                  </div>
                  <div class="note">
                      This verification code is valid for 10 minutes. If you did not request this withdrawal, please contact our support team immediately.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `
=======
    subject: 'MysticNft: Wallet Address Change OTP',
    html: `<p>Hello,</p>
           <p>You requested to change your wallet address for your MysticNft account (${email}).</p>
           <p>New wallet address: <b>${newWalletAddress}</b></p>
           <p>Your OTP for wallet address change is: <b>${otp}</b></p>
           <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
           <p>Thank you,<br/>MysticNft Team</p>`
>>>>>>> 2c0131a738901bad28ade0bdcb21046e0542ebc7
  };
}