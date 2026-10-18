"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Code2, 
  Activity, 
  Award, 
  Settings, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  ShieldAlert,
  Loader2
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Student Management", href: "/admin/students", icon: Users },
  { name: "MCQ Question Bank", href: "/admin/questions", icon: HelpCircle },
  { name: "Coding Problems", href: "/admin/coding-problems", icon: Code2 },
  { name: "Live Monitoring", href: "/admin/monitoring", icon: Activity },
  { name: "Final Results", href: "/admin/results", icon: Award },
  { name: "Competition Settings", href: "/admin/settings", icon: Settings },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState<{
    email: string;
    name: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Verify server-side administrator authorization on mount
  React.useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          router.replace(`/login/admin?redirect=${encodeURIComponent(pathname || "/admin/dashboard")}`);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setAdminUser(data.user);
          setIsVerifying(false);
        }
      } catch {
        router.replace("/login/admin");
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue redirect even if network drops
    } finally {
      router.push("/login/admin");
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Verifying Administrator Authorization...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-0 -translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1 w-10 h-10 flex-shrink-0 flex items-center justify-center shadow-xs">
              <Image
                src="/images/college-logo.png"
                alt="LNMCBM Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white leading-tight">
                LNMCBM
              </h2>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Exam Admin Console
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Operations Desk
          </div>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-blue-200 text-xs font-bold flex-shrink-0">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "AD"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {adminUser?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {adminUser?.email || "admin@lnmcbm.ac.in"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign Out of Console"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-slate-600 hover:text-slate-900 p-1"
                aria-label="Open Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Lalit Narayan Mishra College of Business Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>System Online</span>
              </div>

              <Link
                href="/"
                target="_blank"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors"
              >
                View Public Portal ↗
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
