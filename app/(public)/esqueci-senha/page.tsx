import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { EsqueciSenhaForm } from "./EsqueciSenhaForm";

export const metadata: Metadata = {
  title: "Recuperar Senha",
  description: "Recupere o acesso à sua conta AxéApp.",
};

export default function EsqueciSenhaPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Recuperar senha
          </h1>
          <p className="text-muted text-sm mt-1">
            Digite seu e-mail para receber o link de recuperação
          </p>
        </div>
        <EsqueciSenhaForm />
      </div>
    </div>
  );
}
