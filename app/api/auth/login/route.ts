import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseUrl } from "@/lib/api";

const SESSION_COOKIE = "axe_session";

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Chamar a API do app mobile
    const res = await fetch(`${apiBaseUrl}/api/trpc/auth.loginEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "0": { json: { email: email.toLowerCase().trim(), senha } },
      }),
    });

    const data = await res.json();
    const result = data?.[0]?.result?.data?.json;
    const trpcError = data?.[0]?.error;

    if (trpcError || !result?.token) {
      const message =
        trpcError?.message ||
        result?.message ||
        "E-mail ou senha incorretos.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    // Salvar token no cookie httpOnly
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    });

    return NextResponse.json({
      success: true,
      role: result.user?.role,
      name: result.user?.name,
    });
  } catch (err) {
    console.error("[auth/login] Error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
