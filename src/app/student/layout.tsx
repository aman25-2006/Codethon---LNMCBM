"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  ShieldCheck, 
  User, 
  Clock, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/student-logout", { method: "POST" });
    } catch {
      // Continue redirect even if network drops
    } finally {
      router.push("/login/student");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Student Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1 w-10 h-10 flex-shrink-0 flex items-center justify-center border border-blue-900/10 shadow-xs">
              <Image
                src="/images/college-logo.png"
                alt="LNMCBM Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                Lalit Narayan Mishra College of Business Management
              </h1>
              <p className="text-xs font-semibold text-blue-700">
                Official Examination Portal — Candidate Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Proctored Session</span>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-xs text-slate-600 hover:text-rose-600 hover:border-rose-300"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Exit Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Main Student Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Student Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>Lalit Narayan Mishra College of Business Management, Muzaffarpur • Examination Integrity System</p>
      </footer>
    </div>
  );
}

