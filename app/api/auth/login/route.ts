import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseUrl } from "@/lib/api";
import { createSessionCookieValue, isAdmin } from "@/lib/auth";

const SESSION_COOKIE = "axe_session";

function extractTrpcError(data: unknown): string | null {
  const batch = data as { [k: string]: unknown } | unknown[];
  const first = Array.isArray(batch) ? batch[0] : (batch as { 0?: unknown })?.[0];
  const err = (first as { error?: { json?: { message?: string }; message?: string } })?.error;
  return err?.json?.message || err?.message || null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const res = await fetch(`${apiBaseUrl}/api/trpc/auth.loginEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "0": { json: { email: email.toLowerCase().trim(), senha } },
      }),
    });

    const data = await res.json();
    const result = data?.[0]?.result?.data?.json;
    const trpcErrorMsg = extractTrpcError(data);
    const apiToken = result?.sessionToken ?? result?.token;

    if (trpcErrorMsg || !apiToken || !result?.user) {
      return NextResponse.json(
        { error: trpcErrorMsg || result?.message || "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    const user = {
      id: result.user.id,
      openId: result.user.openId,
      name: result.user.name ?? null,
      email: result.user.email ?? null,
      avatarUrl: result.user.avatarUrl ?? null,
      role: result.user.role ?? null,
    };

    // Login do site é só para painel interno
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Acesso restrito à equipe AxéApp. Use o aplicativo para a sua conta." },
        { status: 403 }
      );
    }

    const cookieValue = await createSessionCookieValue(apiToken, user);
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("[auth/login] Error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}
