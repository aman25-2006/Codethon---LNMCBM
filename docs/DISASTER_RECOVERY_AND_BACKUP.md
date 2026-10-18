# LNMCBM Coding Competition Portal: Disaster Recovery & Data Preservation Guide
**Lalit Narayan Mishra College of Business Management (LNMCBM), Muzaffarpur**

---

## 1. Executive Summary

This operational manual documents data protection, high availability, backup routines, and incident recovery procedures for the **LNMCBM College Coding Competition Portal**. It provides step-by-step recovery runbooks for exam controllers, IT administrators, and lab invigilators during live contest operations.

---

## 2. Backup Procedures

### 2.1 Automated JSON Database Snapshot Utility
The portal includes a standalone backup script located at `scripts/backup-database.mjs`.

- **Execution Command:**
  ```powershell
  node scripts/backup-database.mjs
  ```
- **Output Destination:** `backups/backup-lnmcbm-codethon-<ISO-TIMESTAMP>.json`
- **Tables Captured:**
  1. `competition_settings` (Durations, active categories, proctoring thresholds, lifecycle status)
  2. `students` & `profiles` (Candidate rosters, rolls, credentials status, courses)
  3. `mcq_questions`, `mcq_options`, `mcq_answer_keys` (Authoritative 40-question bank & case studies)
  4. `coding_problems` & `hidden_test_cases` (Multi-language problems, constraints, test suites)
  5. `exam_sessions` & `mcq_answers` (Active timestamps, saved options, marked for review)
  6. `coding_submissions` & `submission_evaluations` (Submitted code, sandbox outputs, scores)
  7. `final_results` (Scored totals, Phase 1 & 2 breakdown, merit ranks, verification codes)
  8. `monitoring_events` & `audit_logs` (Proctoring strikes, warnings, exceptions, admin actions)

### 2.2 PostgreSQL Native Backup (`pg_dump` for Supabase)
For remote Supabase production deployments, daily and pre-competition dumps should be captured using `pg_dump`:

```bash
pg_dump "postgresql://postgres:[YOUR-DB-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  --clean --if-exists --no-owner --no-privileges \
  -f backups/lnmcbm_production_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 3. Answer Preservation During Unexpected Server Restart

### 3.1 MCQ Phase 1 Answer Durability
- **Atomic Persistence:** Candidate answers are saved immediately on selection via `POST /api/student/exam/save-answer`. Answers are not held in client-only memory.
- **Client Reload Resilience:** When a browser refreshes or the server reboots:
  - `GET /api/student/exam/questions` loads the active questions.
  - The API retrieves all existing answers and flags (`is_marked_for_review`) associated with the candidate's active session.
  - The UI re-hydrates the candidate's exact selections seamlessly.
- **Server-Side Timers:** Exam timers (`phase1_expires_at`, `phase2_expires_at`) are stored as absolute UTC ISO timestamps calculated at session start (`started_at + duration_seconds`).
  - Neither client refresh nor server reboot resets, pauses, or artificially inflates candidate time.
  - Countdown calculations are computed as `remainingSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))`.

### 3.2 Coding Phase 2 Draft & Submission Durability
- **Periodic Draft Autosave:** Candidates' code drafts in Monaco Editor are autosaved via `POST /api/student/exam/phase2/save-draft`. If a browser window crashes or machine reboots, the draft is reloaded upon login.
- **Atomic Submission Lock:** When a candidate clicks "Submit Final Code", the server evaluates hidden test cases and locks the submission with `is_final = true`. Once locked, subsequent attempts for the same problem are rejected with HTTP 400.

---

## 4. Handling Interrupted Coding Evaluations

### 4.1 Sandbox Process Crashes or Network Disconnections
- If the execution sandbox crashes or experiences a network timeout during test case evaluation:
  - The transaction aborts before marking `is_final = true`.
  - The student's attempt is **not locked**.
  - The candidate receives an error notification and can immediately re-submit their code.
- **Timeout Protection:** Both sample runs (5s limit) and submission evaluations (3s per test case) have strict sandbox timeouts to prevent infinite loops from hanging server workers.

### 4.2 Restoring Interrupted or Terminated Candidates
If a student experiences hardware failure, power disruption, or accidental proctoring termination (3 strikes):
1. **Invigilator Inspection:** Open `/admin/monitoring` to review the candidate's real-time warning logs and strike reasons.
2. **Administrative Technical Exception:** Click **"Grant Exception"** on the candidate's row.
3. **Mandatory Audit Logging:** Provide an operational justification (e.g., "Lab PC rebooted due to UPS glitch").
4. **Session Restoration:**
   - Clears `is_terminated` flag.
   - Restores session status (`phase1_in_progress` or `phase2_in_progress`).
   - Resets warnings to `DEFAULT_WARNING_THRESHOLD - 1` (allowing 1 final warning before re-termination).
   - Preserves all historical answers, code drafts, and past monitoring events.

---

## 5. Safe Export of Student Submissions & Merit List

### 5.1 Merit List CSV Export
- **Route:** `/api/admin/results/export`
- **Security Features:**
  - **Formula Injection Neutralization:** Any cell beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically prepended with a single quote (`'`), preventing malicious code execution in Microsoft Excel and LibreOffice Calc.
  - **UTF-8 BOM:** File begins with `\uFEFF` to ensure Hindi characters and Indian names render properly across all spreadsheet software.
  - **Fields Included:** Rank, Student Name, Roll Number, Course, Participant ID, Phase 1 Score (80M), Problem 1 Score (10M), Problem 2 Score (10M), Final Total (100M), Category, Verification Code, Finalized At.

---

## 6. Pre-Competition Day Operational Checklist

- [ ] **T-24h Database Backup:** Run `node scripts/backup-database.mjs` and confirm file generation in `backups/`.
- [ ] **Competition State Check:** Verify competition status in `/admin/settings` is set to `Ready`.
- [ ] **Question Bank Verification:** Confirm exactly 40 active questions totaling 80 marks in `/admin/questions`.
- [ ] **Coding Problems Verification:** Confirm all 16 coding problems across categories have sample cases and 5 hidden test cases each.
- [ ] **Student Roster Import:** Confirm candidate count, roll numbers, and credential delivery in `/admin/students`.
- [ ] **Piston / Sandbox Execution Check:** Test execution across all tracks (Python, C, C++, Java, Node.js).
- [ ] **Lab Browser Preparation:** Ensure student lab machines run modern Chromium/Firefox browsers with Fullscreen API support and cookies enabled.

