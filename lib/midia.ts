import { apiBaseUrl, unwrapTrpcData, unwrapTrpcError } from "./api";

export type MidiaPostGerado = {
  titulo: string;
  caption: string;
  hashtags: string[];
  sugestaoVisual: string;
  cta: string;
  formato?: string;
  tema?: string;
  plataforma?: string;
  dia?: string;
};

export async function gerarPostMidia(
  sessionToken: string,
  input: {
    tema: string;
    plataforma: string;
    briefing?: string;
    orixaId?: string;
  }
): Promise<{ ok: true; post: MidiaPostGerado } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/trpc/midia.gerarPost?batch=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ "0": { json: input } }),
    });
    const data = await res.json();
    const err = unwrapTrpcError(data);
    if (err || !res.ok) return { ok: false, error: err || "Erro ao gerar post." };
    const post = unwrapTrpcData<MidiaPostGerado>(data);
    if (!post) return { ok: false, error: "Resposta vazia da API." };
    return { ok: true, post };
  } catch {
    return { ok: false, error: "Erro de conexão com a API." };
  }
}

export async function planejarSemanaMidia(
  sessionToken: string,
  foco?: string
): Promise<{ ok: true; posts: MidiaPostGerado[] } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/trpc/midia.planejarSemana?batch=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ "0": { json: { foco: foco || undefined } } }),
    });
    const data = await res.json();
    const err = unwrapTrpcError(data);
    if (err || !res.ok) return { ok: false, error: err || "Erro ao planejar semana." };
    const parsed = unwrapTrpcData<{ posts: MidiaPostGerado[] }>(data);
    return { ok: true, posts: parsed?.posts ?? [] };
  } catch {
    return { ok: false, error: "Erro de conexão com a API." };
  }
}
