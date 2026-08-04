import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, getSessionUser } from "@/lib/auth";
import { setUserRole, type AdminUserRole } from "@/lib/usuarios";

const ROLES: AdminUserRole[] = ["user", "senior", "admin", "master"];

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "master") {
    return NextResponse.json(
      { error: "Apenas master pode alterar roles." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const userId = Number(body?.userId);
  const role = body?.role as AdminUserRole;

  if (!Number.isFinite(userId) || userId <= 0 || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (userId === user.id && role === "user") {
    return NextResponse.json(
      { error: "Você não pode remover o próprio acesso master." },
      { status: 400 }
    );
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const result = await setUserRole(userId, role, token);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Falha ao atualizar." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
