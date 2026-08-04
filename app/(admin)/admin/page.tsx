import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Link from "next/link";
import {
  CheckSquare,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Crown,
  MessageCircle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { getSessionToken } from "@/lib/auth";
import { listarTerreiros, listarTerreirosPendentes } from "@/lib/terreiros";
import { buscarMetricasAnalytics } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Dashboard Admin | AxéApp",
};

function formatDate(value: string | Date): string {
  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

export default async function AdminDashboardPage() {
  const token = await getSessionToken();
  const [todos, pendentes, metricas] = await Promise.all([
    listarTerreiros(),
    token ? listarTerreirosPendentes(token) : Promise.resolve([]),
    token ? buscarMetricasAnalytics(token) : Promise.resolve(null),
  ]);

  const verificados = todos.filter((t) => t.isVerified === 1).length;
  const porTradicao = todos.reduce<Record<string, number>>((acc, t) => {
    acc[t.tradicao] = (acc[t.tradicao] ?? 0) + 1;
    return acc;
  }, {});
  const topTradicoes = Object.entries(porTradicao)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted text-sm mt-1">
          Visão geral do AxéApp — terreiros + métricas do app
        </p>
      </div>

      {/* Stats terreiros */}
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
        Diretório de Terreiros
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total de Terreiros",
            value: todos.length,
            icon: MapPin,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Verificados",
            value: verificados,
            icon: CheckSquare,
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            label: "Pendentes",
            value: pendentes.length,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
            href: "/admin/aprovacoes",
          },
          {
            label: "Taxa de Verificação",
            value:
              todos.length > 0
                ? `${Math.round((verificados / todos.length) * 100)}%`
                : "0%",
            icon: TrendingUp,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              {stat.href && pendentes.length > 0 && (
                <Link
                  href={stat.href}
                  className="text-xs text-primary hover:underline"
                >
                  Ver todos
                </Link>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stats app (mesma API do Dashboard Analytics do mobile) */}
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
        Métricas do App
      </h2>
      {metricas ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              {
                label: "Usuários",
                value: metricas.totalUsuarios,
                sub: `+${metricas.novosUsuarios7d} nos últimos 7d`,
                icon: Users,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: "Ativos 7d",
                value: metricas.usuariosAtivos7d,
                sub: `${metricas.usuariosAtivos30d} ativos em 30d`,
                icon: Sparkles,
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                label: "Assinantes ativos",
                value: metricas.assinantesAtivos,
                sub: `${metricas.assinantesMensal} mensal · ${metricas.assinantesAnual} anual`,
                icon: Crown,
                color: "text-warning",
                bg: "bg-warning/10",
              },
              {
                label: "Taxa de conversão",
                value: `${metricas.taxaConversao}%`,
                sub: `${metricas.totalAssinantes} assinaturas no histórico`,
                icon: TrendingUp,
                color: "text-secondary",
                bg: "bg-secondary/10",
              },
            ].map((stat) => (
              <div key={stat.label} className="card">
                <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-3`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
                <p className="text-xs text-muted/80 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Consultas",
                value: metricas.totalConsultas,
                sub: `${metricas.consultasHoje} hoje · ${metricas.consultas7d} em 7d`,
                icon: MessageCircle,
              },
              {
                label: "Depoimentos",
                value: metricas.totalDepoimentos,
                sub: `+${metricas.depoimentos7d} em 7d`,
                icon: BookOpen,
              },
              {
                label: "Diário",
                value: metricas.totalEntradasDiario,
                sub: "entradas registradas",
                icon: BookOpen,
              },
              {
                label: "Orixá mais consultado",
                value: metricas.orixaMaisConsultado?.orixaNome ?? "—",
                sub: metricas.orixaMaisConsultado
                  ? `${metricas.orixaMaisConsultado.total} consultas`
                  : "sem dados",
                icon: Sparkles,
              },
            ].map((stat) => (
              <div key={stat.label} className="card">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                  <stat.icon size={20} className="text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground truncate">
                  {stat.value}
                </p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
                <p className="text-xs text-muted/80 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="font-semibold text-foreground mb-4">
                Assinantes por plataforma
              </h2>
              <div className="space-y-3">
                {[
                  {
                    label: "Android",
                    valor: metricas.plataformaAndroid,
                  },
                  { label: "iOS", valor: metricas.plataformaIos },
                ].map((row) => {
                  const total =
                    metricas.plataformaAndroid + metricas.plataformaIos;
                  const pct =
                    total > 0 ? Math.round((row.valor / total) * 100) : 0;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-sm text-foreground w-20">
                        {row.label}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {row.valor}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-foreground mb-4">
                Últimas assinaturas
              </h2>
              {metricas.ultimasAssinaturas.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">
                  Nenhuma assinatura recente
                </p>
              ) : (
                <div className="space-y-2">
                  {metricas.ultimasAssinaturas.slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">
                          {a.plano}
                        </p>
                        <p className="text-xs text-muted">
                          {a.plataforma} · {formatDate(a.dataInicio)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success capitalize">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="card mb-8 text-sm text-muted">
          Não foi possível carregar as métricas do app. Confirme que você está
          logado como admin e que a API (
          <code className="text-xs">NEXT_PUBLIC_API_URL</code>) está correta.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendentes de aprovação */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              Pendentes de Aprovação
            </h2>
            <Link
              href="/admin/aprovacoes"
              className="text-sm text-primary hover:underline"
            >
              Ver todos ({pendentes.length})
            </Link>
          </div>

          {pendentes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <CheckSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum terreiro pendente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendentes.slice(0, 5).map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/aprovacoes?id=${t.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center text-sm">
                    🕯️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {t.nome}
                    </p>
                    <p className="text-xs text-muted">
                      {t.cidade}, {t.estado} · {t.tradicao}
                    </p>
                  </div>
                  <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">
                    Pendente
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top tradições */}
        <div className="card">
          <h2 className="font-semibold text-foreground mb-4">
            Terreiros por Tradição
          </h2>
          <div className="space-y-3">
            {topTradicoes.map(([tradicao, count]) => (
              <div key={tradicao} className="flex items-center gap-3">
                <span className="text-sm text-foreground flex-1 truncate">
                  {tradicao}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{
                        width: `${Math.round((count / Math.max(todos.length, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
