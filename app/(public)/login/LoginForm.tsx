"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "E-mail ou senha incorretos.");
        return;
      }

      // Redirecionar para admin se for admin, senão para home
      if (data.role && ["admin", "master", "senior"].includes(data.role)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/20 text-error text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
          className="input-field"
        />
      </div>

      {/* Senha */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="senha" className="block text-sm font-medium text-foreground">
            Senha
          </label>
          <Link
            href="/esqueci-senha"
            className="text-xs text-primary hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <input
            id="senha"
            type={showSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="input-field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !email || !senha}
        className="btn-primary w-full py-3.5 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Entrar
          </>
        )}
      </button>
    </form>
  );
}
