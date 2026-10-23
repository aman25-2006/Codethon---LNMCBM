import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/auth-guard";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

/**
 * Server-Side Protected Administrator Layout.
 * 
 * SECURITY MANDATE:
 * - Runs strictly on the server before ANY child components or UI markup render.
 * - Cryptographically verifies the administrator session (HMAC token or role === 'admin').
 * - If unauthenticated or role !== 'admin', issues an immediate server-side HTTP 307 redirect
 *   to /login/admin.
 * - ZERO admin HTML, scripts, or state are ever leaked to unauthorized clients or browsers.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAdmin();

  if (!auth.authenticated) {
    redirect("/login/admin");
  }

  return <AdminLayoutClient adminUser={auth.user}>{children}</AdminLayoutClient>;
}
