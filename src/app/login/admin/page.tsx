"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  ShieldAlert, 
  Server,
  ArrowRight,
  Info,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "/admin/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isStudentAccount, setIsStudentAccount] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsStudentAccount(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your administrator email address.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your administrator master password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed. Please check your credentials.");
        if (data.isStudent) {
          setIsStudentAccount(true);
        }
        setIsLoading(false);
        return;
      }

      // Successful admin login: redirect to requested admin page or dashboard
      router.push(redirectTarget);
    } catch {
      setIsLoading(false);
      setErrorMessage("Authentication service unreachable. Please check network connectivity.");
    }
  };

  return (
    <Card className="shadow-2xl border-slate-800 bg-slate-950 text-white">
      <CardHeader className="space-y-1 pb-4 border-b border-slate-800">
        <CardTitle className="text-lg font-bold text-white">
          Administrator Sign In
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Only authorized exam controllers and IT administrators may access this console.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <span>{errorMessage}</span>
              {isStudentAccount && (
                <div className="pt-1">
                  <Link
                    href="/login/student"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                  >
                    Go to Student Examination Login <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@lnmcbm.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-slate-400">
                Master Security Key
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter security password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 text-sm border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              isLoading={isLoading}
            >
              Authenticate Console Access
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Public admin registration is strictly disabled.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Server className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>All console activities and IP requests are logged to audit trail.</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            Need access or forgotten credentials? Contact the Chief Examination Superintendent at <strong>exams@lnmcbm.ac.in</strong>.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link */}
        <div className="mb-6 flex justify-between items-center px-4 sm:px-0">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Public Portal
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Restricted Access
          </span>
        </div>

        {/* College Logo and Header */}
        <div className="text-center">
          <div className="inline-block relative overflow-hidden rounded-full border-2 border-slate-700 p-1 bg-white shadow-xl">
            <Image
              src="/images/college-logo.png"
              alt="Lalit Narayan Mishra College of Business Management Logo"
              width={68}
              height={68}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
            LNMCBM Examination Control Center
          </h2>
          <p className="mt-1 text-sm font-semibold text-blue-400">
            Competition Administrator Authentication
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <React.Suspense
          fallback={
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span>Loading Administrator Portal...</span>
            </div>
          }
        >
          <AdminLoginForm />
        </React.Suspense>

        <p className="mt-4 text-center text-xs text-slate-500">
          Lalit Narayan Mishra College of Business Management — Confidential Portal
        </p>
      </div>
    </div>
  );
}
