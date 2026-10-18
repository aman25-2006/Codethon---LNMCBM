/**
 * LNMCBM College Coding Competition Portal
 * Phase H Automated Verification Test Suite
 *
 * Covers:
 * 1. Category Discovery & Track Configuration Verification
 * 2. Official Problem Seeding (2 problems per track, 5 test cases each, 20M total)
 * 3. Pre-Condition Enforcement (Phase 1 must be completed before Phase 2)
 * 4. Missing Configuration & Invalid Track Rejection
 * 5. DSA Language Track Segregation (C, C++, Java) & Invalid Language Rejection
 * 6. Server-Authoritative 30-Minute Timer Initiation & Idempotency
 * 7. Category & Language Selection Locking (No mid-exam category switching)
 * 8. Strict Phase 1 Score Secrecy & Zero Hidden Test Case Exposure
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
  console.log("  LNMCBM PHASE H: PHASE 2 CATEGORY & TRACK SELECTION");
  console.log("========================================================\n");

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-audit-id",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  const CANDIDATE_H1 = {
    id: `cand-h-1-${Date.now()}`,
    roll_number: "24BCA801",
    full_name: "Sneha Roy",
    course: "BCA",
    participant_id: "LNMC-COD-8001",
  };

  const CANDIDATE_H2 = {
    id: `cand-h-2-${Date.now()}`,
    roll_number: "24BCA802",
    full_name: "Manish Sinha",
    course: "MCA",
    participant_id: "LNMC-COD-8002",
  };

  const CANDIDATE_H1_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_H1))}`;
  const CANDIDATE_H2_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_H2))}`;

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Candidate Authentication
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Candidate Auth ---");

    const unauthCats = await fetch(`${BASE_URL}/api/student/exam/phase2/categories`);
    assert(unauthCats.status === 401, "GET /api/student/exam/phase2/categories rejects unauthenticated requests with 401");

    const unauthStart = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "Python" }),
    });
    assert(unauthStart.status === 401, "POST /api/student/exam/phase2/start rejects unauthenticated requests with 401");

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Seed Official Coding Problems Curriculum
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Preload Official Phase 2 Curriculum ---");

    const seedRes = await fetch(`${BASE_URL}/api/admin/coding-problems/seed`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });
    const seedData = await seedRes.json();
    assert(seedRes.status === 200 && seedData.success === true, "POST /api/admin/coding-problems/seed succeeds");
    assert(seedData.count >= 14, `Seeded at least 14 coding problems across tracks (got: ${seedData.count})`);

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Category Discovery & Track Configuration Verification
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Category Track Discovery & DSA Support ---");

    const catRes = await fetch(`${BASE_URL}/api/student/exam/phase2/categories`, {
      headers: { Cookie: CANDIDATE_H1_COOKIE },
    });
    const catData = await catRes.json();
    assert(catRes.status === 200 && catData.success === true, "GET /api/student/exam/phase2/categories returns 200");

    const categoryNames = catData.categories.map((c) => c.category);
    const expected = ["C", "C++", "Java", "Python", "Web Development", "DSA"];
    const hasAllCategories = expected.every((cat) => categoryNames.includes(cat));
    assert(hasAllCategories, "All 6 required categories present: C, C++, Java, Python, Web Development, DSA");

    const dsaConfig = catData.categories.find((c) => c.category === "DSA");
    assert(dsaConfig.requiresLanguageSelection === true, "DSA category specifies requiresLanguageSelection: true");
    assert(
      dsaConfig.dsaTracks.C.isConfigured &&
      dsaConfig.dsaTracks["C++"].isConfigured &&
      dsaConfig.dsaTracks.Java.isConfigured,
      "DSA language tracks (C, C++, Java) each have at least 2 configured problems"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Pre-Condition Check (Phase 1 Must Be Finished First)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Phase 1 Pre-Condition Verification ---");

    // Candidate H1 has not done Phase 1 yet; attempting to start Phase 2 must fail!
    const prematureStartRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "Python" }),
    });
    assert(
      prematureStartRes.status === 400,
      "POST /api/student/exam/phase2/start rejects candidate if Phase 1 is not completed"
    );

    // Now complete Phase 1 for Candidate H1
    await fetch(`${BASE_URL}/api/admin/questions/seed`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });
    await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_H1_COOKIE },
    });
    const p1SubmitRes = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_H1_COOKIE },
    });
    const p1SubmitData = await p1SubmitRes.json();
    assert(p1SubmitData.completed === true, "Candidate H1 successfully completed Phase 1");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Invalid Track & DSA Language Rejection
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Invalid Category & Language Rejection ---");

    // Missing category
    const missingCatRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "" }),
    });
    assert(missingCatRes.status === 400, "Rejects empty category with 400");

    // Non-existent category
    const invalidCatRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "Rust" }),
    });
    assert(invalidCatRes.status === 400, "Rejects unsupported category 'Rust' with 400");

    // DSA without language
    const dsaNoLangRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "DSA" }),
    });
    assert(dsaNoLangRes.status === 400, "Rejects DSA track without language specification with 400");

    // DSA with invalid language
    const dsaInvalidLangRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "DSA", language: "Go" }),
    });
    assert(dsaInvalidLangRes.status === 400, "Rejects DSA track with unsupported language 'Go' with 400");

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Valid Phase 2 Start & 30-Minute Timer
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Phase 2 Start & Authoritative 30-Minute Clock ---");

    const p2StartRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "DSA", language: "C++" }),
    });
    const p2StartData = await p2StartRes.json();
    assert(p2StartRes.status === 200 && p2StartData.success === true, "POST /api/student/exam/phase2/start succeeds with DSA (C++)");
    assert(p2StartData.category === "DSA" && p2StartData.language === "C++", "Correct track confirmed in session: DSA (C++)");

    // Check 30-minute timer
    const remainingP2 = p2StartData.remainingSeconds;
    assert(
      remainingP2 >= 29 * 60 && remainingP2 <= 30 * 60,
      `Phase 2 countdown initialized to exactly 30 minutes (got: ${remainingP2}s)`
    );

    // Verify 2 assigned problems
    const problems = p2StartData.problems;
    assert(problems.length === 2, `Assigned exactly 2 coding problems (got: ${problems.length})`);
    assert(
      problems.every((p) => p.total_marks === 10),
      "Both assigned problems carry exactly 10 marks each (20 marks total)"
    );

    // Verify ZERO hidden test cases leaked
    const hasHiddenTestsLeaked = problems.some((p) => p.hidden_test_cases !== undefined || p.test_cases !== undefined);
    assert(!hasHiddenTestsLeaked, "Zero hidden test cases exposed in candidate problem payload");

    // Verify Phase 1 score is not leaked
    assert(
      p2StartData.phase1_score === undefined && p2StartData.score === undefined,
      "Strict Score Confidentiality: Phase 1 score remains 100% hidden in Phase 2 payload"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Timer Idempotency & Repeated Clicks
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Timer Idempotency on Repeated Requests ---");

    const p2Expires1 = new Date(p2StartData.session.phase2_expires_at).getTime();

    // Call start again with identical parameters
    const repeatStartRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "DSA", language: "C++" }),
    });
    const repeatStartData = await repeatStartRes.json();
    const p2Expires2 = new Date(repeatStartData.session.phase2_expires_at).getTime();

    assert(
      p2Expires1 === p2Expires2,
      "Timer Idempotency: Repeated Start button clicks or page refreshes NEVER reset the 30-minute timer"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 8: Track & Language Locking (Rejection of Mid-Exam Switching)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Selection Locking Enforcement ---");

    // Attempt to switch category to Python
    const switchCatRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "Python" }),
    });
    assert(
      switchCatRes.status === 400,
      "Category Locking: Switching track from 'DSA' to 'Python' is strictly rejected with HTTP 400"
    );

    // Attempt to switch language to Java within DSA
    const switchLangRes = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
      body: JSON.stringify({ category: "DSA", language: "Java" }),
    });
    assert(
      switchLangRes.status === 400,
      "Language Locking: Switching DSA language from 'C++' to 'Java' is strictly rejected with HTTP 400"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 9: Candidate H2 Language Path Isolation
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 9: Candidate Path Isolation (Python vs DSA) ---");

    // Complete Phase 1 for Candidate H2
    await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_H2_COOKIE },
    });
    await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_H2_COOKIE },
    });

    // Start Phase 2 with Python
    const h2P2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H2_COOKIE },
      body: JSON.stringify({ category: "Python" }),
    });
    const h2P2Data = await h2P2Res.json();
    assert(h2P2Data.category === "Python", "Candidate H2 confirmed in Python track");

    const probIdsH1 = p2StartData.problems.map((p) => p.id);
    const probIdsH2 = h2P2Data.problems.map((p) => p.id);
    const areDifferentProblems = !probIdsH1.every((id) => probIdsH2.includes(id));
    assert(areDifferentProblems, "Path Isolation: DSA (C++) and Python assign distinct problem sets");

    // Conclude Phase 2 for H1 and H2 to ensure clean session state
    for (const p of p2StartData.problems) {
      await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H1_COOKIE },
        body: JSON.stringify({ problem_id: p.id, source_code: "// Clean", language: "C++" }),
      });
    }
    for (const p of h2P2Data.problems) {
      await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: CANDIDATE_H2_COOKIE },
        body: JSON.stringify({ problem_id: p.id, source_code: "# Clean", language: "Python" }),
      });
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failedTests++;
  }

  console.log("\n========================================================");
  console.log(`  PHASE H TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();

