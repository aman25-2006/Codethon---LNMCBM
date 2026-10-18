import Link from "next/link";
import Image from "next/image";
import { BrandHeader } from "@/components/brand-header";
import { 
  Clock, 
  Code2, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Terminal, 
  ArrowRight, 
  Monitor, 
  Lock,
  Layers,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Official Examination Server: <strong>Active & Secure</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Session: 2026 Academic Codethon</span>
            <span className="hidden sm:inline">|</span>
            <Link href="/login/admin" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3" /> Admin Gateway
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <BrandHeader size="md" subtitle="Annual College Coding Competition Portal" />
          <div className="flex items-center gap-3">
            <Link
              href="/login/student"
              className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm"
            >
              Student Login
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 py-16 sm:py-20 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-blue-700" />
                  Official Department Examination
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Lalit Narayan Mishra College of Business Management
                </h1>
                
                <p className="text-xl sm:text-2xl font-semibold text-blue-800">
                  Codethon 2026: Two-Phase Technical & Coding Evaluation
                </p>

                <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Welcome to the official college coding portal. Registered participants will undergo a two-phase assessment comprising 40 comprehensive technical MCQs followed by 2 practical coding challenges evaluated in real-time.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    href="/login/student"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 text-white text-base font-semibold hover:bg-blue-800 shadow-md transition-all hover:shadow-lg"
                  >
                    Enter Student Examination
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <a
                    href="#exam-structure"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 text-base font-semibold hover:bg-slate-50 transition-colors"
                  >
                    View Exam Guidelines
                  </a>
                </div>

                {/* Important notice */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Mandatory Requirement:</strong> Bring your own laptop (Windows / macOS) with a modern browser (Chrome / Edge / Firefox). The platform enforces fullscreen focus monitoring. Ensure you have your roll number and assigned access password ready.
                  </p>
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-base">Competition Matrix</h3>
                      <p className="text-xs text-blue-200">Total Score: 100 Marks | Total Time: 75 Mins</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-blue-800 text-blue-100 text-xs font-semibold">
                      Proctored
                    </span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Phase 1 Box */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-white transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                          PHASE 1
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 45 Minutes
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Multiple Choice Assessment</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        40 Questions spanning Fundamentals (10), Technical Understanding (10), Logic & Debugging (10), and Case Studies (10).
                      </p>
                      <div className="mt-3 flex justify-between items-center text-xs font-semibold text-blue-900 pt-2 border-t border-slate-200">
                        <span>Max Score: 80 Marks</span>
                        <span className="text-slate-500">Randomized Questions</span>
                      </div>
                    </div>

                    {/* Phase 2 Box */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 hover:bg-white transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                          PHASE 2
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 30 Minutes
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Hands-on Coding Problems</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Two programming challenges in your chosen track (C, C++, Java, Python, Web Dev, or DSA). Evaluated against 5 hidden test cases each.
                      </p>
                      <div className="mt-3 flex justify-between items-center text-xs font-semibold text-emerald-900 pt-2 border-t border-slate-200">
                        <span>Max Score: 20 Marks (10M × 2)</span>
                        <span className="text-slate-500">2 Marks / Test Case</span>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500">
                        Scorecard is generated upon complete evaluation of both phases.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Structure Breakdown */}
        <section id="exam-structure" className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Detailed Examination Syllabus & Format
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Designed to test theoretical foundations, algorithmic depth, syntax mastery, and problem-solving velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold mb-4">
                  01
                </div>
                <h3 className="font-bold text-slate-900 text-base">Fundamentals</h3>
                <p className="text-xs text-slate-600 mt-1">
                  10 Questions | 1 Mark each (10 Marks Total)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Data representations, memory layouts, primitive types, computational complexity basics, and programming paradigms.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mb-4">
                  02
                </div>
                <h3 className="font-bold text-slate-900 text-base">Technical Understanding</h3>
                <p className="text-xs text-slate-600 mt-1">
                  10 Questions | 2 Marks each (20 Marks Total)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Object-oriented principles, pointers & references, recursion trees, memory management, and runtime environments.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold mb-4">
                  03
                </div>
                <h3 className="font-bold text-slate-900 text-base">Logic & Debugging</h3>
                <p className="text-xs text-slate-600 mt-1">
                  10 Questions | 3 Marks each (30 Marks Total)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Predicting output of complex snippets, boundary condition bugs, pointer arithmetic, off-by-one errors, and syntax traps.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold mb-4">
                  04
                </div>
                <h3 className="font-bold text-slate-900 text-base">Case Study Problems</h3>
                <p className="text-xs text-slate-600 mt-1">
                  10 Questions | 2 Marks each (20 Marks Total)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  System scenario analysis, architecture decisions, database queries, and algorithmic trade-offs based on technical passages.
                </p>
              </div>
            </div>

            {/* Coding Track Details */}
            <div className="mt-12 bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                    <Terminal className="w-3.5 h-3.5" />
                    Phase 2 Tracks
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold">
                    Choose Your Specialization for the Live Coding Round
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Prior to starting the 30-minute coding timer, students must pick one verified track: <strong>C, C++, Java, Python, Web Development, or Data Structures & Algorithms (DSA in C/C++/Java)</strong>. Once confirmed, you will receive two tailored problem statements with real-time test execution.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 text-xs">
                    <div className="font-semibold text-slate-200">5 Hidden Test Cases / Problem</div>
                    <div className="text-slate-400 mt-0.5">Automated isolated compilation and runtime testing</div>
                  </div>
                  <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700 text-xs">
                    <div className="font-semibold text-slate-200">Monaco Editor Environment</div>
                    <div className="text-slate-400 mt-0.5">Industry-standard code editing with syntax highlighting</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & System Architecture Overview */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Examination Integrity & Security Protocols
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                The portal operates under strict invigilated guidelines to ensure absolute fairness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <ShieldCheck className="w-8 h-8 text-blue-700 mb-3" />
                <h3 className="font-bold text-slate-900 text-base">Server-Authoritative Clock</h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                  Timers for both Phase 1 (45 mins) and Phase 2 (30 mins) are governed strictly on the server. Browser refreshes, clock adjustments, or disconnections do not grant extra time.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <Monitor className="w-8 h-8 text-blue-700 mb-3" />
                <h3 className="font-bold text-slate-900 text-base">Fullscreen & Focus Monitoring</h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                  The exam runs in full-screen mode. Tab switches, window blurring, and exiting fullscreen trigger automated warning events logged directly to the admin invigilator desk.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <Lock className="w-8 h-8 text-blue-700 mb-3" />
                <h3 className="font-bold text-slate-900 text-base">Encrypted Submissions</h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                  Single-submission locks prevent duplicate submissions or race conditions. All MCQ answer selections are continuously auto-saved to prevent data loss.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center">
                  <Image
                    src="/images/college-logo.png"
                    alt="LNMCBM Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">
                    Lalit Narayan Mishra College of Business Management
                  </h4>
                  <p className="text-slate-400 text-xs">Muzaffarpur, Bihar - 842001</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed">
                Autonomous Institution under B.R.A. Bihar University. Dedicated to technical excellence and high-integrity academic competitions.
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Quick Gateways</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/login/student" className="hover:text-white transition-colors">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link href="/login/admin" className="hover:text-white transition-colors">
                    Administrator Login
                  </Link>
                </li>
                <li>
                  <a href="#exam-structure" className="hover:text-white transition-colors">
                    Examination Pattern
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Technical Support</h5>
              <p className="text-slate-400 mb-2">
                For connectivity issues or password resets during the exam, contact the lab invigilator.
              </p>
              <p className="text-slate-500">
                System Version 1.0.0 (Production Ready)
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500">
            <p>© {new Date().getFullYear()} Lalit Narayan Mishra College of Business Management. All rights reserved.</p>
            <p>College Coding Competition Portal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

