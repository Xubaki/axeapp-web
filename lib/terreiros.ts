/**
 * lib/terreiros.ts
 * Funções para buscar terreiros via API do app mobile.
 * Usa fetch direto (server-side) para melhor performance no SSR.
 */
import { apiBaseUrl } from "./api";
import type { Terreiro } from "./types/router";

export type TerreiroFilters = {
  busca?: string;
  estado?: string;
  tradicao?: string;
};

/**
 * Lista terreiros ativos com filtros opcionais.
 * Endpoint: trpc/terreiros.listar
 */
export async function listarTerreiros(
  filters?: TerreiroFilters,
  sessionToken?: string
): Promise<Terreiro[]> {
  const params = new URLSearchParams();
  const input = {
    busca: filters?.busca,
    estado: filters?.estado,
    tradicao: filters?.tradicao,
  };

  params.set("batch", "1");
  params.set("input", JSON.stringify({ "0": { json: input } }));

  const headers: Record<string, string> = {};
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

  try {
    const res = await fetch(
      `${apiBaseUrl}/api/trpc/terreiros.listar?${params}`,
      {
        headers,
        next: { revalidate: 60 }, // Cache por 60s no Next.js
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data?.[0]?.result?.data?.json ?? [];
  } catch {
    return [];
  }
}

/**
 * Busca um terreiro pelo ID.
 * Endpoint: trpc/terreiros.obter
 */
export async function obterTerreiro(
  id: number,
  sessionToken?: string
): Promise<Terreiro | null> {
  const params = new URLSearchParams();
  params.set("batch", "1");
  params.set("input", JSON.stringify({ "0": { json: { id } } }));

  const headers: Record<string, string> = {};
  if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

  try {
    const res = await fetch(
      `${apiBaseUrl}/api/trpc/terreiros.obter?${params}`,
      {
        headers,
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data?.[0]?.result?.data?.json ?? null;
  } catch {
    return null;
  }
}

/**
 * Lista terreiros pendentes de verificação (admin only).
 */
export async function listarTerreirosPendentes(
  sessionToken: string
): Promise<Terreiro[]> {
  const params = new URLSearchParams();
  params.set("batch", "1");
  params.set("input", JSON.stringify({ "0": { json: {} } }));

  try {
    const res = await fetch(
      `${apiBaseUrl}/api/trpc/terreiros.listarPendentes?${params}`,
      {
        headers: { Authorization: `Bearer ${sessionToken}` },
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data?.[0]?.result?.data?.json ?? [];
  } catch {
    return [];
  }
}

/**
 * Verifica um terreiro (admin only).
 */
export async function verificarTerreiro(
  id: number,
  sessionToken: string
): Promise<boolean> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/trpc/terreiros.verificar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ "0": { json: { id } } }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Revoga a verificação de um terreiro (admin only).
 */
export async function revogarVerificacao(
  id: number,
  sessionToken: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/api/trpc/terreiros.revogarVerificacao`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ "0": { json: { id } } }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Retorna o badge de cor para cada plano de terreiro.
 */
export function planoBadge(plano: Terreiro["plano"]) {
  const map = {
    livre: { label: "Livre", className: "bg-gray-100 text-gray-600" },
    prata: { label: "Prata", className: "bg-gray-200 text-gray-700" },
    ouro: { label: "Ouro ✦", className: "bg-yellow-100 text-yellow-700" },
    diamante: { label: "Diamante ✦✦", className: "bg-blue-100 text-blue-700" },
  };
  return map[plano] ?? map.livre;
}

/**
 * Lista de tradições religiosas disponíveis para filtro.
 */
export const TRADICOES = [
  "Umbanda",
  "Candomblé",
  "Quimbanda",
  "Jurema",
  "Tambor de Mina",
  "Batuque",
  "Xangô",
  "Candomblé de Caboclo",
  "Outra",
];

/**
 * Lista de estados brasileiros para filtro.
 */
export const ESTADOS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];
