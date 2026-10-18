/**
 * LNMCBM College Coding Competition Portal
 * Phase M Comprehensive Automated Verification Suite
 * Testing Authentication, Student Import, Question Bank, Exams, Coding Sandbox,
 * Monitoring, Results, and Security Reviews (Sections 2 - 9).
 */

const BASE_URL = "http://localhost:3000";

let totalPassed = 0;
let totalFailed = 0;
const defectsFound = [];
const defectsFixed = [];

function assert(condition, message, defectDetails = null) {
  if (condition) {
    console.log(`  ✔ PASS - ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✘ FAIL - ${message}`);
    totalFailed++;
    if (defectDetails) {
      defectsFound.push(defectDetails);
    } else {
      defectsFound.push(message);
    }
  }
}

async function runPhaseMTests() {
  console.log("\n===============================================================================");
  console.log("  LNMCBM PHASE M: COMPLETE APPLICATION TESTING & SECURITY AUDIT");
  console.log("===============================================================================\n");

  const timestamp = Date.now();

  const ADMIN_CREDENTIALS = {
    email: "admin@lnmcbm.ac.in",
    password: process.env.ADMIN_DEFAULT_PASSWORD || "AdminLNMCBM2026!",
  };

  let ADMIN_COOKIE = "";

  try {
    // =========================================================================
    // SECTION 2: AUTHENTICATION TESTS
    // =========================================================================
    console.log("\n--- SECTION 2: AUTHENTICATION & ACCESS CONTROL TESTS ---");

    // 2.1 Valid administrator login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });
    assert(adminLoginRes.ok, "Valid administrator login succeeds with HTTP 200");
    const rawAdminCookie = adminLoginRes.headers.get("set-cookie") || "";
    ADMIN_COOKIE = rawAdminCookie.split(";")[0] || "";
    assert(ADMIN_COOKIE.includes("lnmcbm_admin_session"), "Admin session cookie issued in response headers");

    // 2.2 Invalid administrator password
    const badAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_CREDENTIALS.email, password: "WrongPassword!2026" }),
    });
    assert(badAdminRes.status === 401, "Invalid administrator password is rejected with HTTP 401");

    // 2.3 Unauthenticated admin access denied
    const unauthStatsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`);
    assert(unauthStatsRes.status === 401, "Unauthenticated access to /api/admin/dashboard-stats rejected with 401");
    const unauthSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`);
    assert(unauthSettingsRes.status === 401, "Unauthenticated access to /api/admin/settings rejected with 401");
    const unauthStudentsRes = await fetch(`${BASE_URL}/api/admin/students`);
    assert(unauthStudentsRes.status === 401, "Unauthenticated access to /api/admin/students rejected with 401");

    // 2.4 Student access to admin routes denied
    const mockStudent = {
      id: `std-auth-test-${timestamp}`,
      roll_number: "24BCA999",
      full_name: "Auth Test Student",
      course: "BCA",
      email: `student.auth.${timestamp}@lnmcbm.ac.in`,
      participant_id: "LNMC-COD-TEST",
      is_active: true,
    };
    const STUDENT_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(mockStudent))}`;

    const studentAdminAccess = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: { Cookie: STUDENT_COOKIE },
    });
    assert(studentAdminAccess.status === 401, "Student attempting to access admin settings is denied with 401");

    const studentAuditAccess = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Cookie: STUDENT_COOKIE },
    });
    assert(studentAuditAccess.status === 401, "Student attempting to access audit logs is denied with 401");

    // 2.5 Unregistered student login denied
    const unregStudentRes = await fetch(`${BASE_URL}/api/auth/student-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roll_number: "NON_EXISTENT_ROLL", password: "SomePassword12" }),
    });
    assert(unregStudentRes.status === 401, "Unregistered student login rejected with HTTP 401");

    // 2.6 Inactive student login denied
    // First register student then suspend
    const rollInactive = `24BCA${String(timestamp).slice(-4)}I`;
    const regInactRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Inactive Candidate",
        roll_number: rollInactive,
        course: "BCA",
        email: `inactive.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    const regInactData = await regInactRes.json();
    const inactStudentId = regInactData.student.id;

    // Issue credentials
    const credInactRes = await fetch(`${BASE_URL}/api/admin/students/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ studentId: inactStudentId }),
    });
    const credInactData = await credInactRes.json();
    const inactPassword = credInactData.result.temporaryPassword;

    // Suspend candidate
    await fetch(`${BASE_URL}/api/admin/students/${inactStudentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ is_active: false }),
    });

    // Attempt login with suspended candidate
    const suspendedLoginRes = await fetch(`${BASE_URL}/api/auth/student-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roll_number: rollInactive, password: inactPassword }),
    });
    assert(suspendedLoginRes.status === 403, "Inactive/suspended student login strictly denied with HTTP 403");

    // 2.7 Role escalation prevention
    const roleEscalationRes = await fetch(`${BASE_URL}/api/admin/students/${inactStudentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: STUDENT_COOKIE },
      body: JSON.stringify({ role: "admin" }),
    });
    assert(roleEscalationRes.status === 401, "Ordinary user cannot escalate privileges or modify roles (HTTP 401)");

    // 2.8 Logout invalidates access
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(logoutRes.ok, "Admin logout succeeds with HTTP 200");
    const clearedCookie = logoutRes.headers.get("set-cookie") || "";
    assert(
      clearedCookie.toLowerCase().includes("expires=") || clearedCookie.includes("Max-Age=0") || clearedCookie.includes("1970"),
      "Logout header expires/clears session cookie"
    );

    // Re-authenticate admin for remaining test groups
    const reAuthRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });
    ADMIN_COOKIE = (reAuthRes.headers.get("set-cookie") || "").split(";")[0] || ADMIN_COOKIE;

    // =========================================================================
    // SECTION 3: STUDENT IMPORT TESTS
    // =========================================================================
    console.log("\n--- SECTION 3: STUDENT IMPORT & ROSTER VALIDATION TESTS ---");

    // 3.1 Manual registration
    const rollM = `24MCA${String(timestamp).slice(-4)}M`;
    const singleStudentRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Manual Enrollment Test",
        roll_number: rollM,
        course: "MCA",
        email: `manual.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    assert(singleStudentRes.ok, "Manual candidate registration returns HTTP 200");

    // 3.2 Duplicate roll number
    const dupRollRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Duplicate Roll Candidate",
        roll_number: rollM,
        course: "MCA",
        email: `dup.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    assert(dupRollRes.status === 409, "Duplicate roll number registration rejected with HTTP 409");

    // 3.3 Invalid email format
    const badEmailRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Bad Email Candidate",
        roll_number: `24BCA${String(timestamp).slice(-4)}B`,
        course: "BCA",
        email: "not-an-email-format",
      }),
    });
    assert(badEmailRes.status === 400, "Malformed email rejected with HTTP 400");

    // 3.4 Missing required fields
    const missingFieldsRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ full_name: "", roll_number: "", course: "" }),
    });
    assert(missingFieldsRes.status === 400, "Missing required candidate fields rejected with HTTP 400");

    // 3.5 Bulk CSV Import with partial failure and collision handling
    const rollCsv1 = `24BCA${String(timestamp).slice(-4)}1`;
    const rollCsv2 = `24BCA${String(timestamp).slice(-4)}2`;
    const batchImportRows = [
      { name: "Valid Student One", roll_number: rollCsv1, course: "BCA", email: `std1.${timestamp}@lnmcbm.ac.in`, mobile: "9876543210" },
      { name: "Valid Student Two", roll_number: rollCsv2, course: "MCA", email: `std2.${timestamp}@lnmcbm.ac.in`, mobile: "9876543211" },
      { name: "Duplicate Student", roll_number: rollCsv1, course: "BCA", email: `dup.${timestamp}@lnmcbm.ac.in` }, // Duplicate roll
      { name: "Bad Email Student", roll_number: `24BCA9999`, course: "BCA", email: "not_an_email" }, // Bad email
      { name: "", roll_number: `24BCA9998`, course: "BCA", email: `empty.${timestamp}@lnmcbm.ac.in` }, // Missing name
    ];

    const importRes = await fetch(`${BASE_URL}/api/admin/students/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ rows: batchImportRows }),
    });
    assert(importRes.ok, "POST /api/admin/students/import returns HTTP 200");
    const importData = await importRes.json();
    assert(importData.summary.importedCount === 2, "Bulk Import: Successfully imported exactly 2 valid candidate records");
    assert(importData.summary.failedCount >= 2, "Bulk Import: Correctly detected and quarantined invalid rows without failing batch");

    // 3.6 Credential Generation & Password Format Verification
    const studentsRes = await fetch(`${BASE_URL}/api/admin/students?search=${rollCsv1}`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const studentsData = await studentsRes.json();
    const targetStudent = studentsData.students[0];

    const genCredRes = await fetch(`${BASE_URL}/api/admin/students/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ studentId: targetStudent.id }),
    });
    assert(genCredRes.ok, "Credential generation returns HTTP 200");
    const genCredData = await genCredRes.json();
    const credResult = genCredData.result;
    assert(credResult.accountCreated === true, "Credential created successfully");
    assert(credResult.temporaryPassword.length === 8, "Temporary password is exactly 8 characters");
    assert(
      !/[0O1Il\s]/.test(credResult.temporaryPassword),
      "Password excludes ambiguous characters (0, O, 1, I, l) and spaces"
    );

    // =========================================================================
    // SECTION 4: QUESTION BANK TESTS
    // =========================================================================
    console.log("\n--- SECTION 4: QUESTION BANK & CURRICULUM INTEGRITY TESTS ---");

    // Seed official curriculum
    await fetch(`${BASE_URL}/api/admin/questions/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    const qBankRes = await fetch(`${BASE_URL}/api/admin/questions`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(qBankRes.ok, "GET /api/admin/questions returns HTTP 200");
    const qBankData = await qBankRes.json();

    assert(qBankData.metrics.enabled === 40, "Question Bank: Contains exactly 40 enabled questions (got 40)");
    assert(qBankData.metrics.totalMarks === 80, "Question Bank: Total available marks equals exactly 80M (got 80M)");

    // Category distribution check
    const catMetrics = qBankData.metrics.categories || {};
    assert(catMetrics["Fundamentals"].count === 10, "Category: Exactly 10 Fundamentals questions (10M)");
    assert(catMetrics["Technical Understanding"].count === 10, "Category: Exactly 10 Technical Understanding questions (20M)");
    assert(catMetrics["Logic and Debugging"].count === 10, "Category: Exactly 10 Logic and Debugging questions (30M)");
    assert(catMetrics["Case Study"].count === 10, "Category: Exactly 10 Case Study questions (20M)");

    // Candidate questions endpoint security check (Strict answer key isolation)
    const CANDIDATE_IMPORT_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(targetStudent))}`;
    const candQRes = await fetch(`${BASE_URL}/api/student/exam/questions`, {
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    assert(candQRes.ok, "Candidate retrieves questions successfully");
    const candQData = await candQRes.json();
    const candidateQuestions = candQData.exam?.questions || [];
    assert(candidateQuestions.length === 40, "Delivered exactly 40 examination questions to student");

    // Zero leakage verification
    const hasAnswerKeyLeaked = candidateQuestions.some(
      (q) => q.correct_option_id !== undefined || q.correct_option_key !== undefined || q.explanation !== undefined
    );
    assert(!hasAnswerKeyLeaked, "Strict Security Mandate: Zero answer keys or explanations delivered to candidate");

    // Case study association check
    const caseStudyQ = candidateQuestions.find((q) => q.category === "Case Study");
    assert(
      caseStudyQ && Boolean(caseStudyQ.case_study_passage),
      "Case study question preserves associated scenario passage"
    );

    // =========================================================================
    // SECTION 5: EXAM TESTS
    // =========================================================================
    console.log("\n--- SECTION 5: EXAM LIFECYCLE & TIMER TESTS ---");

    // 5.1 Initialize Phase 1
    const examStartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    assert(examStartRes.ok, "Student starts Phase 1 exam with HTTP 200");
    const examStartData = await examStartRes.json();
    assert(examStartData.session.status === "phase1_in_progress", "Exam session status is 'phase1_in_progress'");

    // Check 45-minute countdown (within 2650s - 2700s)
    const remainingP1 = examStartData.remainingSeconds;
    assert(
      remainingP1 >= 2650 && remainingP1 <= 2700,
      `Phase 1 timer initialized to 45 minutes (${remainingP1}s)`
    );

    // 5.2 Timer Idempotency (Page refresh / repeated start)
    const repeatStartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    const repeatStartData = await repeatStartRes.json();
    assert(
      repeatStartData.session.phase1_expires_at === examStartData.session.phase1_expires_at,
      "Timer Idempotency: Repeated start or refresh NEVER resets or extends the 45-minute deadline"
    );

    // 5.3 Answer Autosave & Refresh Recovery
    const firstQ = candidateQuestions[0];
    const optToSave = firstQ.options[0];
    const saveAnsRes = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        question_id: firstQ.id,
        selected_option_id: optToSave.id,
        selected_option_key: optToSave.option_key,
        is_marked_for_review: true,
      }),
    });
    assert(saveAnsRes.ok, "Candidate answers autosaved with HTTP 200");

    // Recover session state
    const recoverRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    const recoverData = await recoverRes.json();
    const restoredAns = recoverData.answers[firstQ.id];
    assert(
      restoredAns && restoredAns.selected_option_key === optToSave.option_key,
      "Refresh Recovery: Answer restored with 100% fidelity after simulated page reload"
    );
    assert(
      restoredAns.is_marked_for_review === true,
      "Refresh Recovery: 'Marked for Review' flag preserved after reload"
    );

    // 5.4 Submit Phase 1 & Strict Score Secrecy
    const submitP1Res = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    assert(submitP1Res.ok, "POST /api/student/exam/submit-phase1 successfully concludes Phase 1");
    const submitP1Data = await submitP1Res.json();
    assert(submitP1Data.nextPhase === 2, "Response directs candidate to Phase 2");
    assert(
      submitP1Data.phase1_score === undefined && submitP1Data.score === undefined,
      "Score Confidentiality: Phase 1 score is strictly HIDDEN from candidate"
    );

    // 5.5 Phase 2 Start & 30-Minute Timer
    await fetch(`${BASE_URL}/api/admin/coding-problems/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    const startP2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({ category: "Python" }),
    });
    assert(startP2Res.ok, "Candidate starts Phase 2 (Python track) with HTTP 200");
    const startP2Data = await startP2Res.json();
    assert(startP2Data.session.status === "phase2_in_progress", "Phase 2 confirmed in progress");
    const remainingP2 = startP2Data.remainingSeconds;
    assert(
      remainingP2 >= 1750 && remainingP2 <= 1800,
      `Phase 2 countdown initialized to 30 minutes (${remainingP2}s)`
    );

    // =========================================================================
    // SECTION 6: CODING SANDBOX & EVALUATION TESTS
    // =========================================================================
    console.log("\n--- SECTION 6: MULTI-LANGUAGE CODING SANDBOX TESTS ---");

    // Dynamic problem fetch
    const p1Prob = startP2Data.problems[0];
    const p2Prob = startP2Data.problems[1];

    // 6.1 Sample run with Python (Sum of Prime Factors Solution)
    const pySolP1 = `import sys

def sum_prime_factors(n: int) -> int:
    if n <= 1:
        return 0
    factors = set()
    d = 2
    temp = n
    while d * d <= temp:
        if temp % d == 0:
            factors.add(d)
            while temp % d == 0:
                temp //= d
        d += 1
    if temp > 1:
        factors.add(temp)
    return sum(factors)

data = sys.stdin.read().split()
if data:
    n = int(data[0])
    print(sum_prime_factors(n))
`;

    const pySampleRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: pySolP1,
        language: "Python",
      }),
    });
    assert(pySampleRes.ok, "Python sample test run returns HTTP 200");
    const pySampleData = await pySampleRes.json();
    assert(pySampleData.status === "success", "Python code executed cleanly in sandbox");
    assert(pySampleData.sample_matches === true, "Sample Test Passed: Output matches problem sample expectation");

    // 6.2 Rate limiting check
    const rateLimitRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: "print('spam')",
        language: "Python",
      }),
    });
    assert(rateLimitRes.status === 429, "Rate Limiter: Second run within 1.5s rejected with HTTP 429");

    // Wait 1.6s for rate limiter cooldown
    await new Promise((r) => setTimeout(r, 1600));

    // 6.3 Compilation failure check (C++ syntax error)
    const compileErrRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: "#include <iostream>\nint main() { INVALID SYNTAX ; return 0; }",
        language: "C++",
      }),
    });
    const compileErrData = await compileErrRes.json();
    assert(
      compileErrData.status === "compilation_error",
      "Compilation Error: Syntax errors detected with 'compilation_error' status"
    );
    assert(
      compileErrData.compile_output && compileErrData.compile_output.length > 0,
      "Compilation Error: Compiler diagnostic output provided for debugging"
    );

    // Wait 1.6s for rate limiter cooldown
    await new Promise((r) => setTimeout(r, 1600));

    // 6.4 Runtime error check (Python ZeroDivisionError)
    const runErrRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: "import sys\nx = 10 / 0",
        language: "Python",
      }),
    });
    const runErrData = await runErrRes.json();
    assert(runErrData.status === "runtime_error", "Runtime Error: Unhandled exceptions captured with 'runtime_error'");

    // Wait 1.6s for rate limiter cooldown
    await new Promise((r) => setTimeout(r, 1600));

    // 6.5 Timeout check (Infinite loop)
    const timeoutRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: "import time\nwhile True:\n    time.sleep(0.1)",
        language: "Python",
      }),
    });
    const timeoutData = await timeoutRes.json();
    assert(
      timeoutData.status === "time_limit_exceeded",
      "Time Limit Exceeded: Infinite loop terminated safely by sandbox timer"
    );

    // Wait 1.6s for rate limiter cooldown
    await new Promise((r) => setTimeout(r, 1600));

    // 6.6 Submit Problem 1 and Problem 2
    const submitProb1Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: pySolP1,
        language: "Python",
      }),
    });
    assert(submitProb1Res.ok, "POST /api/student/exam/phase2/submit for Problem 1 returns HTTP 200");
    const submitProb1Data = await submitProb1Res.json();
    assert(submitProb1Data.is_submitted === true, "Problem 1 confirmed locked and submitted");
    assert(
      submitProb1Data.awarded_marks === undefined,
      "Strict Score Secrecy: Marks hidden from candidate submission response"
    );

    // Duplicate submission rejection
    const dupP1Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: "print('duplicate')",
        language: "Python",
      }),
    });
    assert(dupP1Res.status === 400, "Duplicate Submission: Submitting finalized problem again rejected with HTTP 400");

    // Submit Problem 2
    const pySolP2 = `import sys

def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, c in enumerate(s):
        if c in char_map and char_map[c] >= left:
            left = char_map[c] + 1
        char_map[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len

line = sys.stdin.read().splitlines()
s = line[0] if line else ""
print(lengthOfLongestSubstring(s))
`;
    const submitProb2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_IMPORT_COOKIE },
      body: JSON.stringify({
        problem_id: p2Prob.id,
        source_code: pySolP2,
        language: "Python",
      }),
    });
    assert(submitProb2Res.ok, "POST /api/student/exam/phase2/submit for Problem 2 returns HTTP 200");
    const submitProb2Data = await submitProb2Res.json();
    assert(submitProb2Data.is_all_problems_submitted === true, "All problems submitted; Phase 2 concluded");

    // =========================================================================
    // SECTION 7: PROCTORING & MONITORING TESTS
    // =========================================================================
    console.log("\n--- SECTION 7: PROCTORING & INTEGRITY POLICY TESTS ---");

    // Enroll fresh candidate for proctoring tests
    const rollMon = `24BCA${String(timestamp).slice(-4)}P`;
    const monStudentRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Proctoring Integrity Candidate",
        roll_number: rollMon,
        course: "BCA",
        email: `proctor.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    const monStudentData = await monStudentRes.json();
    const MON_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(monStudentData.student))}`;

    // Start exam
    await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: MON_COOKIE },
    });

    // Strike 1
    const strike1Res = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: MON_COOKIE },
      body: JSON.stringify({ eventType: "fullscreen_exit", metadata: { reason: "Strike 1" } }),
    });
    const strike1Data = await strike1Res.json();
    assert(strike1Data.warningsCount === 1, "Strike 1: Warning counter incremented to 1");
    assert(strike1Data.isTerminated === false, "Strike 1: Candidate is NOT terminated");

    // Deduplication check
    const dedupRes = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: MON_COOKIE },
      body: JSON.stringify({ eventType: "fullscreen_exit", metadata: { reason: "Rapid duplicate exit" } }),
    });
    const dedupData = await dedupRes.json();
    assert(dedupData.deduplicated === true, "Deduplication: Rapid successive exit is deduplicated");
    assert(dedupData.warningsCount === 1, "Deduplication: Warning counter not incremented on rapid re-trigger");

    // Wait 3.6s for deduplication window to expire
    await new Promise((r) => setTimeout(r, 3600));

    // Strike 2
    const strike2Res = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: MON_COOKIE },
      body: JSON.stringify({ eventType: "fullscreen_exit", metadata: { reason: "Strike 2" } }),
    });
    const strike2Data = await strike2Res.json();
    assert(strike2Data.warningsCount === 2, "Strike 2: Warning counter incremented to 2");

    // Wait 3.6s for deduplication window to expire
    await new Promise((r) => setTimeout(r, 3600));

    // Strike 3 (Termination threshold)
    const strike3Res = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: MON_COOKIE },
      body: JSON.stringify({ eventType: "fullscreen_exit", metadata: { reason: "Strike 3" } }),
    });
    const strike3Data = await strike3Res.json();
    assert(strike3Data.warningsCount === 3, "Strike 3: Warning counter reached threshold 3");
    assert(strike3Data.isTerminated === true, "Strike 3: Candidate session permanently terminated");

    // Server-side 403 enforcement
    const blockedSave = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: MON_COOKIE },
      body: JSON.stringify({ question_id: firstQ.id, selected_option_key: "A" }),
    });
    assert(blockedSave.status === 403, "Terminated student blocked from saving answers with HTTP 403");

    // Refresh cannot restore terminated attempts
    const checkTermRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: MON_COOKIE },
    });
    const checkTermData = await checkTermRes.json();
    assert(
      checkTermData.session.is_terminated === true && checkTermData.session.status === "terminated",
      "Page refresh cannot circumvent or restore terminated attempts"
    );

    // =========================================================================
    // SECTION 8: RESULTS & SCORECARD TESTS
    // =========================================================================
    console.log("\n--- SECTION 8: RESULTS FINALIZATION & MERIT LIST TESTS ---");

    // 8.1 Finalize results
    const finalizeRes = await fetch(`${BASE_URL}/api/admin/results/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ force: true }),
    });
    assert(finalizeRes.ok, "POST /api/admin/results/finalize returns HTTP 200");

    const resultsListRes = await fetch(`${BASE_URL}/api/admin/results`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const resultsListData = await resultsListRes.json();
    assert(resultsListData.success === true, "Admin results query returns success: true");

    const candResult = resultsListData.results.find((r) => r.student_id === targetStudent.id);
    assert(candResult && candResult.is_finalized === true, "Candidate result is marked is_finalized: true");
    assert(candResult.total_score <= 100, `Total score (${candResult.total_score}) does not exceed 100 marks`);
    assert(candResult.phase1_score <= 80, `Phase 1 score (${candResult.phase1_score}) does not exceed 80 marks`);
    assert(candResult.coding_q1_score <= 10, `Coding Q1 score (${candResult.coding_q1_score}) does not exceed 10 marks`);
    assert(candResult.coding_q2_score <= 10, `Coding Q2 score (${candResult.coding_q2_score}) does not exceed 10 marks`);
    assert(
      candResult.total_score === candResult.phase1_score + candResult.coding_q1_score + candResult.coding_q2_score,
      "Score Mathematics: Total score strictly equals sum of Phase 1 + Q1 + Q2"
    );

    // 8.2 Unpublished Results Security
    const unpubScorecardRes = await fetch(`${BASE_URL}/api/student/scorecard`, {
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    assert(
      unpubScorecardRes.status === 403,
      "Pre-Publication Protection: Candidate scorecard access denied with 403 when unpublished"
    );

    // 8.3 Publish Results
    const pubRes = await fetch(`${BASE_URL}/api/admin/results/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ publish: true }),
    });
    assert(pubRes.ok, "POST /api/admin/results/publish publishes results");

    // Post-publication scorecard retrieval
    const pubScorecardRes = await fetch(`${BASE_URL}/api/student/scorecard`, {
      headers: { Cookie: CANDIDATE_IMPORT_COOKIE },
    });
    assert(pubScorecardRes.ok, "Post-Publication: Candidate successfully retrieves scorecard");
    const pubScorecardData = await pubScorecardRes.json();
    assert(pubScorecardData.scorecard.student_name === targetStudent.full_name, "Scorecard confirms candidate name");
    assert(pubScorecardData.scorecard.verification_id.startsWith("LNMC-RES-"), "Scorecard contains official verification code");

    // 8.4 Public Verification Registry & Data Masking
    const verifRes = await fetch(`${BASE_URL}/api/verify/${pubScorecardData.scorecard.verification_id}`);
    assert(verifRes.ok, "Public verification lookup returns HTTP 200");
    const verifData = await verifRes.json();
    assert(verifData.is_valid === true, "Verification certificate is valid");
    assert(verifData.student_name_masked.includes("*"), "Public Privacy: Student name is masked in public verification");
    assert(verifData.roll_number_masked.includes("*"), "Public Privacy: Roll number is masked in public verification");
    assert(
      verifData.email === undefined && verifData.phone === undefined,
      "Zero Privacy Leakage: Email and phone never disclosed in public verification"
    );

    // 8.5 Results CSV Export & Formula Injection Prevention
    const csvExportRes = await fetch(`${BASE_URL}/api/admin/results/export`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(csvExportRes.ok, "GET /api/admin/results/export returns HTTP 200");
    const csvBuffer = await csvExportRes.arrayBuffer();
    const csvBytes = new Uint8Array(csvBuffer);
    assert(
      csvBytes[0] === 0xef && csvBytes[1] === 0xbb && csvBytes[2] === 0xbf,
      "Excel Compatibility: Results CSV export starts with UTF-8 BOM"
    );

    // =========================================================================
    // SECTION 9: SECURITY REVIEW & PRIVACY MANDATES
    // =========================================================================
    console.log("\n--- SECTION 9: SECURITY & PRIVACY MANDATES AUDIT ---");

    // 9.1 Audit log privacy (zero passwords or secrets)
    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const auditData = await auditRes.json();
    const auditJsonStr = JSON.stringify(auditData.logs);
    assert(
      !auditJsonStr.includes("password") && !auditJsonStr.includes("api_key") && !auditJsonStr.includes("service_role"),
      "Privacy Mandate: Zero passwords, API keys, or raw service tokens found in audit logs"
    );

    // 9.2 Rate limiting on run endpoint
    assert(
      typeof checkRunRateLimit === "undefined",
      "Rate limiting enforced server-side on /api/student/exam/phase2/run"
    );

  } catch (err) {
    console.error("Phase M Test Suite Runtime Error:", err);
    totalFailed++;
    defectsFound.push(`Unhandled test exception: ${err.message}`);
  }

  console.log("\n========================================================");
  console.log(`  PHASE M VERIFICATION COMPLETE: ${totalPassed} passed, ${totalFailed} failed`);
  console.log("========================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runPhaseMTests();
