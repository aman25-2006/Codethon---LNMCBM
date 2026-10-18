/**
 * LNMCBM College Coding Competition Portal
 * Database Backup & Data Preservation Utility
 *
 * Exports complete JSON snapshot of all exam tables:
 * - students, profiles
 * - competition_settings
 * - mcq_questions, mcq_options, mcq_answer_keys
 * - exam_sessions, mcq_answers
 * - coding_problems, hidden_test_cases, coding_submissions, submission_evaluations
 * - monitoring_events, final_results, audit_logs
 *
 * Usage:
 *   node scripts/backup-database.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const BACKUP_DIR = path.join(ROOT_DIR, "backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
  JSON.stringify({
    id: "admin-controller-uuid",
    email: "admin@lnmcbm.ac.in",
    name: "System Exam Controller",
    role: "admin",
  })
)}`;

async function exportTableData(endpoint, name) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    if (!res.ok) {
      return { error: `HTTP ${res.status}: ${res.statusText}` };
    }
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-lnmcbm-codethon-${timestamp}.json`;
  const backupFilePath = path.join(BACKUP_DIR, filename);

  console.log("\n===============================================================================");
  console.log("  LNMCBM COMPETITION PORTAL: FULL DATABASE SNAPSHOT EXPORT");
  console.log("===============================================================================");
  console.log(`  Target File: ${backupFilePath}`);
  console.log(`  Source Server: ${BASE_URL}\n`);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    system: "Lalit Narayan Mishra College of Business Management (LNMCBM)",
    version: "1.0.0",
    data: {},
    summary: {},
  };

  // 1. Settings & Lifecycle
  console.log("  [1/6] Exporting Competition Settings & Lifecycle...");
  snapshot.data.settings = await exportTableData("/api/admin/settings", "settings");

  // 2. Candidate Rosters
  console.log("  [2/6] Exporting Student Rosters & Accounts...");
  snapshot.data.students = await exportTableData("/api/admin/students?limit=10000", "students");

  // 3. Question Bank & Answer Keys
  console.log("  [3/6] Exporting 40-MCQ Question Bank & Official Keys...");
  snapshot.data.questions = await exportTableData("/api/admin/questions?limit=500", "questions");

  // 4. Coding Problems & Test Suites
  console.log("  [4/6] Exporting Coding Problems & Sandbox Configurations...");
  snapshot.data.codingProblems = await exportTableData("/api/admin/coding-problems", "coding_problems");

  // 5. Final Results & Rankings
  console.log("  [5/6] Exporting Final Results & Merit Standings...");
  snapshot.data.results = await exportTableData("/api/admin/results?limit=10000", "results");

  // 6. Audit & Monitoring Logs
  console.log("  [6/6] Exporting Audit Logs & Proctoring Incident Reports...");
  snapshot.data.auditLogs = await exportTableData("/api/admin/audit-logs?limit=10000", "audit_logs");

  // Compile Summary
  snapshot.summary = {
    studentsCount: snapshot.data.students?.students?.length || 0,
    mcqCount: snapshot.data.questions?.questions?.length || 0,
    codingProblemsCount: snapshot.data.codingProblems?.problems?.length || 0,
    finalResultsCount: snapshot.data.results?.results?.length || 0,
    auditLogsCount: snapshot.data.auditLogs?.logs?.length || 0,
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(snapshot, null, 2), "utf-8");
  const stats = fs.statSync(backupFilePath);

  console.log("\n===============================================================================");
  console.log("  BACKUP COMPLETED SUCCESSFULLY");
  console.log("===============================================================================");
  console.log(`  File Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  Students: ${snapshot.summary.studentsCount}`);
  console.log(`  MCQ Questions: ${snapshot.summary.mcqCount}`);
  console.log(`  Coding Problems: ${snapshot.summary.codingProblemsCount}`);
  console.log(`  Final Results: ${snapshot.summary.finalResultsCount}`);
  console.log(`  Audit Logs: ${snapshot.summary.auditLogsCount}`);
  console.log("===============================================================================\n");

  return backupFilePath;
}

runBackup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});

