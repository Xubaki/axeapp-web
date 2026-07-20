import Link from "next/link";
import { MapPin, Phone, Instagram, CheckCircle } from "lucide-react";
import type { Terreiro } from "@/lib/types/router";
import { planoBadge } from "@/lib/terreiros";

interface TerreiroCardProps {
  terreiro: Terreiro;
  compact?: boolean;
}

export function TerreiroCard({ terreiro, compact = false }: TerreiroCardProps) {
  const badge = planoBadge(terreiro.plano);

  return (
    <Link
      href={`/terreiros/${terreiro.id}`}
      className="card hover:shadow-md hover:border-primary/20 transition-all group block"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge-plano ${badge.className}`}>
              {badge.label}
            </span>
            {terreiro.isVerified === 1 && (
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle size={12} />
                Verificado
              </span>
            )}
          </div>
          <h3 className="font-serif font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {terreiro.nome}
          </h3>
        </div>
        <div className="text-2xl flex-shrink-0">
          {terreiro.tradicao.includes("Umbanda")
            ? "🕯️"
            : terreiro.tradicao.includes("Candomblé")
            ? "🥁"
            : terreiro.tradicao.includes("Quimbanda")
            ? "⚡"
            : "🔥"}
        </div>
      </div>

      {/* Tradição */}
      <p className="text-sm font-medium text-primary mb-2">{terreiro.tradicao}</p>

      {/* Localização */}
      <div className="flex items-center gap-1.5 text-sm text-muted mb-3">
        <MapPin size={14} className="flex-shrink-0" />
        <span className="truncate">
          {terreiro.cidade}, {terreiro.estado}
        </span>
      </div>

      {/* Descrição */}
      {!compact && terreiro.descricao && (
        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
          {terreiro.descricao}
        </p>
      )}

      {/* Contatos */}
      <div className="flex items-center gap-3 text-xs text-muted">
        {terreiro.whatsapp && (
          <span className="flex items-center gap-1">
            <Phone size={12} />
            WhatsApp
          </span>
        )}
        {terreiro.instagram && (
          <span className="flex items-center gap-1">
            <Instagram size={12} />
            Instagram
          </span>
        )}
        {terreiro.dirigente && (
          <span className="truncate">Dir.: {terreiro.dirigente}</span>
        )}
      </div>
    </Link>
  );
}
