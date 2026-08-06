import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, getSessionUser } from "@/lib/auth";
import { excluirUsuarioAdmin } from "@/lib/usuarios";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas master pode excluir contas." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const userId = Number(body?.userId);

  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json(
      { error: "Você não pode excluir a própria conta por aqui." },
      { status: 400 }
    );
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const result = await excluirUsuarioAdmin(userId, token);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Falha ao excluir." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
