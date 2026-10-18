# LNMCBM CODETHON 2026: OFFICIAL COMPETITION-DAY CHECKLIST
**Lalit Narayan Mishra College of Business Management, Muzaffarpur**  
*Operating Runbook & Safety Checklist for Exam Controllers, Administrators, and Invigilators*

```
================================================================================
CONTEST:       LNMCBM Inter-Course Coding Championship (Codethon 2026)
VENUE:         Computer Applications Laboratories (Lab 1, Lab 2 & Lab 3)
STRUCTURE:     Phase 1: 40 MCQs (45 Mins, 80 Marks)
               Phase 2: 2 Coding Problems (30 Mins, 20 Marks)
TOTAL:         100 Maximum Marks
================================================================================
```

---

## I. BEFORE THE EVENT (PRE-CONTEST READINESS)

### Phase 1: Student Roster & Credential Provisioning
- [ ] **1.1 Confirm Final Student List:** Receive verified list of enrolled BCA and MCA candidates from the Department of Computer Applications.
- [ ] **1.2 Import Student Roster:**
  - Navigate to `/admin/students` -> Click **"Import CSV"**.
  - Upload candidate CSV (`Name, Roll_Number, Course, Email, Mobile`).
  - Confirm imported candidate count matches the official roll roster.
- [ ] **1.3 Verify Account Creation:**
  - Verify every imported candidate has an auto-assigned Participant ID (e.g., `LNMC-COD-001`).
  - Verify account status displays as `Active`.
- [ ] **1.4 Generate & Deliver Credentials:**
  - Select all candidates -> Click **"Generate Credentials"**.
  - Ensure 8-character temporary passwords (cryptographically random, unambiguous characters `A-Z`, `a-z`, `2-9`) are issued.
  - Send transactional emails or distribute physical sealed slips for lab candidates.
  - Review `/api/admin/students/email-logs` for any failed deliveries and click **"Retry"** if needed.

### Phase 2: Examination Content & Rules Configuration
- [ ] **2.1 Verify MCQ Question Bank (`/admin/questions`):**
  - Verify **exactly 40 questions** are published and enabled:
    - *Fundamentals:* 10 questions (20 marks)
    - *Technical Understanding:* 10 questions (20 marks)
    - *Logic and Debugging:* 10 questions (20 marks)
    - *Case Study:* 10 questions (20 marks, 2 case-study passages with 5 questions each)
  - Verify **Total Phase 1 Marks = 80**.
- [ ] **2.2 Verify Coding Question Bank (`/admin/coding-problems`):**
  - Verify coding problems are seeded across all 6 tracks:
    - *C Track:* 2 problems (10 marks each = 20 marks)
    - *C++ Track:* 2 problems (10 marks each = 20 marks)
    - *Java Track:* 2 problems (10 marks each = 20 marks)
    - *Python Track:* 2 problems (10 marks each = 20 marks)
    - *Web Development Track:* 2 problems (JavaScript algorithms, 20 marks)
    - *DSA Track:* Problem suites allocated for C, C++, and Java selections.
  - Verify all problems contain public sample test cases and 5 hidden test cases (2 marks each).
- [ ] **2.3 Test Code Execution Service:**
  - Execute sample runs across all languages (`Python`, `C`, `C++`, `Java`, `JavaScript`).
  - Confirm sandbox execution response times are under 1.5 seconds.
  - If self-hosting Piston, verify Docker container is running: `docker ps | grep piston`.
- [ ] **2.4 Verify Timers & Parameters (`/admin/settings`):**
  - Phase 1 Duration: `45` minutes.
  - Phase 2 Duration: `30` minutes.
  - Fullscreen Warning Threshold: `3` strikes before automatic termination.
  - Results Publication: `Disabled (Unpublished)`.
  - Competition Status: Set to **`Ready`** or **`In Progress`**.
- [ ] **2.5 Export Pre-Contest Database Backup:**
  - Run `node scripts/backup-database.mjs`.
  - Confirm generated JSON snapshot in `backups/backup-lnmcbm-codethon-<timestamp>.json`.
- [ ] **2.6 Conduct Mock Test:**
  - Run 2-3 sample test sessions on representative lab computers (Windows and macOS).
  - Verify login, fullscreen prompt, answer autosave, Monaco editor rendering, and submission.

