import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface StudentEmailPayload {
  studentName: string;
  rollNumber: string;
  email: string;
  temporaryPassword: string;
  participantId?: string;
  competitionName?: string;
  portalUrl?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  status: "delivered" | "accepted" | "failed" | "provider_not_configured";
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

// In-memory simulation log for development when Resend API key is not configured
export interface SimulatedEmailEntry {
  id: string;
  recipient: string;
  rollNumber: string;
  studentName: string;
  timestamp: string;
  subject: string;
  status: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_simulated_emails__: SimulatedEmailEntry[] | undefined;
}

function getSimulatedOutbox(): SimulatedEmailEntry[] {
  if (!global.__lnmcbm_simulated_emails__) {
    global.__lnmcbm_simulated_emails__ = [];
  }
  return global.__lnmcbm_simulated_emails__;
}

export function getRecentSimulatedEmails(): SimulatedEmailEntry[] {
  return getSimulatedOutbox().slice(0, 50);
}

/**
 * Dispatches candidate examination credentials via transactional email.
 * Supports Resend API when configured, or transparent simulated outbox in development.
 */
export async function sendStudentCredentialsEmail(
  payload: StudentEmailPayload
): Promise<EmailDispatchResult> {
  const {
    studentName,
    rollNumber,
    email,
    temporaryPassword,
    participantId = "Assigned",
    competitionName = "Codethon 2026",
    portalUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/login/student",
  } = payload;

  const apiKey = process.env.RESEND_API_KEY;
  const isResendConfigured = Boolean(
    apiKey &&
    apiKey.trim() &&
    !apiKey.includes("your_resend_api_key") &&
    apiKey.startsWith("re_")
  );

  const subject = `Your Examination Credentials: ${competitionName} — LNMCBM`;

  // 1. Generate Plaintext Version
  const textContent = `
LALIT NARAYAN MISHRA COLLEGE OF BUSINESS MANAGEMENT
Muzaffarpur, Bihar
${competitionName} — Official Examination Credentials

Dear ${studentName},

Your student participation account for ${competitionName} has been generated.
Please review your login details below and keep them strictly confidential.

--- EXAMINATION CREDENTIALS ---
Candidate Name:   ${studentName}
Roll Number / ID: ${rollNumber}
Participant ID:   ${participantId}
Temporary Pass:   ${temporaryPassword}
Login Portal:     ${portalUrl}

--- IMPORTANT EXAMINATION RULES ---
1. Phase 1: 40 Multiple-Choice Questions (45 minutes, 80 marks).
2. Phase 2: 2 Programming Problems (30 minutes, 20 marks).
3. Fullscreen browser mode is strictly enforced. Tab switches and window unfocus events are monitored and recorded.
4. Do not refresh or close your browser tab once the examination timer commences.
5. Bring your valid College Identity Card to the assigned computer laboratory.

If you experience login difficulties, immediately report to your room invigilator or contact exams@lnmcbm.ac.in.

Best regards,
Examination Control Committee
Lalit Narayan Mishra College of Business Management
`.trim();

  // 2. Generate HTML Version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${competitionName} Examination Credentials</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; border-bottom: 3px solid #2563eb; }
    .header h1 { margin: 0; font-size: 18px; color: #ffffff; letter-spacing: -0.025em; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #60a5fa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .lead { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .credential-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .credential-title { font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .credential-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #dcfce7; font-size: 13px; }
    .credential-row:last-child { border-bottom: none; }
    .credential-label { color: #475569; font-weight: 500; }
    .credential-value { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; color: #0f172a; }
    .password-badge { background: #166534; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
    .rules-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; font-size: 12px; color: #475569; line-height: 1.6; }
    .rules-box strong { color: #0f172a; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lalit Narayan Mishra College of Business Management</h1>
      <p>${competitionName} — Candidate Examination Desk</p>
    </div>

    <div class="content">
      <div class="greeting">Dear ${studentName},</div>
      <div class="lead">
        Your examination account for <strong>${competitionName}</strong> has been configured by the exam controller. Please use the credentials below to access the examination desk:
      </div>

      <div class="credential-box">
        <div class="credential-title">Verified Examination Credentials</div>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr style="border-bottom: 1px dashed #bbf7d0;">
            <td style="padding: 8px 0; color: #475569;">Candidate Name:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a;">${studentName}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #bbf7d0;">
            <td style="padding: 8px 0; color: #475569;">Roll Number / User ID:</td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">${rollNumber}</td>
          </tr>
          <tr style="border-bottom: 1px dashed #bbf7d0;">
            <td style="padding: 8px 0; color: #475569;">Participant ID:</td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; font-weight: 600; color: #2563eb;">${participantId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #475569;">Temporary Password:</td>
            <td style="padding: 8px 0; text-align: right;">
              <span class="password-badge">${temporaryPassword}</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="btn-container">
        <a href="${portalUrl}" class="btn">Sign In to Student Examination Desk →</a>
      </div>

      <div class="rules-box">
        <p style="margin-top: 0; font-weight: 700; color: #0f172a;">Examination Guidelines & Integrity Requirements:</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Phase 1:</strong> 40 Multiple Choice Questions (45 minutes, 80 maximum marks).</li>
          <li><strong>Phase 2:</strong> 2 Coding Problems (30 minutes, 20 maximum marks).</li>
          <li><strong>Fullscreen Mode:</strong> Mandatory throughout the examination session. Window unfocus and tab-switching events are permanently logged.</li>
          <li><strong>Security:</strong> Do not share your credentials with anyone. Only one active device session is permitted per candidate.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">Lalit Narayan Mishra College of Business Management, Muzaffarpur, Bihar</p>
      <p style="margin: 4px 0 0;">For inquiries or verification issues, contact the Examination Desk at <strong>exams@lnmcbm.ac.in</strong></p>
    </div>
  </div>
</body>
</html>
`.trim();

  const gmailPass =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASS;

  const gmailUser =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    "lnmcbmhackathoncell@gmail.com";

  const fromAddress =
    process.env.EMAIL_FROM ||
    `"LNMCBM Hackathon Cell" <${gmailUser}>`;

  // ----------------------------------------------------------------------------
  // Case A: Gmail SMTP Transport (Sends directly from lnmcbmhackathoncell@gmail.com)
  // ----------------------------------------------------------------------------
  if (gmailPass && gmailPass.trim()) {
    try {
      const isCustomSmtp = Boolean(process.env.SMTP_HOST);
      const transporter = nodemailer.createTransport(
        isCustomSmtp
          ? {
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT) || 587,
              secure: process.env.SMTP_PORT === "465",
              auth: {
                user: (process.env.SMTP_USER || gmailUser).trim(),
                pass: gmailPass.trim().replace(/\s+/g, ""),
              },
            }
          : {
              service: "gmail",
              auth: {
                user: gmailUser.trim(),
                pass: gmailPass.trim().replace(/\s+/g, ""),
              },
            }
      );

      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        status: "delivered",
        messageId: info.messageId || `gmail-${Date.now()}`,
      };
    } catch (err: unknown) {
      console.error("Gmail SMTP dispatch error:", err);
      const errMsg = err instanceof Error ? err.message : "SMTP transport error.";
      return {
        success: false,
        status: "failed",
        error: errMsg.includes("Invalid login")
          ? "Gmail authentication failed. Please check GMAIL_APP_PASSWORD in Vercel (requires a 16-character Google App Password with 2FA enabled on lnmcbmhackathoncell@gmail.com)."
          : errMsg,
      };
    }
  }

  // ----------------------------------------------------------------------------
  // Case B: Resend API Key Configured (Alternative Provider)
  // ----------------------------------------------------------------------------
  if (isResendConfigured) {
    try {
      const resend = new Resend(apiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "LNMCBM Exam Controller <onboarding@resend.dev>";

      const response = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        text: textContent,
        html: htmlContent,
      });

      if (response.error) {
        console.error("Resend API rejected dispatch:", response.error);
        return {
          success: false,
          status: "failed",
          error: response.error.message || "Failed to dispatch email via Resend.",
        };
      }

      return {
        success: true,
        status: "accepted",
        messageId: response.data?.id || `resend-${Date.now()}`,
      };
    } catch (err: unknown) {
      console.error("Resend email dispatch exception:", err);
      return {
        success: false,
        status: "failed",
        error: err instanceof Error ? err.message : "Transactional email transport error.",
      };
    }
  }

  // ----------------------------------------------------------------------------
  // Case C: Neither Gmail SMTP nor Resend Configured (Safe Simulation)
  // Transparently records attempt without pretending external delivery occurred.
  // ----------------------------------------------------------------------------
  const outbox = getSimulatedOutbox();
  const simulatedId = `sim-email-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  outbox.unshift({
    id: simulatedId,
    recipient: email,
    rollNumber,
    studentName,
    timestamp: new Date().toISOString(),
    subject,
    status: "provider_not_configured",
  });

  return {
    success: false,
    status: "provider_not_configured",
    messageId: simulatedId,
    simulated: true,
    error:
      "Gmail App Password not set. Please add GMAIL_APP_PASSWORD in your Vercel Environment Variables for lnmcbmhackathoncell@gmail.com.",
  };
}

