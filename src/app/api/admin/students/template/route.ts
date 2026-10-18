import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const csvContent =
`Name,Roll Number,Course,Email,Mobile
Rahul Kumar,230101,BCA,rahul.kumar@example.com,9876543210
Priya Sharma,230102,BCA,priya.sharma@example.com,9876543211
Amit Verma,220201,MCA,amit.verma@example.com,
Anjali Singh,230301,BBA,anjali.singh@example.com,9876543213
Vikas Gupta,220401,MBA,vikas.gupta@example.com,9876543214`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lnmcbm_student_import_template.csv"',
    },
  });
}

