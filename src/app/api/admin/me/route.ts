import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await verifyAdmin();

    if (!auth.authenticated) {
      return NextResponse.json(
        { authenticated: false, error: auth.error },
        { status: auth.status }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
    });
  } catch (error) {
    console.error("Admin verification API error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

