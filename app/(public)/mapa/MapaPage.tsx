"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, List, Map, Filter } from "lucide-react";
import type { Terreiro } from "@/lib/types/router";
import { TerreiroCard } from "@/components/terreiro/TerreiroCard";
import { ESTADOS, TRADICOES } from "@/lib/terreiros";

// Importar mapa dinamicamente (evita SSR com Leaflet)
const MapaTerreiros = dynamic(
  () =>
    import("@/components/map/MapaTerreiros").then((m) => m.MapaTerreiros),
  { ssr: false, loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-xl" /> }
);

interface Props {
  terreiros: Terreiro[];
}

export function MapaPage({ terreiros }: Props) {
  const [view, setView] = useState<"mapa" | "lista">("mapa");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTradicao, setFiltroTradicao] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar terreiros
  const terreirosFiltrados = terreiros.filter((t) => {
    if (filtroEstado && t.estado !== filtroEstado) return false;
    if (filtroTradicao && !t.tradicao.includes(filtroTradicao)) return false;
    return true;
  });

  const selectedTerreiro = terreirosFiltrados.find((t) => t.id === selectedId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-surface border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <h1 className="font-serif font-semibold text-foreground">
              Mapa de Terreiros
            </h1>
            <span className="text-xs text-muted bg-gray-100 px-2 py-0.5 rounded-full">
              {terreirosFiltrados.length} terreiros
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters || filtroEstado || filtroTradicao
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-foreground hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Filtros
              {(filtroEstado || filtroTradicao) && (
                <span className="bg-white/30 rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {[filtroEstado, filtroTradicao].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Toggle Mapa/Lista */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setView("mapa")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "mapa"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Map size={14} />
                Mapa
              </button>
              <button
                onClick={() => setView("lista")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === "lista"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <List size={14} />
                Lista
              </button>
            </div>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 flex flex-wrap gap-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-field py-2 text-sm w-auto min-w-[160px]"
            >
              <option value="">Todos os estados</option>
              {ESTADOS.map((e) => (
                <option key={e.sigla} value={e.sigla}>
                  {e.nome}
                </option>
              ))}
            </select>

            <select
              value={filtroTradicao}
              onChange={(e) => setFiltroTradicao(e.target.value)}
              className="input-field py-2 text-sm w-auto min-w-[160px]"
            >
              <option value="">Todas as tradições</option>
              {TRADICOES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(filtroEstado || filtroTradicao) && (
              <button
                onClick={() => {
                  setFiltroEstado("");
                  setFiltroTradicao("");
                }}
                className="text-sm text-error hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "mapa" ? (
          <div className="h-full flex">
            {/* Mapa */}
            <div className="flex-1 p-4">
              <MapaTerreiros
                terreiros={terreirosFiltrados}
                height="100%"
                selectedId={selectedId}
                onSelect={(t) => setSelectedId(t.id === selectedId ? null : t.id)}
              />
            </div>

            {/* Painel lateral — terreiro selecionado */}
            {selectedTerreiro && (
              <div className="w-80 border-l border-border bg-surface p-4 overflow-y-auto">
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-muted hover:text-foreground mb-3"
                >
                  ✕ Fechar
                </button>
                <TerreiroCard terreiro={selectedTerreiro} />
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {terreirosFiltrados.length === 0 ? (
                <div className="col-span-full text-center py-16 text-muted">
                  <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhum terreiro encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar os filtros</p>
                </div>
              ) : (
                terreirosFiltrados.map((t) => (
                  <TerreiroCard key={t.id} terreiro={t} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
