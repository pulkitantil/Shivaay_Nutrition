const nodemailer = require('nodemailer');

/**
 * Sends a 6-digit OTP email to the admin.
 * Falls back to logging the OTP to the console if SMTP credentials are not configured or email sending fails.
 * 
 * @param {string} toEmail - The recipient admin email
 * @param {string} otp - The 6-digit OTP code
 * @returns {Promise<boolean>} - Returns true if sent successfully via email, or false if it fell back to console log
 */
async function sendOTPEmail(toEmail, otp) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log(`\n============================================`);
  console.log(`🔐 SECURITY ALERT: GENERATED OTP FOR ADMIN`);
  console.log(`📧 Recipient: ${toEmail}`);
  console.log(`🔑 OTP Code:  [ ${otp} ]`);
  console.log(`🕒 Expires in: 10 minutes`);
  console.log(`============================================\n`);

  if (!smtpUser || !smtpPass) {
    console.log('⚠️ SMTP_USER or SMTP_PASS environment variables are missing. Fell back to console log.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Shivaay Nutrition Security" <${smtpUser}>`,
      to: toEmail,
      subject: 'Shivaay Nutrition Admin Panel — One-Time Password (OTP)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #FF6B00; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1.5px;">SHIVAAY <span style="color: #FF6B00;">NUTRITION</span></h1>
            <p style="color: #666666; font-size: 12px; margin: 5px 0 0 0;">Secure Administrator Authentication</p>
          </div>
          
          <div style="padding: 10px 0;">
            <p style="font-size: 16px; color: #333333;">Hello Administrator,</p>
            <p style="font-size: 14px; color: #555555; line-height: 1.5;">You requested access to the Shivaay Nutrition Admin Dashboard. Please use the following One-Time Password (OTP) to complete your login:</p>
            
            <div style="background-color: #f9f9f9; border: 1px dashed #FF6B00; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0; font-family: monospace;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF6B00;">${otp}</span>
            </div>
            
            <p style="font-size: 12px; color: #888888; line-height: 1.4;">
              * This OTP is valid for <strong>10 minutes</strong>.<br />
              * For security reasons, please do not share this code with anyone.<br />
              * If you did not request this OTP, please ignore this email.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e0e0e0; margin-top: 30px; padding-top: 15px; text-align: center; font-size: 11px; color: #aaaaaa;">
            © ${new Date().getFullYear()} Shivaay Nutrition. All Rights Reserved.
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 OTP Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending OTP email via SMTP:', err.message);
    console.log('⚠️ Falling back to console log OTP verification.');
    return false;
  }
}

module.exports = {
  sendOTPEmail
};
