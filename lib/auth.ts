/**
 * lib/auth.ts
 * Sessão do site Next.js (painel admin).
 * Cookie assinado contém apiToken (mobile) + role/nome para isAdmin().
 */
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { apiBaseUrl } from "./api";

const SESSION_COOKIE = "axe_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "axeapp-secret-fallback-change-in-production"
);

export type SessionUser = {
  id: number;
  openId: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
};

type SessionPayload = SessionUser & {
  apiToken: string;
};

/**
 * Monta cookie de sessão admin (token da API + perfil).
 */
export async function createSessionCookieValue(
  apiToken: string,
  user: SessionUser
): Promise<string> {
  return new SignJWT({
    apiToken,
    id: user.id,
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

async function readSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const { payload } = await jwtVerify(raw, JWT_SECRET);
    const data = payload as unknown as SessionPayload;
    if (!data.apiToken || !data.openId) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Token Bearer para chamar a API do app (aprovações etc.).
 */
export async function getSessionToken(): Promise<string | null> {
  const session = await readSessionPayload();
  return session?.apiToken ?? null;
}

/**
 * Perfil da sessão atual (Server Component).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await readSessionPayload();
  if (!session) return null;
  return {
    id: session.id,
    openId: session.openId,
    name: session.name,
    email: session.email,
    avatarUrl: session.avatarUrl,
    role: session.role,
  };
}

export function isAdmin(user: SessionUser | null): boolean {
  return ["admin", "master", "senior"].includes(user?.role ?? "");
}

/**
 * Faz login com e-mail e senha via API do app mobile.
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ token: string; user: SessionUser }> {
  const res = await fetch(`${apiBaseUrl}/api/trpc/auth.loginEmail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "0": { json: { email, senha: password } },
    }),
  });

  if (!res.ok) {
    throw new Error("Credenciais inválidas");
  }

  const data = await res.json();
  const result = data?.[0]?.result?.data?.json;
  const sessionToken = result?.sessionToken ?? result?.token;

  if (!sessionToken) {
    throw new Error(result?.message || "Erro ao fazer login");
  }

  return {
    token: sessionToken,
    user: {
      id: result.user?.id,
      openId: result.user?.openId,
      name: result.user?.name,
      email: result.user?.email,
      avatarUrl: result.user?.avatarUrl,
      role: result.user?.role,
    },
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/api/trpc/auth.forgotPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "0": { json: { email } },
    }),
  });

  if (!res.ok) {
    throw new Error("Erro ao solicitar recuperação de senha");
  }
}

export async function resetPassword(
  token: string,
  novaSenha: string
): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/api/trpc/auth.resetPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "0": { json: { token, novaSenha } },
    }),
  });

  if (!res.ok) {
    throw new Error("Token inválido ou expirado");
  }
}
