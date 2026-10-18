/**
 * LNMCBM College Coding Competition Portal
 * Phase I Test Suite: Monaco Editor, Isolated Code Execution & Automated Evaluation
 */

import http from "http";
import { executeCode, evaluateHiddenTestCases } from "./src/lib/services/code-execution-service.ts";

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

async function runPhaseITests() {
  console.log("\n========================================================");
  console.log("  LNMCBM PHASE I: CODE EXECUTION & AUTOMATIC EVALUATION");
  console.log("========================================================\n");

  const CANDIDATE_I = {
    id: `cand-i-${Date.now()}`,
    roll_number: "24BCA801",
    full_name: "Sneha Patel",
    course: "BCA",
    email: "sneha.patel@lnmcbm.ac.in",
    participant_id: "LNMC-COD-8001",
  };

  const CANDIDATE_COOKIE = `lnmcbm_student_session=${encodeURIComponent(JSON.stringify(CANDIDATE_I))}`;

  const ADMIN_COOKIE = `lnmcbm_admin_session=${encodeURIComponent(
    JSON.stringify({
      id: "admin-audit-id",
      email: "admin@lnmcbm.ac.in",
      name: "System Exam Controller",
      role: "admin",
    })
  )}`;

  try {
    // -------------------------------------------------------------------------
    // TEST GROUP 1: Route Protection & Candidate Authentication
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Route Protection & Candidate Auth ---");

    const unauthRun = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem_id: "any", source_code: "print(1)", language: "python" }),
    });
    assert(unauthRun.status === 401, "POST /api/student/exam/phase2/run rejects unauthenticated requests with 401");

    const unauthDraft = await fetch(`${BASE_URL}/api/student/exam/phase2/save-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem_id: "any", source_code: "print(1)", language: "python" }),
    });
    assert(unauthDraft.status === 401, "POST /api/student/exam/phase2/save-draft rejects unauthenticated requests with 401");

    const unauthSubmit = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem_id: "any", source_code: "print(1)", language: "python" }),
    });
    assert(unauthSubmit.status === 401, "POST /api/student/exam/phase2/submit rejects unauthenticated requests with 401");

    // -------------------------------------------------------------------------
    // TEST GROUP 2: Direct Multi-Language Code Execution Engine Tests
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Multi-Language Isolated Execution Engine ---");

    // 2.1 Python Execution
    const pyCode = `import sys
lines = sys.stdin.read().split()
if lines:
    print(int(lines[0]) * 2)
`;
    const pyRes = await executeCode("python", pyCode, "21");
    assert(pyRes.status === "success" && pyRes.stdout.trim() === "42", "Python 3: Correctly executes and computes 21 * 2 = 42");

    // 2.2 C Execution
    const cCode = `#include <stdio.h>
int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        printf("%d\\n", n * 3);
    }
    return 0;
}
`;
    const cRes = await executeCode("c", cCode, "10");
    assert(cRes.status === "success" && cRes.stdout.trim() === "30", "C (GCC): Correctly compiles and computes 10 * 3 = 30");

    // 2.3 C++ Execution
    const cppCode = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a + b) << "\\n";
    }
    return 0;
}
`;
    const cppRes = await executeCode("cpp", cppCode, "15 25");
    assert(cppRes.status === "success" && cppRes.stdout.trim() === "40", "C++ (G++): Correctly compiles and computes 15 + 25 = 40");

    // 2.4 Java Execution
    const javaCode = `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int val = sc.nextInt();
            System.out.println(val * val);
        }
    }
}
`;
    const javaRes = await executeCode("java", javaCode, "9");
    assert(javaRes.status === "success" && javaRes.stdout.trim() === "81", "Java (OpenJDK): Correctly compiles and computes 9^2 = 81");

    // 2.5 JavaScript Execution
    const jsCode = `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(input.toUpperCase());
`;
    const jsRes = await executeCode("javascript", jsCode, "hello lnmcbm");
    assert(jsRes.status === "success" && jsRes.stdout.trim() === "HELLO LNMCBM", "JavaScript (Node): Correctly executes uppercase transformation");

    // -------------------------------------------------------------------------
    // TEST GROUP 3: Execution Faults (Compilation, Runtime, Timeout, Wrong Answer)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Execution Faults & Error Handling ---");

    // 3.1 Compilation Error in C++
    const badCppCode = `#include <iostream>
int main() {
    int x = "incompatible string assignment";
    return 0;
}
`;
    const badCppRes = await executeCode("cpp", badCppCode, "");
    assert(badCppRes.status === "compilation_error", "Compilation Error: Incompatible assignment caught with compilation_error status");
    assert(badCppRes.stderr.length > 0, "Compilation Error: Stderr contains compiler diagnostic output");

    // 3.2 Runtime Error in Python
    const badPyCode = `x = 10 / 0\n`;
    const badPyRes = await executeCode("python", badPyCode, "");
    assert(badPyRes.status === "runtime_error", "Runtime Error: ZeroDivisionError correctly captured with runtime_error status");

    // 3.3 Time Limit Exceeded (Infinite Loop in Python)
    const infLoopPyCode = `import time\nwhile True:\n    pass\n`;
    const infLoopRes = await executeCode("python", infLoopPyCode, "", 1500);
    assert(infLoopRes.status === "time_limit_exceeded", "Time Limit Exceeded: Process terminated safely on infinite loop");

    // -------------------------------------------------------------------------
    // TEST GROUP 4: Candidate Phase 1 Prerequisite & Phase 2 Initialization
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Candidate Session & Starter Code Delivery ---");

    // Admin seeds questions & coding problems first
    await fetch(`${BASE_URL}/api/admin/questions/seed?reset=true`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    await fetch(`${BASE_URL}/api/admin/coding-problems/seed`, {
      method: "POST",
      headers: { Cookie: ADMIN_COOKIE },
    });

    // Start Phase 1 & submit to complete prerequisite
    const p1StartRes = await fetch(`${BASE_URL}/api/student/exam/start`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    const p1StartData = await p1StartRes.json();

    const p1SubmitRes = await fetch(`${BASE_URL}/api/student/exam/submit-phase1`, {
      method: "POST",
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    const p1SubmitData = await p1SubmitRes.json();
    assert(p1SubmitData.completed === true, "Candidate successfully completed Phase 1 prerequisite");

    // Start Phase 2 with Python
    const startP2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({ category: "Python" }),
    });
    const startP2Data = await startP2Res.json();
    if (!startP2Res.ok) {
      console.error("Start Phase 2 error response:", startP2Data);
    }
    assert(startP2Res.status === 200 && startP2Data.success === true, "Candidate successfully started Phase 2 (Python track)");

    const prob1 = startP2Data.problems[0];
    const prob2 = startP2Data.problems[1];
    assert(startP2Data.problems.length === 2, "Assigned exactly 2 coding problems");
    assert(startP2Data.workstates[prob1.id] !== undefined, "Prepopulated workstate exists for Problem 1");
    assert(startP2Data.workstates[prob1.id].source_code.includes("Python"), "Problem 1 pre-populated with Python starter template");

    // -------------------------------------------------------------------------
    // TEST GROUP 5: Run Sample Test Endpoint & Rate Limiting
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Sample Test Run & Rate Limiting ---");

    // Problem 1: "Sum of Prime Factors"
    // Sample Input: 12 -> Distinct prime factors of 12 are 2 and 3 -> Sum is 5
    const correctPySol = `import sys

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
    n = int(data[0])
    print(sum_prime_factors(n))
`;

    const runRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob1.id,
        source_code: correctPySol,
        language: "Python",
      }),
    });
    const runData = await runRes.json();
    assert(runRes.status === 200, "POST /api/student/exam/phase2/run returns HTTP 200");
    assert(runData.sample_matches === true, "Sample Test Passed: Candidate output matches problem sample output (5)");
    assert(runData.awarded_marks === undefined, "Zero Marks Leakage: Run endpoint does NOT award marks");
    assert(runData.hidden_test_cases === undefined, "Zero Hidden Test Cases Leakage: Hidden tests never exposed");

    // Rapid successive run to test rate limiting
    const rapidRunRes = await fetch(`${BASE_URL}/api/student/exam/phase2/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob1.id,
        source_code: correctPySol,
        language: "Python",
      }),
    });
    assert(
      rapidRunRes.status === 429,
      "Rate Limiter: Second run within 1.5s is rejected with HTTP 429 Too Many Requests"
    );

    // Wait 2 seconds for rate limiter window to clear
    await new Promise((r) => setTimeout(r, 2000));

    // -------------------------------------------------------------------------
    // TEST GROUP 6: Draft Autosave & Refresh Recovery
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Draft Autosave & Refresh Recovery ---");

    const draftCode = `# Custom working draft for Problem 2\nprint("testing draft")\n`;
    const draftRes = await fetch(`${BASE_URL}/api/student/exam/phase2/save-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob2.id,
        source_code: draftCode,
        language: "Python",
      }),
    });
    const draftData = await draftRes.json();
    assert(draftRes.status === 200 && draftData.success === true, "Draft autosaved successfully");

    // Fetch session state to verify restoration
    const sessionRes = await fetch(`${BASE_URL}/api/student/exam/phase2/session`, {
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    const sessionData = await sessionRes.json();
    assert(
      sessionData.workstates[prob2.id].source_code === draftCode,
      "Refresh Recovery: Autosaved draft restored with 100% fidelity"
    );

    // -------------------------------------------------------------------------
    // TEST GROUP 7: Hidden Test Evaluation & Scoring (All 5 Passing = 10 Marks)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Final Submission & Server-Side Scoring ---");

    // Problem 1: Submit correct prime factor solution
    const submitP1Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob1.id,
        source_code: correctPySol,
        language: "Python",
      }),
    });
    const submitP1Data = await submitP1Res.json();
    assert(submitP1Res.status === 200, "POST /api/student/exam/phase2/submit returns HTTP 200");
    assert(submitP1Data.is_submitted === true, "Problem 1 confirmed submitted");
    assert(submitP1Data.is_all_problems_submitted === false, "Problem 2 remains pending; candidate can continue working");
    assert(submitP1Data.awarded_marks === undefined, "Strict Score Secrecy: Marks strictly hidden from candidate payload");

    // -------------------------------------------------------------------------
    // TEST GROUP 8: Selection Locking & Duplicate Submission Rejection
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Code Locking & Duplicate Rejection ---");

    // Attempting to submit Problem 1 again must be rejected
    const dupSubmitRes = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob1.id,
        source_code: correctPySol,
        language: "Python",
      }),
    });
    assert(dupSubmitRes.status === 400, "Duplicate Submission Protection: Submitting Problem 1 again is rejected with 400");

    // Attempting to modify draft of Problem 1 must be rejected
    const editLockedRes = await fetch(`${BASE_URL}/api/student/exam/phase2/save-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob1.id,
        source_code: "print('modified')",
        language: "Python",
      }),
    });
    assert(editLockedRes.status === 400, "Code Locking: Modifying draft for finalized problem is rejected with 400");

    // -------------------------------------------------------------------------
    // TEST GROUP 9: Partial Scoring Demonstration (e.g. 3 of 5 Passed = 6 Marks)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 9: Hidden Test Case Marks Calculation Matrix ---");

    // Test evaluation matrix using mock/synthetic test suite
    const mockTestCases = [
      { id: "tc1", test_case_order: 1, input_data: "10", expected_output: "20", marks: 2 },
      { id: "tc2", test_case_order: 2, input_data: "20", expected_output: "40", marks: 2 },
      { id: "tc3", test_case_order: 3, input_data: "30", expected_output: "60", marks: 2 },
      { id: "tc4", test_case_order: 4, input_data: "40", expected_output: "80", marks: 2 },
      { id: "tc5", test_case_order: 5, input_data: "50", expected_output: "100", marks: 2 },
    ];

    // Solution that only handles numbers <= 30 (passes exactly 3 tests)
    const partialSol = `import sys
n = int(sys.stdin.read().strip())
if n <= 30:
    print(n * 2)
else:
    print("wrong")
`;
    const evalPartial = await evaluateHiddenTestCases("mock_prob", "python", partialSol, mockTestCases);
    assert(evalPartial.passed_test_cases === 3, "Scoring Matrix: Correctly counted exactly 3 passed test cases");
    assert(evalPartial.awarded_marks === 6, "Scoring Matrix: 3 passed tests awarded exactly 6 marks (3 * 2M)");

    // Solution that passes all 5 tests
    const fullSol = `import sys\nprint(int(sys.stdin.read().strip()) * 2)\n`;
    const evalFull = await evaluateHiddenTestCases("mock_prob", "python", fullSol, mockTestCases);
    assert(evalFull.passed_test_cases === 5, "Scoring Matrix: Correctly counted all 5 passed test cases");
    assert(evalFull.awarded_marks === 10, "Scoring Matrix: 5 passed tests awarded exactly 10 marks (5 * 2M)");

    // -------------------------------------------------------------------------
    // TEST GROUP 10: Finalizing Problem 2 & Exam Conclusion
    // -------------------------------------------------------------------------
    console.log("\n--- TEST GROUP 10: Exam Conclusion & Final Submission ---");

    // Problem 2: "Longest Substring Without Repeating Characters"
    const pySol2 = `import sys

def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, c in enumerate(s):
        if c in char_map and char_map[c] >= left:
            left = char_map[c] + 1
        char_map[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len

line = sys.stdin.read().splitlines()
s = line[0] if line else ""
print(lengthOfLongestSubstring(s))
`;

    const submitP2Res = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob2.id,
        source_code: pySol2,
        language: "Python",
      }),
    });
    const submitP2Data = await submitP2Res.json();
    assert(submitP2Res.status === 200, "POST /api/student/exam/phase2/submit for Problem 2 returns HTTP 200");
    assert(submitP2Data.is_submitted === true, "Problem 2 confirmed submitted");
    assert(submitP2Data.is_all_problems_submitted === true, "Exam Completion: Both problems submitted, is_all_problems_submitted is true");

    // Verify session status is phase2_completed
    const finalSessionRes = await fetch(`${BASE_URL}/api/student/exam/session`, {
      headers: { Cookie: CANDIDATE_COOKIE },
    });
    const finalSessionData = await finalSessionRes.json();
    assert(finalSessionData.session.status === "phase2_completed", "Exam Session transitioned to 'phase2_completed'");

    // Subsequent submissions must be rejected
    const postSubmitRes = await fetch(`${BASE_URL}/api/student/exam/phase2/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: CANDIDATE_COOKIE },
      body: JSON.stringify({
        problem_id: prob2.id,
        source_code: pySol2,
        language: "Python",
      }),
    });
    assert(postSubmitRes.status === 400, "Post-Exam Protection: Further submissions rejected with HTTP 400");

    console.log("\n========================================================");
    console.log(`  PHASE I TEST SUMMARY: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log("========================================================\n");

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Unhandled error during Phase I test suite:", err);
    process.exit(1);
  }
}

runPhaseITests();
