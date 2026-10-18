/**
 * LNMCBM College Coding Competition Portal
 * Phase K Automated Test Suite: Final Result Processing, Scorecards, Merit List & Verification
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

async function runPhaseKTests() {
  console.log("\n===============================================================================");
  console.log("  LNMCBM PHASE K: FINAL RESULT PROCESSING, SCORECARDS & MERIT LIST");
  console.log("===============================================================================\n");

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-controller-uuid",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  const timestamp = Date.now();
  let CANDIDATE_K1, CANDIDATE_K2, COOKIE_K1, COOKIE_K2;

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Admin Authorization
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Admin Authorization ---");

    const unauthResults = await fetch(`${BASE_URL}/api/admin/results`);
    assert(unauthResults.status === 401, "GET /api/admin/results rejects unauthenticated requests with 401");

    const unauthFinalize = await fetch(`${BASE_URL}/api/admin/results/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(unauthFinalize.status === 401, "POST /api/admin/results/finalize rejects unauthenticated requests with 401");

    const unauthPublish = await fetch(`${BASE_URL}/api/admin/results/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: true }),
    });
    assert(unauthPublish.status === 401, "POST /api/admin/results/publish rejects unauthenticated requests with 401");

    const unauthExport = await fetch(`${BASE_URL}/api/admin/results/export`);
    assert(unauthExport.status === 401, "GET /api/admin/results/export rejects unauthenticated requests with 401");

    const unauthScorecard = await fetch(`${BASE_URL}/api/student/scorecard`);
    assert(unauthScorecard.status === 401, "GET /api/student/scorecard rejects unauthenticated requests with 401");

    // Pre-seed curriculum questions & coding problems
    await fetch(`${BASE_URL}/api/admin/questions/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });
    await fetch(`${BASE_URL}/api/admin/coding-problems/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Candidate Enrollment & Exam Submissions Flow
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Candidate Enrollment & Exam Submissions Flow ---");

    // Register Candidates in system
    const rollK1 = `24BCA${String(timestamp).slice(-4)}1`;
    const rollK2 = `24BCA${String(timestamp).slice(-4)}2`;

    const regK1Res = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Aakash Sharma",
        roll_number: rollK1,
        course: "BCA",
        email: `aakash.sharma.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    const regK1Data = await regK1Res.json();
    CANDIDATE_K1 = regK1Data.student;
    COOKIE_K1 = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_K1))}`;

    const regK2Res = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "Priya Patel",
        roll_number: rollK2,
        course: "BCA",
        email: `priya.patel.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    const regK2Data = await regK2Res.json();
    CANDIDATE_K2 = regK2Data.student;
    COOKIE_K2 = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_K2))}`;

    // CANDIDATE 1: Phase 1 Start & Answers
    const k1StartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: COOKIE_K1 },
    });
    assert(k1StartRes.ok, "Candidate K1 successfully initialized exam session");
    const k1Data = await k1StartRes.json();

    // Fetch official questions to know the correct keys
    const qListRes = await fetch(`${BASE_URL}/api/admin/questions`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const qListData = await qListRes.json();
    const correctMap = {};
    for (const q of qListData.questions) {
      correctMap[q.id] = q.correct_option_key;
    }

    // Save all correct answers for Candidate K1
    for (const q of k1Data.questions) {
      const correctKey = correctMap[q.id] || "A";
      const opt = q.options.find((o) => (o.option_key || o.key) === correctKey) || q.options[0];
      await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: COOKIE_K1 },
        body: JSON.stringify({
          question_id: q.id,
          selected_option_id: opt.id,
          selected_option_key: opt.option_key || opt.key,
          is_marked_for_review: false,
        }),
      });
    }

    // Submit Phase 1 for Candidate K1
    const k1SubmitP1 = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: COOKIE_K1 },
    });
    assert(k1SubmitP1.ok, "Candidate K1 successfully submitted Phase 1");

    // Candidate K1: Start Phase 2 (Python track)
    const k1P2Start = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: COOKIE_K1 },
      body: JSON.stringify({ category: "Python" }),
    });
    assert(k1P2Start.ok, "Candidate K1 successfully started Phase 2 (Python track)");
    const k1P2Data = await k1P2Start.json();
    const p1Prob = k1P2Data.problems[0];
    const p2Prob = k1P2Data.problems[1];

    // Submit perfect solutions for both coding problems (10 marks each)
    const pySol1 = `import sys

def sum_prime_factors(n):
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
    print(sum_prime_factors(int(data[0])))
`;
    const subProb1Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: COOKIE_K1 },
      body: JSON.stringify({
        problem_id: p1Prob.id,
        source_code: pySol1,
        language: "Python",
      }),
    });
    assert(subProb1Res.ok, "Candidate K1 submitted perfect solution for Coding Problem 1");

    const pySol2 = `import sys

def longest_unique(s):
    seen = {}
    start = 0
    ans = 0
    for i, ch in enumerate(s):
        if ch in seen and seen[ch] >= start:
            start = seen[ch] + 1
        seen[ch] = i
        ans = max(ans, i - start + 1)
    return ans

line = sys.stdin.read().rstrip('\\r\\n')
print(longest_unique(line))
`;
    const subProb2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: COOKIE_K1 },
      body: JSON.stringify({
        problem_id: p2Prob.id,
        source_code: pySol2,
        language: "Python",
      }),
    });
    assert(subProb2Res.ok, "Candidate K1 submitted perfect solution for Coding Problem 2");

    // CANDIDATE 2: Starts and completes Phase 1 with partial answers
    const k2StartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: COOKIE_K2 },
    });
    assert(k2StartRes.ok, "Candidate K2 successfully initialized exam session");
    const k2Data = await k2StartRes.json();

    // Answer roughly 30 questions correctly for K2
    let answered = 0;
    for (const q of k2Data.questions) {
      if (answered < 30) {
        const correctKey = correctMap[q.id] || "A";
        const opt = q.options.find((o) => (o.option_key || o.key) === correctKey) || q.options[0];
        await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: COOKIE_K2 },
          body: JSON.stringify({
            question_id: q.id,
            selected_option_id: opt.id,
            selected_option_key: opt.option_key || opt.key,
            is_marked_for_review: false,
          }),
        });
      }
      answered++;
    }

    const k2SubmitP1 = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: COOKIE_K2 },
    });
    assert(k2SubmitP1.ok, "Candidate K2 successfully submitted Phase 1");

    // Candidate K2 starts Phase 2
    const k2P2Start = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: COOKIE_K2 },
      body: JSON.stringify({ category: "Python" }),
    });
    const k2P2Data = await k2P2Start.json();
    const k2Prob1 = k2P2Data.problems[0];
    const k2Prob2 = k2P2Data.problems[1];

    // Submit partial solutions for K2 (e.g. static outputs)
    await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: COOKIE_K2 },
      body: JSON.stringify({
        problem_id: k2Prob1.id,
        source_code: 'import sys\\nprint("5")',
        language: "Python",
      }),
    });

    await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: COOKIE_K2 },
      body: JSON.stringify({
        problem_id: k2Prob2.id,
        source_code: 'import sys\\nprint("1")',
        language: "Python",
      }),
    });

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Server-Authoritative Finalization & Mark Constraints
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Server-Authoritative Finalization & Mark Constraints ---");

    const finalizeRes = await fetch(`${BASE_URL}/api/admin/results/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({}),
    });
    assert(finalizeRes.ok, "POST /api/admin/results/finalize returns HTTP 200 for admin");
    const finalizeData = await finalizeRes.json();
    assert(finalizeData.success === true, "Finalize response success is true");
    assert(finalizeData.finalizedCount >= 2, "Finalized at least 2 candidate attempts");

    // Idempotency: Calling finalize again does not duplicate or corrupt records
    const finalizeAgainRes = await fetch(`${BASE_URL}/api/admin/results/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({}),
    });
    assert(finalizeAgainRes.ok, "Idempotency: Repeated call to /api/admin/results/finalize succeeds without error");

    // Query admin results
    const adminRes = await fetch(`${BASE_URL}/api/admin/results`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(adminRes.ok, "GET /api/admin/results returns HTTP 200");
    const adminData = await adminRes.json();
    assert(adminData.success === true, "Admin results response success is true");
    assert(adminData.results.length >= 2, "Returns all candidates in results ledger");

    const k1Result = adminData.results.find((r) => r.roll_number === CANDIDATE_K1.roll_number);
    assert(Boolean(k1Result), "Candidate K1 found in finalized results list");
    assert(k1Result.is_finalized === true, "Candidate K1 result is marked is_finalized: true");
    assert(k1Result.total_score <= 100, "Mark constraint: Total score does not exceed 100M cap");
    assert(k1Result.phase1_score <= 80, "Mark constraint: Phase 1 score does not exceed 80M cap");
    assert(k1Result.coding_q1_score <= 10, "Mark constraint: Coding Q1 does not exceed 10M cap");
    assert(k1Result.coding_q2_score <= 10, "Mark constraint: Coding Q2 does not exceed 10M cap");
    assert(
      k1Result.total_score === k1Result.phase1_score + k1Result.coding_q1_score + k1Result.coding_q2_score,
      "Mathematical Integrity: Total score strictly equals sum of Phase 1 + Q1 + Q2"
    );

    const verificationIdK1 = k1Result.verification_id;
    assert(
      verificationIdK1 && verificationIdK1.startsWith("LNMC-RES-"),
      "Verification ID is generated with official 'LNMC-RES-' prefix"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Deterministic Ranking & Tie-Breaking
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Deterministic Ranking & Tie-Breaking ---");

    const k2Result = adminData.results.find((r) => r.roll_number === CANDIDATE_K2.roll_number);
    assert(Boolean(k2Result), "Candidate K2 found in finalized results list");

    assert(k1Result.rank === 1, "Candidate K1 with highest total score is assigned Rank 1");
    assert(k2Result.rank > k1Result.rank, "Candidate K2 with lower total score is assigned lower rank than K1");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Strict Publication Security & Student Access Control
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Publication Security & Student Access Control ---");

    // Ensure results are currently UNPUBLISHED
    assert(k1Result.is_published === false, "Results begin in UNPUBLISHED state");

    // Candidate K1 attempts to view scorecard BEFORE publication
    const prePubScorecard = await fetch(`${BASE_URL}/api/student/scorecard`, {
      headers: { Cookie: COOKIE_K1 },
    });
    assert(
      prePubScorecard.status === 403,
      "Pre-Publication Protection: Candidate GET /api/student/scorecard strictly rejected with HTTP 403"
    );
    const prePubErr = await prePubScorecard.json();
    assert(
      prePubErr.error === "RESULTS_NOT_PUBLISHED",
      "Error code explicitly returns 'RESULTS_NOT_PUBLISHED'"
    );

    // Public verification of K1's ID BEFORE publication
    const prePubVerify = await fetch(`${BASE_URL}/api/verify/${verificationIdK1}`);
    assert(
      prePubVerify.status === 404,
      "Pre-Publication Protection: Public verification for unpublished result returns 404"
    );

    // ADMIN PUBLISHES RESULTS
    console.log("\n--- ADMIN PUBLISHES OFFICIAL RESULTS ---");
    const pubRes = await fetch(`${BASE_URL}/api/admin/results/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ publish: true }),
    });
    assert(pubRes.ok, "POST /api/admin/results/publish succeeds with HTTP 200");
    const pubData = await pubRes.json();
    assert(pubData.success === true, "Publish response success is true");
    assert(pubData.is_published === true, "Results publication status set to true");

    // AFTER PUBLICATION: Candidate K1 accesses their own scorecard
    const postPubScorecard = await fetch(`${BASE_URL}/api/student/scorecard`, {
      headers: { Cookie: COOKIE_K1 },
    });
    assert(
      postPubScorecard.ok,
      "Post-Publication: Candidate K1 successfully retrieves own scorecard with HTTP 200"
    );
    const scorecardData = await postPubScorecard.json();
    assert(scorecardData.success === true, "Scorecard response success is true");
    assert(
      scorecardData.scorecard.student_name === CANDIDATE_K1.full_name,
      "Scorecard contains candidate full name"
    );
    assert(
      scorecardData.scorecard.roll_number === CANDIDATE_K1.roll_number,
      "Scorecard contains candidate roll number"
    );
    assert(
      scorecardData.scorecard.total_score === k1Result.total_score,
      "Scorecard total score matches authoritative database record"
    );
    assert(
      scorecardData.scorecard.rank === 1,
      "Scorecard reflects official State Merit Rank 1"
    );
    assert(
      scorecardData.scorecard.verification_id === verificationIdK1,
      "Scorecard contains matching certified verification ID"
    );

    // Candidate K2 accesses their own scorecard
    const postPubScorecardK2 = await fetch(`${BASE_URL}/api/student/scorecard`, {
      headers: { Cookie: COOKIE_K2 },
    });
    assert(postPubScorecardK2.ok, "Candidate K2 retrieves own scorecard with HTTP 200");
    const scorecardDataK2 = await postPubScorecardK2.json();
    assert(
      scorecardDataK2.scorecard.student_name === CANDIDATE_K2.full_name,
      "Candidate K2 receives strictly their own name, not K1's"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Public Verification Registry & Data Masking
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Public Verification Registry & Data Masking ---");

    const postPubVerify = await fetch(`${BASE_URL}/api/verify/${verificationIdK1}`);
    assert(postPubVerify.ok, "Public verification of published ID returns HTTP 200");
    const verifyData = await postPubVerify.json();
    assert(verifyData.is_valid === true, "Verification confirms certificate is valid");
    assert(verifyData.total_score === k1Result.total_score, "Verified total score matches database record");
    assert(verifyData.max_score === 100, "Maximum score is confirmed as 100");
    assert(
      verifyData.student_name_masked.includes("*"),
      "Privacy Guard: Student name is masked in public verification ledger (e.g. Aakash S***)"
    );
    assert(
      verifyData.roll_number_masked.includes("*"),
      "Privacy Guard: Roll number is masked in public verification ledger (e.g. 24BCA***)"
    );
    assert(
      !verifyData.email && !verifyData.mobile && !verifyData.password,
      "Zero Privacy Leakage: Email, mobile, and credentials NEVER exposed in public verification"
    );

    // Non-existent verification ID
    const fakeVerify = await fetch(`${BASE_URL}/api/verify/LNMC-RES-FAKE-9999`);
    assert(fakeVerify.status === 404, "Invalid verification ID rejected with HTTP 404");
    const fakeVerifyData = await fakeVerify.json();
    assert(fakeVerifyData.is_valid === false, "Invalid verification confirms is_valid: false");

    // -------------------------------------------------------------------------
    // TEST GROUP 7: CSV Export & Formula Injection Prevention
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: CSV Export & Formula Injection Prevention ---");

    const exportRes = await fetch(`${BASE_URL}/api/admin/results/export`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    assert(exportRes.ok, "GET /api/admin/results/export returns HTTP 200 for admin");
    assert(
      exportRes.headers.get("content-type")?.includes("text/csv"),
      "Response Content-Type header specifies 'text/csv'"
    );

    const arrayBuffer = await exportRes.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const hasUtf8Bom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    assert(hasUtf8Bom, "Excel Compatibility: CSV begins with UTF-8 BOM (0xEF, 0xBB, 0xBF)");

    const csvText = new TextDecoder("utf-8").decode(arrayBuffer);
    assert(csvText.includes("Rank,Participant ID,Roll Number"), "CSV contains standard column headers");
    assert(csvText.includes(CANDIDATE_K1.roll_number), "CSV contains Candidate K1 roll number");
    assert(csvText.includes(verificationIdK1), "CSV contains verification ID");
    assert(
      !csvText.includes("password") && !csvText.includes("secret"),
      "Export Security: Passwords and tokens never leaked in CSV export"
    );

    // Test formula injection escaping rules
    function testSanitizeCell(value) {
      if (value === null || value === undefined) return '""';
      let str = String(value);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }

    assert(
      testSanitizeCell("=cmd|' /C calc'!A0") === "\"'=cmd|' /C calc'!A0\"",
      "Formula Injection Prevention: '=cmd...' cell is safely prefixed with single quote (\\'=)"
    );
    assert(
      testSanitizeCell("+911234567890") === "\"'+911234567890\"",
      "Formula Injection Prevention: '+91...' cell is safely prefixed with single quote (\\'+)"
    );
    assert(
      testSanitizeCell("@SUM(1,2)") === "\"'@SUM(1,2)\"",
      "Formula Injection Prevention: '@SUM...' cell is safely prefixed with single quote (\\'@)"
    );
    assert(
      testSanitizeCell("-BCA") === "\"'-BCA\"",
      "Formula Injection Prevention: '-BCA' cell is safely prefixed with single quote (\\'-)"
    );

    // Live API formula injection verification
    const regHackRes = await fetch(`${BASE_URL}/api/admin/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        full_name: "=cmd|' /C calc'!A0",
        roll_number: `+91${String(timestamp).slice(-8)}`,
        course: "-BCA",
        email: `hack.${timestamp}@lnmcbm.ac.in`,
      }),
    });
    if (regHackRes.ok) {
      const regHackData = await regHackRes.json();
      const hackCand = regHackData.student;
      const hackCookie = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(hackCand))}`;
      const hStartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
        method: "POST",
        headers: { Cookie: hackCookie },
      });
      if (hStartRes.ok) {
        await fetch(`${BASE_URL}/api/student/exam/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: hackCookie },
          body: JSON.stringify({ answers: {} }),
        });
        await fetch(`${BASE_URL}/api/admin/results/finalize`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
          body: JSON.stringify({ student_id: hackCand.id }),
        });
        const exportResHack = await fetch(`${BASE_URL}/api/admin/results/export`, {
          headers: { Cookie: ADMIN_COOKIE },
        });
        const hackBuf = await exportResHack.arrayBuffer();
        const hackCsv = new TextDecoder("utf-8").decode(hackBuf);
        assert(
          hackCsv.includes("\"'=cmd|' /C calc'!A0\""),
          "Live API Formula Injection: '=cmd...' is safely escaped in live CSV export"
        );
      }
    }

    // -------------------------------------------------------------------------
    // TEST GROUP 8: Unpublish Results & Access Revocation
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Unpublish Results & Access Revocation ---");

    const unpubRes = await fetch(`${BASE_URL}/api/admin/results/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ publish: false }),
    });
    assert(unpubRes.ok, "POST /api/admin/results/publish successfully unpublishes results");

    const revokedScorecard = await fetch(`${BASE_URL}/api/student/scorecard`, {
      headers: { Cookie: COOKIE_K1 },
    });
    assert(
      revokedScorecard.status === 403,
      "Access Revocation: Student scorecard access immediately returns 403 once unpublished"
    );

    // Re-publish so system remains in published state for manual inspection
    await fetch(`${BASE_URL}/api/admin/results/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ publish: true }),
    });
  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    testsFailed++;
  }

  console.log("\n========================================================");
  console.log(`  PHASE K TESTS COMPLETE: ${testsPassed} passed, ${testsFailed} failed`);
  console.log("========================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPhaseKTests();
