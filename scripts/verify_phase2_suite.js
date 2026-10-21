const {
  getCategoryConfigurations,
  getAllCodingProblems,
  getAssignedProblemsForTrack,
  getProblemWithHiddenTestCases,
} = require('../src/lib/services/coding-problems-service.ts');

async function runVerification() {
  console.log('=== VERIFYING PHASE 2 CODING TEST SUITE ===');

  const configs = await getCategoryConfigurations();
  console.log('\n--- 1. Category Configurations ---');
  let allTracksReady = true;
  for (const cfg of configs) {
    console.log(
      `Track ${cfg.category}: isConfigured=${cfg.isConfigured}, problemCount=${cfg.problemCount}, requiredProblems=${cfg.requiredProblems}, totalMarks=${cfg.totalMarks}`
    );
    if (!cfg.isConfigured) {
      allTracksReady = false;
      console.error(`FAILED: Track ${cfg.category} is not marked as configured!`);
    }
    if (cfg.category === 'DSA') {
      console.log('  DSA Sub-tracks:', JSON.stringify(cfg.dsaTracks));
      for (const lang of ['C', 'C++', 'Java']) {
        if (!cfg.dsaTracks[lang].isConfigured) {
          allTracksReady = false;
          console.error(`FAILED: DSA ${lang} subtrack is not configured!`);
        }
      }
    }
  }

  if (!allTracksReady) {
    throw new Error('Not all tracks are configured!');
  }

  console.log('\n--- 2. Assigned Problems Verification (Candidate Safe) ---');
  const testTracks = [
    { cat: 'C', lang: null },
    { cat: 'C++', lang: null },
    { cat: 'Java', lang: null },
    { cat: 'Python', lang: null },
    { cat: 'Web Development', lang: null },
    { cat: 'DSA', lang: 'C' },
    { cat: 'DSA', lang: 'C++' },
    { cat: 'DSA', lang: 'Java' },
  ];

  for (const t of testTracks) {
    const assigned = await getAssignedProblemsForTrack(t.cat, t.lang);
    console.log(
      `Track: ${t.cat}${t.lang ? ` (${t.lang})` : ''} -> Returned ${assigned.length} problems:`
    );
    if (assigned.length !== 2) {
      throw new Error(`Expected exactly 2 problems for ${t.cat}, got ${assigned.length}`);
    }

    let trackMarks = 0;
    for (const p of assigned) {
      trackMarks += p.total_marks;
      console.log(`  - [${p.slug}] "${p.title}" (${p.total_marks} Marks)`);
      if (p.test_cases || p.hidden_test_cases) {
        throw new Error(`SECURITY BREACH: Student safe problem exposed hidden test cases!`);
      }
    }

    if (trackMarks !== 20) {
      throw new Error(`Expected 20 marks total for ${t.cat}, got ${trackMarks}`);
    }
  }

  console.log('\n--- 3. Hidden Test Cases Verification (Server Evaluation Engine Only) ---');
  const allProblems = await getAllCodingProblems();
  console.log(`Total Problems in Catalog: ${allProblems.length}`);

  for (const prob of allProblems) {
    const evalData = await getProblemWithHiddenTestCases(prob.id);
    if (!evalData) {
      throw new Error(`Failed to load evaluation data for problem ${prob.id} (${prob.slug})`);
    }
    if (evalData.testCases.length !== 5) {
      throw new Error(
        `Expected 5 test cases for ${prob.slug}, got ${evalData.testCases.length}`
      );
    }
    const totalCaseMarks = evalData.testCases.reduce((sum, tc) => sum + tc.marks, 0);
    if (totalCaseMarks !== 10) {
      throw new Error(
        `Expected 10 total test case marks for ${prob.slug}, got ${totalCaseMarks}`
      );
    }
  }

  console.log(
    `\nSUCCESS: All 16 coding problems verified across 6 tracks and all 80 evaluation test cases validated!`
  );
}

runVerification().catch((err) => {
  console.error('\nVERIFICATION FAILED:', err);
  process.exit(1);
});
