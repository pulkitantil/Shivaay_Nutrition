const nodemailer = require("nodemailer");

/**
 * Sends a 6-digit OTP email to the admin.
 * Falls back to logging the OTP if SMTP fails.
 */

async function sendOTPEmail(toEmail, otp) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log("\n============================================");
  console.log("🔐 SECURITY ALERT: GENERATED OTP FOR ADMIN");
  console.log("📧 Recipient:", toEmail);
  console.log("🔑 OTP Code:", otp);
  console.log("🕒 Expires in: 10 minutes");
  console.log("============================================\n");

  if (!smtpUser || !smtpPass) {
    console.log("❌ SMTP credentials are missing.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,

      auth: {
        user: smtpUser,
        pass: smtpPass,
      },

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,

      tls: {
        rejectUnauthorized: false,
      },

      logger: true,
      debug: true,
    });

    console.log("🔄 Verifying SMTP connection...");

    await transporter.verify();

    console.log("✅ SMTP Connected Successfully.");

    const info = await transporter.sendMail({
      from: `"Shivaay Nutrition Security" <${smtpUser}>`,
      to: toEmail,
      subject: "Shivaay Nutrition Admin Panel — One-Time Password (OTP)",
      html: `
        <div style="font-family:Arial,sans-serif;padding:25px">
          <h2>Shivaay Nutrition</h2>

          <p>Your OTP is:</p>

          <h1 style="letter-spacing:6px;color:#FF6B00">${otp}</h1>

          <p>This OTP will expire in 10 minutes.</p>

          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    console.log("✅ OTP Email Sent Successfully");
    console.log(info);

    return true;
  } catch (err) {
    console.log("================================");
    console.log("❌ SMTP ERROR");
    console.log(err);
    console.log(err.stack);
    console.log("================================");

    return false;
  }
}

module.exports = {
  sendOTPEmail,
};