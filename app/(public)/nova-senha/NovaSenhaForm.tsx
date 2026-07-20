"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";

interface Props {
  token: string;
}

export function NovaSenhaForm({ token }: Props) {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-success" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Senha redefinida!
          </h2>
          <p className="text-sm text-muted">
            Sua senha foi alterada com sucesso. Redirecionando para o login...
          </p>
        </div>
        <Link href="/login" className="btn-primary inline-flex">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {error && (
        <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Nova senha */}
      <div>
        <label
          htmlFor="novaSenha"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Nova senha
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Lock size={18} />
          </div>
          <input
            id="novaSenha"
            type={showSenha ? "text" : "password"}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            autoComplete="new-password"
            className="input-field pl-10 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {/* Força da senha */}
        {novaSenha && (
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  novaSenha.length >= level * 3
                    ? level <= 1
                      ? "bg-error"
                      : level <= 2
                      ? "bg-warning"
                      : level <= 3
                      ? "bg-secondary"
                      : "bg-success"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmar senha */}
      <div>
        <label
          htmlFor="confirmar"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Confirmar nova senha
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Lock size={18} />
          </div>
          <input
            id="confirmar"
            type={showSenha ? "text" : "password"}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repita a nova senha"
            required
            autoComplete="new-password"
            className={`input-field pl-10 ${
              confirmar && confirmar !== novaSenha
                ? "border-error focus:ring-error"
                : confirmar && confirmar === novaSenha
                ? "border-success focus:ring-success"
                : ""
            }`}
          />
        </div>
        {confirmar && confirmar !== novaSenha && (
          <p className="text-xs text-error mt-1">As senhas não coincidem</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !novaSenha || !confirmar || novaSenha !== confirmar}
        className="btn-primary w-full py-3.5 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Lock size={18} />
            Salvar nova senha
          </>
        )}
      </button>
    </form>
  );
}
