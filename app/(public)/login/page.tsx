import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Faça login na sua conta AxéApp.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="AxéApp" width={64} height={64} className="rounded-2xl mx-auto mb-3" />
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Entrar no AxéApp
          </h1>
          <p className="text-muted text-sm mt-1">
            Acesse sua conta para gerenciar seu terreiro
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted mt-6">
          Não tem conta?{" "}
          <a
            href="/#download"
            className="text-primary font-medium hover:underline"
          >
            Baixe o app
          </a>{" "}
          para se cadastrar.
        </p>
      </div>
    </div>
  );
}
