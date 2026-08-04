import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, getSessionUser, isAdmin } from "@/lib/auth";
import { planejarSemanaMidia } from "@/lib/midia";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const result = await planejarSemanaMidia(
    token,
    body?.foco ? String(body.foco) : undefined
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, posts: result.posts });
}
