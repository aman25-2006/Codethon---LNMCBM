# College Coding Competition Portal
**Lalit Narayan Mishra College of Business Management (LNMCBM), Muzaffarpur**  
*An Institutional, Proctored Web Platform for Academic Coding Contests & Technical Examinations*

---

## 📖 1. Project Overview

The **LNMCBM College Coding Competition Portal** is a production-grade, secure, browser-based examination portal engineered for institutional programming contests. It provides a structured, 100-mark evaluation divided into two strictly proctored phases:

1. **Phase 1: Multiple Choice Questions (MCQ)**
   - **40 Questions | 80 Marks | 45-Minute Server-Authoritative Timer**
   - Covers: *Fundamentals* (10 questions, 20M), *Technical Understanding* (10 questions, 20M), *Logic & Debugging* (10 questions, 20M), and *Case Study Passages* (10 questions across 2 passages, 20M).
   - Instant answer autosave, deterministic randomization, review flags, and confidential scoring.
2. **Phase 2: Live Programming Round**
   - **2 Problems | 20 Marks (10M each) | 30-Minute Timer**
   - Multi-Track Support: C, C++, Java, Python, Web Development (JavaScript), or Data Structures & Algorithms (DSA in C/C++/Java).
   - Powered by Monaco Code Editor with starter code, compilation diagnostics, and automated server-side evaluation against 5 hidden test cases per problem.
3. **Total Assessment: 100 Marks**
   - Automated rank compilation with tie-breaking rules, digital scorecard verification QR codes, and tamper-resistant CSV exports.

---

## 🛠️ 2. Technology Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict type checking)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) with [Lucide React](https://lucide.dev/)
- **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`)
- **Database & Auth:** [Supabase](https://supabase.com/) PostgreSQL with Row Level Security (RLS)
- **Code Execution Sandbox:** Multi-tier engine supporting local process isolation, [Piston API v2](https://github.com/engineer-man/piston), and Judge0 CE
- **Transactional Email:** [Resend](https://resend.com/) API (with transparent dev outbox fallback)
- **Deployment Platform:** [Vercel](https://vercel.com/) (Edge Network + Serverless Node.js Runtimes)

---

## 💻 3. Local Development Setup

### Prerequisites
- **Node.js:** Version 18.17+ or 20+ (Check with `node -v`)
- **Package Manager:** `npm` (bundled with Node.js)
- **Git:** Version Control (optional for local testing)

### Step-by-Step Installation
1. **Clone or Navigate to the Project:**
   ```powershell
   cd "d:\Codethon - LNMCBM"
   ```
2. **Install Dependencies:**
   ```powershell
   npm install
   ```
3. **Create Environment File:**
   ```powershell
   Copy-Item .env.example .env.local
   ```
4. **Start the Development Server:**
   ```powershell
   npm run dev
   ```
5. **Open in Browser:**
   Visit [http://localhost:3000](http://localhost:3000).

---

## 🔑 4. Environment Variables Reference

Configure these in `.env.local` for local execution or under **Project Settings -> Environment Variables** in Vercel:

| Variable Name | Required | Safe for Client? | Purpose | Example Value |
| :--- | :---: | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Canonical domain for redirects & cookies | `http://localhost:3000` or `https://codethon.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Public Supabase project REST endpoint | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Public anon key (enforces RLS) | `eyJhbGciOiJIUz...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **NO (Server Only)** | Secret key bypassing RLS for admin/scoring | `eyJhbGciOiJIUz...` |
| `ADMIN_INITIAL_EMAIL` | Yes | **NO (Server Only)** | Master exam controller login email | `admin@lnmcbm.ac.in` |
| `ADMIN_INITIAL_PASSWORD` | Yes | **NO (Server Only)** | Master exam controller temporary password | `AdminLNMCBM2026!` |
| `RESEND_API_KEY` | Optional | **NO (Server Only)** | Resend transactional email API key | `re_1234567890abcdef` |
| `RESEND_FROM_EMAIL` | Optional | **NO (Server Only)** | Sender address for credential emails | `"LNMCBM Exams <exams@yourdomain.com>"` |
| `PISTON_API_URL` | Optional | **NO (Server Only)** | Piston cloud execution engine URL | `https://emkc.org/api/v2/piston/execute` |
| `PARTICIPANT_ID_PREFIX` | Optional | **NO (Server Only)** | Prefix for student participant IDs | `LNMC-COD` |

