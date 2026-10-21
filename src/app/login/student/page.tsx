"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  UserCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Terminal,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function StudentLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/student/dashboard";

  const [rollNumber, setRollNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!rollNumber.trim()) {
      setErrorMessage("Please enter your assigned College Roll Number.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your assigned temporary password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_number: rollNumber.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed. Please check your credentials.");
        return;
      }

      // Successful login -> Navigate to Candidate Desk
      router.push(redirectTarget);
    } catch {
      setErrorMessage("A network error occurred. Please consult your room invigilator.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="space-y-1 pb-4 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900">
          Sign In to Candidate Desk
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Use the credentials distributed by the competition administrator or sent to your registered email.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="rollNumber"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              College Roll Number / User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. 23BCA001 or 22MCA015"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Temporary Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="8-character assigned password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Case-sensitive. Exactly 8 characters with letters and numbers.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-semibold"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Verifying Credentials..." : "Verify Credentials & Enter Exam"}
            </Button>
          </div>
        </form>

        {/* Examination Reminders */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Fullscreen mode is strictly enforced during examination.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Terminal className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Do not refresh or close tab once the countdown starts.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link */}
        <div className="mb-6 flex justify-between items-center px-4 sm:px-0">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            Student Access
          </span>
        </div>

        {/* College Logo and Header */}
        <div className="text-center">
          <div className="inline-block relative overflow-hidden rounded-full border-2 border-blue-900/15 p-1 bg-white shadow-md">
            <Image
              src="/images/college-logo.png"
              alt="Lalit Narayan Mishra College of Business Management Logo"
              width={68}
              height={68}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
            Lalit Narayan Mishra College of Business Management
          </h2>
          <p className="mt-1 text-sm font-semibold text-blue-700">
            Student Examination Login Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <React.Suspense
          fallback={
            <div className="p-12 text-center bg-white rounded-xl shadow-lg border border-slate-200">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading student authentication...</p>
            </div>
          }
        >
          <StudentLoginForm />
        </React.Suspense>

        {/* Register Now Callout */}
        <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-800">
            Don&apos;t have login credentials yet?
          </p>
          <Link
            href="/register"
            className="inline-flex items-center text-xs font-extrabold text-blue-700 hover:text-blue-900 transition-colors"
          >
            Register Now for Codethon 2026 →
          </Link>
        </div>

        {/* Bottom Help */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Cannot sign in? Contact your invigilator or administrator immediately.
        </p>
      </div>
    </div>
  );
}
