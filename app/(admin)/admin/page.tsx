import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { CheckSquare, MapPin, Clock, TrendingUp } from "lucide-react";
import { getSessionToken } from "@/lib/auth";
import { listarTerreiros, listarTerreirosPendentes } from "@/lib/terreiros";

export const metadata: Metadata = {
  title: "Dashboard Admin | AxéApp",
};

export default async function AdminDashboardPage() {
  const token = await getSessionToken();
  const [todos, pendentes] = await Promise.all([
    listarTerreiros(),
    token ? listarTerreirosPendentes(token) : Promise.resolve([]),
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
          Visão geral do AxéApp
        </p>
      </div>

      {/* Stats */}
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
            value: todos.length > 0 ? `${Math.round((verificados / todos.length) * 100)}%` : "0%",
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
                        width: `${Math.round((count / todos.length) * 100)}%`,
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
