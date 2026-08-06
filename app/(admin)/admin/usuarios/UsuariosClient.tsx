"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Crown, Users, Trash2, MailPlus } from "lucide-react";
import type { AdminUser, AdminUserRole } from "@/lib/usuarios";

interface Props {
  usuarios: AdminUser[];
  currentUserId: number;
}

const ROLE_OPTIONS: { value: AdminUserRole; label: string; hint: string }[] = [
  { value: "user", label: "user", hint: "Sem Premium por role" },
  {
    value: "senior",
    label: "senior",
    hint: "Cortesia Premium (recomendado para staff/influenciadores)",
  },
  { value: "admin", label: "admin", hint: "Premium + acesso admin" },
  { value: "master", label: "master", hint: "Controle total" },
];

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function UsuariosClient({ usuarios: initial, currentUserId }: Props) {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState(initial);
  const [busca, setBusca] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [emailCortesia, setEmailCortesia] = useState("");
  const [savingCortesia, setSavingCortesia] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setUsuarios(initial);
  }, [initial]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q) ||
        String(u.id).includes(q) ||
        (u.role ?? "").toLowerCase().includes(q) ||
        (u.loginMethod ?? "").toLowerCase().includes(q)
    );
  }, [usuarios, busca]);

  const handleSetRole = async (userId: number, role: AdminUserRole) => {
    const atual = usuarios.find((u) => u.id === userId);
    if (!atual || atual.role === role) return;

    const ok = window.confirm(
      `Alterar role de #${userId} (${atual.email || atual.name || "sem e-mail"}) para "${role}"?`
    );
    if (!ok) return;

    setLoadingId(userId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erro ao atualizar." });
        return;
      }
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      setMessage({
        type: "success",
        text:
          role === "user"
            ? "Role removida (sem Premium por staff)."
            : `Role "${role}" aplicada — Premium por role no app.`,
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    } finally {
      setLoadingId(null);
    }
  };

  const handleCortesia = async () => {
    const email = emailCortesia.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Informe um e-mail válido." });
      return;
    }
    setSavingCortesia(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cortesia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "senior" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erro ao cadastrar." });
        return;
      }
      setEmailCortesia("");
      setMessage({
        type: "success",
        text: data.criado
          ? `Cortesia criada para ${data.email}. Quando a pessoa criar conta com esse e-mail, já entra Premium.`
          : `Cortesia aplicada em conta existente (${data.email}).`,
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    } finally {
      setSavingCortesia(false);
    }
  };

  const handleExcluir = async (u: AdminUser) => {
    if (u.id === currentUserId) return;
    if (u.role === "master") {
      setMessage({ type: "error", text: "Não é possível excluir conta master." });
      return;
    }
    const ok = window.confirm(
      `Excluir permanentemente #${u.id} (${u.email || u.name || "sem e-mail"})?\n\nIsso apaga a conta e dados ligados (LGPD). Não dá para desfazer.`
    );
    if (!ok) return;

    setLoadingId(u.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/excluir-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erro ao excluir." });
        return;
      }
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
      setMessage({ type: "success", text: `Conta #${u.id} excluída.` });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Erro de conexão." });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
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

      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MailPlus size={16} className="text-primary" />
          Cadastrar cortesia por e-mail
        </h2>
        <p className="text-xs text-muted mb-3">
          Digite o e-mail da pessoa. Se ela ainda não tiver conta, criamos um cadastro
          pendente com Premium (role senior). Quando ela entrar no app com esse e-mail,
          já recebe o benefício.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={emailCortesia}
            onChange={(e) => setEmailCortesia(e.target.value)}
            placeholder="email@exemplo.com"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground outline-none"
          />
          <button
            type="button"
            onClick={handleCortesia}
            disabled={savingCortesia}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {savingCortesia ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Crown size={16} />
            )}
            Dar cortesia Premium
          </button>
        </div>
      </div>

      <div className="card mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex-1 flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-background">
          <Search size={16} className="text-muted" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por e-mail, nome, id ou role…"
            className="flex-1 bg-transparent outline-none text-sm text-foreground"
          />
        </div>
        <p className="text-xs text-muted">
          {filtrados.length} de {usuarios.length} · use{" "}
          <strong>senior</strong> para cortesia Premium
        </p>
      </div>

      {usuarios.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-muted opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Nenhum usuário listado
          </h2>
          <p className="text-muted text-sm">
            Confirme a API e que sua conta master está autenticada. Ou cadastre uma
            cortesia pelo formulário acima.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((u) => {
            const premium =
              u.role === "senior" || u.role === "admin" || u.role === "master";
            const isSelf = u.id === currentUserId;
            const pendente = u.loginMethod === "cortesia";
            return (
              <div key={u.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-muted">#{u.id}</span>
                      {premium && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          <Crown size={10} />
                          Premium (role)
                        </span>
                      )}
                      {pendente && (
                        <span className="text-xs bg-amber-500/15 text-amber-800 px-2 py-0.5 rounded-full">
                          cortesia pendente
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-xs bg-foreground/10 text-foreground px-2 py-0.5 rounded-full">
                          você
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">
                      {u.name || "Sem nome"}
                    </h3>
                    <p className="text-sm text-muted truncate">
                      {u.email || u.openId}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {u.loginMethod ?? "—"} · desde {formatDate(u.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-xs text-muted whitespace-nowrap">
                      Role
                    </label>
                    <select
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground min-w-[140px]"
                      value={(u.role as AdminUserRole) || "user"}
                      disabled={loadingId === u.id}
                      onChange={(e) =>
                        handleSetRole(u.id, e.target.value as AdminUserRole)
                      }
                      title={
                        ROLE_OPTIONS.find((r) => r.value === u.role)?.hint ?? ""
                      }
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    {!isSelf && u.role !== "master" && (
                      <button
                        type="button"
                        onClick={() => handleExcluir(u)}
                        disabled={loadingId === u.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-error/40 text-error px-3 py-2 text-xs font-medium hover:bg-error/10 disabled:opacity-50"
                        title="Excluir conta"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    )}
                    {loadingId === u.id && (
                      <Loader2 size={16} className="animate-spin text-primary" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
