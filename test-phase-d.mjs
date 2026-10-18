// test-phase-d.mjs
// Comprehensive Verification Suite for Phase D: Student Management, Bulk Import and Registration Control

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
  console.log("  LNMCBM Coding Competition Portal - Phase D Test Suite  ");
  console.log("========================================================\n");

  // --- Step 0: Unauthorized Access Prevention ---
  console.log("--- Test 1: Reject unauthenticated access to /api/admin/students ---");
  const unauthRes = await fetch(`${BASE_URL}/api/admin/students`);
  assert(unauthRes.status === 401, `Unauthenticated GET /api/admin/students returned HTTP ${unauthRes.status} (Expected 401)`);

  const unauthPostRes = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: "Hacker", roll_number: "999", course: "BCA", email: "hacker@evil.com" }),
  });
  assert(unauthPostRes.status === 401, `Unauthenticated POST /api/admin/students returned HTTP ${unauthPostRes.status} (Expected 401)`);

  // --- Step 1: Admin Login to Obtain Valid Session ---
  console.log("\n--- Test 2: Administrator Authentication ---");
  const loginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@lnmcbm.ac.in", password: "AdminLNMCBM2026!" }),
  });
  const setCookie = loginRes.headers.get("set-cookie");
  const cookieHeader = setCookie ? setCookie.split(";")[0] : "";
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: cookieHeader,
  };
  assert(loginRes.status === 200, `Admin authenticated successfully (Cookie: ${cookieHeader ? "Present" : "Missing"})`);

  // --- Step 2: CSV Template Download ---
  console.log("\n--- Test 3: Download CSV Roster Template ---");
  const templateRes = await fetch(`${BASE_URL}/api/admin/students/template`);
  const templateText = await templateRes.text();
  assert(
    templateRes.status === 200 &&
    templateText.includes("Name,Roll Number,Course,Email,Mobile") &&
    templateText.includes("Rahul Kumar"),
    `CSV Template verified with standard header and sample student rows`
  );

  // --- Step 3: Valid Single Student Registration ---
  console.log("\n--- Test 4: Valid Single-Student Registration ---");
  const student1Res = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      full_name: "Aakash Verma",
      roll_number: "23BCA001",
      course: "BCA",
      email: "aakash.verma@lnmcbm.ac.in",
      mobile: "9876543201",
    }),
  });
  const student1Data = await student1Res.json();
  assert(
    student1Res.status === 201 &&
    student1Data.student?.roll_number === "23BCA001" &&
    student1Data.student?.participant_id?.startsWith("LNMC-COD-"),
    `Candidate enrolled: ${student1Data.student?.full_name} [${student1Data.student?.participant_id}] (Roll: ${student1Data.student?.roll_number})`
  );

  const student1Id = student1Data.student?.id;

  // --- Step 4: Invalid Email Rejection ---
  console.log("\n--- Test 5: Reject Registration with Invalid Email ---");
  const badEmailRes = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      full_name: "Invalid Candidate",
      roll_number: "23BCA002",
      course: "BCA",
      email: "not-an-email",
    }),
  });
  const badEmailData = await badEmailRes.json();
  assert(
    badEmailRes.status === 400 && badEmailData.error?.includes("valid email"),
    `Server rejected invalid email syntax: "${badEmailData.error}"`
  );

  // --- Step 5: Duplicate Roll Number Rejection ---
  console.log("\n--- Test 6: Reject Duplicate Roll Number ---");
  const dupRollRes = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      full_name: "Imposter Candidate",
      roll_number: "23BCA001", // already registered
      course: "MCA",
      email: "different.email@lnmcbm.ac.in",
    }),
  });
  const dupRollData = await dupRollRes.json();
  assert(
    dupRollRes.status === 409 && dupRollData.error?.includes("already registered"),
    `Server rejected duplicate roll number with HTTP 409: "${dupRollData.error}"`
  );

  // --- Step 6: Bulk Import CSV with Valid and Duplicate/Invalid Rows ---
  console.log("\n--- Test 7: Bulk CSV Import with Validation & Collision Detection ---");
  const batchImportRows = [
    { name: "Pooja Mishra", roll_number: "23MCA101", course: "MCA", email: "pooja.mishra@lnmcbm.ac.in", mobile: "9876543202" },
    { name: "Rohan Kumar", roll_number: "23BCA003", course: "BCA", email: "rohan.kumar@lnmcbm.ac.in", mobile: "9876543203" },
    { name: "Duplicate In Batch", roll_number: "23MCA101", course: "MCA", email: "another.pooja@lnmcbm.ac.in" }, // Duplicate in file
    { name: "Already In DB", roll_number: "23BCA001", course: "BCA", email: "existing.aakash@lnmcbm.ac.in" }, // Existing in DB
    { name: "Bad Email Candidate", roll_number: "23BBA005", course: "BBA", email: "bad-email-format" }, // Bad email
    { name: "", roll_number: "23MBA006", course: "MBA", email: "no.name@lnmcbm.ac.in" }, // Missing name
    { name: "Suresh Sinha", roll_number: "23BBA201", course: "BBA", email: "suresh.sinha@lnmcbm.ac.in", mobile: "" }, // Valid with empty mobile
  ];

  const importRes = await fetch(`${BASE_URL}/api/admin/students/import`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ rows: batchImportRows }),
  });
  const importData = await importRes.json();
  const summary = importData.summary;

  assert(
    importRes.status === 200 &&
    summary.totalRows === 7 &&
    summary.importedCount === 3 && // Pooja, Rohan, Suresh
    summary.skippedCount === 1 &&  // Already In DB (23BCA001)
    summary.failedCount === 3,     // Duplicate In Batch, Bad Email, Missing Name
    `Bulk import processed: Total = ${summary?.totalRows}, Imported = ${summary?.importedCount}, Skipped = ${summary?.skippedCount}, Failed = ${summary?.failedCount}`
  );

  // --- Step 7: Search and Filter Verification ---
  console.log("\n--- Test 8: Search and Filter Functionality ---");
  // Filter by course MCA
  const mcaRes = await fetch(`${BASE_URL}/api/admin/students?course=MCA`, { headers: authHeaders });
  const mcaData = await mcaRes.json();
  assert(
    mcaData.students.length === 1 && mcaData.students[0].roll_number === "23MCA101",
    `Filter by course (MCA) returned exactly 1 student: ${mcaData.students[0]?.full_name}`
  );

  // Search by name "Pooja"
  const searchRes = await fetch(`${BASE_URL}/api/admin/students?search=Pooja`, { headers: authHeaders });
  const searchData = await searchRes.json();
  assert(
    searchData.students.length === 1 && searchData.students[0].roll_number === "23MCA101",
    `Search query ("Pooja") returned: ${searchData.students[0]?.full_name}`
  );

  // Verify Metrics aggregation
  const allRes = await fetch(`${BASE_URL}/api/admin/students`, { headers: authHeaders });
  const allData = await allRes.json();
  assert(
    allData.metrics?.total >= 4 && allData.metrics?.active >= 4,
    `Aggregated telemetry: Total Students = ${allData.metrics?.total}, Active = ${allData.metrics?.active}`
  );

  // --- Step 8: Edit Student Record ---
  console.log("\n--- Test 9: Edit Permitted Student Details ---");
  const updateRes = await fetch(`${BASE_URL}/api/admin/students/${student1Id}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      full_name: "Aakash Verma (Updated)",
      course: "BCA",
      mobile: "9998887776",
    }),
  });
  const updateData = await updateRes.json();
  assert(
    updateRes.status === 200 && updateData.student?.full_name === "Aakash Verma (Updated)",
    `Updated candidate name to: ${updateData.student?.full_name} and mobile to: ${updateData.student?.mobile}`
  );

  // --- Step 9: Toggle Active / Inactive Status ---
  console.log("\n--- Test 10: Toggle Participation Status (Suspend / Reactivate) ---");
  const toggleRes = await fetch(`${BASE_URL}/api/admin/students/${student1Id}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ is_active: false }),
  });
  const toggleData = await toggleRes.json();
  assert(
    toggleRes.status === 200 && toggleData.student?.is_active === false,
    `Candidate status updated to: Suspended (is_active: ${toggleData.student?.is_active})`
  );

  const recheckMetrics = await fetch(`${BASE_URL}/api/admin/students`, { headers: authHeaders });
  const recheckData = await recheckMetrics.json();
  assert(
    recheckData.metrics?.inactive >= 1 && recheckData.metrics?.active >= 3,
    `Metrics correctly reflected suspension: Active = ${recheckData.metrics?.active}, Suspended = ${recheckData.metrics?.inactive}`
  );

  // Reactivate student
  await fetch(`${BASE_URL}/api/admin/students/${student1Id}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ is_active: true }),
  });

  // --- Step 10: Delete Student Record ---
  console.log("\n--- Test 11: Remove Candidate Record ---");
  const deleteRes = await fetch(`${BASE_URL}/api/admin/students/${student1Id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  assert(deleteRes.status === 200, `Candidate deleted successfully with HTTP 200`);

  const afterDeleteRes = await fetch(`${BASE_URL}/api/admin/students/${student1Id}`, { headers: authHeaders });
  assert(afterDeleteRes.status === 404, `Deleted candidate returned HTTP 404 on subsequent lookup`);

  // Clean up bulk imported test candidates
  for (const st of importData.summary?.importedStudents || []) {
    await fetch(`${BASE_URL}/api/admin/students/${st.id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
  }

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

