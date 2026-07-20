import { NextRequest, NextResponse } from "next/server";
import { apiBaseUrl } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { token, novaSenha } = await req.json();

    if (!token || !novaSenha) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const res = await fetch(`${apiBaseUrl}/api/trpc/auth.resetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "0": { json: { token, novaSenha } },
      }),
    });

    const data = await res.json();
    const trpcError = data?.[0]?.error;

    if (trpcError || !res.ok) {
      return NextResponse.json(
        { error: "Token inválido ou expirado. Solicite um novo link." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/reset-password] Error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
