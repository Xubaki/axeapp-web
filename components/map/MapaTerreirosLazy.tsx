"use client";

import dynamic from "next/dynamic";
import type { Terreiro } from "@/lib/types/router";

interface Props {
  terreiros: Terreiro[];
  height?: string;
  selectedId?: number | null;
  onSelect?: (terreiro: Terreiro) => void;
}

const MapaTerreiros = dynamic(
  () => import("@/components/map/MapaTerreiros").then((m) => m.MapaTerreiros),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" /> }
);

/** Client wrapper: `ssr: false` não pode ficar em Server Components (Next 16). */
export function MapaTerreirosLazy(props: Props) {
  return <MapaTerreiros {...props} />;
}
