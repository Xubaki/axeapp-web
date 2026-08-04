/**
 * lib/api.ts
 * Cliente tRPC para o site Next.js — conecta à mesma API do app mobile.
 */
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { PRODUCTION_API_BASE_URL } from "@/constants/production-defaults";

export type { AppRouter } from "./types/router";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_BASE_URL
).replace(/\/$/, "");

/**
 * Cria um cliente tRPC server-side (para Server Components e Route Handlers).
 */
export function createServerClient(sessionToken?: string) {
  return createTRPCProxyClient<import("./types/router").AppRouter>({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
        headers: sessionToken
          ? { Authorization: `Bearer ${sessionToken}` }
          : {},
      }),
    ],
  });
}

/** URL base da API — fetch direto (SSR / route handlers). */
export const apiBaseUrl = API_URL;

/** Extrai payload JSON de uma resposta tRPC (batch array ou objeto único). */
export function unwrapTrpcData<T = unknown>(data: unknown): T | null {
  if (Array.isArray(data)) {
    return (data[0]?.result?.data?.json ?? null) as T | null;
  }
  if (data && typeof data === "object" && "result" in data) {
    const single = data as { result?: { data?: { json?: T } } };
    return single.result?.data?.json ?? null;
  }
  return null;
}

/** Extrai mensagem de erro tRPC (batch ou objeto único). */
export function unwrapTrpcError(data: unknown): string | null {
  const first = Array.isArray(data) ? data[0] : data;
  const err = (first as { error?: { json?: { message?: string }; message?: string } })
    ?.error;
  return err?.json?.message || err?.message || null;
}
