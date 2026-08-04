import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Painel Admin",
  description: "Acesso restrito à equipe AxéApp.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="AxéApp" width={64} height={64} className="rounded-2xl mx-auto mb-3" />
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Painel AxéApp
          </h1>
          <p className="text-muted text-sm mt-1">
            Acesso interno da equipe — aprovação de terreiros e dashboard
          </p>
        </div>

        <Suspense fallback={<div className="card text-center text-muted text-sm py-8">Carregando…</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-muted mt-6">
          Conta de usuário?{" "}
          <a href="/#download" className="text-primary font-medium hover:underline">
            Use o app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
