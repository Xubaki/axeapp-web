/**
 * lib/types/router.ts
 * Tipos da AppRouter do app mobile — espelhados aqui para uso no site.
 * Mantidos em sincronia com server/routers.ts do app axe_app.
 */

export type Terreiro = {
  id: number;
  nome: string;
  tradicao: string;
  dirigente?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  cidade: string;
  estado: string;
  whatsapp?: string | null;
  instagram?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  telefone?: string | null;
  userId?: number | null;
  isVerified: number;
  plano: "livre" | "prata" | "ouro" | "diamante";
  ativo: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type User = {
  id: number;
  openId: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  createdAt?: Date | string;
};

export type AppRouter = any; // Referência de tipo — substituída por import direto em build