---

## II. DURING THE EVENT (LIVE MONITORING RUNBOOK)

- [ ] **3.1 Live Monitoring Desk (`/admin/monitoring`):**
  - Keep the Monitoring dashboard open on the Exam Controller console.
  - Watch the real-time summary: Total Active, Terminated Attempts, Recent Warning Events.
- [ ] **3.2 Proctoring & Warning Threshold Management:**
  - Strike 1: Informational amber warning banner on student screen.
  - Strike 2: Severe red warning modal on student screen (1 violation remaining).
  - Strike 3: Automatic termination. Candidate screen locks, session status updates to `terminated`, and remaining answers are preserved.
- [ ] **3.3 Handling Technical Incidents (Administrative Technical Exceptions):**
  - If a student experiences genuine hardware failure, power trip, or accidental browser crash:
    1. Verify incident physically at the student's terminal.
    2. In `/admin/monitoring`, locate student's row -> Click **"Grant Exception"**.
    3. Enter mandatory operational reason (e.g., *"UPS glitch on Terminal Lab-2-PC-14, verified by invigilator Prof. Sharma"*).
    4. Confirm restoration: candidate's session is restored with 1 strike remaining (`warnings = 2`), preserving all previously autosaved answers and time.
- [ ] **3.4 Execution Health & Safety Rules:**
  - **CRITICAL:** **NEVER edit competition durations, question marks, or category rules while an exam session is actively running.**
  - Monitor code execution response times; ensure students do not spam the "Run" button (1.5-second rate limiter protects the sandbox).

---

## III. AFTER THE EVENT (EVALUATION, MERIT LIST & PUBLICATION)

- [ ] **4.1 Verify All Session Expirations:**
  - Confirm the 30-minute Phase 2 timer has elapsed for all student terminals.
  - Check `/admin/monitoring` to ensure no active sessions remain in `phase2_in_progress`.
- [ ] **4.2 Bulk Result Finalization (`/admin/results`):**
  - Click **"Finalize All Results"**.
  - System evaluates all Phase 1 MCQ answers against official keys (Max 80 marks).
  - System sums Phase 2 coding evaluations (Problem 1: Max 10 marks + Problem 2: Max 10 marks).
  - Calculates final total score (Max 100 marks).
  - Executes tie-breaking rules:
    1. Higher Phase 2 Coding Score.
    2. Earlier Submission Timestamp.
- [ ] **4.3 Post-Contest Database Snapshot:**
  - Run `node scripts/backup-database.mjs` immediately after finalization.
  - Verify backup contains all scored records and logs.
- [ ] **4.4 Export Official Merit List CSV:**
  - Click **"Export CSV"** in `/admin/results`.
  - Verify downloaded file has UTF-8 BOM, sanitized formula characters, and verified ranks 1 through N.
  - Submit printed copy to College Examination Committee for formal signing.
- [ ] **4.5 Publish Results:**
  - Once signed by College Authority, navigate to `/admin/settings`.
  - Toggle **"Publish Results"** to `Enabled` -> Click **"Save Settings"**.
  - Students can now view their official scorecards, breakdown, and digital verification QR codes.
- [ ] **4.6 Scorecard Verification:**
  - Test public verification on sample verification IDs: `/verify/[verificationId]`.
  - Confirm candidate privacy is maintained (Roll and ID masked as `24***01`).

---

## IV. EMERGENCY CONTACTS & CONTROLLER DIRECTORY

| Role | Designation | Contact Email | Extension |
| :--- | :--- | :--- | :--- |
| **Chief Exam Controller** | Head of Dept (CA) | `controller@lnmcbm.ac.in` | Ext. 101 |
| **Technical System Admin** | Server Administrator | `sysadmin@lnmcbm.ac.in` | Ext. 104 |
| **Lab 1 Invigilator** | Assistant Professor | `lab1.exam@lnmcbm.ac.in` | Lab 1 Desk |
| **Lab 2 Invigilator** | Assistant Professor | `lab2.exam@lnmcbm.ac.in` | Lab 2 Desk |
| **Lab 3 Invigilator** | Assistant Professor | `lab3.exam@lnmcbm.ac.in` | Lab 3 Desk |

*Print this checklist and retain a physical signed copy in the Central Examination Control Room.*

