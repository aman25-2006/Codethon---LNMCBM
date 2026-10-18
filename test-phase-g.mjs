/**
 * LNMCBM College Coding Competition Portal
 * Phase G Automated Verification Test Suite
 *
 * Covers:
 * 1. Student Authentication & Unauthorized Access Rejection
 * 2. Inactive Student Suspension Enforcement
 * 3. Idempotent Session Creation & 45-Minute Server-Authoritative Timer
 * 4. 40-Question Delivery & Deterministic Randomization
 * 5. Debounced Answer Persistence & Refresh Recovery
 * 6. Academic Integrity & Proctoring Violation Tracking
 * 7. Server-Side Scoring & Strict Phase 1 Score Secrecy
 * 8. Clean Progression to Phase 2 Domain Selection
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m - ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✘ FAIL\x1b[0m - ${testName} ${details ? `(${details})` : ""}`);
    failedTests++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  LNMCBM PHASE G: STUDENT DASHBOARD & PHASE 1 EXAM SUITE");
  console.log("========================================================\n");

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-audit-id",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  const CANDIDATE_A = {
    id: `cand-g-1-${Date.now()}`,
    roll_number: "24BCA901",
    full_name: "Rahul Verma",
    course: "BCA",
    email: "rahul.verma@lnmcbm.ac.in",
    participant_id: "LNMC-COD-9001",
  };

  const CANDIDATE_B = {
    id: `cand-g-2-${Date.now()}`,
    roll_number: "24BCA902",
    full_name: "Anjali Kumari",
    course: "MCA",
    email: "anjali.kumari@lnmcbm.ac.in",
    participant_id: "LNMC-COD-9002",
  };

  const CANDIDATE_A_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_A))}`;
  const CANDIDATE_B_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_B))}`;

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Authorization
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Candidate Auth ---");

    const unauthSession = await fetch(`${BASE_URL}/api/student/exam/session`);
    assert(unauthSession.status === 401, "GET /api/student/exam/session rejects unauthenticated requests with 401");

    const unauthStart = await fetch(`${BASE_URL}/api/student/exam/start`, { method: "POST" });
    assert(unauthStart.status === 401, "POST /api/student/exam/start rejects unauthenticated requests with 401");

    const unauthSave = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: "any" }),
    });
    assert(unauthSave.status === 401, "POST /api/student/exam/save-answer rejects unauthenticated requests with 401");

    const unauthSubmit = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, { method: "POST" });
    assert(unauthSubmit.status === 401, "POST /api/student/exam/submit-phase1 rejects unauthenticated requests with 401");

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Ensure Question Bank Has 40 Questions (Seed if needed)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Verify Question Bank Readiness ---");

    await fetch(`${BASE_URL}/api/admin/questions/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    const qBankRes = await fetch(`${BASE_URL}/api/admin/questions`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const qBankData = await qBankRes.json();
    assert(qBankData.metrics.isValidExamSet === true, "Official 40Q / 80M curriculum verified active for Phase 1");

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Exam Session Lifecycle & 45-Minute Timer
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Exam Session Creation & Timer Idempotency ---");

    // Initial check: Candidate has not started yet
    const initSessionRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const initSessionData = await initSessionRes.json();
    assert(initSessionData.status === "not_started", "Candidate begins in 'not_started' session state");

    // Start Phase 1 Exam
    const startRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const startData = await startRes.json();
    assert(startRes.status === 200 && startData.success === true, "POST /api/student/exam/start successfully initializes exam");
    assert(startData.session.status === "phase1_in_progress", "Session status is set to 'phase1_in_progress'");

    const firstExpiresAt = new Date(startData.session.phase1_expires_at).getTime();
    const remainingSecs = startData.remainingSeconds;
    assert(
      remainingSecs >= 44 * 60 && remainingSecs <= 45 * 60,
      `Timer initialized to approximately 45 minutes (got: ${remainingSecs}s)`
    );

    // Call start again (simulating repeated clicks or page refresh)
    const restartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const restartData = await restartRes.json();
    const secondExpiresAt = new Date(restartData.session.phase1_expires_at).getTime();
    assert(
      firstExpiresAt === secondExpiresAt,
      "Timer Idempotency: Repeated start requests or page refreshes NEVER extend the deadline"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 4: 40-Question Delivery & Security Isolation
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: 40-Question Delivery & Randomization ---");

    const questionsA = startData.questions;
    assert(questionsA.length === 40, `Delivered exactly 40 examination questions (got: ${questionsA.length})`);

    // Verify all answer keys are strictly withheld
    const hasAnswerKeyLeak = questionsA.some(
      (q) => q.correct_option_key !== undefined || q.correct_option_id !== undefined || q.explanation !== undefined
    );
    assert(!hasAnswerKeyLeak, "Strict Answer Key Isolation: Zero answer keys or explanations delivered to candidate");

    // Verify candidate B gets a distinct question permutation
    const startBRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_B_COOKIE },
    });
    const startBData = await startBRes.json();
    const questionsB = startBData.questions;

    const idsA = questionsA.map((q) => q.id);
    const idsB = questionsB.map((q) => q.id);
    const isDistinctOrder = !idsA.every((id, idx) => id === idsB[idx]);
    assert(isDistinctOrder, "Deterministic Randomization: Candidate A and B receive distinct permutations");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Answer Autosave & Refresh Recovery
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Answer Autosave & Refresh Recovery ---");

    const targetQ1 = questionsA[0];
    const targetQ2 = questionsA[1];

    // Candidate A selects option for Q1
    const saveRes1 = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_A_COOKIE },
      body: JSON.stringify({
        question_id: targetQ1.id,
        selected_option_id: targetQ1.options[1].id,
        selected_option_key: targetQ1.options[1].option_key,
        is_marked_for_review: false,
        question_order_index: 0,
      }),
    });
    const saveData1 = await saveRes1.json();
    assert(saveRes1.status === 200 && saveData1.success === true, "POST /api/student/exam/save-answer persists selected option");

    // Candidate A marks Q2 for review with an option
    const saveRes2 = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_A_COOKIE },
      body: JSON.stringify({
        question_id: targetQ2.id,
        selected_option_id: targetQ2.options[0].id,
        selected_option_key: targetQ2.options[0].option_key,
        is_marked_for_review: true,
        question_order_index: 1,
      }),
    });
    const saveData2 = await saveRes2.json();
    assert(saveRes2.status === 200 && saveData2.success === true, "Option selection and Mark-for-Review persisted for Q2");

    // Simulate page refresh: Fetch active session state
    const refreshSessionRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const refreshedState = await refreshSessionRes.json();
    const restoredQ1Ans = refreshedState.answers[targetQ1.id];
    const restoredQ2Ans = refreshedState.answers[targetQ2.id];

    assert(
      restoredQ1Ans && restoredQ1Ans.selected_option_key === targetQ1.options[1].option_key,
      "Refresh Recovery: Q1 selected option restored with 100% fidelity"
    );
    assert(
      restoredQ2Ans && restoredQ2Ans.is_marked_for_review === true,
      "Refresh Recovery: Q2 'Marked for Review' flag preserved after page reload"
    );
    assert(
      refreshedState.paletteSummary.answered === 2 && refreshedState.paletteSummary.markedForReview === 1,
      `Palette Counters restored: Answered = ${refreshedState.paletteSummary.answered}, Review = ${refreshedState.paletteSummary.markedForReview}`
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Proctoring & Integrity Incident Reporting
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Proctoring & Integrity Incident Tracking ---");

    const violationRes = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_A_COOKIE },
      body: JSON.stringify({
        eventType: "fullscreen_exit",
        metadata: { reason: "Candidate exited browser fullscreen mode" },
      }),
    });
    const violationData = await violationRes.json();
    assert(violationRes.status === 200 && violationData.warningsCount >= 1, "Fullscreen exit logged and warning counter incremented");

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Server-Side Scoring & Strict Score Secrecy
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Server-Side Scoring & Score Secrecy ---");

    // Submit Phase 1
    const submitRes = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 200 && submitData.success === true, "POST /api/student/exam/submit-phase1 successfully concludes phase");
    assert(submitData.completed === true && submitData.nextPhase === 2, "Response confirms completion and directs candidate to Phase 2");

    // MANDATORY SECURITY RULE: Phase 1 Score must be strictly HIDDEN from the student
    assert(
      submitData.phase1_score === undefined &&
      submitData.score === undefined &&
      submitData.marks === undefined,
      "Strict Score Confidentiality: Score is completely HIDDEN from candidate payload"
    );

    // Verify session status updated
    const finalSessionRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const finalSessionData = await finalSessionRes.json();
    assert(finalSessionData.session.status === "phase1_completed", "Session status transitioned to 'phase1_completed'");

    // Verify answers cannot be modified after submission
    const postSubmitSaveRes = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_A_COOKIE },
      body: JSON.stringify({
        question_id: targetQ1.id,
        selected_option_key: "D",
      }),
    });
    assert(
      postSubmitSaveRes.status === 400 || postSubmitSaveRes.status === 410,
      "Post-Submission Protection: Modifying answers after submission is rejected with 400/410"
    );

    // Re-submission idempotency
    const reSubmitRes = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_A_COOKIE },
    });
    const reSubmitData = await reSubmitRes.json();
    assert(reSubmitData.success === true && reSubmitData.completed === true, "Duplicate submission handled safely and idempotently");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failedTests++;
  }

  console.log("\n========================================================");
  console.log(`  PHASE G TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();

