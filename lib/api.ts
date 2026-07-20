/**
 * lib/api.ts
 * Cliente tRPC para o site Next.js — conecta à mesma API do app mobile.
 * Usa httpBatchLink com superjson (mesmo transformer do app).
 */
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// Tipos importados do app mobile (compartilhados via referência de tipo)
// Em produção, esses tipos podem ser exportados de um pacote shared.
export type { AppRouter } from "./types/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://axeapp-web-production.up.railway.app";

/**
 * Cria um cliente tRPC server-side (para Server Components e Route Handlers).
 * Aceita um token de sessão opcional para chamadas autenticadas.
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

/**
 * URL base da API — usada para chamadas fetch diretas quando necessário.
 */
export const apiBaseUrl = API_URL;
