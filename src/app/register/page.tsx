"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileImage,
  X,
  Loader2,
  ShieldCheck,
  User,
  GraduationCap,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DEPARTMENTS = [
  "BCA (Bachelor of Computer Applications)",
  "MCA (Master of Computer Applications)",
  "BCA",
  "MCA",
  "BBA (Bachelor of Business Administration)",
  "MBA (Master of Business Administration)",
  "BBA",
  "MBA",
  "B.Com (Professional)",
  "Information Technology",
  "Computer Science",
];

const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState("");
  const [rollNumber, setRollNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [department, setDepartment] = React.useState(DEPARTMENTS[0]);
  const [semester, setSemester] = React.useState(SEMESTERS[0]);
  const [mobile, setMobile] = React.useState("");

  // ID Card State
  const [idCardFile, setIdCardFile] = React.useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = React.useState<string | null>(null);
  const [idCardError, setIdCardError] = React.useState<string | null>(null);

  // Submission State
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [registeredStudent, setRegisteredStudent] = React.useState<{
    id: string;
    roll_number: string;
    full_name: string;
    participant_id: string;
    course: string;
    email: string;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File) => {
    setIdCardError(null);
    setFormError(null);

    // Validate MIME type
    const validMimes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setIdCardError("Invalid file type. Only PNG, JPEG, or JPG images are allowed.");
      setIdCardFile(null);
      setIdCardPreview(null);
      return;
    }

    // Validate size (strictly <= 2 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setIdCardError(`File size (${sizeMb} MB) exceeds the 2 MB limit. Please select an image under 2 MB.`);
      setIdCardFile(null);
      setIdCardPreview(null);
      return;
    }

    setIdCardFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setIdCardPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeSelectedFile = () => {
    setIdCardFile(null);
    setIdCardPreview(null);
    setIdCardError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError("Please enter your full name (minimum 2 characters).");
      return;
    }
    if (!rollNumber.trim()) {
      setFormError("Please enter your College / University Roll Number.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Please enter a valid email address where your credentials can be sent.");
      return;
    }
    if (!department) {
      setFormError("Please select your department / program.");
      return;
    }
    if (!semester) {
      setFormError("Please select your current semester.");
      return;
    }
    const cleanMobile = mobile.trim().replace(/[^0-9]/g, "");
    if (cleanMobile.length !== 10) {
      setFormError("Please provide a valid 10-digit mobile phone number.");
      return;
    }
    if (!idCardPreview || !idCardFile) {
      setFormError("College Identity Card photo is mandatory. Please upload a clear photo.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          roll_number: rollNumber.trim(),
          email: email.trim().toLowerCase(),
          department: department.trim(),
          semester: semester.trim(),
          mobile: cleanMobile,
          id_card_data: idCardPreview,
          id_card_mime: idCardFile.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to submit registration. Please check your details.");
        return;
      }

      if (data.student) {
        setRegisteredStudent(data.student);
      }
      setIsSubmitted(true);
    } catch {
      setFormError("A network error occurred. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/login/student"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Student Login
          </Link>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            Codethon 2026 Registration
          </span>
        </div>

        {/* College Header */}
        <div className="text-center">
          <div className="inline-block relative overflow-hidden rounded-full border-2 border-blue-900/15 p-1 bg-white shadow-md">
            <Image
              src="/images/college-logo.png"
              alt="LNMCBM Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="mt-2.5 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Lalit Narayan Mishra College of Business Management
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-blue-700">
            Codethon 2026 — Candidate Self-Registration Portal
          </p>
        </div>

        {/* Success Confirmation Screen */}
        {isSubmitted ? (
          <Card className="shadow-lg border-emerald-300 bg-white">
            <CardContent className="pt-8 pb-8 px-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ Registration Completed &amp; Credentials Dispatched
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  Registration Successful!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                  Your official examination login credentials have been generated and dispatched directly to your email address.
                </p>
              </div>

              {/* Enrolled Candidate Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-3 shadow-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    Enrolled Candidate Details
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Candidate Name</span>
                    <strong className="text-slate-900 font-semibold">{registeredStudent?.full_name || fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Roll Number</span>
                    <strong className="text-slate-900 font-mono font-bold">{registeredStudent?.roll_number || rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Participant ID</span>
                    <strong className="text-blue-700 font-mono font-bold">{registeredStudent?.participant_id || "Assigned"}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Course</span>
                    <strong className="text-slate-800">{registeredStudent?.course || department}</strong>
                  </div>
                </div>
              </div>

              {/* Email Delivery Alert */}
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl max-w-md mx-auto text-emerald-950 text-xs text-left space-y-1.5 shadow-xs">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  Check Your Email Inbox &amp; Spam Folder
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Your login password has been sent to <strong className="text-emerald-950 underline">{registeredStudent?.email || email}</strong> from <span className="font-mono font-semibold">lnmcbmhackathoncell@gmail.com</span>. Please check your inbox (and spam/junk folder) right now to sign in.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/login/student" className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full text-xs font-bold py-2.5 px-6 bg-blue-600 hover:bg-blue-700">
                    Proceed to Student Login →
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full text-xs font-semibold py-2.5 px-6">
                    Home Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Registration Form */
          <Card className="shadow-lg border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Candidate Details &amp; Identity Verification
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                All fields are mandatory. Please provide authentic college enrollment information.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {formError && (
                <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Candidate Full Name <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full pl-9.5 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* 2. Roll Number & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="rollNumber"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      College Roll Number <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        id="rollNumber"
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 22BCA041"
                        className="w-full pl-9.5 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Mobile Number <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        id="mobile"
                        type="tel"
                        maxLength={10}
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="10-digit number"
                        className="w-full pl-9.5 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Email Address <span className="text-red-600 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul.kumar@gmail.com"
                      className="w-full pl-9.5 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your official exam login password will be delivered to this email.
                  </p>
                </div>

                {/* 4. Department & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="department"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Department / Course <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9.5 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="semester"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Semester <span className="text-red-600 font-bold">*</span>
                    </label>
                    <select
                      id="semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. ID Card Upload (Max 2 MB, PNG/JPEG/JPG) */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    College ID Card or Admission Receipt Photo (PNG, JPG, or JPEG ≤ 2 MB) <span className="text-red-600 font-bold">*</span>
                  </label>

                  {/* Special Note for 1st Year Students as requested */}
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 mb-3 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="font-bold text-amber-950">Notice for 1st Year Students:</strong> The first year students who don&apos;t get their ID Card are requested to upload their <strong>Admission Receipt</strong>.
                    </div>
                  </div>

                  {idCardError && (
                    <div className="mb-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{idCardError}</span>
                    </div>
                  )}

                  {!idCardPreview ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">
                        Click to upload College ID Card or Admission Receipt (or drag and drop)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        PNG, JPG, or JPEG format only • Strictly maximum 2 MB
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0 relative">
                          <img
                            src={idCardPreview}
                            alt="ID Card Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {idCardFile?.name || "Uploaded ID Card"}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>
                              {idCardFile
                                ? `${(idCardFile.size / 1024).toFixed(0)} KB`
                                : "Uploaded"}
                            </span>
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs h-8 px-2.5"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeSelectedFile}
                          className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="w-full py-2.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Registration Request...
                      </>
                    ) : (
                      "Submit Registration Request"
                    )}
                  </Button>
                </div>
              </form>

              {/* Already Registered Note */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered or have your credentials?{" "}
                <Link
                  href="/login/student"
                  className="font-bold text-blue-700 hover:underline"
                >
                  Sign in to Candidate Desk →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

