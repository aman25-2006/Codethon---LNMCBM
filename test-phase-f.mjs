/**
 * LNMCBM College Coding Competition Portal
 * Phase F Automated Verification Test Suite
 *
 * Covers:
 * 1. Admin Authentication & Route Protection
 * 2. 40 Questions / 80 Marks Curriculum Validation & Readiness Metrics
 * 3. Question Bank CRUD Operations (Create, Read, Update, Delete)
 * 4. CSV Template Download & Bulk Import Validation
 * 5. Case Study Passage Association & Rules Enforcement
 * 6. Answer Key Security Mandate (Candidate API strictly strips answers/explanations)
 * 7. Deterministic Attempt-Stable Randomization (Order-stable on reload, distinct across students)
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
  JSON.stringify({
    id: "admin-audit-id",
    email: "admin@lnmcbm.ac.in",
    name: "System Exam Controller",
    role: "admin",
  })
)}`;

const STUDENT_A_COOKIE = `lnmcbm_student_session=${encodeURIComponent(
  JSON.stringify({
    id: "test-candidate-uuid-1",
    roll_number: "24BCA001",
    full_name: "Aman Kumar",
    course: "BCA",
    participant_id: "LNMC-COD-0001",
  })
)}`;

const STUDENT_B_COOKIE = `lnmcbm_student_session=${encodeURIComponent(
  JSON.stringify({
    id: "test-candidate-uuid-2",
    roll_number: "24BCA002",
    full_name: "Priya Sharma",
    course: "MCA",
    participant_id: "LNMC-COD-0002",
  })
)}`;

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
  console.log("  LNMCBM PHASE F: MCQ QUESTION BANK & IMPORT TEST SUITE");
  console.log("========================================================\n");

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Admin Authorization
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Admin Auth ---");

    const unauthGetRes = await fetch(`${BASE_URL}/api/admin/questions`);
    assert(unauthGetRes.status === 401, "GET /api/admin/questions rejects unauthenticated requests with 401");

    const unauthPostRes = await fetch(`${BASE_URL}/api/admin/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_text: "Unauthorized test" }),
    });
    assert(unauthPostRes.status === 401, "POST /api/admin/questions rejects unauthenticated requests with 401");

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Seed Official 40-Question, 80-Mark Curriculum
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Official Curriculum Seeding & Readiness Metrics ---");

    const seedRes = await fetch(`${BASE_URL}/api/admin/questions/seed`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });
    const seedData = await seedRes.json();
    assert(seedRes.status === 200 && seedData.success === true, "POST /api/admin/questions/seed succeeds", `status: ${seedRes.status}`);
    assert(seedData.count === 40, `Seeded exactly 40 curriculum questions (got: ${seedData.count})`);

    // Verify Metrics via GET /api/admin/questions
    const listRes = await fetch(`${BASE_URL}/api/admin/questions`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const listData = await listRes.json();
    assert(listRes.status === 200 && listData.success === true, "GET /api/admin/questions returns 200 with metrics");

    const m = listData.metrics;
    assert(m.enabled === 40, `Enabled active questions is 40 (got: ${m.enabled})`);
    assert(m.totalMarks === 80, `Total curriculum marks equals exactly 80 (got: ${m.totalMarks})`);
    assert(m.isValidExamSet === true, "Question bank readiness flag isValidExamSet is true");

    // Check individual category requirements
    const cats = m.categories;
    assert(
      cats["Fundamentals"].count === 10 && cats["Fundamentals"].totalMarks === 10 && cats["Fundamentals"].isSatisfied,
      "Fundamentals satisfies: 10 questions @ 1 mark = 10 marks"
    );
    assert(
      cats["Technical Understanding"].count === 10 && cats["Technical Understanding"].totalMarks === 20 && cats["Technical Understanding"].isSatisfied,
      "Technical Understanding satisfies: 10 questions @ 2 marks = 20 marks"
    );
    assert(
      cats["Logic and Debugging"].count === 10 && cats["Logic and Debugging"].totalMarks === 30 && cats["Logic and Debugging"].isSatisfied,
      "Logic and Debugging satisfies: 10 questions @ 3 marks = 30 marks"
    );
    assert(
      cats["Case Study"].count === 10 && cats["Case Study"].totalMarks === 20 && cats["Case Study"].isSatisfied,
      "Case Study satisfies: 10 questions @ 2 marks = 20 marks"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Single Question CRUD Operations
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Question CRUD Operations & Validation ---");

    // Create a new question
    const createRes = await fetch(`${BASE_URL}/api/admin/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        category: "Fundamentals",
        question_text: "Which protocol is connection-oriented at the transport layer?",
        options: {
          A: "UDP",
          B: "TCP",
          C: "IP",
          D: "ICMP",
        },
        correct_option: "B",
        explanation: "TCP requires a three-way handshake to establish a reliable stream.",
        marks: 1,
        is_active: false, // created inactive so it doesn't disturb the 40-question readiness
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.success === true, "POST /api/admin/questions creates single question with options");
    const createdId = createData.question.id;

    // Retrieve single question by ID
    const getSingleRes = await fetch(`${BASE_URL}/api/admin/questions/${createdId}`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    const getSingleData = await getSingleRes.json();
    assert(getSingleRes.status === 200 && getSingleData.question.id === createdId, "GET /api/admin/questions/[id] retrieves created question");
    assert(getSingleData.question.correct_option_key === "B", "Question returns correct option key B to admin");

    // Update single question
    const updateRes = await fetch(`${BASE_URL}/api/admin/questions/${createdId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        question_text: "Updated: Which transport protocol provides reliable byte streaming?",
        options: {
          A: "UDP",
          B: "UDP-Lite",
          C: "TCP",
          D: "ARP",
        },
        correct_option: "C",
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.success === true, "PUT /api/admin/questions/[id] updates question and answer key");
    assert(updateData.question.correct_option_key === "C", "Updated question correctly stores new key C");

    // Delete the test question
    const deleteRes = await fetch(`${BASE_URL}/api/admin/questions/${createdId}`, {
      method: "DELETE",
      headers: { Cookie: ADMIN_COOKIE },
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success === true, "DELETE /api/admin/questions/[id] removes question");

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Template Download & Bulk CSV Import
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Template Download & Bulk CSV Import ---");

    const templateRes = await fetch(`${BASE_URL}/api/admin/questions/template`);
    assert(templateRes.status === 200, "GET /api/admin/questions/template returns HTTP 200");
    const templateContent = await templateRes.text();
    assert(
      templateContent.includes("category") &&
      templateContent.includes("question") &&
      templateContent.includes("option_a") &&
      templateContent.includes("correct_option"),
      "Template CSV contains required header columns"
    );

    // Bulk import valid rows
    const importRes = await fetch(`${BASE_URL}/api/admin/questions/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        rows: [
          {
            category: "Technical Understanding",
            question: "What is the amortized insertion time for a dynamic array (std::vector / ArrayList)?",
            option_a: "O(1)",
            option_b: "O(n)",
            option_c: "O(log n)",
            option_d: "O(n^2)",
            correct_option: "A",
            explanation: "Occasional geometric doubling yields amortized constant time.",
          },
          {
            category: "Case Study",
            question: "In the banking cluster, which replication mode eliminates data loss upon primary failure?",
            option_a: "Asynchronous replication",
            option_b: "Synchronous multi-AZ replication",
            option_c: "Weekly tape backup",
            option_d: "Eventual consistency only",
            correct_option: "B",
            case_study_passage: "A banking system requires Zero RPO for all account transactions.",
            explanation: "Synchronous replication ensures writes are acknowledged across replicas.",
          },
          {
            // Invalid row for testing rejection
            category: "Case Study",
            question: "Invalid case study missing passage",
            option_a: "A",
            option_b: "B",
            option_c: "C",
            option_d: "D",
            correct_option: "A",
            case_study_passage: "", // Missing passage!
          },
        ],
      }),
    });
    const importData = await importRes.json();
    assert(importRes.status === 200 && importData.success === true, "POST /api/admin/questions/import returns 200 summary");
    assert(importData.summary.importedCount === 2, `Imported exactly 2 valid rows (got: ${importData.summary.importedCount})`);
    assert(importData.summary.failedCount === 1, `Rejected 1 invalid row without passage (got: ${importData.summary.failedCount})`);

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Answer Key Security Mandate
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Candidate Answer Key Security Mandate ---");

    const unauthExamRes = await fetch(`${BASE_URL}/api/student/exam/questions`);
    assert(unauthExamRes.status === 401, "GET /api/student/exam/questions rejects unauthenticated candidate with 401");

    const examRes = await fetch(`${BASE_URL}/api/student/exam/questions`, {
      headers: { Cookie: STUDENT_A_COOKIE },
    });
    const examData = await examRes.json();
    assert(examRes.status === 200 && examData.success === true, "GET /api/student/exam/questions returns HTTP 200 for authenticated candidate");

    // Security Audit of student exam payload: Ensure 0 leaks of answer keys
    let leakDetected = false;
    let questionsChecked = 0;

    for (const q of examData.exam.questions) {
      questionsChecked++;
      if (q.correct_option_key !== undefined || q.correct_option_id !== undefined || q.explanation !== undefined) {
        leakDetected = true;
        break;
      }
    }

    assert(
      !leakDetected && questionsChecked >= 40,
      `Strict Answer Key Isolation: Zero answer keys or explanations leaked across ${questionsChecked} candidate questions`
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Deterministic Attempt-Stable Randomization
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Deterministic Attempt Randomization ---");

    // Request candidate A questions twice with same attemptId/session
    const studentACall1 = await fetch(`${BASE_URL}/api/student/exam/questions?attemptId=candidate_session_1`, {
      headers: { Cookie: STUDENT_A_COOKIE },
    }).then((r) => r.json());

    const studentACall2 = await fetch(`${BASE_URL}/api/student/exam/questions?attemptId=candidate_session_1`, {
      headers: { Cookie: STUDENT_A_COOKIE },
    }).then((r) => r.json());

    // Compare question IDs sequence
    const idsA1 = studentACall1.exam.questions.map((q) => q.id);
    const idsA2 = studentACall2.exam.questions.map((q) => q.id);
    const areSequencesEqualA = idsA1.length === idsA2.length && idsA1.every((id, idx) => id === idsA2[idx]);

    assert(areSequencesEqualA, "Candidate sequence is 100% stable across browser reloads / repeated requests");

    // Compare option texts sequence for question 0
    const optTexts1 = studentACall1.exam.questions[0].options.map((o) => o.option_text);
    const optTexts2 = studentACall2.exam.questions[0].options.map((o) => o.option_text);
    const areOptionsEqualA = optTexts1.every((txt, idx) => txt === optTexts2[idx]);
    assert(areOptionsEqualA, "Option sequence per question is 100% stable across browser reloads");

    // Request candidate B questions with different attemptId
    const studentBCall = await fetch(`${BASE_URL}/api/student/exam/questions?attemptId=candidate_session_2`, {
      headers: { Cookie: STUDENT_B_COOKIE },
    }).then((r) => r.json());

    const idsB = studentBCall.exam.questions.map((q) => q.id);
    const areSequencesDifferent = !idsA1.every((id, idx) => id === idsB[idx]);
    assert(areSequencesDifferent, "Candidate A and Candidate B receive distinct randomized permutations");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failedTests++;
  }

  console.log("\n========================================================");
  console.log(`  PHASE F TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();

