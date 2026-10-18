# Supabase PostgreSQL Database Setup & Security Guide
**College Coding Competition Portal — Lalit Narayan Mishra College of Business Management (LNMCBM)**

This guide walks you through setting up the remote Supabase database, executing the migration scripts, establishing Row Level Security (RLS), and bootstrapping your initial administrator account.

---

## 1. Create a Supabase Project

1. Visit [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **"New Project"**.
3. Select your organization and enter:
   - **Name:** `LNMCBM-Codethon-Portal` (or your preferred name)
   - **Database Password:** Enter a strong, memorable database password.
   - **Region:** Choose the region closest to your campus (e.g., `ap-south-1` Mumbai for India).
4. Click **"Create new project"** and wait approximately 1-2 minutes for provisioning to complete.

---

## 2. Obtain Your Supabase Credentials

1. In the Supabase Dashboard sidebar, navigate to **Project Settings** (gear icon) -> **API**.
2. Under **Project URL**, copy the URL (e.g. `https://xyzcompany.supabase.co`).
3. Under **Project API Keys**:
   - Copy the **`anon` `public`** key (Safe for browser/client).
   - Copy the **`service_role` `secret`** key (Confidential: server-side only).

---

## 3. Configure Local Environment Variables

1. In your local project directory (`d:\Codethon - LNMCBM`), create your `.env.local` file from `.env.example`:
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. Open `.env.local` and paste your copied credentials:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

   # Master admin bootstrap account
   ADMIN_INITIAL_EMAIL=admin@lnmcbm.ac.in
   ADMIN_INITIAL_PASSWORD=YourSecureMasterPassword2026!
   ```
3. **Important:** `.env.local` is listed in `.gitignore` and must **never** be committed to GitHub.

---

## 4. Execute Database Migrations

You can run the SQL migrations directly in the Supabase Dashboard:

1. In your Supabase Dashboard, click on **"SQL Editor"** in the left sidebar.
2. Click **"New query"**.
3. Open `supabase/migrations/20261018000001_initial_schema.sql` on your machine, copy all contents, paste into the SQL Editor, and click **"Run"**.
   - *Verification:* Go to **Table Editor** — you should see all 16 tables (`profiles`, `students`, `competition_settings`, `mcq_questions`, `mcq_options`, `mcq_answer_keys`, `exam_sessions`, `mcq_answers`, `coding_problems`, `hidden_test_cases`, `coding_submissions`, `submission_evaluations`, `monitoring_events`, `final_results`, `email_delivery_logs`, `audit_logs`).
4. Click **"New query"** again.
5. Open `supabase/migrations/20261018000002_row_level_security.sql`, paste into the SQL Editor, and click **"Run"**.
   - *Verification:* Go to **Authentication** -> **Policies** — you will see green badges indicating Row Level Security is active on every table.
6. *(Optional for local dev testing)*: You may execute `supabase/seed.sql` to populate 40 sample MCQs (80 marks) and sample coding problems.

---

## 5. Row Level Security (RLS) Verification

Our architecture enforces database-level defense-in-depth:

| Table | Student Access | Admin Access | Security Rationale |
| :--- | :--- | :--- | :--- |
| `mcq_questions` | Active questions only | Full Access | Candidates see questions only during active contest. |
| `mcq_options` | Option keys & text | Full Access | Displays choices A, B, C, D. |
| `mcq_answer_keys` | **0 Access (BLOCKED)** | Full Access | Correct options & explanations are in a separate table; students cannot query them. |
| `hidden_test_cases`| **0 Access (BLOCKED)** | Full Access | Test inputs & expected outputs never leak to client bundles or network requests. |
| `exam_sessions` | Own session only | Full Access | Students cannot see other candidate sessions. |
| `submission_evaluations` | Read-only own results | Full Access | Marks can only be written by admin or server execution worker. |
| `final_results` | Own record ONLY IF `is_published = true` | Full Access | Prevents premature score disclosure before both phases conclude. |
| `profiles` | Own profile (read-only role) | Full Access | Self-promotion trigger blocks unauthorized elevation to `admin`. |

---

## 6. How to Bootstrap the First Administrator Account

When starting with a fresh Supabase database:

1. In Supabase Dashboard, go to **Authentication** -> **Users** -> **"Add user"**.
2. Enter your administrator email (e.g., `admin@lnmcbm.ac.in`) and a secure password.
3. Check **"Auto Confirm User"** so no verification email is required for the admin.
4. Copy the generated User UID (e.g. `a1b2c3d4-e5f6-...`).
5. Open **SQL Editor** and run:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   VALUES (
     'YOUR-COPIED-USER-UID-HERE',
     'admin@lnmcbm.ac.in',
     'Master Exam Controller',
     'admin'
   )
   ON CONFLICT (id) DO UPDATE SET role = 'admin';
   ```
6. Now this account is granted complete administrator privileges across all database tables and the admin operations desk!

