import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, getSessionUser } from "@/lib/auth";
import { concederCortesiaPorEmail } from "@/lib/usuarios";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas master pode conceder cortesia." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const role = body?.role === "admin" ? "admin" : "senior";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const result = await concederCortesiaPorEmail(email, token, role);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Falha ao conceder cortesia." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, ...result.data });
}
