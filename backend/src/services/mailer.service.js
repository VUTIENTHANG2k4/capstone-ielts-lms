// Lightweight mailer wrapper.
// In production: set SMTP_* env vars and install nodemailer.
// In dev: logs to console and returns the link so frontend tests work.

let transporter = null;
try {
  if (process.env.SMTP_HOST) {
    // eslint-disable-next-line global-require
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
} catch (e) {
  console.warn('[mailer] nodemailer not installed – emails disabled.');
}

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log('[mailer/dev] To:', to, 'Subject:', subject);
    console.log('[mailer/dev] Body:', text || html);
    return { mocked: true };
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || 'IELTS Academy <no-reply@ielts.academy>',
    to, subject, html, text,
  });
}

module.exports = { sendMail };
