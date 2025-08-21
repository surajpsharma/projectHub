import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Placeholder route since Sentry was removed
export function GET() {
  return NextResponse.json({ data: "Sentry has been removed." });
}
