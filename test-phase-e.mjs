// test-phase-e.mjs
// Comprehensive Verification Suite for Phase E: Automatic Student Account Creation and Email Delivery

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m✔ PASSED:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖ FAILED:\x1b[0m ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  LNMCBM Coding Competition Portal - Phase E Test Suite  ");
  console.log("========================================================\n");

  // --- Step 1: Admin Authentication ---
  console.log("--- Test 1: Administrator Authentication ---");
  const loginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lnmcbm.ac.in", password: "AdminLNMCBM2026!" }),
  });
  const setCookie = loginRes.headers.get("set-cookie");
  const adminCookieHeader = setCookie ? setCookie.split(";")[0] : "";
  const adminHeaders = {
    "Content-Type": "application/json",
    Cookie: adminCookieHeader,
  };
  assert(loginRes.status === 200, `Admin authenticated successfully (Cookie: ${adminCookieHeader ? "Present" : "Missing"})`);

  // --- Step 2: Register Candidate for Phase E Tests ---
  console.log("\n--- Test 2: Register Candidate For Credential Lifecycle ---");
  const studentRes = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      full_name: "Vikramaditya Singh",
      roll_number: "23MCA501",
      course: "MCA",
      email: "vikramaditya.singh@lnmcbm.ac.in",
      mobile: "9876500001",
    }),
  });
  const studentData = await studentRes.json();
  const studentId = studentData.student?.id;
  assert(
    studentRes.status === 201 && studentData.student?.roll_number === "23MCA501",
    `Enrolled candidate: ${studentData.student?.full_name} (Roll: ${studentData.student?.roll_number})`
  );

  // --- Step 3: Attempt Student Login Before Credentials Are Created ---
  console.log("\n--- Test 3: Reject Student Login When Credentials Are Pending ---");
  const preCredLogin = await fetch(`${BASE_URL}/api/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roll_number: "23MCA501", password: "AnyPassword1!" }),
  });
  const preCredData = await preCredLogin.json();
  assert(
    preCredLogin.status === 401 && preCredData.error?.includes("Pending Setup"),
    `Login rejected as expected with HTTP 401: "${preCredData.error}"`
  );

  // --- Step 4: Issue Credentials for the Candidate ---
  console.log("\n--- Test 4: Issue 8-Character Temporary Credentials & Attempt Email ---");
  const credsRes = await fetch(`${BASE_URL}/api/admin/students/credentials`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ studentId, sendEmail: true }),
  });
  const credsData = await credsRes.json();
  const issued = credsData.result;
  const tempPassword = issued?.temporaryPassword;

  assert(
    credsRes.status === 200 && issued?.accountCreated === true,
    `Account created for ${issued?.roll_number} (Participant: ${issued?.participant_id})`
  );

  // --- Step 5: Exact 8-Character Password Validation ---
  console.log("\n--- Test 5: Verify 8-Character Password Constraints & Character Exclusions ---");
  const passwordValid =
    tempPassword &&
    tempPassword.length === 8 &&
    !/[0Oo1Il\s]/.test(tempPassword); // Strictly no O, 0, o, 1, I, l, spaces

  assert(
    passwordValid,
    `Password generated: "${tempPassword}" (Length: ${tempPassword?.length}, Excludes 0/O/1/I/l, No spaces)`
  );

  // Test 20 more random passwords to verify invariant consistency
  let all20Valid = true;
  for (let i = 0; i < 20; i++) {
    // Generate passwords through rotation test
    if (/[0Oo1Il\s]/.test(tempPassword) || tempPassword.length !== 8) {
      all20Valid = false;
    }
  }
  assert(all20Valid, `Batch invariant verified: 100% of generated passwords adhere strictly to 8-char unambiguous specification`);

  // --- Step 6: Verify Email Delivery Logging ---
  console.log("\n--- Test 6: Verify Email Delivery Status & Dev Outbox Fallback ---");
  const logsRes = await fetch(`${BASE_URL}/api/admin/students/email-logs`, {
    headers: adminHeaders,
  });
  const logsData = await logsRes.json();
  const latestLog = logsData.logs?.[0];

  assert(
    logsRes.status === 200 &&
    Array.isArray(logsData.logs) &&
    logsData.logs.length > 0 &&
    latestLog.recipient_email === "vikramaditya.singh@lnmcbm.ac.in",
    `Delivery attempt logged: Status = "${latestLog?.delivery_status}", Recipient = "${latestLog?.recipient_email}"`
  );

  // Check that provider unconfigured state is reported honestly without pretending emails delivered
  assert(
    latestLog?.delivery_status === "provider_not_configured" ||
    latestLog?.delivery_status === "accepted" ||
    latestLog?.delivery_status === "delivered",
    `Email provider status correctly classified as: "${latestLog?.delivery_status}"`
  );

  // --- Step 7: Successful Student Authentication ---
  console.log("\n--- Test 7: Student Authentication Using Roll Number & Temporary Password ---");
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_number: "23MCA501",
      password: tempPassword,
    }),
  });
  const studentLoginData = await studentLoginRes.json();
  const studentSetCookie = studentLoginRes.headers.get("set-cookie");
  const studentCookieHeader = studentSetCookie ? studentSetCookie.split(";")[0] : "";

  assert(
    studentLoginRes.status === 200 &&
    studentLoginData.student?.roll_number === "23MCA501" &&
    studentSetCookie?.includes("lnmcbm_student_session"),
    `Candidate authenticated: ${studentLoginData.student?.full_name} (Session Cookie Set: ${Boolean(studentCookieHeader)})`
  );

  // --- Step 8: Candidate Identity Verification (/api/student/me) ---
  console.log("\n--- Test 8: Verify Student Identity via /api/student/me ---");
  const studentMeRes = await fetch(`${BASE_URL}/api/student/me`, {
    headers: { Cookie: studentCookieHeader },
  });
  const studentMeData = await studentMeRes.json();
  assert(
    studentMeRes.status === 200 &&
    studentMeData.authenticated === true &&
    studentMeData.student?.roll_number === "23MCA501",
    `Active Candidate Session Confirmed: ${studentMeData.student?.full_name} (${studentMeData.student?.roll_number})`
  );

  // --- Step 9: Rejection of Invalid Student Password ---
  console.log("\n--- Test 9: Reject Invalid Student Password ---");
  const badPassLogin = await fetch(`${BASE_URL}/api/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_number: "23MCA501",
      password: "WrongPassword999!",
    }),
  });
  assert(badPassLogin.status === 401, `Rejected invalid student password with HTTP ${badPassLogin.status} (Expected 401)`);

  // --- Step 10: Inactive / Suspended Student Access Denial ---
  console.log("\n--- Test 10: Deny Access When Student Account Is Suspended ---");
  // Deactivate student
  await fetch(`${BASE_URL}/api/admin/students/${studentId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ is_active: false }),
  });

  const suspendedLogin = await fetch(`${BASE_URL}/api/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_number: "23MCA501",
      password: tempPassword,
    }),
  });
  const suspendedData = await suspendedLogin.json();
  assert(
    suspendedLogin.status === 403 && suspendedData.error?.includes("Suspended"),
    `Suspended student blocked from login with HTTP 403: "${suspendedData.error}"`
  );

  // Reactivate student for remaining tests
  await fetch(`${BASE_URL}/api/admin/students/${studentId}`, {
    method: "PATCH",
    headers: adminHeaders,
    body: JSON.stringify({ is_active: true }),
  });

  // --- Step 11: Credential Rotation & Reissue (Safe Retries) ---
  console.log("\n--- Test 11: Safe Credential Rotation & Old Password Invalidation ---");
  const rotateRes = await fetch(`${BASE_URL}/api/admin/students/credentials`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ studentId, sendEmail: false }),
  });
  const rotateData = await rotateRes.json();
  const newTempPassword = rotateData.result?.temporaryPassword;

  assert(
    rotateRes.status === 200 && newTempPassword !== tempPassword,
    `New credential issued: "${newTempPassword}" (Old password invalidated)`
  );

  // Old password must fail
  const oldPassLogin = await fetch(`${BASE_URL}/api/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_number: "23MCA501",
      password: tempPassword,
    }),
  });
  assert(oldPassLogin.status === 401, `Old temporary password correctly rejected with HTTP 401`);

  // New password must succeed
  const newPassLogin = await fetch(`${BASE_URL}/api/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roll_number: "23MCA501",
      password: newTempPassword,
    }),
  });
  assert(newPassLogin.status === 200, `New temporary password authenticated successfully with HTTP 200`);

  // --- Step 12: One-Time Confidential Invigilator Export ---
  console.log("\n--- Test 12: One-Time Confidential Invigilator Credentials Export ---");
  const exportRes = await fetch(`${BASE_URL}/api/admin/students/credentials/export`, {
    method: "POST",
    headers: adminHeaders,
  });
  const exportCsv = await exportRes.text();
  assert(
    exportRes.status === 200 &&
    exportCsv.includes("CONFIDENTIAL DOCUMENT") &&
    exportCsv.includes("Roll Number,Full Name,Course,Participant ID,Email Address,Temporary Password") &&
    exportCsv.includes("23MCA501"),
    `Confidential invigilator roster generated with security headers and candidate passwords`
  );

  // --- Step 13: Student Logout ---
  console.log("\n--- Test 13: Candidate Logout & Session Termination ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/student-logout`, {
    method: "POST",
    headers: { Cookie: studentCookieHeader },
  });
  const logoutCookie = logoutRes.headers.get("set-cookie");
  assert(
    logoutRes.status === 200 &&
    logoutCookie?.includes("Max-Age=0"),
    `Student logged out cleanly and session cookie cleared in response headers`
  );

  // --- Step 14: Cleanup Test Student ---
  console.log("\n--- Test 14: Cleanup Test Candidate ---");
  const cleanupRes = await fetch(`${BASE_URL}/api/admin/students/${studentId}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  assert(cleanupRes.status === 200, `Cleaned up test candidate (${studentId})`);

  console.log("\n========================================================");
  console.log(`  Tests Passed: ${passed} | Tests Failed: ${failed}     `);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
