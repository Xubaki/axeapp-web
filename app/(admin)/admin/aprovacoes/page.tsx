import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { getSessionToken } from "@/lib/auth";
import { listarTerreirosPendentes } from "@/lib/terreiros";
import { AprovacoesClient } from "./AprovacoesClient";

export const metadata: Metadata = {
  title: "Aprovações | Admin AxéApp",
};

export default async function AprovacoesPage() {
  const token = await getSessionToken();
  const pendentes = token ? await listarTerreirosPendentes(token) : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Aprovações de Terreiros
        </h1>
        <p className="text-muted text-sm mt-1">
          {pendentes.length} terreiro{pendentes.length !== 1 ? "s" : ""} aguardando verificação
        </p>
      </div>

      <AprovacoesClient terreiros={pendentes} />
    </div>
  );
}
