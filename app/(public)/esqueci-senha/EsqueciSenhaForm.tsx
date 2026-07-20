"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";

export function EsqueciSenhaForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Contador regressivo para reenvio
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const enviarLink = useCallback(async (emailToSend: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar e-mail.");
        return;
      }

      setSent(true);
      setCountdown(60); // 60 segundos para reenvio
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviarLink(email);
  };

  const handleReenviar = () => {
    if (countdown > 0) return;
    enviarLink(email);
  };

  if (sent) {
    return (
      <div className="card text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-success" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Link enviado!
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Se o e-mail{" "}
            <span className="font-medium text-foreground">{email}</span> estiver
            cadastrado, você receberá o link de recuperação em breve.
          </p>
          <p className="text-xs text-muted mt-2">
            Verifique também a pasta de spam.
          </p>
        </div>

        {/* Reenviar com contador */}
        <div className="pt-2">
          {countdown > 0 ? (
            <p className="text-sm text-muted">
              Reenviar disponível em{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {countdown}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleReenviar}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Reenviar link
            </button>
          )}
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao login
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

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          E-mail cadastrado
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Mail size={18} />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
            className="input-field pl-10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="btn-primary w-full py-3.5 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Mail size={18} />
            Enviar link de recuperação
          </>
        )}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar ao login
      </Link>
    </form>
  );
}
