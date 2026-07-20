import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { listarTerreiros } from "@/lib/terreiros";
import { MapaPage } from "./MapaPage";

export const metadata: Metadata = {
  title: "Mapa de Terreiros",
  description:
    "Encontre terreiros de Umbanda e Candomblé perto de você no mapa interativo do AxéApp.",
};

export default async function MapaServerPage() {
  const terreiros = await listarTerreiros();

  return <MapaPage terreiros={terreiros} />;
}
