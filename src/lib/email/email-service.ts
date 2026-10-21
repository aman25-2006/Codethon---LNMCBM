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

export interface ScorecardEmailPayload {
  studentName: string;
  rollNumber: string;
  email: string;
  participantId?: string;
  course?: string;
  competitionName?: string;
  phase1Score: number;
  codingQ1Score: number;
  codingQ2Score: number;
  totalScore: number;
  rank?: number | null;
  verificationId: string;
  finalizedAt?: string;
  portalUrl?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  status: "delivered" | "accepted" | "failed" | "provider_not_configured";
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

// In-memory simulation log for development when email credentials are not configured
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

function getSmtpTransporter() {
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

  if (!gmailPass || !gmailPass.trim()) return null;

  const isCustomSmtp = Boolean(process.env.SMTP_HOST);
  return nodemailer.createTransport(
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
}

function getSenderAddress() {
  const gmailUser =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    "lnmcbmhackathoncell@gmail.com";

  return process.env.EMAIL_FROM || `"LNMCBM Hackathon Cell" <${gmailUser}>`;
}

/**
 * Dispatches candidate examination credentials via transactional email.
 * Supports direct Gmail SMTP (lnmcbmhackathoncell@gmail.com), Resend API, or transparent simulated outbox.
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
    portalUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://codethon-lnmcbm.vercel.app") + "/login/student",
  } = payload;

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

If you experience login difficulties, contact lnmcbmhackathoncell@gmail.com.

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
    .password-badge { background: #166534; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
    .rules-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; font-size: 12px; color: #475569; line-height: 1.6; }
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
        Your examination account for <strong>${competitionName}</strong> has been confirmed. Please use the credentials below to access the examination desk:
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
      <p style="margin: 4px 0 0;">For inquiries or verification issues, contact <strong>lnmcbmhackathoncell@gmail.com</strong></p>
    </div>
  </div>
</body>
</html>
`.trim();

  // ----------------------------------------------------------------------------
  // Case A: SMTP Transport (Sends directly from lnmcbmhackathoncell@gmail.com)
  // ----------------------------------------------------------------------------
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: getSenderAddress(),
        to: email,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        status: "delivered",
        messageId: info.messageId || `smtp-${Date.now()}`,
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
  // Case B: Resend API Key Configured (Fallback Provider)
  // ----------------------------------------------------------------------------
  const apiKey = process.env.RESEND_API_KEY;
  const isResendConfigured = Boolean(
    apiKey &&
    apiKey.trim() &&
    !apiKey.includes("your_resend_api_key") &&
    apiKey.startsWith("re_")
  );

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
  // Case C: Neither SMTP nor Resend Configured (Safe Simulation)
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

/**
 * Dispatches candidate official scorecard immediately upon examination conclusion.
 * Sends directly from lnmcbmhackathoncell@gmail.com.
 */
export async function sendScorecardEmail(
  payload: ScorecardEmailPayload
): Promise<EmailDispatchResult> {
  const {
    studentName,
    rollNumber,
    email,
    participantId = "Assigned",
    course = "BCA / MCA",
    competitionName = "Codethon 2026",
    phase1Score,
    codingQ1Score,
    codingQ2Score,
    totalScore,
    rank,
    verificationId,
    finalizedAt = new Date().toISOString(),
    portalUrl = process.env.NEXT_PUBLIC_APP_URL || "https://codethon-lnmcbm.vercel.app",
  } = payload;

  const subject = `Official Scorecard & Merit Record: ${competitionName} — LNMCBM`;
  const scorecardUrl = `${portalUrl}/student/scorecard`;

  const formattedDate = new Date(finalizedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Plaintext version
  const textContent = `
LALIT NARAYAN MISHRA COLLEGE OF BUSINESS MANAGEMENT
Muzaffarpur, Bihar
${competitionName} — Official Examination Scorecard

Dear ${studentName},

Congratulations on completing your assessment in ${competitionName}.
Your examination attempt has concluded and your scores have been officially finalized.

--- CANDIDATE RECORD ---
Candidate Name:   ${studentName}
Roll Number / ID: ${rollNumber}
Participant ID:   ${participantId}
Academic Program: ${course}
Verification ID:  ${verificationId}
Concluded Date:   ${formattedDate}

--- MARKS BREAKDOWN ---
Phase 1: Objective Assessment (MCQ): ${phase1Score} / 80 Marks
Phase 2: Coding Problem 1:          ${codingQ1Score} / 10 Marks
Phase 2: Coding Problem 2:          ${codingQ2Score} / 10 Marks
--------------------------------------------------------
FINAL AGGREGATE TOTAL:              ${totalScore} / 100 Marks
${rank !== null && rank !== undefined ? `State Merit Standing:               #${rank}` : ""}

View and print your official certified PDF scorecard online:
${scorecardUrl}

For any queries regarding your result, contact lnmcbmhackathoncell@gmail.com.

Examination Control Committee
Lalit Narayan Mishra College of Business Management
`.trim();

  // HTML version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${competitionName} Official Scorecard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; border-bottom: 3px solid #2563eb; }
    .header h1 { margin: 0; font-size: 17px; color: #ffffff; letter-spacing: -0.025em; text-transform: uppercase; }
    .header p { margin: 6px 0 0; font-size: 12px; color: #60a5fa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .lead { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
    .hero-score-box { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #93c5fd; font-weight: 700; }
    .score-value { font-size: 30px; font-weight: 900; font-family: ui-monospace, monospace; color: #fde047; }
    .rank-tag { background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #ffffff; text-align: right; }
    .table-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f8fafc; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
    td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    tr:last-child td { border-bottom: none; }
    .total-row { background: #f8fafc; font-weight: 800; border-top: 2px solid #0f172a; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 13px; text-decoration: none; padding: 13px 30px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25); }
    .security-badge { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #166534; margin-bottom: 20px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lalit Narayan Mishra College of Business Management</h1>
      <p>${competitionName} — Official Examination Scorecard</p>
    </div>

    <div class="content">
      <div class="greeting">Dear ${studentName},</div>
      <div class="lead">
        Your test submission has been recorded and evaluated. Below is your official performance summary for <strong>${competitionName}</strong>:
      </div>

      <div class="hero-score-box">
        <div>
          <div class="score-label">Final Aggregate Score</div>
          <div class="score-value">${totalScore} <span style="font-size: 16px; color: #bfdbfe; font-weight: normal;">/ 100</span></div>
        </div>
        ${
          rank !== null && rank !== undefined
            ? `<div class="rank-tag">State Merit Standing<br><span style="font-size: 16px; color: #fde047;">#${rank}</span></div>`
            : `<div class="rank-tag">Attempt Concluded<br><span style="color: #93c5fd;">Official Record</span></div>`
        }
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Assessment Component</th>
              <th style="text-align: center;">Max</th>
              <th style="text-align: right;">Awarded</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Phase 1: Objective Examination</strong><br>
                <span style="font-size: 11px; color: #64748b;">40 Multiple Choice Questions</span>
              </td>
              <td style="text-align: center; font-family: monospace;">80</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700;">${phase1Score}</td>
            </tr>
            <tr>
              <td>
                <strong>Phase 2: Coding Problem 1</strong><br>
                <span style="font-size: 11px; color: #64748b;">5 Automated Server Test Cases</span>
              </td>
              <td style="text-align: center; font-family: monospace;">10</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700;">${codingQ1Score}</td>
            </tr>
            <tr>
              <td>
                <strong>Phase 2: Coding Problem 2</strong><br>
                <span style="font-size: 11px; color: #64748b;">5 Automated Server Test Cases</span>
              </td>
              <td style="text-align: center; font-family: monospace;">10</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700;">${codingQ2Score}</td>
            </tr>
            <tr class="total-row">
              <td><strong>TOTAL EVALUATED SCORE</strong></td>
              <td style="text-align: center; font-family: monospace;">100</td>
              <td style="text-align: right; font-family: monospace; font-size: 15px; color: #1e3a8a;"><strong>${totalScore}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="security-badge">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="padding: 0; color: #166534; font-size: 12px;">
              <strong>Verification ID:</strong> <span style="font-family: monospace; font-weight: 700;">${verificationId}</span><br>
              <strong>Candidate Roll:</strong> ${rollNumber} &nbsp;|&nbsp; <strong>Participant ID:</strong> ${participantId}
            </td>
          </tr>
        </table>
      </div>

      <div class="btn-container">
        <a href="${scorecardUrl}" class="btn">View & Print Official PDF Scorecard →</a>
      </div>

      <p style="font-size: 11px; color: #64748b; line-height: 1.5; margin: 0; text-align: center;">
        This document is an electronically issued scorecard authenticated by the Examination Controller.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">Lalit Narayan Mishra College of Business Management, Muzaffarpur, Bihar</p>
      <p style="margin: 4px 0 0;">Sender: <strong>lnmcbmhackathoncell@gmail.com</strong></p>
    </div>
  </div>
</body>
</html>
`.trim();

  // 1. SMTP Transport (lnmcbmhackathoncell@gmail.com)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: getSenderAddress(),
        to: email,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        status: "delivered",
        messageId: info.messageId || `scorecard-smtp-${Date.now()}`,
      };
    } catch (err: unknown) {
      console.error("Scorecard SMTP dispatch error:", err);
      const errMsg = err instanceof Error ? err.message : "SMTP transport error.";
      return {
        success: false,
        status: "failed",
        error: errMsg,
      };
    }
  }

  // 2. Resend API Fallback
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey.startsWith("re_")) {
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
        return {
          success: false,
          status: "failed",
          error: response.error.message,
        };
      }

      return {
        success: true,
        status: "accepted",
        messageId: response.data?.id,
      };
    } catch (err: unknown) {
      return {
        success: false,
        status: "failed",
        error: err instanceof Error ? err.message : "Transport error.",
      };
    }
  }

  // 3. Simulated Outbox
  const outbox = getSimulatedOutbox();
  const simulatedId = `sim-scorecard-${Date.now()}`;
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
    error: "GMAIL_APP_PASSWORD not configured.",
  };
}
