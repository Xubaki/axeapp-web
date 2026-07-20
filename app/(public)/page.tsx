import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, Star, Shield, Smartphone, ArrowRight, ChevronRight } from "lucide-react";
import { listarTerreiros } from "@/lib/terreiros";
import { TerreiroCard } from "@/components/terreiro/TerreiroCard";
import { SearchBar } from "@/components/ui/SearchBar";

export const metadata: Metadata = {
  title: "AxéApp — Guia Espiritual de Umbanda e Candomblé",
  description:
    "Encontre terreiros de Umbanda e Candomblé perto de você. Mapa interativo, guia espiritual e comunidade afro-brasileira.",
};

export default async function HomePage() {
  // Buscar terreiros em destaque (plano ouro/diamante)
  const terreiros = await listarTerreiros();
  const terreiroDestaque = terreiros
    .filter((t) => t.plano === "ouro" || t.plano === "diamante")
    .slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-16 pb-24">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Image src="/logo.png" alt="AxéApp" width={18} height={18} className="rounded-sm" />
              <span>O guia espiritual afro-brasileiro mais completo</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
              Encontre seu{" "}
              <span className="text-primary">terreiro</span> e{" "}
              <span className="text-secondary">conecte-se</span> ao axé
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              Descubra terreiros de Umbanda e Candomblé perto de você, aprenda
              sobre os Orixás e faça parte de uma comunidade espiritual
              autêntica.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center" id="download">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-base px-8 py-4 gap-2"
              >
                <span>🍎</span>
                Baixar para iOS
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-8 py-4 gap-2"
              >
                <span>🤖</span>
                Baixar para Android
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className="text-secondary fill-secondary" />
                  ))}
                </div>
                <span className="font-medium text-foreground">4.9</span>
                <span>na App Store</span>
              </div>
              <span className="text-border">|</span>
              <span>+10.000 usuários</span>
              <span className="text-border">|</span>
              <span>+500 terreiros cadastrados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              O AxéApp reúne terreiros, conhecimento espiritual e comunidade
              para guiar sua jornada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin size={32} className="text-primary" />,
                title: "Mapa de Terreiros",
                description:
                  "Encontre terreiros verificados perto de você com mapa interativo. Filtre por tradição, cidade e estado.",
                href: "/mapa",
                cta: "Ver mapa",
              },
              {
                icon: <Search size={32} className="text-secondary" />,
                title: "Busca Avançada",
                description:
                  "Pesquise por nome, cidade, estado ou tradição religiosa. Encontre exatamente o que procura.",
                href: "/terreiros",
                cta: "Buscar terreiros",
              },
              {
                icon: <Shield size={32} className="text-accent" />,
                title: "Terreiros Verificados",
                description:
                  "Todos os terreiros passam por verificação da nossa equipe para garantir autenticidade e segurança.",
                href: "/sobre",
                cta: "Saiba mais",
              },
            ].map((feature) => (
              <div key={feature.title} className="card hover:shadow-md transition-shadow group">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                >
                  {feature.cta}
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terreiros em Destaque */}
      {terreiroDestaque.length > 0 && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                  Terreiros em Destaque
                </h2>
                <p className="text-muted">
                  Terreiros parceiros verificados pela nossa equipe
                </p>
              </div>
              <Link
                href="/terreiros"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Ver todos
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {terreiroDestaque.map((terreiro) => (
                <TerreiroCard key={terreiro.id} terreiro={terreiro} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link href="/terreiros" className="btn-outline">
                Ver todos os terreiros
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* App Download Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Smartphone size={16} />
                <span>Disponível para iOS e Android</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                Leve o axé no seu bolso
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Com o app AxéApp você tem acesso ao diário espiritual, consultas
                com IA sobre os Orixás, mapa offline e muito mais — tudo na
                palma da sua mão.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Diário espiritual pessoal",
                  "Consultas sobre Orixás com IA",
                  "Mapa de terreiros offline",
                  "Comunidade e depoimentos",
                  "Perfil espiritual personalizado",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-white/90">
                    <span className="text-secondary">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
                >
                  🍎 App Store
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  🤖 Google Play
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-64 h-96 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                <div className="text-center">
                  <Image src="/logo.png" alt="AxéApp" width={80} height={80} className="rounded-2xl mx-auto mb-4" />
                  <p className="text-white/80 text-sm font-medium">AxéApp</p>
                  <p className="text-white/60 text-xs mt-1">Guia Espiritual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tradições Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              Tradições que celebramos
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              O AxéApp abraça a diversidade das religiões afro-brasileiras com
              respeito e autenticidade.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { nome: "Umbanda", emoji: "🕯️", desc: "Caridade e evolução espiritual" },
              { nome: "Candomblé", emoji: "🥁", desc: "Tradições africanas preservadas" },
              { nome: "Quimbanda", emoji: "⚡", desc: "Trabalhos e magia" },
              { nome: "Jurema", emoji: "🌿", desc: "Tradição indígena nordestina" },
              { nome: "Tambor de Mina", emoji: "🌊", desc: "Tradição maranhense" },
              { nome: "Batuque", emoji: "🎶", desc: "Tradição gaúcha" },
              { nome: "Xangô", emoji: "⚖️", desc: "Tradição pernambucana" },
              { nome: "Candomblé de Caboclo", emoji: "🌿", desc: "Sincretismo afro-indígena" },
            ].map((tradicao) => (
              <Link
                key={tradicao.nome}
                href={`/terreiros?tradicao=${encodeURIComponent(tradicao.nome)}`}
                className="card text-center hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="text-3xl mb-2">{tradicao.emoji}</div>
                <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {tradicao.nome}
                </h3>
                <p className="text-xs text-muted mt-1">{tradicao.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
