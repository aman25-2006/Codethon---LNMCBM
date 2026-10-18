/**
 * LNMCBM College Coding Competition Portal
 * Phase L Test Suite: Competition Settings, Lifecycle Management & Audit Logs
 */

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS - ${message}`);
    passed++;
  } else {
    console.error(`  ✘ FAIL - ${message}`);
    failed++;
  }
}

async function runPhaseLTests() {
  console.log("\n===============================================================================");
  console.log("  LNMCBM PHASE L: SETTINGS, LIFECYCLE MANAGEMENT & AUDIT LOGS TEST SUITE");
  console.log("===============================================================================\n");

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-controller-uuid",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  const STUDENT_COOKIE = `lnmcbm_student_session=${encodeURIComponent(
    JSON.stringify({
      id: "student-unauth-test",
      roll_number: "24BCA999",
      full_name: "Test Candidate",
      course: "BCA",
      email: "candidate@lnmcbm.ac.in",
      participant_id: "LNMC-COD-TEST",
      is_active: true,
    })
  )}`;

  const timestamp = Date.now();

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Admin Authorization
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Admin Authorization ---");

    const unauthSettingsGet = await fetch(`${BASE_URL}/api/admin/settings`);
    assert(unauthSettingsGet.status === 401, "GET /api/admin/settings rejects unauthenticated requests with 401");

    const unauthSettingsPut = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ competition_name: "Hacked Title" }),
    });
    assert(unauthSettingsPut.status === 401, "PUT /api/admin/settings rejects unauthenticated requests with 401");

    const unauthTransition = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_status: "in_progress" }),
    });
    assert(unauthTransition.status === 401, "POST /api/admin/settings/transition rejects unauthenticated requests with 401");

    const unauthPreflight = await fetch(`${BASE_URL}/api/admin/settings/preflight`);
    assert(unauthPreflight.status === 401, "GET /api/admin/settings/preflight rejects unauthenticated requests with 401");

    const unauthAuditLogs = await fetch(`${BASE_URL}/api/admin/audit-logs`);
    assert(unauthAuditLogs.status === 401, "GET /api/admin/audit-logs rejects unauthenticated requests with 401");

    const unauthAuditExport = await fetch(`${BASE_URL}/api/admin/audit-logs/export`);
    assert(unauthAuditExport.status === 401, "GET /api/admin/audit-logs/export rejects unauthenticated requests with 401");

    // Student access rejection
    const studentSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: { Cookie: STUDENT_COOKIE },
    });
    assert(studentSettingsRes.status === 401, "Candidate session strictly blocked from admin settings with 401");

    const studentAuditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Cookie: STUDENT_COOKIE },
    });
    assert(studentAuditRes.status === 401, "Candidate session strictly blocked from audit trail with 401");

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Settings Retrieval & Parameter Validation
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Settings Retrieval & Parameter Validation ---");

    const settingsGetRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(settingsGetRes.ok, "GET /api/admin/settings returns HTTP 200 for admin");
    const settingsGetData = await settingsGetRes.json();
    assert(settingsGetData.success === true, "Settings response success is true");
    assert(Boolean(settingsGetData.settings.competition_name), "Settings contains competition_name");
    assert(Boolean(settingsGetData.settings.college_name), "Settings contains college_name");
    assert(Array.isArray(settingsGetData.settings.eligible_coding_categories), "Settings contains coding categories array");

    // Parameter Range Violations:
    // 1. Phase 1 Duration < 5 min
    const invP1Res = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ phase1_duration_minutes: 2 }),
    });
    assert(invP1Res.status === 400, "Rejects Phase 1 duration < 5 minutes with HTTP 400");

    // 2. Phase 1 Duration > 180 min
    const invP1MaxRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ phase1_duration_minutes: 240 }),
    });
    assert(invP1MaxRes.status === 400, "Rejects Phase 1 duration > 180 minutes with HTTP 400");

    // 3. Phase 2 Duration < 5 min
    const invP2Res = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ phase2_duration_minutes: 0 }),
    });
    assert(invP2Res.status === 400, "Rejects Phase 2 duration < 5 minutes with HTTP 400");

    // 4. Strike Threshold < 1 or > 10
    const invStrikeRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ fullscreen_warning_threshold: 15 }),
    });
    assert(invStrikeRes.status === 400, "Rejects warning threshold > 10 strikes with HTTP 400");

    // 5. Invalid Contact Email
    const invEmailRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ contact_email: "not-an-email" }),
    });
    assert(invEmailRes.status === 400, "Rejects malformed contact email with HTTP 400");

    // 6. Empty Title
    const invTitleRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ competition_name: "   " }),
    });
    assert(invTitleRes.status === 400, "Rejects whitespace-only competition name with HTTP 400");

    // 7. Empty coding categories
    const invCatRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ eligible_coding_categories: [] }),
    });
    assert(invCatRes.status === 400, "Rejects empty eligible coding categories array with HTTP 400");

    // Valid Settings Update
    const currentSettingsCheck = await (await fetch(`${BASE_URL}/api/admin/settings`, { headers: { Cookie: ADMIN_COOKIE } })).json();
    const hasActiveExams = (currentSettingsCheck.activeExams || 0) > 0;

    const validTitle = `Codethon ${new Date().getFullYear()} - LNMCBM Championship`;
    const validUpdateRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        competition_name: validTitle,
        phase1_duration_minutes: 50,
        phase2_duration_minutes: 35,
        fullscreen_warning_threshold: 4,
        contact_email: "controller.exams@lnmcbm.ac.in",
        ...(hasActiveExams
          ? {
              forceEmergencyBypass: true,
              justification: "Pre-test calibration of championship configuration",
            }
          : {}),
      }),
    });
    assert(validUpdateRes.ok, "PUT /api/admin/settings accepts valid parameters with HTTP 200");
    const validData = await validUpdateRes.json();
    assert(validData.settings.competition_name === validTitle, "Updated competition title successfully persisted");
    assert(validData.settings.phase1_duration_minutes === 50, "Phase 1 duration updated to 50m");
    assert(validData.settings.phase2_duration_minutes === 35, "Phase 2 duration updated to 35m");
    assert(validData.settings.fullscreen_warning_threshold === 4, "Warning threshold updated to 4 strikes");

    // Reset durations to standard defaults
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        phase1_duration_minutes: 45,
        phase2_duration_minutes: 30,
        fullscreen_warning_threshold: 3,
        ...(hasActiveExams
          ? {
              forceEmergencyBypass: true,
              justification: "Reverting parameters to standard defaults",
            }
          : {}),
      }),
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Preflight Checklist Verification
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Preflight Checklist Verification ---");

    // Pre-seed official curriculum to ensure checks pass
    await fetch(`${BASE_URL}/api/admin/questions/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });
    await fetch(`${BASE_URL}/api/admin/coding-problems/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    const preflightRes = await fetch(`${BASE_URL}/api/admin/settings/preflight`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(preflightRes.ok, "GET /api/admin/settings/preflight returns HTTP 200");
    const preflightData = await preflightRes.json();
    assert(preflightData.success === true, "Preflight response success is true");
    assert(Array.isArray(preflightData.checks), "Preflight contains checklist array");
    assert(preflightData.checks.length >= 7, "Preflight contains at least 7 comprehensive checklist gates");

    const mcqCheck = preflightData.checks.find((c) => c.id === "mcq_questions_count");
    assert(mcqCheck && mcqCheck.passed === true, "Preflight Check: 40 MCQ question bank completeness passed");

    const marksCheck = preflightData.checks.find((c) => c.id === "mcq_marks_total");
    assert(marksCheck && marksCheck.passed === true, "Preflight Check: 80 Marks MCQ distribution balance passed");

    const codingCheck = preflightData.checks.find((c) => c.id === "coding_problems_valid");
    assert(codingCheck && codingCheck.passed === true, "Preflight Check: 2 coding problems per track passed");

    const hiddenCheck = preflightData.checks.find((c) => c.id === "hidden_test_cases_valid");
    assert(hiddenCheck && hiddenCheck.passed === true, "Preflight Check: Hidden evaluation test cases present");

    const paramsCheck = preflightData.checks.find((c) => c.id === "settings_valid");
    assert(paramsCheck && paramsCheck.passed === true, "Preflight Check: Parameter validity passed");

    assert(typeof preflightData.canStart === "boolean", "Preflight returns overall canStart boolean verdict");

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Guarded State Machine & Lifecycle Transitions
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Guarded State Machine & Lifecycle Transitions ---");

    // Try arbitrary illegal jump: e.g. from current state directly to 'in_progress' when in 'draft'
    // First ensure we are in 'draft'
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ status: "draft" }),
    });

    const illegalJumpRes = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ target_status: "in_progress" }),
    });
    assert(
      illegalJumpRes.status === 400,
      "State Guard: Arbitrary jump from 'draft' directly to 'in_progress' is strictly REJECTED with 400"
    );
    const illegalData = await illegalJumpRes.json();
    assert(
      illegalData.error.includes("INVALID_STATE_TRANSITION"),
      "Error explicitly indicates INVALID_STATE_TRANSITION"
    );

    // Controlled Step 1: Draft -> Registration Open
    const step1Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ target_status: "registration_open" }),
    });
    assert(step1Res.ok, "Lifecycle Step 1: Draft -> Registration Open succeeds with HTTP 200");
    const step1Data = await step1Res.json();
    assert(step1Data.settings.status === "registration_open", "Status confirmed: registration_open");
    assert(step1Data.settings.registration_status === "open", "Side effect: registration_status set to 'open'");

    // Enroll candidate while registration is open
    const rollK = `24BCA${String(timestamp).slice(-4)}L`;
    const regRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Preflight Test Student",
        roll_number: rollK,
        course: "BCA",
        email: `preflight.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    assert(regRes.ok, "Candidate successfully registered during open registration window");

    // Controlled Step 2: Registration Open -> Registration Closed
    const step2Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ target_status: "registration_closed" }),
    });
    assert(step2Res.ok, "Lifecycle Step 2: Registration Open -> Registration Closed succeeds");
    const step2Data = await step2Res.json();
    assert(step2Data.settings.status === "registration_closed", "Status confirmed: registration_closed");
    assert(step2Data.settings.registration_status === "closed", "Side effect: registration_status set to 'closed'");

    // Controlled Step 3: Registration Closed -> Ready
    const step3Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ target_status: "ready" }),
    });
    assert(step3Res.ok, "Lifecycle Step 3: Registration Closed -> Ready succeeds (Preflight validated)");
    const step3Data = await step3Res.json();
    assert(step3Data.settings?.status === "ready", "Status confirmed: ready");

    // Controlled Step 4: Ready -> In Progress (Start Competition)
    const step4Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        target_status: "in_progress",
        justification: "Official competition launched by examination controller",
      }),
    });
    assert(step4Res.ok, "Lifecycle Step 4: Ready -> In Progress succeeds (Competition Launched)");
    const step4Data = await step4Res.json();
    assert(step4Data.settings.status === "in_progress", "Status confirmed: in_progress (Live)");

    // Controlled Step 5: In Progress -> Completed (Conclude Competition)
    const step5Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        target_status: "completed",
        justification: "Examination timer elapsed for all cohorts",
      }),
    });
    assert(step5Res.ok, "Lifecycle Step 5: In Progress -> Completed succeeds");
    const step5Data = await step5Res.json();
    assert(step5Data.settings.status === "completed", "Status confirmed: completed");

    // Controlled Step 6: Completed -> Results Published
    const step6Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ target_status: "results_published" }),
    });
    assert(step6Res.ok, "Lifecycle Step 6: Completed -> Results Published succeeds");
    const step6Data = await step6Res.json();
    assert(step6Data.settings.status === "results_published", "Status confirmed: results_published");
    assert(step6Data.settings.results_published === true, "Side effect: results_published set to true");

    // Controlled Step 7: Results Published -> Completed (Unpublish / Retract)
    const step7Res = await fetch(`${BASE_URL}/api/admin/settings/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ target_status: "completed" }),
    });
    assert(step7Res.ok, "Lifecycle Step 7: Unpublish results back to Completed succeeds");
    const step7Data = await step7Res.json();
    assert(step7Data.settings.status === "completed", "Status reverted to completed");
    assert(step7Data.settings.results_published === false, "Side effect: results_published set to false");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Active Exam Safety Guards
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Active Exam Safety Guards ---");

    // Enroll a test candidate and start active session
    const rollSafe = `24BCA${String(timestamp).slice(-4)}S`;
    const regSafeRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Safety Check Student",
        roll_number: rollSafe,
        course: "BCA",
        email: `safety.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    const regSafeData = await regSafeRes.json();
    const SAFE_CANDIDATE = regSafeData.student;
    const SAFE_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(SAFE_CANDIDATE))}`;

    // Start exam session for candidate
    const safeStartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: SAFE_COOKIE },
    });
    assert(safeStartRes.ok, "Candidate initialized active exam session");

    // Now, admin attempts to alter phase 1 duration while student has an active session
    const unsafeDurRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ phase1_duration_minutes: 60 }),
    });
    assert(
      unsafeDurRes.status === 409,
      "Active Exam Safety: Altering duration during active attempt is strictly REJECTED with 409"
    );
    const unsafeDurData = await unsafeDurRes.json();
    assert(
      unsafeDurData.error.includes("ACTIVE_EXAM_PROTECTION"),
      "Error explicitly reports ACTIVE_EXAM_PROTECTION"
    );

    // Attempting to alter fullscreen strike threshold during active exam is also blocked
    const unsafeStrikeRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ fullscreen_warning_threshold: 5 }),
    });
    assert(
      unsafeStrikeRes.status === 409,
      "Active Exam Safety: Altering warning threshold during active attempt is strictly REJECTED with 409"
    );

    // Non-critical parameter modification (e.g. Helpdesk Phone) is permitted without disrupting exam
    const safeParamRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ contact_phone: "+91-621-2268199" }),
    });
    assert(safeParamRes.ok, "Safe parameter update (contact phone) permitted during active exams");

    // Emergency bypass with justification
    const emergencyRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        phase1_duration_minutes: 45,
        forceEmergencyBypass: true,
        justification: "Approved technical accommodation for server power fluctuation",
      }),
    });
    assert(emergencyRes.ok, "Emergency bypass with valid justification succeeds with HTTP 200");

    // Clean up active candidate attempt
    await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: SAFE_COOKIE },
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Audit Logs Persistence, Querying & Privacy Guard
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Audit Logs Persistence, Querying & Privacy Guard ---");

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(auditRes.ok, "GET /api/admin/audit-logs returns HTTP 200 for admin");
    const auditData = await auditRes.json();
    assert(auditData.success === true, "Audit logs response success is true");
    assert(Array.isArray(auditData.logs), "Audit logs returns array of events");
    assert(auditData.total >= 5, "Audit logs records all privileged operations (got at least 5)");

    // Verify key action records exist
    const actions = auditData.logs.map((l) => l.action);
    assert(actions.includes("SETTINGS_UPDATED"), "Audit trail captured 'SETTINGS_UPDATED' event");
    assert(actions.includes("STATE_TRANSITION"), "Audit trail captured 'STATE_TRANSITION' event");

    // Privacy Guard: verify sensitive keys are never exposed in audit logs
    const auditJson = JSON.stringify(auditData.logs);
    assert(
      !auditJson.includes("password") && !auditJson.includes("api_key") && !auditJson.includes("secret"),
      "Privacy Mandate: Zero passwords, API keys, or raw tokens present in audit records"
    );

    // Search and filter verification
    const filteredRes = await fetch(`${BASE_URL}/api/admin/audit-logs?action=STATE_TRANSITION`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(filteredRes.ok, "Action-filtered audit query returns HTTP 200");
    const filteredData = await filteredRes.json();
    const allStateTransitions = filteredData.logs.every((l) => l.action === "STATE_TRANSITION");
    assert(allStateTransitions, "Action filter strictly returns only STATE_TRANSITION events");

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Audit Logs CSV Export & Formula Protection
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Audit Logs CSV Export & Formula Protection ---");

    const exportRes = await fetch(`${BASE_URL}/api/admin/audit-logs/export`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(exportRes.ok, "GET /api/admin/audit-logs/export returns HTTP 200 for admin");
    assert(
      exportRes.headers.get("content-type")?.includes("text/csv"),
      "Content-Type header specifies 'text/csv'"
    );

    const arrayBuffer = await exportRes.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const hasUtf8Bom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    assert(hasUtf8Bom, "Excel Compatibility: Audit CSV begins with UTF-8 BOM (0xEF, 0xBB, 0xBF)");

    const csvText = new TextDecoder("utf-8").decode(arrayBuffer);
    assert(csvText.includes("Timestamp,Administrator,Action,Target Resource"), "CSV contains standard audit column headers");
    assert(csvText.includes("SETTINGS_UPDATED"), "CSV contains recorded SETTINGS_UPDATED event");
    assert(csvText.includes("STATE_TRANSITION"), "CSV contains recorded STATE_TRANSITION event");
    assert(
      !csvText.includes("password") && !csvText.includes("secret"),
      "Audit CSV Security: Passwords and tokens never leaked in export"
    );

  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    failed++;
  }

  console.log("\n========================================================");
  console.log(`  PHASE L TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseLTests();
