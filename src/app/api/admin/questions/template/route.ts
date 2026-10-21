import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/questions/template
 * Returns a standardized CSV template for bulk importing competition MCQs.
 */
export async function GET() {
  const headers = [
    "track",
    "category",
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
    "marks",
    "explanation",
    "case_study_passage",
    "code_snippet",
  ];

  const sampleRows = [
    [
      "DSA",
      "Fundamentals",
      "Which data structure operates on a Last-In, First-Out (LIFO) order?",
      "Queue",
      "Stack",
      "Linked List",
      "Hash Map",
      "B",
      "1",
      "A Stack is a LIFO linear structure.",
      "",
      "",
    ],
    [
      "DSA",
      "Technical Understanding",
      "What is the average time complexity of searching in a balanced Binary Search Tree?",
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n log n)",
      "B",
      "2",
      "Balanced trees half the search space at each depth level.",
      "",
      "",
    ],
    [
      "Logic and Debugging",
      "What will be printed by the following code snippet?",
      "0",
      "1",
      "15",
      "Compilation Error",
      "B",
      "3",
      "x & (x - 1) == 0 checks if x is a power of 2.",
      "",
      "int x = 16;\nint result = (x & (x - 1)) == 0;",
    ],
    [
      "Case Study",
      "In Case Study 1, how should the bank handle account balance verification before debiting?",
      "Run client-side validation in the web browser",
      "Use SELECT ... FOR UPDATE or atomic UPDATE ... WHERE balance >= amount",
      "Rely solely on Redis cached balances without DB verification",
      "Insert debit logs asynchronously via background worker",
      "B",
      "2",
      "Pessimistic row locking or atomic conditional updates guarantee balance integrity.",
      "CASE STUDY 1: High-Concurrency Banking Transaction Processing System.\nA cooperative bank in Bihar processes over 50,000 NEFT fund transfer requests per minute. Microservices run on Kubernetes with PostgreSQL and Redis.",
      "",
    ],
  ];

  const csvRows = [
    headers.join(","),
    ...sampleRows.map((row) =>
      row
        .map((cell) => {
          const escaped = cell.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="LNMCBM_MCQ_Question_Bank_Template.csv"',
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

