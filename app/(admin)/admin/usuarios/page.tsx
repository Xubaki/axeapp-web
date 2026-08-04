import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { getSessionToken, getSessionUser } from "@/lib/auth";
import { listarUsuariosAdmin } from "@/lib/usuarios";
import { UsuariosClient } from "./UsuariosClient";

export const metadata: Metadata = {
  title: "Usuários | Admin AxéApp",
};

export default async function UsuariosPage() {
  const user = await getSessionUser();
  const isMaster = user?.role === "master";
  const token = await getSessionToken();
  const usuarios =
    isMaster && token ? await listarUsuariosAdmin(token) : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Usuários & Cortesia
        </h1>
        <p className="text-muted text-sm mt-1">
          Roles com Premium no app:{" "}
          <strong className="text-foreground">senior</strong>,{" "}
          <strong className="text-foreground">admin</strong>,{" "}
          <strong className="text-foreground">master</strong>. Assinantes pagos
          continuam via Google Play / Apple.
        </p>
      </div>

      {!isMaster ? (
        <div className="card text-sm text-muted">
          Esta tela é restrita a contas <strong>master</strong>. Você está
          logado como <code>{user?.role ?? "—"}</code>.
        </div>
      ) : (
        <UsuariosClient
          usuarios={usuarios}
          currentUserId={user?.id ?? 0}
        />
      )}
    </div>
  );
}
