"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/terreiros?busca=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/terreiros");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex items-center bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-4 text-muted">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar terreiro por nome, cidade ou tradição..."
          className="flex-1 py-4 pr-4 bg-transparent text-foreground placeholder-muted focus:outline-none text-sm sm:text-base"
        />
        <div className="px-2 py-2">
          <button
            type="submit"
            className="btn-primary px-6 py-2.5 text-sm rounded-xl"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {["Umbanda", "Candomblé", "São Paulo", "Rio de Janeiro", "Bahia"].map(
          (tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const isEstado = ["São Paulo", "Rio de Janeiro", "Bahia"].includes(tag);
                if (isEstado) {
                  router.push(`/terreiros?busca=${encodeURIComponent(tag)}`);
                } else {
                  router.push(`/terreiros?tradicao=${encodeURIComponent(tag)}`);
                }
              }}
              className="inline-flex items-center gap-1 bg-white/80 hover:bg-white border border-border px-3 py-1 rounded-full text-xs font-medium text-foreground transition-colors"
            >
              {["São Paulo", "Rio de Janeiro", "Bahia"].includes(tag) ? (
                <MapPin size={11} />
              ) : (
                <span>✦</span>
              )}
              {tag}
            </button>
          )
        )}
      </div>
    </form>
  );
}
