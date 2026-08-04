import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiBaseUrl, unwrapTrpcData, unwrapTrpcError } from "@/lib/api";
import { createSessionCookieValue, isAdmin, type SessionUser } from "@/lib/auth";

const SESSION_COOKIE = "axe_session";

type LoginResult = {
  sessionToken?: string;
  token?: string;
  message?: string;
  user?: {
    id: number;
    openId: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  };
};

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Mesmo formato do httpBatchLink do app (`?batch=1`)
    const res = await fetch(`${apiBaseUrl}/api/trpc/auth.loginEmail?batch=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "0": { json: { email: email.toLowerCase().trim(), senha } },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!data) {
      console.error("[auth/login] API sem JSON", apiBaseUrl, res.status);
      return NextResponse.json(
        { error: "Não foi possível falar com a API. Tente novamente." },
        { status: 502 }
      );
    }

    const result = unwrapTrpcData<LoginResult>(data);
    const trpcErrorMsg = unwrapTrpcError(data);
    const apiToken = result?.sessionToken ?? result?.token;

    if (trpcErrorMsg || !apiToken || !result?.user) {
      console.error("[auth/login] falha", {
        apiBaseUrl,
        status: res.status,
        trpcErrorMsg,
        hasUser: Boolean(result?.user),
        hasToken: Boolean(apiToken),
      });
      return NextResponse.json(
        {
          error:
            trpcErrorMsg ||
            result?.message ||
            "E-mail ou senha incorretos.",
        },
        { status: 401 }
      );
    }

    const user: SessionUser = {
      id: result.user.id,
      openId: result.user.openId,
      name: result.user.name ?? null,
      email: result.user.email ?? null,
      avatarUrl: result.user.avatarUrl ?? null,
      role: result.user.role ?? null,
    };

    if (!isAdmin(user)) {
      return NextResponse.json(
        {
          error:
            "Acesso restrito à equipe AxéApp. Use o aplicativo para a sua conta.",
        },
        { status: 403 }
      );
    }

    const cookieValue = await createSessionCookieValue(apiToken, user);
    const cookieStore = await cookies();
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
