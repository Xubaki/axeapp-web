import { NextResponse } from "next/server";
import { apiBaseUrl } from "@/lib/api";

/**
 * Diagnóstico leve (sem dados sensíveis) — confirma qual API o site está usando.
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    apiBaseUrl,
    matchesAppDefault: apiBaseUrl === "https://axeapp-vdtapk2t.manus.space",
  });
}
