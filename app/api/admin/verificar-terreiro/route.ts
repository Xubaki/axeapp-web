import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, getSessionUser, isAdmin } from "@/lib/auth";
import { verificarTerreiro } from "@/lib/terreiros";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const ok = await verificarTerreiro(id, token);
  if (!ok) {
    return NextResponse.json(
      { error: "Erro ao verificar terreiro." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
