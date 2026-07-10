const nodemailer = require('nodemailer');
const env = require('./env');

const isConfigured = 
  env.SMTP_HOST && 
  env.SMTP_PORT && 
  env.SMTP_USER && 
  env.SMTP_PASS &&
  !env.SMTP_USER.includes('your-smtp-username');

let transporter;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465, // true for port 465, false for 587
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  console.log('✅ SMTP Email Transporter initialized');
} else {
  console.warn('⚠️ SMTP Email credentials not configured in server/.env. Outgoing emails will be logged to the console.');
}

// Dispatches an email using Nodemailer or falls back to logging it in the console.
async function sendEmail({ to, subject, html }) {
  if (!isConfigured) {
    console.log('\n--- 📧 OUTGOING EMAIL SIMULATION ---');
    console.log(`To:      ${to}`);
    console.log(`From:    ${env.EMAIL_FROM}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------------------------');
    console.log('Body HTML:\n', html);
    console.log('------------------------------------\n');
    return { messageId: 'mock-message-id' };
  }

  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error.message);
    throw error;
  }
}

module.exports = { sendEmail };
