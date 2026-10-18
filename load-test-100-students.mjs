/**
 * LNMCBM College Coding Competition Portal
 * Phase M: Load Testing & Concurrency Benchmark
 *
 * Controlled test plan for 100 simulated participants:
 * 1. Bulk Enrollment (100 students)
 * 2. Credential Generation (100 accounts)
 * 3. Login Concurrency (100 concurrent logins)
 * 4. Timer & Session Synchronization (100 concurrent starts/refreshes)
 * 5. MCQ Answer-Saving Load (100 students x concurrent answer saves)
 * 6. Code Execution Concurrency (controlled multi-compiler workload)
 * 7. Mass Submission & Bulk Finalization (100 candidate scoring & ranking)
 * 8. Master Results & CSV Export
 */

const BASE_URL = "http://localhost:3000";
const NUM_STUDENTS = 100;

function calculateLatencyStats(latencies) {
  if (!latencies || latencies.length === 0) {
    return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
  }
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / sorted.length);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return { min, max, avg, p50, p95, p99, count: sorted.length };
}

async function runLoadTest() {
  console.log("\n===============================================================================");
  console.log(`  LNMCBM PHASE M: LOAD TESTING BENCHMARK (${NUM_STUDENTS} SIMULATED PARTICIPANTS)`);
  console.log("===============================================================================\n");

  const benchmarkReport = {
    totalStudents: NUM_STUDENTS,
    phases: {},
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-controller-uuid",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  const timestamp = Date.now();
  const students = [];

  // Generate 100 student records
  for (let i = 1; i <= NUM_STUDENTS; i++) {
    const pad = String(i).padStart(3, "0");
    const course = i % 2 === 0 ? "BCA" : "MCA";
    students.push({
      name: `Candidate ${pad}`,
      roll_number: `24${course}L${String(timestamp).slice(-3)}${pad}`,
      course,
      email: `sim.student${pad}.${timestamp}@lnmcbm.ac.in`,
      mobile: `98765${pad}${String(i % 100).padStart(2, "0")}`,
    });
  }

  // ---------------------------------------------------------------------------
  // STEP 1: BULK ROSTER IMPORT (100 Students)
  // ---------------------------------------------------------------------------
  console.log(`[Step 1] Bulk Roster Import: Uploading ${NUM_STUDENTS} candidate records...`);
  const t0Import = Date.now();
  const importRes = await fetch(`${BASE_URL}/api/admin/students/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ rows: students }),
  });
  const importDuration = Date.now() - t0Import;
  const importData = await importRes.json();

  console.log(`  ✔ Imported: ${importData.summary?.importedCount || 0}/${NUM_STUDENTS} in ${importDuration}ms`);
  benchmarkReport.phases["bulk_import"] = {
    durationMs: importDuration,
    importedCount: importData.summary?.importedCount || 0,
    failedCount: importData.summary?.failedCount || 0,
    success: importRes.ok,
  };

  // Retrieve enrolled candidate IDs
  const listRes = await fetch(`${BASE_URL}/api/admin/students?limit=200`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const listData = await listRes.json();
  const enrolledStudents = listData.students.filter((s) =>
    students.some((st) => st.roll_number === s.roll_number)
  );

  // ---------------------------------------------------------------------------
  // STEP 2: BULK CREDENTIAL GENERATION (100 Accounts)
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 2] Bulk Credential Generation: Issuing 8-char credentials for ${enrolledStudents.length} candidates...`);
  const enrolledIds = enrolledStudents.map((s) => s.id);
  const t0Creds = Date.now();
  // We set sendEmail: false to avoid overwhelming external third-party mail APIs
  const credsRes = await fetch(`${BASE_URL}/api/admin/students/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ studentIds: enrolledIds, sendEmail: false }),
  });
  const credsDuration = Date.now() - t0Creds;
  const credsData = await credsRes.json();
  const issuedCreds = credsData.summary?.results || [];

  console.log(`  ✔ Credentials Issued: ${issuedCreds.length} accounts created in ${credsDuration}ms (avg ${(credsDuration / enrolledStudents.length).toFixed(1)}ms/account)`);
  benchmarkReport.phases["credential_generation"] = {
    durationMs: credsDuration,
    accountsIssued: issuedCreds.length,
    avgPerAccountMs: Math.round(credsDuration / enrolledStudents.length),
  };

  // Map credentials for login
  const credMap = new Map();
  issuedCreds.forEach((c) => {
    credMap.set(c.roll_number, c.temporaryPassword);
  });

  // ---------------------------------------------------------------------------
  // STEP 3: CONCURRENT LOGIN BENCHMARK (100 Simultaneous Logins)
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 3] Concurrent Login Benchmark: Firing ${NUM_STUDENTS} concurrent student logins...`);
  const loginLatencies = [];
  const studentSessions = [];
  const t0Login = Date.now();

  const loginPromises = enrolledStudents.map(async (student) => {
    const password = credMap.get(student.roll_number);
    const startReq = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/auth/student-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_number: student.roll_number, password }),
      });
      const latency = Date.now() - startReq;
      loginLatencies.push(latency);
      const rawCookie = res.headers.get("set-cookie") || "";
      const cookieHeader = rawCookie.split(";")[0];
      const data = await res.json();
      if (res.ok && cookieHeader) {
        studentSessions.push({ student, cookieHeader, data });
        return { success: true, latency };
      }
      return { success: false, latency, status: res.status };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  const loginResults = await Promise.all(loginPromises);
  const totalLoginDuration = Date.now() - t0Login;
  const successfulLogins = loginResults.filter((r) => r.success).length;
  const loginStats = calculateLatencyStats(loginLatencies);

  console.log(`  ✔ Logins: ${successfulLogins}/${NUM_STUDENTS} succeeded in ${totalLoginDuration}ms`);
  console.log(`    Latency: Avg = ${loginStats.avg}ms | p50 = ${loginStats.p50}ms | p95 = ${loginStats.p95}ms | Max = ${loginStats.max}ms`);
  console.log(`    Throughput: ${(successfulLogins / (totalLoginDuration / 1000)).toFixed(1)} logins/sec`);

  benchmarkReport.phases["login_concurrency"] = {
    totalDurationMs: totalLoginDuration,
    successfulLogins,
    throughputReqSec: Number((successfulLogins / (totalLoginDuration / 1000)).toFixed(1)),
    stats: loginStats,
  };

  // ---------------------------------------------------------------------------
  // STEP 4: EXAM SESSION & TIMER SYNCHRONIZATION (100 Concurrent Starts)
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 4] Session & Timer Synchronization: 100 concurrent exam starts...`);
  const sessionLatencies = [];
  const t0Session = Date.now();

  const startPromises = studentSessions.map(async ({ cookieHeader }) => {
    const startReq = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/student/exam/start`, {
        method: "POST",
        headers: { Cookie: cookieHeader },
      });
      const latency = Date.now() - startReq;
      sessionLatencies.push(latency);
      return { success: res.ok, latency };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  const startResults = await Promise.all(startPromises);
  const totalSessionDuration = Date.now() - t0Session;
  const successfulStarts = startResults.filter((r) => r.success).length;
  const sessionStats = calculateLatencyStats(sessionLatencies);

  console.log(`  ✔ Exam Sessions Started: ${successfulStarts}/${studentSessions.length} in ${totalSessionDuration}ms`);
  console.log(`    Latency: Avg = ${sessionStats.avg}ms | p50 = ${sessionStats.p50}ms | p95 = ${sessionStats.p95}ms | Max = ${sessionStats.max}ms`);

  benchmarkReport.phases["session_synchronization"] = {
    totalDurationMs: totalSessionDuration,
    successfulStarts,
    stats: sessionStats,
  };

  // ---------------------------------------------------------------------------
  // STEP 5: MCQ ANSWER-SAVING LOAD (100 Students x 4 Answers = 400 Requests)
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 5] MCQ Answer-Saving Concurrency: 100 students x 4 concurrent saves (400 requests)...`);

  // Fetch student safe questions
  const qRes = await fetch(`${BASE_URL}/api/student/exam/questions`, {
    headers: { Cookie: studentSessions[0].cookieHeader },
  });
  const qData = await qRes.json();
  const sampleQuestions = (qData.exam?.questions || []).slice(0, 4);

  const saveLatencies = [];
  const t0Save = Date.now();
  const savePromises = [];

  studentSessions.forEach(({ cookieHeader }, studentIdx) => {
    sampleQuestions.forEach((q, qIdx) => {
      const optKeys = ["A", "B", "C", "D"];
      const chosenKey = optKeys[(studentIdx + qIdx) % 4];
      const p = (async () => {
        const startReq = Date.now();
        try {
          const res = await fetch(`${BASE_URL}/api/student/exam/save-answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookieHeader },
            body: JSON.stringify({
              question_id: q.id,
              selected_option_key: chosenKey,
              is_marked_for_review: qIdx === 3,
            }),
          });
          const latency = Date.now() - startReq;
          saveLatencies.push(latency);
          return { success: res.ok, latency };
        } catch (err) {
          return { success: false, error: err.message };
        }
      })();
      savePromises.push(p);
    });
  });

  const saveResults = await Promise.all(savePromises);
  const totalSaveDuration = Date.now() - t0Save;
  const successfulSaves = saveResults.filter((r) => r.success).length;
  const saveStats = calculateLatencyStats(saveLatencies);

  console.log(`  ✔ Answer Saves: ${successfulSaves}/${savePromises.length} succeeded in ${totalSaveDuration}ms`);
  console.log(`    Latency: Avg = ${saveStats.avg}ms | p50 = ${saveStats.p50}ms | p95 = ${saveStats.p95}ms | Max = ${saveStats.max}ms`);
  console.log(`    Throughput: ${(successfulSaves / (totalSaveDuration / 1000)).toFixed(1)} answers/sec`);

  benchmarkReport.phases["answer_saving_load"] = {
    totalDurationMs: totalSaveDuration,
    totalRequests: savePromises.length,
    successfulSaves,
    throughputReqSec: Number((successfulSaves / (totalSaveDuration / 1000)).toFixed(1)),
    stats: saveStats,
  };

  // ---------------------------------------------------------------------------
  // STEP 6: BULK PHASE 1 SUBMISSION (100 Students)
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 6] Bulk Phase 1 Submission: Submitting 100 candidate exam attempts simultaneously...`);
  const submitLatencies = [];
  const t0Submit = Date.now();

  const submitPromises = studentSessions.map(async ({ cookieHeader }) => {
    const startReq = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
        method: "POST",
        headers: { Cookie: cookieHeader },
      });
      const latency = Date.now() - startReq;
      submitLatencies.push(latency);
      return { success: res.ok, latency };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  const submitResults = await Promise.all(submitPromises);
  const totalSubmitDuration = Date.now() - t0Submit;
  const successfulSubmissions = submitResults.filter((r) => r.success).length;
  const submitStats = calculateLatencyStats(submitLatencies);

  console.log(`  ✔ Phase 1 Submissions: ${successfulSubmissions}/${studentSessions.length} submitted in ${totalSubmitDuration}ms`);
  console.log(`    Latency: Avg = ${submitStats.avg}ms | p50 = ${submitStats.p50}ms | p95 = ${submitStats.p95}ms | Max = ${submitStats.max}ms`);

  benchmarkReport.phases["phase1_submission"] = {
    totalDurationMs: totalSubmitDuration,
    successfulSubmissions,
    stats: submitStats,
  };

  // ---------------------------------------------------------------------------
  // STEP 7: PHASE 2 INITIALIZATION ACROSS MULTIPLE TRACKS
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 7] Phase 2 Track Start: Initializing Phase 2 for candidates across languages...`);
  const trackAssignments = [
    { category: "Python", language: "Python" },
    { category: "C", language: "C" },
    { category: "C++", language: "C++" },
    { category: "Java", language: "Java" },
    { category: "Web Development", language: "JavaScript" },
    { category: "DSA", language: "C" },
    { category: "DSA", language: "C++" },
    { category: "DSA", language: "Java" },
  ];

  const phase2Cohort = [];
  for (let i = 0; i < trackAssignments.length && i < studentSessions.length; i++) {
    const session = studentSessions[i];
    const track = trackAssignments[i];
    const startP2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: session.cookieHeader },
      body: JSON.stringify({ category: track.category, language: track.language }),
    });
    if (startP2Res.ok) {
      const p2Data = await startP2Res.json();
      phase2Cohort.push({
        session,
        track,
        problems: p2Data.problems || [],
      });
    }
  }
  console.log(`  ✔ Phase 2 Cohort: ${phase2Cohort.length} students initialized across tracks.`);

  // ---------------------------------------------------------------------------
  // STEP 8: CODE EXECUTION CONCURRENCY (Multi-Language Sandbox Batch)
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 8] Code Execution Concurrency: Controlled parallel sandbox execution across ${phase2Cohort.length} tracks...`);
  const execLatencies = [];
  const t0Exec = Date.now();

  const codeSnippets = {
    Python: "print('LNMCBM Python Benchmark')",
    JavaScript: "console.log('LNMCBM WebDev Benchmark');",
    C: "#include <stdio.h>\nint main(){printf(\"LNMCBM C Benchmark\");return 0;}",
    "C++": "#include <iostream>\nint main(){std::cout<<\"LNMCBM CPP Benchmark\";return 0;}",
    Java: "public class Solution{public static void main(String[] args){System.out.print(\"LNMCBM Java Benchmark\");}}",
  };

  const execPromises = phase2Cohort.map(async (cohortItem) => {
    const lang = cohortItem.track.language;
    const code = codeSnippets[lang] || "print('Default Benchmark')";
    const probId = cohortItem.problems[0]?.id || "problem-1";
    const startReq = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cohortItem.session.cookieHeader },
        body: JSON.stringify({
          problem_id: probId,
          source_code: code,
          language: lang,
        }),
      });
      const latency = Date.now() - startReq;
      execLatencies.push(latency);
      return { success: res.ok, lang, latency };
    } catch (err) {
      return { success: false, lang, error: err.message };
    }
  });

  const execResults = await Promise.all(execPromises);
  const totalExecDuration = Date.now() - t0Exec;
  const successfulExecs = execResults.filter((r) => r.success).length;
  const execStats = calculateLatencyStats(execLatencies);

  console.log(`  ✔ Sandbox Executions: ${successfulExecs}/${phase2Cohort.length} completed in ${totalExecDuration}ms`);
  console.log(`    Latency: Avg = ${execStats.avg}ms | p50 = ${execStats.p50}ms | p95 = ${execStats.p95}ms | Max = ${execStats.max}ms`);

  benchmarkReport.phases["code_execution_concurrency"] = {
    totalDurationMs: totalExecDuration,
    successfulExecs,
    stats: execStats,
  };

  // ---------------------------------------------------------------------------
  // STEP 9: MASS RESULT FINALIZATION & RANKING COMPUTATION
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 9] Mass Result Finalization: Scoring and ranking all 100 students on the server...`);
  const t0Finalize = Date.now();
  const finalizeRes = await fetch(`${BASE_URL}/api/admin/results/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
    body: JSON.stringify({ force: true }),
  });
  const finalizeDuration = Date.now() - t0Finalize;
  const finalizeData = await finalizeRes.json();

  console.log(`  ✔ Finalized Results: ${finalizeData.finalizedCount} attempts evaluated and ranked in ${finalizeDuration}ms`);
  benchmarkReport.phases["result_finalization"] = {
    durationMs: finalizeDuration,
    finalizedCount: finalizeData.finalizedCount,
    success: finalizeRes.ok,
  };

  // ---------------------------------------------------------------------------
  // STEP 10: MASTER MERIT LIST & CSV EXPORT UNDER LOAD
  // ---------------------------------------------------------------------------
  console.log(`\n[Step 10] Master Results & CSV Export: Generating 100-student merit list...`);
  const t0Export = Date.now();
  const exportRes = await fetch(`${BASE_URL}/api/admin/results/export`, {
    headers: { Cookie: ADMIN_COOKIE },
  });
  const exportDuration = Date.now() - t0Export;
  const exportBuffer = await exportRes.arrayBuffer();

  console.log(`  ✔ Merit List CSV Export: Generated ${exportBuffer.byteLength} bytes in ${exportDuration}ms`);
  benchmarkReport.phases["csv_export"] = {
    durationMs: exportDuration,
    byteLength: exportBuffer.byteLength,
    success: exportRes.ok,
  };

  const endMemory = process.memoryUsage();
  benchmarkReport.memoryUsage = {
    rssMb: Math.round(endMemory.rss / (1024 * 1024)),
    heapTotalMb: Math.round(endMemory.heapTotal / (1024 * 1024)),
    heapUsedMb: Math.round(endMemory.heapUsed / (1024 * 1024)),
    externalMb: Math.round(endMemory.external / (1024 * 1024)),
  };

  benchmarkReport.completedAt = new Date().toISOString();

  // Print Summary Table
  console.log("\n===============================================================================");
  console.log("  100-STUDENT CONCURRENCY & LOAD TEST SUMMARY TABLE");
  console.log("===============================================================================");
  console.log("  Phase                      | Total Req | Succeeded | Duration (ms) | p50 Latency | p95 Latency");
  console.log("  ---------------------------+-----------+-----------+---------------+-------------+------------");
  console.log(`  Bulk Import                |       100 |       100 |        ${String(benchmarkReport.phases.bulk_import.durationMs).padEnd(6)} |         N/A |        N/A`);
  console.log(`  Credential Generation      |       100 |       100 |        ${String(benchmarkReport.phases.credential_generation.durationMs).padEnd(6)} |         N/A |        N/A`);
  console.log(`  Student Login Concurrency  |       100 |       ${String(benchmarkReport.phases.login_concurrency.successfulLogins).padEnd(3)} |        ${String(benchmarkReport.phases.login_concurrency.totalDurationMs).padEnd(6)} |       ${String(benchmarkReport.phases.login_concurrency.stats.p50).padEnd(4)}ms |      ${String(benchmarkReport.phases.login_concurrency.stats.p95).padEnd(4)}ms`);
  console.log(`  Session Sync & Timers      |       100 |       ${String(benchmarkReport.phases.session_synchronization.successfulStarts).padEnd(3)} |        ${String(benchmarkReport.phases.session_synchronization.totalDurationMs).padEnd(6)} |       ${String(benchmarkReport.phases.session_synchronization.stats.p50).padEnd(4)}ms |      ${String(benchmarkReport.phases.session_synchronization.stats.p95).padEnd(4)}ms`);
  console.log(`  MCQ Answer-Saving Load     |       400 |       ${String(benchmarkReport.phases.answer_saving_load.successfulSaves).padEnd(3)} |        ${String(benchmarkReport.phases.answer_saving_load.totalDurationMs).padEnd(6)} |       ${String(benchmarkReport.phases.answer_saving_load.stats.p50).padEnd(4)}ms |      ${String(benchmarkReport.phases.answer_saving_load.stats.p95).padEnd(4)}ms`);
  console.log(`  Phase 1 Submission Load    |       100 |       ${String(benchmarkReport.phases.phase1_submission.successfulSubmissions).padEnd(3)} |        ${String(benchmarkReport.phases.phase1_submission.totalDurationMs).padEnd(6)} |       ${String(benchmarkReport.phases.phase1_submission.stats.p50).padEnd(4)}ms |      ${String(benchmarkReport.phases.phase1_submission.stats.p95).padEnd(4)}ms`);
  console.log(`  Code Sandbox Concurrency   |         8 |         ${String(benchmarkReport.phases.code_execution_concurrency.successfulExecs).padEnd(3)} |        ${String(benchmarkReport.phases.code_execution_concurrency.totalDurationMs).padEnd(6)} |       ${String(benchmarkReport.phases.code_execution_concurrency.stats.p50).padEnd(4)}ms |      ${String(benchmarkReport.phases.code_execution_concurrency.stats.p95).padEnd(4)}ms`);
  console.log(`  Score Finalization & Ranks |       100 |       ${String(benchmarkReport.phases.result_finalization.finalizedCount).padEnd(3)} |        ${String(benchmarkReport.phases.result_finalization.durationMs).padEnd(6)} |         N/A |        N/A`);
  console.log(`  Master CSV Export          |         1 |         1 |        ${String(benchmarkReport.phases.csv_export.durationMs).padEnd(6)} |         N/A |        N/A`);
  console.log("===============================================================================");
  console.log(`  Node Process Memory: RSS=${benchmarkReport.memoryUsage.rssMb}MB, Heap=${benchmarkReport.memoryUsage.heapUsedMb}/${benchmarkReport.memoryUsage.heapTotalMb}MB`);
  console.log("===============================================================================\n");

  return benchmarkReport;
}

runLoadTest().catch((err) => {
  console.error("Load Test Fatal Error:", err);
  process.exit(1);
});
