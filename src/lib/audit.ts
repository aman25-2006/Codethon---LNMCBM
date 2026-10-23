import { createAdminClient, isSupabaseLive } from "@/lib/supabase/admin";

export interface AuditLogEntry {
  id?: string;
  actorId?: string | null;
  actorEmail: string;
  action: string;
  targetResource: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  outcome?: "success" | "failure";
  created_at?: string;
}

// In-memory fallback audit store for local execution
declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_audit_logs__: AuditLogEntry[] | undefined;
}

function getLocalAuditStore(): AuditLogEntry[] {
  if (!global.__lnmcbm_local_audit_logs__) {
    global.__lnmcbm_local_audit_logs__ = [];
  }
  return global.__lnmcbm_local_audit_logs__;
}

/**
 * Recursively deep-scrubs any sensitive keys (passwords, tokens, secrets, API keys).
 */
function sanitizeAuditDetails(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditDetails(item));
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveRegex = /password|secret|token|apikey|api_key|credential|auth_user|temp_pass|private_key/i;

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveRegex.test(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditDetails(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Writes an immutable security audit event into the audit_logs table and fallback store.
 * Strictly executes on the server using the service-role client.
 * 
 * SECURITY RULES:
 * - NEVER log passwords, temporary credentials, API keys, or raw tokens.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const nowIso = new Date().toISOString();
    const cleanDetails = (sanitizeAuditDetails(entry.details) as Record<string, unknown>) || {};
    const outcome = entry.outcome || "success";

    const logRecord: AuditLogEntry = {
      id: entry.id || `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      actorId: entry.actorId || null,
      actorEmail: entry.actorEmail || "system",
      action: entry.action,
      targetResource: entry.targetResource,
      details: cleanDetails,
      ipAddress: entry.ipAddress || null,
      outcome,
      created_at: entry.created_at || nowIso,
    };

    // Always log to console telemetry
    console.log(`[AUDIT LOG] ${nowIso} | ${entry.action} | ${entry.actorEmail} | ${entry.targetResource} | ${outcome}`);

    // Store in memory for instant local retrieval
    const localStore = getLocalAuditStore();
    localStore.unshift(logRecord);

    // Persist to Supabase if live
    if (isSupabaseLive()) {
      const admin = createAdminClient();
      await admin.from("audit_logs").insert({
        actor_id: logRecord.actorId || null,
        actor_email: logRecord.actorEmail,
        action: logRecord.action,
        target_resource: logRecord.targetResource,
        details: cleanDetails,
        ip_address: logRecord.ipAddress || null,
      });
    }
  } catch (error) {
    console.error("Failed to persist audit log entry:", error);
  }
}

/**
 * Retrieves audit logs with optional search, category action filter, and pagination.
 */
export async function getAuditLogs(params?: {
  search?: string;
  action?: string;
  outcome?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const search = params?.search?.trim().toLowerCase() || "";
  const actionFilter = params?.action?.trim() || "";
  const outcomeFilter = params?.outcome?.trim() || "";
  const limit = Math.min(params?.limit || 50, 500);
  const offset = params?.offset || 0;

  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();
      let query = admin
        .from("audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (actionFilter) {
        query = query.eq("action", actionFilter);
      }

      const { data, count, error } = await query.range(offset, offset + limit - 1);
      if (!error && data) {
        let filtered = data.map((d) => ({
          id: d.id,
          actorId: d.actor_id,
          actorEmail: d.actor_email,
          action: d.action,
          targetResource: d.target_resource,
          details: d.details as Record<string, unknown>,
          ipAddress: d.ip_address,
          outcome: (d.details as any)?.outcome || "success",
          created_at: d.created_at,
        }));

        if (search) {
          filtered = filtered.filter(
            (l) =>
              l.actorEmail.toLowerCase().includes(search) ||
              l.action.toLowerCase().includes(search) ||
              l.targetResource.toLowerCase().includes(search)
          );
        }

        return { logs: filtered, total: count || filtered.length };
      }
    } catch (err) {
      console.warn("Supabase audit log query failed, falling back to local memory store:", err);
    }
  }

  // Fallback in-memory query
  let logs = [...getLocalAuditStore()];

  if (actionFilter) {
    logs = logs.filter((l) => l.action.toLowerCase() === actionFilter.toLowerCase());
  }

  if (outcomeFilter) {
    logs = logs.filter((l) => (l.outcome || "success").toLowerCase() === outcomeFilter.toLowerCase());
  }

  if (search) {
    logs = logs.filter(
      (l) =>
        l.actorEmail.toLowerCase().includes(search) ||
        l.action.toLowerCase().includes(search) ||
        l.targetResource.toLowerCase().includes(search) ||
        JSON.stringify(l.details || {}).toLowerCase().includes(search)
    );
  }

  const total = logs.length;
  const paginated = logs.slice(offset, offset + limit);

  return { logs: paginated, total };
}

/**
 * Sanitizes an individual cell to prevent CSV / Formula Injection attacks (RFC-4180).
 */
function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an RFC-compliant CSV with formula injection escaping and UTF-8 BOM.
 */
export function generateAuditLogsCsv(logs: AuditLogEntry[]): string {
  const headers = [
    "Timestamp",
    "Administrator",
    "Action",
    "Target Resource",
    "Outcome",
    "IP Address",
    "Details",
  ];

  const rows = logs.map((log) => [
    sanitizeCsvCell(log.created_at || "N/A"),
    sanitizeCsvCell(log.actorEmail),
    sanitizeCsvCell(log.action),
    sanitizeCsvCell(log.targetResource),
    sanitizeCsvCell(log.outcome || "success"),
    sanitizeCsvCell(log.ipAddress || "Internal"),
    sanitizeCsvCell(log.details ? JSON.stringify(log.details) : "{}"),
  ]);

  return "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
