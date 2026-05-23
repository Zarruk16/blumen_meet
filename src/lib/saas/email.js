import nodemailer from "nodemailer";

export function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

function getFromAddress() {
  return process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@blumenmeet.com";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

let transporter;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  const from = getFromAddress();

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", { to, subject, text: text || html?.slice(0, 200) });
      return { ok: true, dev: true };
    }
    throw new Error("Email is not configured");
  }

  await transport.sendMail({ from, to, subject, html, text });
  return { ok: true };
}

export async function sendPasswordResetEmail(to, token, name) {
  const url = `${getAppUrl()}/user-auth/reset-password?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  return sendEmail({
    to,
    subject: "Reset your Blumen Meet password",
    text: `${greeting}\n\nReset your password: ${url}\n\nThis link expires in 1 hour.`,
    html: `<p>${greeting}</p><p><a href="${url}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
  });
}

export async function sendVerificationEmail(to, token, name) {
  const url = `${getAppUrl()}/api/saas/auth/verify-email?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  return sendEmail({
    to,
    subject: "Verify your Blumen Meet email",
    text: `${greeting}\n\nVerify your email: ${url}\n\nThis link expires in 24 hours.`,
    html: `<p>${greeting}</p><p><a href="${url}">Verify your email</a></p><p>This link expires in 24 hours.</p>`,
  });
}
