"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, MapPin, X } from "lucide-react";
import type { Terreiro } from "@/lib/types/router";
import { TerreiroCard } from "@/components/terreiro/TerreiroCard";
import { ESTADOS, TRADICOES } from "@/lib/terreiros";

interface Props {
  terreiros: Terreiro[];
  initialFilters: {
    busca: string;
    estado: string;
    tradicao: string;
  };
}

export function TerreirosBuscaPage({ terreiros, initialFilters }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busca, setBusca] = useState(initialFilters.busca);
  const [estado, setEstado] = useState(initialFilters.estado);
  const [tradicao, setTradicao] = useState(initialFilters.tradicao);

  const hasFilters = busca || estado || tradicao;

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (busca.trim()) params.set("busca", busca.trim());
    if (estado) params.set("estado", estado);
    if (tradicao) params.set("tradicao", tradicao);

    startTransition(() => {
      router.push(`/terreiros${params.toString() ? `?${params}` : ""}`);
    });
  };

  const clearFilters = () => {
    setBusca("");
    setEstado("");
    setTradicao("");
    startTransition(() => router.push("/terreiros"));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          Buscar Terreiros
        </h1>
        <p className="text-muted">
          {terreiros.length > 0
            ? `${terreiros.length} terreiro${terreiros.length !== 1 ? "s" : ""} encontrado${terreiros.length !== 1 ? "s" : ""}`
            : "Nenhum terreiro encontrado com esses filtros"}
        </p>
      </div>

      {/* Filtros */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Busca por texto */}
          <div className="sm:col-span-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Buscar por nome, cidade, dirigente..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os estados</option>
              {ESTADOS.map((e) => (
                <option key={e.sigla} value={e.sigla}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tradição */}
          <div>
            <select
              value={tradicao}
              onChange={(e) => setTradicao(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as tradições</option>
              {TRADICOES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              disabled={isPending}
              className="btn-primary flex-1"
            >
              <Filter size={16} />
              {isPending ? "Buscando..." : "Filtrar"}
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="btn-outline px-3"
                title="Limpar filtros"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Tags de filtros ativos */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <span className="text-xs text-muted font-medium">Filtros:</span>
            {busca && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                "{busca}"
                <button onClick={() => { setBusca(""); applyFilters(); }}>
                  <X size={10} />
                </button>
              </span>
            )}
            {estado && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {ESTADOS.find((e) => e.sigla === estado)?.nome ?? estado}
                <button onClick={() => { setEstado(""); applyFilters(); }}>
                  <X size={10} />
                </button>
              </span>
            )}
            {tradicao && (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {tradicao}
                <button onClick={() => { setTradicao(""); applyFilters(); }}>
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Resultados */}
      {terreiros.length === 0 ? (
        <div className="text-center py-20">
          <MapPin size={48} className="mx-auto mb-4 text-muted opacity-30" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhum terreiro encontrado
          </h2>
          <p className="text-muted mb-6">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
          <button onClick={clearFilters} className="btn-outline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {terreiros.map((terreiro) => (
            <TerreiroCard key={terreiro.id} terreiro={terreiro} />
          ))}
        </div>
      )}
    </div>
  );
}
