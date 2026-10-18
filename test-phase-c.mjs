// test-phase-c.mjs
// Comprehensive Verification Suite for Phase C: Secure Admin Authentication and Protected Admin Dashboard

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
  console.log("  LNMCBM Coding Competition Portal - Phase C Test Suite  ");
  console.log("========================================================\n");

  // --- Test 1: Unauthenticated request to /api/admin/dashboard-stats ---
  console.log("--- Test 1: Reject unauthenticated request to /api/admin/dashboard-stats ---");
  const unauthStatsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`);
  assert(unauthStatsRes.status === 401, `Rejected unauthenticated dashboard stats with HTTP ${unauthStatsRes.status} (Expected 401)`);

  // --- Test 2: Unauthenticated request to /api/admin/me ---
  console.log("\n--- Test 2: Reject unauthenticated request to /api/admin/me ---");
  const unauthMeRes = await fetch(`${BASE_URL}/api/admin/me`);
  assert(unauthMeRes.status === 401, `Rejected unauthenticated /api/admin/me with HTTP ${unauthMeRes.status} (Expected 401)`);

  // --- Test 3: Invalid Admin Password Authentication ---
  console.log("\n--- Test 3: Reject invalid administrator password ---");
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lnmcbm.ac.in", password: "WrongPassword999!" }),
  });
  assert(badLoginRes.status === 401, `Rejected invalid password with HTTP ${badLoginRes.status} (Expected 401)`);

  // --- Test 4: Valid Admin Login (Bootstrap Administrator) ---
  console.log("\n--- Test 4: Authenticate with valid administrator credentials ---");
  const goodLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lnmcbm.ac.in", password: "AdminLNMCBM2026!" }),
  });
  const goodLoginData = await goodLoginRes.json();
  const setCookie = goodLoginRes.headers.get("set-cookie");
  assert(goodLoginRes.status === 200 && goodLoginData.success === true, `Admin login returned HTTP 200 with success status`);
  assert(setCookie && setCookie.includes("lnmcbm_admin_session"), `Admin session cookie set in HTTP response headers`);

  const cookieHeader = setCookie ? setCookie.split(";")[0] : "";

  // --- Test 5: Verified /api/admin/me With Active Session Cookie ---
  console.log("\n--- Test 5: Verify administrator session via /api/admin/me ---");
  const meRes = await fetch(`${BASE_URL}/api/admin/me`, {
    headers: { Cookie: cookieHeader },
  });
  const meData = await meRes.json();
  assert(
    meRes.status === 200 && meData.authenticated === true && meData.user.role === "admin",
    `Authorized admin identity confirmed: ${meData.user?.name} (${meData.user?.email}) [Role: ${meData.user?.role}]`
  );

  // --- Test 6: Verified /api/admin/dashboard-stats With Active Session Cookie ---
  console.log("\n--- Test 6: Retrieve operational statistics via /api/admin/dashboard-stats ---");
  const statsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
    headers: { Cookie: cookieHeader },
  });
  const statsData = await statsRes.json();
  assert(
    statsRes.status === 200 && typeof statsData.totalStudents === "number",
    `Retrieved dashboard telemetry: Total Students = ${statsData.totalStudents}, Active = ${statsData.activeStudents}, Phase 1 In-Progress = ${statsData.phase1InProgress}`
  );

  // --- Test 7: Middleware Route Protection on /admin/dashboard ---
  console.log("\n--- Test 7: Verify middleware route protection on /admin/dashboard ---");
  const mwUnauthRes = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: "manual" });
  assert(
    mwUnauthRes.status === 307 || mwUnauthRes.status === 302 || mwUnauthRes.status === 308,
    `Unauthenticated visitor redirected by middleware with HTTP ${mwUnauthRes.status} to: ${mwUnauthRes.headers.get("location")}`
  );

  const mwAuthRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Cookie: cookieHeader },
    redirect: "manual",
  });
  assert(mwAuthRes.status === 200, `Authenticated admin allowed access to /admin/dashboard with HTTP ${mwAuthRes.status}`);

  // --- Test 8: Admin Logout API ---
  console.log("\n--- Test 8: Terminate session via /api/auth/logout ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  const logoutData = await logoutRes.json();
  const logoutCookie = logoutRes.headers.get("set-cookie");
  assert(logoutRes.status === 200 && logoutData.success === true, `Logout executed successfully`);
  assert(
    logoutCookie && (logoutCookie.includes("Max-Age=0") || logoutCookie.includes("Expires=")),
    `Session cookie expired and cleared in response headers`
  );

  // --- Test 9: Post-Logout Route Protection Verification ---
  console.log("\n--- Test 9: Verify access is blocked post-logout ---");
  const postLogoutMe = await fetch(`${BASE_URL}/api/admin/me`, {
    headers: { Cookie: "lnmcbm_admin_session=; Path=/; Max-Age=0" },
  });
  assert(postLogoutMe.status === 401, `Post-logout request to /api/admin/me correctly rejected with HTTP ${postLogoutMe.status}`);

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

