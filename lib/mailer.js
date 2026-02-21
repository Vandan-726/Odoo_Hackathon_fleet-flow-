const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendVerificationEmail(email, token) {
  const transporter = createTransport();
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000' || 'https://5wwngzzg-3001.inc1.devtunnels.ms'}/api/auth/verify-email?token=${token}`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#714b67;padding:32px 24px;text-align:center;">
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.15);margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:800;font-size:22px;">FF</span>
        </div>
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">FleetFlow</h1>
        <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">Fleet & Logistics Management</p>
      </div>
      <div style="padding:32px 28px;">
        <h2 style="margin:0 0 12px;font-size:20px;color:#1f2937;">Verify Your Email</h2>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
          Thank you for registering! Click the button below to verify your email address and activate your FleetFlow account.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${verifyUrl}" style="display:inline-block;background:#714b67;color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.3px;">
            Verify Email Address
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:20px 0 0;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color:#714b67;word-break:break-all;">${verifyUrl}</a>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">This link expires in 24 hours.</p>
      </div>
      <div style="background:#f9fafb;padding:16px 28px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">&copy; 2026 FleetFlow. All rights reserved.</p>
      </div>
    </div>
    `;

  await transporter.sendMail({
    from: `"FleetFlow" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your FleetFlow account',
    html,
  });
}

module.exports = { sendVerificationEmail };
