import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, getSessionUser, isAdmin } from "@/lib/auth";
import { gerarPostMidia } from "@/lib/midia";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json();
  const tema = String(body?.tema || "");
  const plataforma = String(body?.plataforma || "");
  if (!tema || !plataforma) {
    return NextResponse.json({ error: "tema e plataforma são obrigatórios." }, { status: 400 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const result = await gerarPostMidia(token, {
    tema,
    plataforma,
    briefing: body?.briefing ? String(body.briefing) : undefined,
    orixaId: body?.orixaId ? String(body.orixaId) : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, post: result.post });
}
