/**
 * Métricas do painel analytics (mesma fonte do app: analytics.metricas).
 */
import { apiBaseUrl } from "./api";

export type MetricasAnalytics = {
  totalUsuarios: number;
  usuariosAtivos7d: number;
  usuariosAtivos30d: number;
  novosUsuarios7d: number;
  novosUsuarios30d: number;
  totalAssinantes: number;
  assinantesAtivos: number;
  assinantesMensal: number;
  assinantesAnual: number;
  totalConsultas: number;
  consultasHoje: number;
  consultas7d: number;
  totalDepoimentos: number;
  depoimentos7d: number;
  totalEntradasDiario: number;
  taxaConversao: number;
  plataformaAndroid: number;
  plataformaIos: number;
  orixaMaisConsultado: {
    orixaId: string;
    orixaNome: string;
    total: number;
  } | null;
  ultimasAssinaturas: Array<{
    id: number;
    plano: string;
    plataforma: string;
    status: string;
    dataInicio: string | Date;
  }>;
};

export async function buscarMetricasAnalytics(
  sessionToken: string
): Promise<MetricasAnalytics | null> {
  const params = new URLSearchParams();
  params.set("batch", "1");
  params.set("input", JSON.stringify({ "0": { json: null } }));

  try {
    const res = await fetch(
      `${apiBaseUrl}/api/trpc/analytics.metricas?${params}`,
      {
        headers: { Authorization: `Bearer ${sessionToken}` },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const json = data?.[0]?.result?.data?.json;
    if (!json || typeof json.totalUsuarios !== "number") return null;
    return json as MetricasAnalytics;
  } catch (err) {
    console.error("[analytics] falha ao buscar métricas:", err);
    return null;
  }
}
