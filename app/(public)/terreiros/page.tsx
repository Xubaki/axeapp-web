import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { listarTerreiros } from "@/lib/terreiros";
import { TerreirosBuscaPage } from "./TerreirosBuscaPage";

interface Props {
  searchParams: {
    busca?: string;
    estado?: string;
    tradicao?: string;
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const parts = [];
  if (searchParams.tradicao) parts.push(searchParams.tradicao);
  if (searchParams.estado) parts.push(searchParams.estado);
  if (searchParams.busca) parts.push(`"${searchParams.busca}"`);

  return {
    title: parts.length > 0 ? `Terreiros: ${parts.join(", ")}` : "Buscar Terreiros",
    description: `Encontre terreiros de Umbanda e Candomblé${parts.length > 0 ? ` em ${parts.join(", ")}` : ""} no AxéApp.`,
  };
}

export default async function TarreirosPage({ searchParams }: Props) {
  const terreiros = await listarTerreiros({
    busca: searchParams.busca,
    estado: searchParams.estado,
    tradicao: searchParams.tradicao,
  });

  return (
    <TerreirosBuscaPage
      terreiros={terreiros}
      initialFilters={{
        busca: searchParams.busca ?? "",
        estado: searchParams.estado ?? "",
        tradicao: searchParams.tradicao ?? "",
      }}
    />
  );
}
