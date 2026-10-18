/**
 * LNMCBM College Coding Competition Portal
 * Phase J Automated Test Suite: Fullscreen Monitoring, Deduplication, Warnings & Termination
 */

const BASE_URL = "http://localhost:3000";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS - ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✘ FAIL - ${message}`);
    testsFailed++;
  }
}

async function runPhaseJTests() {
  console.log("\n===============================================================================");
  console.log("  LNMCBM PHASE J: FULLSCREEN MONITORING, WARNINGS & EXAM TERMINATION");
  console.log("===============================================================================\n");

  const CANDIDATE_J = {
    id: `cand-j-${Date.now()}`,
    roll_number: "24BCA901",
    full_name: "Rahul Verma",
    course: "BCA",
    email: "rahul.verma@lnmcbm.ac.in",
    participant_id: "LNMC-COD-9001",
  };

  const CANDIDATE_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_J))}`;

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-controller-uuid",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Authentication
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Authentication ---");

    const unauthMonitoring = await fetch(`${BASE_URL}/api/admin/monitoring`);
    assert(unauthMonitoring.status === 401, "GET /api/admin/monitoring rejects unauthenticated requests with 401");

    const unauthTimeline = await fetch(`${BASE_URL}/api/admin/monitoring/test-sess/events`);
    assert(unauthTimeline.status === 401, "GET /api/admin/monitoring/[id]/events rejects unauthenticated requests with 401");

    const unauthException = await fetch(`${BASE_URL}/api/admin/monitoring/exception`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: "test", reason: "test" }),
    });
    assert(unauthException.status === 401, "POST /api/admin/monitoring/exception rejects unauthenticated requests with 401");

    const unauthViolation = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "fullscreen_exit" }),
    });
    assert(unauthViolation.status === 401, "POST /api/student/exam/violation rejects unauthenticated requests with 401");

    // Ensure Question Bank is seeded with 40 MCQs
    await fetch(`${BASE_URL}/api/admin/questions/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Exam Session Initialization & Strike 1
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Exam Session Initialization & Strike 1 ---");

    const initRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    assert(initRes.ok, "POST /api/student/exam/start initializes candidate exam session");
    const initData = await initRes.json();
    assert(initData.session && !initData.session.is_terminated, "Exam session initialized with clean status (not terminated)");
    assert(initData.session.fullscreen_warnings_count === 0, "Candidate starts with 0 fullscreen warnings");

    const sessionId = initData.session.id;

    // Save one answer before any violation to verify work preservation later
    const q1 = initData.questions[0];
    const opt1 = q1.options[0];
    const optKey = opt1.option_key || opt1.key || "A";
    const saveAnsRes = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        question_id: q1.id,
        selected_option_id: opt1.id,
        selected_option_key: optKey,
        is_marked_for_review: false,
      }),
    });
    assert(saveAnsRes.ok, "Candidate successfully saves an MCQ answer before violations");

    // Strike 1
    const strike1Res = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        eventType: "fullscreen_exit",
        metadata: { reason: "Candidate exited browser fullscreen mode" },
      }),
    });
    assert(strike1Res.ok, "POST /api/student/exam/violation accepts Strike 1 event");
    const strike1Data = await strike1Res.json();
    assert(strike1Data.warningsCount === 1, "Strike 1: warningsCount incremented to exactly 1");
    assert(strike1Data.isTerminated === false, "Strike 1: Candidate is NOT terminated");
    assert(strike1Data.remainingStrikes === 2, "Strike 1: Exactly 2 remaining strikes left");
    assert(strike1Data.threshold === 3, "Strike 1: Confirms default 3-strike threshold");

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Event Deduplication & Non-Fullscreen Telemetry Logging
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Event Deduplication & Telemetry Logging ---");

    // Rapid successive exit within milliseconds (should be deduplicated)
    const dedupRes = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        eventType: "fullscreen_exit",
        metadata: { reason: "Rapid second exit event" },
      }),
    });
    assert(dedupRes.ok, "POST /api/student/exam/violation accepts rapid successive event");
    const dedupData = await dedupRes.json();
    assert(dedupData.deduplicated === true, "Deduplication: rapid exit within window is flagged as deduplicated");
    assert(dedupData.warningsCount === 1, "Deduplication: strike counter is NOT incremented (remains 1)");

    // Non-fullscreen events: tab_switch & window_blur
    const tabSwitchRes = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        eventType: "tab_switch",
        metadata: { reason: "Candidate switched tab", bypass_dedup: true },
      }),
    });
    const tabSwitchData = await tabSwitchRes.json();
    assert(tabSwitchData.warningsCount === 1, "tab_switch event is recorded in telemetry without incrementing strike count");

    const blurRes = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        eventType: "window_blur",
        metadata: { reason: "Window blur", bypass_dedup: true },
      }),
    });
    const blurData = await blurRes.json();
    assert(blurData.warningsCount === 1, "window_blur event is recorded in telemetry without incrementing strike count");

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Strike 2 & Strike 3 Permanent Termination
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Strike 2 & Strike 3 Termination Policy ---");

    // Strike 2
    const strike2Res = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        eventType: "fullscreen_exit",
        metadata: { reason: "Candidate exited fullscreen 2nd time", bypass_dedup: true },
      }),
    });
    const strike2Data = await strike2Res.json();
    assert(strike2Data.warningsCount === 2, "Strike 2: warningsCount incremented to 2");
    assert(strike2Data.isTerminated === false, "Strike 2: Candidate is NOT terminated (Final warning)");
    assert(strike2Data.remainingStrikes === 1, "Strike 2: Exactly 1 strike remaining");

    // Strike 3 (Final Termination)
    const strike3Res = await fetch(`${BASE_URL}/api/student/exam/violation`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        eventType: "fullscreen_exit",
        metadata: { reason: "Candidate exited fullscreen 3rd time", bypass_dedup: true },
      }),
    });
    const strike3Data = await strike3Res.json();
    assert(strike3Data.warningsCount === 3, "Strike 3: warningsCount reaches threshold 3");
    assert(strike3Data.isTerminated === true, "Strike 3: Candidate is permanently TERMINATED");
    assert(strike3Data.remainingStrikes === 0, "Strike 3: 0 strikes remaining");
    assert(
      strike3Data.terminationReason && strike3Data.terminationReason.includes("Exceeded maximum permissible fullscreen exit violations"),
      "Strike 3: Authoritative termination reason returned"
    );

    // Verify session status via session query
    const sessionRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    const sessionData = await sessionRes.json();
    assert(sessionData.session.is_terminated === true, "Session query confirms is_terminated is true");
    assert(sessionData.session.status === "terminated", "Session query confirms status is 'terminated'");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Server-Side 403 Enforcement on Terminated Attempt
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Server-Side 403 Enforcement ---");

    const blockAnswer = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        question_id: q1.id,
        selected_option_id: opt1.id,
        selected_option_key: opt1.key,
      }),
    });
    assert(blockAnswer.status === 403, "POST /api/student/exam/save-answer rejects terminated student with 403 Forbidden");

    const blockSubmit1 = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    assert(blockSubmit1.status === 403, "POST /api/student/exam/submit-phase1 rejects terminated student with 403 Forbidden");

    const blockPhase2Start = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({ category: "Python" }),
    });
    assert(blockPhase2Start.status === 403, "POST /api/student/exam/phase2/start rejects terminated student with 403 Forbidden");

    const blockPhase2Run = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({ problem_id: "any", source_code: "print(1)", language: "python" }),
    });
    assert(blockPhase2Run.status === 403, "POST /api/student/exam/phase2/run rejects terminated student with 403 Forbidden");

    const blockPhase2Draft = await fetch(`${BASE_URL}/api/student/exam/phase2/save-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({ problem_id: "any", source_code: "print(1)", language: "python" }),
    });
    assert(blockPhase2Draft.status === 403, "POST /api/student/exam/phase2/save-draft rejects terminated student with 403 Forbidden");

    const blockPhase2Submit = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({ problem_id: "any", source_code: "print(1)", language: "python" }),
    });
    assert(blockPhase2Submit.status === 403, "POST /api/student/exam/phase2/submit rejects terminated student with 403 Forbidden");

    // Browser Refresh / Attempt to restart: does NOT unblock session
    const restartAttempt = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    assert(restartAttempt.status === 403, "Calling /api/student/exam/start again rejects with 403 (does NOT reset termination)");

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Work Preservation Guarantee
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Work Preservation Guarantee ---");

    assert(
      sessionData.answers &&
        sessionData.answers[q1.id] &&
        (sessionData.answers[q1.id].selected_option_key === optKey ||
          sessionData.answers[q1.id].selected_option_id === opt1.id),
      "Previously recorded answer is 100% preserved in the database after termination"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Admin Proctoring Console & Incident Timeline
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Admin Console & Incident Timeline ---");

    const adminMonitoringRes = await fetch(`${BASE_URL}/api/admin/monitoring`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(adminMonitoringRes.ok, "GET /api/admin/monitoring returns 200 for authenticated admin");
    const adminMonitoringData = await adminMonitoringRes.json();
    assert(adminMonitoringData.success === true, "Admin monitoring response success is true");
    assert(adminMonitoringData.summary.terminatedCandidates >= 1, "Admin summary telemetry reflects terminated candidate");

    const candidateSessionSummary = adminMonitoringData.sessions.find((s) => s.sessionId === sessionId);
    assert(Boolean(candidateSessionSummary), "Candidate session appears in admin telemetry table");
    assert(candidateSessionSummary.isTerminated === true, "Admin console displays isTerminated: true for candidate");
    assert(candidateSessionSummary.warningsCount === 3, "Admin console displays warningsCount: 3 for candidate");

    // Timeline query
    const timelineRes = await fetch(`${BASE_URL}/api/admin/monitoring/${sessionId}/events`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(timelineRes.ok, "GET /api/admin/monitoring/[id]/events returns 200 for authenticated admin");
    const timelineData = await timelineRes.json();
    assert(Array.isArray(timelineData.events), "Timeline returns array of events");

    const eventTypes = timelineData.events.map((e) => e.event_type);
    assert(eventTypes.includes("fullscreen_exit"), "Timeline includes 'fullscreen_exit' events");
    assert(eventTypes.includes("tab_switch"), "Timeline includes 'tab_switch' event");
    assert(eventTypes.includes("window_blur"), "Timeline includes 'window_blur' event");
    assert(eventTypes.includes("auto_terminated"), "Timeline includes 'auto_terminated' audit event");

    // -------------------------------------------------------------------------
    // TEST GROUP 8: Technical Exception & Recovery Workflow
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Technical Exception Recovery Workflow ---");

    // Attempt exception without reason
    const badException = await fetch(`${BASE_URL}/api/admin/monitoring/exception`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ sessionId, reason: "" }),
    });
    assert(badException.status === 400, "POST /api/admin/monitoring/exception rejects empty justification with 400");

    // Grant valid technical exception
    const validException = await fetch(`${BASE_URL}/api/admin/monitoring/exception`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        sessionId,
        reason: "Lab display power cable reconnection confirmed by proctor. Candidate granted permission to resume.",
      }),
    });
    assert(validException.ok, "POST /api/admin/monitoring/exception approves valid technical exception");
    const exceptionData = await validException.json();
    assert(exceptionData.success === true, "Exception approval returns success: true");
    assert(exceptionData.session.is_terminated === false, "Candidate session unblocked: is_terminated is false");
    assert(exceptionData.session.status === "phase1_in_progress", "Candidate status restored to 'phase1_in_progress'");

    // Timeline verification: original violation logs are NOT deleted, exception event appended
    const updatedTimelineRes = await fetch(`${BASE_URL}/api/admin/monitoring/${sessionId}/events`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const updatedTimelineData = await updatedTimelineRes.json();
    const updatedEventTypes = updatedTimelineData.events.map((e) => e.event_type);
    assert(updatedEventTypes.includes("fullscreen_exit"), "Original violation records permanently preserved in audit timeline");
    assert(updatedEventTypes.includes("technical_exception_granted"), "New 'technical_exception_granted' audit record appended");

    // Candidate can now save answers again
    const resumeSave = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        question_id: q1.id,
        selected_option_id: opt1.id,
        selected_option_key: opt1.key,
        is_marked_for_review: true,
      }),
    });
    assert(resumeSave.ok, "Restored candidate can now successfully interact and save answers again (HTTP 200)");

    // Cleanly submit Phase 1 exam to finalize session
    const p1Submit = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    assert(p1Submit.ok, "Candidate successfully submitted Phase 1 after exception recovery");
  } catch (err) {
    console.error("Test execution failed with exception:", err);
    testsFailed++;
  }

  console.log("\n========================================================");
  console.log(`  PHASE J TESTS COMPLETE: ${testsPassed} passed, ${testsFailed} failed`);
  console.log("========================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhaseJTests();
