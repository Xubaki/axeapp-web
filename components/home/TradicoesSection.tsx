import Link from "next/link";

const TRADICOES = [
  {
    nome: "Umbanda",
    emoji: "☀️",
    desc: "Caridade e evolução espiritual",
  },
  {
    nome: "Candomblé",
    emoji: "🏛️",
    desc: "Tradições africanas preservadas",
  },
  {
    nome: "Quimbanda",
    emoji: "⚡",
    desc: "Trabalhos e magia",
  },
  {
    nome: "Jurema",
    emoji: "🌿",
    desc: "Tradição indígena nordestina",
  },
  {
    nome: "Tambor de Mina",
    emoji: "👁️",
    desc: "Tradição maranhense",
  },
  {
    nome: "Batuque",
    emoji: "🎭",
    desc: "Tradição gaúcha",
  },
  {
    nome: "Xangô",
    emoji: "⚔️",
    desc: "Tradição pernambucana",
  },
  {
    nome: "Candomblé de Caboclo",
    emoji: "🌳",
    desc: "Sincretismo afro-indígena",
  },
] as const;

/**
 * Seção "Tradições que celebramos" — design Manus (mock HTML)
 * portado para Next + Tailwind. Links para busca de terreiros.
 */
export function TradicoesSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-[#f5f1ed] via-[#ede7e0] to-[#f5f1ed]">
      {/* Halos decorativos */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(45,80,22,0.08)_0%,transparent_70%)]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-14">
          <div
            aria-hidden
            className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/60"
          >
            <span className="text-[#D4AF37] text-lg">✦</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-bold text-foreground tracking-tight mb-4">
            Tradições que celebramos
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            O AxéApp abraça a diversidade das religiões de matriz africana com
            respeito e autenticidade.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRADICOES.map((t, i) => (
            <Link
              key={t.nome}
              href={`/terreiros?tradicao=${encodeURIComponent(t.nome)}`}
              className="group relative overflow-hidden rounded-2xl bg-white border-2 border-transparent p-6 sm:p-8 text-center shadow-[0_4px_6px_rgba(0,0,0,0.07)] transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/30 hover:shadow-[0_12px_24px_rgba(212,175,55,0.15)]"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <div className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37]/15 to-[#2D5016]/10 text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                {t.emoji}
              </div>

              <div
                aria-hidden
                className="mx-auto mb-3 h-0.5 w-10 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />

              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">
                {t.nome}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                {t.desc}
              </p>
              <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] transition-transform duration-300 group-hover:translate-x-1">
                Ver terreiros →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
