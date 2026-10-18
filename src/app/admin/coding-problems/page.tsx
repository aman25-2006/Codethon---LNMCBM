import { Code2, Plus, Terminal, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminCodingProblemsPage() {
  const tracks = [
    { name: "C Language", problems: 2, totalMarks: 20 },
    { name: "C++ Language", problems: 2, totalMarks: 20 },
    { name: "Java Language", problems: 2, totalMarks: 20 },
    { name: "Python Language", problems: 2, totalMarks: 20 },
    { name: "Web Development", problems: 2, totalMarks: 20 },
    { name: "Data Structures & Algorithms (DSA)", problems: 2, totalMarks: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Phase 2: Coding Problems & Test Cases
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure 2 problems per track with 5 hidden test cases each (2 marks per passed test case, 10 marks per problem).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Coding Problem
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => (
          <Card key={track.name} className="hover:border-slate-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-bold text-slate-900">
                  {track.name}
                </CardTitle>
                <Badge variant="outline">2 Problems</Badge>
              </div>
              <CardDescription className="text-xs text-slate-500">
                10 Marks per Problem (5 Hidden Tests × 2M)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span>Total: {track.totalMarks} Marks</span>
                <span className="text-blue-700 font-medium">Configure Track →</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Configured Coding Challenges
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Hidden test cases are securely protected and evaluated server-side in isolated execution sandboxes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
              <Code2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No coding problems configured yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create problem statements with constraints, input/output formats, public sample tests, and 5 hidden test cases.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