> [!WARNING]
> Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` through any variable prefixed with `NEXT_PUBLIC_`.

---

## 🗄️ 5. Database Setup & Migrations (Supabase)

The database schema, constraints, and Row Level Security policies are located in `supabase/migrations/`:

1. **Create Supabase Project:**
   - Log into [Supabase](https://supabase.com) -> Click **"New Project"**.
   - Region: Select closest region (e.g. `Mumbai (ap-south-1)`).
2. **Execute Schema Migration:**
   - Go to **SQL Editor** in the Supabase Dashboard.
   - Copy and paste contents of [`supabase/migrations/20261018000001_initial_schema.sql`](supabase/migrations/20261018000001_initial_schema.sql) -> Click **"Run"**.
   - Creates all 16 core tables: `students`, `profiles`, `competition_settings`, `mcq_questions`, `mcq_options`, `mcq_answer_keys`, `exam_sessions`, `mcq_answers`, `coding_problems`, `hidden_test_cases`, `coding_submissions`, `submission_evaluations`, `monitoring_events`, `final_results`, `email_delivery_logs`, `audit_logs`.
3. **Execute Row Level Security (RLS) Migration:**
   - In SQL Editor, run [`supabase/migrations/20261018000002_row_level_security.sql`](supabase/migrations/20261018000002_row_level_security.sql).
   - Secures every table with strict zero-trust policies (`is_admin()` and `current_student_id()`).
4. **Seed Sample Data (Optional for testing):**
   - Run [`supabase/seed.sql`](supabase/seed.sql) to populate 40 sample MCQs (80M) and coding problems.

---

## 👑 6. Administrator Bootstrap

To initialize the primary administrator account:
1. In the Supabase Dashboard, go to **Authentication -> Users** -> Click **"Add user"**.
2. Enter email: `admin@lnmcbm.ac.in` and set a secure password.
3. Check **"Auto Confirm User"**.
4. Copy the newly created User ID (UUID).
5. In SQL Editor, run:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   VALUES ('<COPIED-USER-UUID>', 'admin@lnmcbm.ac.in', 'Master Exam Controller', 'admin')
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```
6. Access the administrator portal at [http://localhost:3000/login/admin](http://localhost:3000/login/admin).

---

## 📋 7. CSV Import Formats

### 7.1 Student Roster CSV Format (`/admin/students`)
```csv
Name,Roll_Number,Course,Email,Mobile
Aman Kumar,24BCA001,BCA,aman.kumar@example.com,9876543210
Priya Singh,24MCA015,MCA,priya.singh@example.com,9876543211
Rohit Sharma,24BCA042,BCA,rohit.sharma@example.com,9876543212
```
*Note: Header row is required. Course must be `BCA` or `MCA`.*

### 7.2 MCQ Question Bank CSV Format (`/admin/questions`)
```csv
Question_Text,Category,Option_A,Option_B,Option_C,Option_D,Correct_Option,Marks,Explanation,Case_Study_Passage
What is the time complexity of binary search?,Fundamentals,O(1),O(log n),O(n),O(n^2),B,2,Binary search halves the search space each step.,
In SQL, which clause filters rows after GROUP BY?,Technical Understanding,WHERE,ORDER BY,HAVING,LIMIT,C,2,HAVING applies to aggregated groups.,
```
*Note: Category must be one of: `Fundamentals`, `Technical Understanding`, `Logic and Debugging`, or `Case Study`.*

---

## 📧 8. Transactional Email Configuration (Resend)

Student credentials (Roll number + 8-char temporary password) are dispatched via transactional email:
1. Create a free account at [Resend](https://resend.com).
2. Generate an API Key (starts with `re_...`) and add it to `.env.local` as `RESEND_API_KEY`.
3. Add and verify your college domain (e.g., `lnmcbm.ac.in`) in Resend Domains, and set `RESEND_FROM_EMAIL="LNMCBM Exam Controller <exams@lnmcbm.ac.in>"`.
4. **Development / Fallback Mode:** When `RESEND_API_KEY` is unset or invalid, the portal transparently logs credential emails to an internal outbox, viewable at `/api/admin/students/email-logs` without crashing.

---

## ⚡ 9. Code Execution Setup (Multi-Tier Sandbox)

The platform evaluates code across C, C++, Java, Python, and JavaScript:

- **Tier 1 (Host Compilers - Offline):** If GCC/G++, Python 3, Node.js, or JDK are installed on the server, code runs in ephemeral sandbox folders with strict timeouts (3,000ms) and stripped environment variables.
- **Tier 2 (Piston Cloud API - Recommended for Production):**
  - **Public Endpoint:** `https://emkc.org/api/v2/piston/execute` (requires 0 API keys; rate limits apply).
  - **Self-Hosted Docker (Zero Quotas - Ideal for 100 Students):**
    ```bash
    docker run -d -p 2000:2000 ghcr.io/engineer-man/piston
    ```
    Set `PISTON_API_URL=http://<YOUR-SERVER-IP>:2000/api/v2/execute`.
- **Tier 3 (Judge0 CE - RapidAPI Alternative):** Set `JUDGE0_API_URL` and `JUDGE0_API_KEY` in `.env.local`.

---

## 🚀 10. Vercel Production Deployment Guide

Deploying the competition portal to Vercel takes under 5 minutes:

### Step 1: Connect GitHub Repository
1. Push your sanitized codebase to a private GitHub repository.
2. Log into [Vercel](https://vercel.com) -> Click **"Add New Project"**.
3. Import your GitHub repository.

### Step 2: Configure Environment Variables in Vercel
In the Vercel project configuration screen, expand **Environment Variables** and add:
- `NEXT_PUBLIC_APP_URL` = `https://<YOUR-PROJECT-NAME>.vercel.app`
- `NEXT_PUBLIC_SUPABASE_URL` = `https://<YOUR-PROJECT-REF>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOi...`
- `ADMIN_INITIAL_EMAIL` = `admin@lnmcbm.ac.in`
- `ADMIN_INITIAL_PASSWORD` = `<YOUR-STRONG-PASSWORD>`
- `RESEND_API_KEY` = `re_...`
- `RESEND_FROM_EMAIL` = `LNMCBM Exam Controller <exams@yourdomain.com>`
- `PISTON_API_URL` = `https://emkc.org/api/v2/piston/execute` (or your private runner)

### Step 3: Deploy & Verify
1. Click **"Deploy"**. Vercel will run `npm run build` and provision serverless functions.
2. Once deployed, open the URL and test the admin login at `/login/admin`.
3. In Supabase Dashboard -> **Authentication -> URL Configuration**, add your Vercel URL to **Site URL** and **Redirect URLs**.

---

## 🧪 11. Automated Testing & Verification Commands

All phases include standalone verification scripts:

| Command | Target Verification | Expected Result |
| :--- | :--- | :--- |
| `npm run lint` | ESLint static code analysis | `✔ No ESLint warnings or errors` |
| `npx tsc --noEmit` | Strict TypeScript compiler check | Exits 0 with 0 type errors |
| `npm run build` | Next.js production build | All 19 routes compile cleanly |
| `node test-phase-m.mjs` | Phase M Full Platform Audit | 93 / 93 assertions passed |
| `node load-test-100-students.mjs` | 100-student concurrency benchmark | 100/100 logins, 400 saves, 0 errors |
| `node scripts/backup-database.mjs` | Database snapshot export | Creates full timestamped JSON backup |

---

## ⚠️ 12. Known Limitations & Operational Considerations

1. **Browser Proctoring Scope:** Browser web applications cannot lock down local OS hotkeys (e.g. `Alt+Tab`, `Win+Key`). Fullscreen monitoring and window-blur tracking are enforced with transparent student notification and an administrative technical exception recovery workflow.
2. **Public Piston Rate Limits:** The public Piston endpoint (`emkc.org`) is rate-limited. For 100 concurrent students executing code simultaneously on competition day, running a self-hosted Piston container via Docker or an isolated VPS runner is strongly advised.
3. **Upstream Punycode Warning:** In local development mode on Node.js 21+, an informational `punycode` deprecation notice from Next.js 14 may appear. This does not affect production builds.

---

## 🔧 13. Troubleshooting Common Issues

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **"Cannot connect to Supabase"** | Missing or incorrect `.env.local` keys | Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. |
| **"Rate limit exceeded (HTTP 429)"** | Code Run clicked within 1.5 seconds | Wait 2 seconds between test runs; rate limiter protects server. |
| **"Student exam already terminated"** | Candidate accumulated 3 fullscreen strikes | Invigilator can grant an administrative exception via `/admin/monitoring`. |
| **"Email provider not configured"** | `RESEND_API_KEY` not set in `.env.local` | Add key, or view simulated dispatches in `/api/admin/students/email-logs`. |
| **"Formula injection warning in Excel"** | Precautionary CSV sanitization prefix (`'`) | Normal security behavior; ensures cells starting with `=`, `@`, or `+` cannot execute shell macros. |

---

## 🏛️ Institutional Information

- **Institution:** Lalit Narayan Mishra College of Business Management (LNMCBM)
- **Location:** Bhagwanpur Chowk, Muzaffarpur, Bihar - 842001
- **Event:** Inter-Course Coding Championship (Codethon 2026)
- **Technical Desk:** `exams@lnmcbm.ac.in`
