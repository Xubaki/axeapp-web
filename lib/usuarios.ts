/**
 * lib/usuarios.ts — proxy admin listar/setRole → API mobile (master-only).
 */
import { apiBaseUrl, unwrapTrpcData, unwrapTrpcError } from "./api";

export type AdminUserRole = "user" | "senior" | "admin" | "master";

export type AdminUser = {
  id: number;
  openId: string;
  email: string | null;
  name: string | null;
  role: AdminUserRole | string | null;
  loginMethod: string | null;
  createdAt: string | Date;
};

export async function listarUsuariosAdmin(
  sessionToken: string
): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  params.set("batch", "1");
  params.set("input", JSON.stringify({ "0": { json: null } }));

  try {
    const res = await fetch(
      `${apiBaseUrl}/api/trpc/admin.listarUsuarios?${params}`,
      {
        headers: { Authorization: `Bearer ${sessionToken}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const err = unwrapTrpcError(data);
    if (err) {
      console.error("[listarUsuariosAdmin]", err);
      return [];
    }
    const list = unwrapTrpcData<AdminUser[]>(data);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error("[listarUsuariosAdmin]", e);
    return [];
  }
}

export async function setUserRole(
  userId: number,
  role: AdminUserRole,
  sessionToken: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/trpc/admin.setRole?batch=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ "0": { json: { userId, role } } }),
    });
    const data = await res.json();
    const err = unwrapTrpcError(data);
    if (err || !res.ok) {
      return { ok: false, error: err || "Erro ao atualizar role." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Erro de conexão com a API." };
  }
}
