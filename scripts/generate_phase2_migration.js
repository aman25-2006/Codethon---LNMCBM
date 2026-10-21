const fs = require('fs');
const { OFFICIAL_PHASE2_CODING_PROBLEMS } = require('../src/lib/data/coding-problems/official-phase2-problems.ts');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

let sql = '-- ============================================================================\n';
sql += '-- LNMCBM CODTHON 2026 — Phase 2 Official Coding Test Suite Seed Migration\n';
sql += '-- Source: CODTHON 2026 — PHASE 2 CODING TEST SUITE (Official Test Suite)\n';
sql += '-- 16 Problems across 6 Tracks (C, C++, Java, Python, Web Dev, DSA with C/C++/Java)\n';
sql += '-- 5 Hidden Test Cases per Problem (80 test cases total, 2 marks each = 10 marks/problem)\n';
sql += '-- ============================================================================\n\n';
sql += 'CREATE UNIQUE INDEX IF NOT EXISTS idx_coding_problems_slug ON coding_problems (slug);\n\n';

for (const prob of OFFICIAL_PHASE2_CODING_PROBLEMS) {
  sql += '-- ----------------------------------------------------------------------------\n';
  sql += '-- Problem: ' + prob.title + ' (' + prob.category + (prob.programming_language ? ' / ' + prob.programming_language : '') + ')\n';
  sql += '-- ----------------------------------------------------------------------------\n';
  sql += 'INSERT INTO coding_problems (\n';
  sql += '    title, slug, category, programming_language, problem_statement, constraints,\n';
  sql += '    input_format, output_format, sample_input, sample_output,\n';
  sql += '    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active\n';
  sql += ') VALUES (\n';
  sql += '    ' + escapeSql(prob.title) + ',\n';
  sql += '    ' + escapeSql(prob.slug) + ',\n';
  sql += '    ' + escapeSql(prob.category) + ',\n';
  sql += '    ' + (prob.programming_language ? escapeSql(prob.programming_language) : 'NULL') + ',\n';
  sql += '    ' + escapeSql(prob.problem_statement) + ',\n';
  sql += '    ' + escapeSql(prob.constraints) + ',\n';
  sql += '    ' + escapeSql(prob.input_format) + ',\n';
  sql += '    ' + escapeSql(prob.output_format) + ',\n';
  sql += '    ' + escapeSql(prob.sample_input) + ',\n';
  sql += '    ' + escapeSql(prob.sample_output) + ',\n';
  sql += '    ' + prob.time_limit_ms + ',\n';
  sql += '    ' + prob.memory_limit_mb + ',\n';
  sql += '    ' + prob.marks_per_test_case + ',\n';
  sql += '    ' + prob.total_marks + ',\n';
  sql += '    true\n';
  sql += ')\n';
  sql += 'ON CONFLICT (slug) DO UPDATE SET\n';
  sql += '    title = EXCLUDED.title,\n';
  sql += '    category = EXCLUDED.category,\n';
  sql += '    programming_language = EXCLUDED.programming_language,\n';
  sql += '    problem_statement = EXCLUDED.problem_statement,\n';
  sql += '    constraints = EXCLUDED.constraints,\n';
  sql += '    input_format = EXCLUDED.input_format,\n';
  sql += '    output_format = EXCLUDED.output_format,\n';
  sql += '    sample_input = EXCLUDED.sample_input,\n';
  sql += '    sample_output = EXCLUDED.sample_output,\n';
  sql += '    time_limit_ms = EXCLUDED.time_limit_ms,\n';
  sql += '    memory_limit_mb = EXCLUDED.memory_limit_mb,\n';
  sql += '    marks_per_test_case = EXCLUDED.marks_per_test_case,\n';
  sql += '    total_marks = EXCLUDED.total_marks,\n';
  sql += '    is_active = EXCLUDED.is_active;\n\n';

  for (const tc of prob.test_cases) {
    sql += 'INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)\n';
    sql += 'SELECT id, ' + tc.order + ', ' + escapeSql(tc.input) + ', ' + escapeSql(tc.output) + ', 2, true\n';
    sql += 'FROM coding_problems WHERE slug = ' + escapeSql(prob.slug) + '\n';
    sql += 'ON CONFLICT (problem_id, test_case_order) DO UPDATE SET\n';
    sql += '    input_data = EXCLUDED.input_data,\n';
    sql += '    expected_output = EXCLUDED.expected_output,\n';
    sql += '    marks = EXCLUDED.marks,\n';
    sql += '    is_active = EXCLUDED.is_active;\n';
  }
  sql += '\n';
}

fs.writeFileSync('supabase/migrations/20261021000002_seed_official_phase2_coding_problems.sql', sql, 'utf8');
console.log('Migration generated successfully! File size:', sql.length, 'bytes');

