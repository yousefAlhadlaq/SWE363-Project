const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  requireTLS: true, // Force TLS for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000 // 10 seconds
});

/**
 * Send email verification code
 * @param {string} email - Recipient email
 * @param {string} fullName - Recipient name
 * @param {string} verificationCode - 6-digit code
 */
exports.sendVerificationEmail = async (email, fullName, verificationCode) => {
  try {
    const mailOptions = {
      from: `"Quroosh Financial Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email - Quroosh',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px dashed #667eea;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏦 Quroosh</h1>
            <p>Financial Management Platform</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName}!</h2>
            <p>Thank you for registering with Quroosh. To complete your registration, please verify your email address using the code below:</p>

            <div class="code-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
              <div class="code">${verificationCode}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 15 minutes</p>
            </div>

            <p>Enter this code in the verification page to activate your account and start managing your finances with Quroosh.</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Quroosh staff will never ask for your verification code</li>
                <li>This code expires in 15 minutes</li>
              </ul>
            </div>

            <p>If you didn't create an account with Quroosh, please ignore this email.</p>

            <p>Best regards,<br>The Quroosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Quroosh Financial Platform. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${email}:`, error.message);
    throw error;
  }
};

/**
 * Send password reset code
 * @param {string} email - Recipient email
 * @param {string} fullName - Recipient name
 * @param {string} resetCode - 6-digit code
 */
exports.sendPasswordResetEmail = async (email, fullName, resetCode) => {
  try {
    const mailOptions = {
      from: `"Quroosh Financial Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Reset Your Password - Quroosh',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .code-box {
              background: white;
              border: 2px dashed #dc3545;
              border-radius: 10px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #dc3545;
              letter-spacing: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #f8d7da;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏦 Quroosh</h1>
            <p>Financial Management Platform</p>
          </div>
          <div class="content">
            <h2>Hello ${fullName}!</h2>
            <p>We received a request to reset your password. Use the code below to reset your password:</p>

            <div class="code-box">
              <p style="margin: 0; color: #666; font-size: 14px;">Password Reset Code</p>
              <div class="code">${resetCode}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 15 minutes</p>
            </div>

            <p>Enter this code on the password reset page to create a new password.</p>

            <div class="warning">
              <strong>⚠️ Security Alert:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>Quroosh staff will never ask for your reset code</li>
                <li>This code expires in 15 minutes</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>

            <p>If you didn't request a password reset, your account is still secure and you can safely ignore this email.</p>

            <p>Best regards,<br>The Quroosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Quroosh Financial Platform. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
    throw error;
  }
};

/**
 * Test email configuration
 */
exports.testEmailConfiguration = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error.message);
    return false;
  }
};
