/**
 * lib/auth.ts
 * Funções de autenticação para o site Next.js.
 * Reutiliza o mesmo fluxo de auth do app mobile (Opção A — auth própria).
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

/**
 * Obtém o token de sessão do cookie.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Obtém o usuário da sessão atual (Server Component).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Verifica se o usuário tem role de admin.
 */
export function isAdmin(user: SessionUser | null): boolean {
  return ["admin", "master", "senior"].includes(user?.role ?? "");
}

/**
 * Faz login com e-mail e senha via API do app mobile.
 * Retorna o token JWT ou lança erro.
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

  if (!result?.token) {
    throw new Error(result?.message || "Erro ao fazer login");
  }

  return {
    token: result.token,
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

/**
 * Solicita recuperação de senha via API.
 */
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

/**
 * Redefine a senha com o token recebido por e-mail.
 */
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
