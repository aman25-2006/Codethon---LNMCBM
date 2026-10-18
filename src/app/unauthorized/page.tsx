import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowLeft, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block relative overflow-hidden rounded-full border-2 border-slate-700 p-1 bg-white shadow-xl mb-4">
          <Image
            src="/images/college-logo.png"
            alt="LNMCBM Logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>

        <Card className="border-slate-800 bg-slate-950 text-white shadow-2xl">
          <CardHeader className="text-center pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-500 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold text-white">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Administrator privileges required
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-xs text-slate-300 leading-relaxed">
              You do not have the required administrative clearance to access this area. Ordinary candidate or student accounts cannot view the administrator console, question bank keys, or proctoring controls.
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
              If you are an enrolled competition participant, please log in via the student examination portal.
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login/student">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  Go to Student Examination Portal
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-slate-500">
          Lalit Narayan Mishra College of Business Management — Examination Security System
        </p>
      </div>
    </div>
  );
}

