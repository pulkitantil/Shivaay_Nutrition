const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a 6-digit OTP email using Resend.
 *
 * @param {string} toEmail
 * @param {string} otp
 * @returns {Promise<boolean>}
 */

async function sendOTPEmail(toEmail, otp) {
  console.log("\n============================================");
  console.log("🔐 SECURITY ALERT: GENERATED OTP FOR ADMIN");
  console.log("📧 Recipient:", toEmail);
  console.log("🔑 OTP Code:", otp);
  console.log("🕒 Expires in: 10 minutes");
  console.log("============================================\n");

  if (!process.env.RESEND_API_KEY) {
    console.log("❌ RESEND_API_KEY is missing.");
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Shivaay Nutrition <noreply@shivaaynutrition.com>",
      to: [toEmail],
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

    if (error) {
      console.error("❌ Resend Error:", error);
      return false;
    }

    console.log("✅ OTP Email Sent Successfully");
    console.log(data);

    return true;
  } catch (err) {
    console.error("❌ Resend Exception:", err);
    return false;
  }
}

module.exports = {
  sendOTPEmail,
};