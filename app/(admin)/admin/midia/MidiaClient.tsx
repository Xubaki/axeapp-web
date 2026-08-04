"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Check, Sparkles, CalendarDays } from "lucide-react";
import type { MidiaPostGerado } from "@/lib/midia";

const TEMAS = [
  { value: "orixa_motivacao", label: "Seg — Orixá / motivação" },
  { value: "educacao", label: "Ter — Educação" },
  { value: "dica_pratica", label: "Qua — Dica prática" },
  { value: "engajamento", label: "Qui — Engajamento" },
  { value: "cta_app", label: "Sex — CTA app / Premium" },
  { value: "livre", label: "Livre (briefing)" },
];

const PLATAFORMAS = [
  { value: "instagram_feed", label: "Instagram Feed" },
  { value: "instagram_reels", label: "Instagram Reels" },
  { value: "stories", label: "Stories" },
  { value: "tiktok", label: "TikTok" },
];

const CHECKLIST_KEY = "axe_midia_checklist_v1";

type Checklist = {
  bioLink: boolean;
  evergreen8: boolean;
  reelsPiloto: boolean;
  mediaKitParceiro: boolean;
};

const CHECKLIST_DEFAULT: Checklist = {
  bioLink: false,
  evergreen8: false,
  reelsPiloto: false,
  mediaKitParceiro: false,
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-background transition-colors"
    >
      {ok ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      {label ?? (ok ? "Copiado" : "Copiar")}
    </button>
  );
}

function PostCard({ post }: { post: MidiaPostGerado }) {
  const full = [post.caption, "", (post.hashtags ?? []).join(" ")].join("\n").trim();
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{post.titulo}</h3>
          <p className="text-xs text-muted mt-0.5">
            {[post.dia, post.tema, post.plataforma, post.formato]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <CopyButton text={full} label="Copiar post" />
      </div>
      <pre className="text-sm whitespace-pre-wrap font-sans text-foreground bg-background border border-border rounded-lg p-3">
        {post.caption}
      </pre>
      <p className="text-xs text-primary">{(post.hashtags ?? []).join(" ")}</p>
      {post.sugestaoVisual && (
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">Visual:</span>{" "}
          {post.sugestaoVisual}
        </p>
      )}
      {post.cta && (
        <p className="text-sm">
          <span className="font-medium">CTA:</span> {post.cta}
        </p>
      )}
    </div>
  );
}

export function MidiaClient() {
  const [tema, setTema] = useState("orixa_motivacao");
  const [plataforma, setPlataforma] = useState("instagram_feed");
  const [briefing, setBriefing] = useState("");
  const [focoSemana, setFocoSemana] = useState("");
  const [loading, setLoading] = useState<"post" | "semana" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<MidiaPostGerado | null>(null);
  const [semana, setSemana] = useState<MidiaPostGerado[]>([]);
  const [checklist, setChecklist] = useState<Checklist>(CHECKLIST_DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_KEY);
      if (raw) setChecklist({ ...CHECKLIST_DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const saveChecklist = (next: Checklist) => {
    setChecklist(next);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
  };

  const gerar = async () => {
    setLoading("post");
    setError(null);
    try {
      const res = await fetch("/api/admin/midia/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, plataforma, briefing: briefing || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao gerar.");
        return;
      }
      setPost(data.post);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(null);
    }
  };

  const planejar = async () => {
    setLoading("semana");
    setError(null);
    try {
      const res = await fetch("/api/admin/midia/semana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foco: focoSemana || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha no plano.");
        return;
      }
      setSemana(data.posts ?? []);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">
          {error}
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles size={18} /> Gerar 1 post
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span className="text-muted">Tema</span>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            >
              {TEMAS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-muted">Plataforma</span>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
            >
              {PLATAFORMAS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="text-sm space-y-1 block">
          <span className="text-muted">Briefing (opcional)</span>
          <textarea
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm min-h-[72px]"
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            placeholder="Ex.: falar de Iemanjá e banho de arruda, tom acolhedor"
          />
        </label>
        <button
          type="button"
          onClick={gerar}
          disabled={loading !== null}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading === "post" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Gerar caption
        </button>
        {post && <PostCard post={post} />}
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <CalendarDays size={18} /> Plano da semana (Seg–Sex)
        </h2>
        <label className="text-sm space-y-1 block">
          <span className="text-muted">Foco da semana (opcional)</span>
          <input
            className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm"
            value={focoSemana}
            onChange={(e) => setFocoSemana(e.target.value)}
            placeholder="Ex.: lançar Premium anual + Orixá da semana"
          />
        </label>
        <button
          type="button"
          onClick={planejar}
          disabled={loading !== null}
          className="btn-primary inline-flex items-center gap-2"
        >
          {loading === "semana" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CalendarDays size={16} />
          )}
          Gerar semana
        </button>
        <div className="space-y-3">
          {semana.map((p, i) => (
            <PostCard key={`${p.titulo}-${i}`} post={p} />
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-foreground">Checklist fase 1 (local)</h2>
        <p className="text-xs text-muted">
          Salvo neste navegador. Preços oficiais no Media Kit: R$2,99 / R$15,99 /
          R$99,99 / R$34,99.
        </p>
        {(
          [
            ["bioLink", "Bio IG/TikTok com link appaxe.com.br"],
            ["evergreen8", "8 posts evergreen salvos (Drive/Notion)"],
            ["reelsPiloto", "1 Reels piloto medido"],
            ["mediaKitParceiro", "Media Kit enviado a 1 parceiro"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={checklist[key]}
              onChange={(e) =>
                saveChecklist({ ...checklist, [key]: e.target.checked })
              }
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
