import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { listarTerreiros } from "@/lib/terreiros";
import { TerreirosBuscaPage } from "./TerreirosBuscaPage";

interface Props {
  searchParams: Promise<{
    busca?: string;
    estado?: string;
    tradicao?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const parts = [];
  if (sp.tradicao) parts.push(sp.tradicao);
  if (sp.estado) parts.push(sp.estado);
  if (sp.busca) parts.push(`"${sp.busca}"`);

  return {
    title: parts.length > 0 ? `Terreiros: ${parts.join(", ")}` : "Buscar Terreiros",
    description: `Encontre terreiros de Umbanda e Candomblé${parts.length > 0 ? ` em ${parts.join(", ")}` : ""} no AxéApp.`,
  };
}

export default async function TarreirosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const terreiros = await listarTerreiros({
    busca: sp.busca,
    estado: sp.estado,
    tradicao: sp.tradicao,
  });

  return (
    <TerreirosBuscaPage
      terreiros={terreiros}
      initialFilters={{
        busca: sp.busca ?? "",
        estado: sp.estado ?? "",
        tradicao: sp.tradicao ?? "",
      }}
    />
  );
}
