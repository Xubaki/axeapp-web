import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  Phone,
  Instagram,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Globe,
} from "lucide-react";
import { obterTerreiro, planoBadge } from "@/lib/terreiros";

const MapaTerreiros = dynamic(
  () => import("@/components/map/MapaTerreiros").then((m) => m.MapaTerreiros),
  { ssr: false, loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" /> }
);

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseInt(params.id);
  if (isNaN(id)) return { title: "Terreiro não encontrado" };

  const terreiro = await obterTerreiro(id);
  if (!terreiro) return { title: "Terreiro não encontrado" };

  return {
    title: terreiro.nome,
    description: terreiro.descricao
      ? terreiro.descricao.slice(0, 160)
      : `${terreiro.nome} — ${terreiro.tradicao} em ${terreiro.cidade}, ${terreiro.estado}. Encontre no AxéApp.`,
    openGraph: {
      title: `${terreiro.nome} | AxéApp`,
      description: terreiro.descricao?.slice(0, 160) ?? "",
      type: "article",
      locale: "pt_BR",
    },
    alternates: {
      canonical: `https://appaxe.com.br/terreiros/${terreiro.id}`,
    },
  };
}

export default async function TerreiroDetalhePage({ params }: Props) {
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const terreiro = await obterTerreiro(id);
  if (!terreiro || terreiro.ativo === 0) notFound();

  const badge = planoBadge(terreiro.plano);
  const temMapa =
    terreiro.latitude &&
    terreiro.longitude &&
    !isNaN(parseFloat(terreiro.latitude)) &&
    !isNaN(parseFloat(terreiro.longitude));

  // JSON-LD para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: terreiro.nome,
    description: terreiro.descricao ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: terreiro.cidade,
      addressRegion: terreiro.estado,
      addressCountry: "BR",
      streetAddress: terreiro.endereco ?? undefined,
    },
    telephone: terreiro.telefone ?? terreiro.whatsapp ?? undefined,
    url: `https://appaxe.com.br/terreiros/${terreiro.id}`,
    ...(temMapa && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: parseFloat(terreiro.latitude!),
        longitude: parseFloat(terreiro.longitude!),
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link
            href="/terreiros"
            className="hover:text-foreground transition-colors"
          >
            Terreiros
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">
            {terreiro.nome}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header do terreiro */}
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
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
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight">
                    {terreiro.nome}
                  </h1>
                  <p className="text-primary font-medium mt-1">
                    {terreiro.tradicao}
                  </p>
                </div>
                <div className="text-4xl">
                  {terreiro.tradicao.includes("Umbanda")
                    ? "🕯️"
                    : terreiro.tradicao.includes("Candomblé")
                    ? "🥁"
                    : terreiro.tradicao.includes("Quimbanda")
                    ? "⚡"
                    : "🔥"}
                </div>
              </div>

              {/* Localização */}
              <div className="flex items-start gap-2 text-muted mb-3">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {terreiro.cidade}, {terreiro.estado}
                  </p>
                  {terreiro.endereco && (
                    <p className="text-sm">{terreiro.endereco}</p>
                  )}
                </div>
              </div>

              {/* Dirigente */}
              {terreiro.dirigente && (
                <p className="text-sm text-muted">
                  <span className="font-medium text-foreground">Dirigente:</span>{" "}
                  {terreiro.dirigente}
                </p>
              )}
            </div>

            {/* Descrição */}
            {terreiro.descricao && (
              <div className="card">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-3">
                  Sobre o Terreiro
                </h2>
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {terreiro.descricao}
                </p>
              </div>
            )}

            {/* Mapa */}
            {temMapa && (
              <div className="card">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
                  Localização
                </h2>
                <MapaTerreiros
                  terreiros={[terreiro]}
                  height="300px"
                  selectedId={terreiro.id}
                />
                {terreiro.endereco && (
                  <p className="text-sm text-muted mt-3 flex items-center gap-1.5">
                    <MapPin size={14} />
                    {terreiro.endereco}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — Contato */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Entrar em contato
              </h2>

              <div className="space-y-3">
                {terreiro.whatsapp && (
                  <a
                    href={`https://wa.me/${terreiro.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-success hover:bg-success/5 transition-colors group"
                  >
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-success transition-colors">
                        WhatsApp
                      </p>
                      <p className="text-xs text-muted">{terreiro.whatsapp}</p>
                    </div>
                    <ExternalLink
                      size={14}
                      className="ml-auto text-muted group-hover:text-success"
                    />
                  </a>
                )}

                {terreiro.telefone && (
                  <a
                    href={`tel:${terreiro.telefone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
                  >
                    <Phone size={20} className="text-muted group-hover:text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        Telefone
                      </p>
                      <p className="text-xs text-muted">{terreiro.telefone}</p>
                    </div>
                  </a>
                )}

                {terreiro.instagram && (
                  <a
                    href={`https://instagram.com/${terreiro.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-pink-500 hover:bg-pink-50 transition-colors group"
                  >
                    <Instagram
                      size={20}
                      className="text-muted group-hover:text-pink-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-pink-500 transition-colors">
                        Instagram
                      </p>
                      <p className="text-xs text-muted">{terreiro.instagram}</p>
                    </div>
                    <ExternalLink
                      size={14}
                      className="ml-auto text-muted group-hover:text-pink-500"
                    />
                  </a>
                )}

                {!terreiro.whatsapp && !terreiro.telefone && !terreiro.instagram && (
                  <p className="text-sm text-muted text-center py-4">
                    Nenhum contato disponível
                  </p>
                )}
              </div>
            </div>

            {/* CTA App */}
            <div className="card bg-primary/5 border-primary/20">
              <div className="text-center">
                <div className="text-3xl mb-2">🔥</div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  Baixe o AxéApp
                </h3>
                <p className="text-xs text-muted mb-3">
                  Acesse este terreiro e muito mais no app
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2"
                  >
                    🍎 App Store
                  </a>
                  <a
                    href="https://play.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-2"
                  >
                    🤖 Google Play
                  </a>
                </div>
              </div>
            </div>

            {/* Voltar */}
            <Link
              href="/terreiros"
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar à busca
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
