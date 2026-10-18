"use client";

import * as React from "react";
import { X, User, ShieldCheck, ShieldAlert, KeyRound, Calendar, Mail, Phone, BookOpen, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentRecord } from "@/lib/services/students-service";

interface StudentDetailsModalProps {
  isOpen: boolean;
  student: StudentRecord | null;
  onClose: () => void;
  onEdit: (student: StudentRecord) => void;
}

export function StudentDetailsModal({
  isOpen,
  student,
  onClose,
  onEdit,
}: StudentDetailsModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-details-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200 shadow-xs">
              {student.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 id="student-details-title" className="text-sm font-bold text-slate-900">
                {student.full_name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {student.participant_id}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Roll: {student.roll_number}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Badges Row */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Participation Status
              </span>
              {student.is_active ? (
                <Badge variant="success" className="text-xs py-0.5">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Active / Eligible
                </Badge>
              ) : (
                <Badge variant="danger" className="text-xs py-0.5">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Account Suspended
                </Badge>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Auth User Account
              </span>
              {student.auth_user_id ? (
                <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <KeyRound className="w-3 h-3 mr-1" />
                  Credentials Active
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <KeyRound className="w-3 h-3 mr-1" />
                  Pending Setup
                </span>
              )}
            </div>
          </div>

          {/* Key Information Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium block">Department / Course</span>
                <span className="font-semibold text-slate-800">{student.course}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Hash className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium block">College Roll Number</span>
                <span className="font-semibold font-mono text-slate-800">{student.roll_number}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium block">Registered Email</span>
                <span className="font-medium text-slate-800 break-all">{student.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium block">Mobile Number</span>
                <span className="font-medium text-slate-800">
                  {student.mobile || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Enrolled: {new Date(student.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span>Updated: {new Date(student.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(student);
            }}
            className="text-xs font-semibold"
          >
            Edit Record
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
