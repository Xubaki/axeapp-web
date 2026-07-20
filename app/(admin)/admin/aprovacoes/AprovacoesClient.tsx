"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Instagram,
  Loader2,
  Clock,
} from "lucide-react";
import type { Terreiro } from "@/lib/types/router";

interface Props {
  terreiros: Terreiro[];
}

export function AprovacoesClient({ terreiros: initialTerreiros }: Props) {
  const router = useRouter();
  const [terreiros, setTerreiros] = useState(initialTerreiros);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAcao = async (
    id: number,
    acao: "verificar" | "revogar"
  ) => {
    setLoadingId(id);
    setMessage(null);

    try {
      const endpoint =
        acao === "verificar"
          ? "/api/admin/verificar-terreiro"
          : "/api/admin/revogar-verificacao";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Erro ao processar ação." });
        return;
      }

      // Remover da lista local
      setTerreiros((prev) => prev.filter((t) => t.id !== id));
      setMessage({
        type: "success",
        text:
          acao === "verificar"
            ? "Terreiro verificado com sucesso!"
            : "Verificação revogada.",
      });

      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    } finally {
      setLoadingId(null);
    }
  };

  if (terreiros.length === 0) {
    return (
      <div className="card text-center py-16">
        <CheckCircle size={48} className="mx-auto mb-4 text-success opacity-50" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Tudo em dia!
        </h2>
        <p className="text-muted">
          Não há terreiros pendentes de aprovação no momento.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Feedback */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {terreiros.map((terreiro) => (
          <div key={terreiro.id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">
                    <Clock size={10} />
                    Pendente
                  </span>
                  <span className="text-xs text-muted">#{terreiro.id}</span>
                </div>

                <h3 className="text-lg font-serif font-semibold text-foreground mb-1">
                  {terreiro.nome}
                </h3>
                <p className="text-sm text-primary font-medium mb-2">
                  {terreiro.tradicao}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {terreiro.cidade}, {terreiro.estado}
                  </span>
                  {terreiro.whatsapp && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} />
                      {terreiro.whatsapp}
                    </span>
                  )}
                  {terreiro.instagram && (
                    <span className="flex items-center gap-1">
                      <Instagram size={13} />
                      {terreiro.instagram}
                    </span>
                  )}
                </div>

                {terreiro.descricao && (
                  <p className="text-sm text-muted line-clamp-2">
                    {terreiro.descricao}
                  </p>
                )}

                {terreiro.endereco && (
                  <p className="text-xs text-muted mt-1">
                    📍 {terreiro.endereco}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex sm:flex-col gap-2 sm:w-36">
                <button
                  onClick={() => handleAcao(terreiro.id, "verificar")}
                  disabled={loadingId === terreiro.id}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-success text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-success/90 disabled:opacity-50 transition-colors"
                >
                  {loadingId === terreiro.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  Verificar
                </button>

                <a
                  href={`/terreiros/${terreiro.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gray-100 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Ver página
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
