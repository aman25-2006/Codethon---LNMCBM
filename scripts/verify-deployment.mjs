/**
 * LNMCBM College Coding Competition Portal
 * Pre-Flight Deployment Verification Script
 *
 * Runs sanity checks on the live deployment:
 * 1. Health check & Homepage HTTP 200
 * 2. Static asset & Logo availability
 * 3. Admin Login Desk
 * 4. Student Login Desk
 * 5. Public Verification Route (404 expected for non-existent code)
 * 6. Admin Auth Guard (401 expected for invalid credentials)
 * 7. Admin Login with Valid Credentials (200 expected)
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function verifyDeployment() {
  console.log("\n===============================================================================");
  console.log("  LNMCBM COMPETITION PORTAL: PRE-FLIGHT DEPLOYMENT VERIFICATION");
  console.log("===============================================================================");
  console.log(`  Target URL: ${BASE_URL}\n`);

  let passed = 0;
  let total = 0;

  async function check(name, url, expectedStatus = 200, options = {}) {
    total++;
    process.stdout.write(`  [${total}] Checking ${name}... `);
    try {
      const res = await fetch(`${BASE_URL}${url}`, options);
      if (res.status === expectedStatus) {
        console.log(`✔ PASS (Got expected HTTP ${res.status})`);
        passed++;
        return true;
      } else {
        console.log(`✖ FAILED (Expected HTTP ${expectedStatus}, got HTTP ${res.status})`);
        return false;
      }
    } catch (err) {
      console.log(`✖ ERROR (${err.message})`);
      return false;
    }
  }

  // 1. Homepage & Root Layout
  await check("Landing Page & Syllabus (HTTP 200)", "/", 200);

  // 2. Official College Logo Asset
  await check("Official College Logo Asset (HTTP 200)", "/images/college-logo.png", 200);

  // 3. Admin Login Desk
  await check("Admin Login Desk Page (HTTP 200)", "/login/admin", 200);

  // 4. Student Login Desk
  await check("Student Login Desk Page (HTTP 200)", "/login/student", 200);

  // 5. Public Verification Route (404 expected for dummy code)
  await check("Public Verification Route with Dummy Code (HTTP 404 Expected)", "/api/verify/DUMMY-SAMPLE-CODE", 404);

  // 6. Admin Auth Guard (Rejecting invalid credentials)
  await check("Admin Auth Guard (Rejecting invalid credentials with HTTP 401)", "/api/auth/admin-login", 401, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid@test.com", password: "wrong" }),
  });

  // 7. Admin Valid Login
  await check("Admin Login (Authenticating master exam controller with HTTP 200)", "/api/auth/admin-login", 200, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lnmcbm.ac.in", password: "AdminLNMCBM2026!" }),
  });

  console.log("\n===============================================================================");
  console.log(`  PRE-FLIGHT RESULTS: ${passed}/${total} checks verified successfully.`);
  console.log("===============================================================================\n");
}

verifyDeployment().catch(console.error);

