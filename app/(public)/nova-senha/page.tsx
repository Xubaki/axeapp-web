import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { NovaSenhaForm } from "./NovaSenhaForm";

export const metadata: Metadata = {
  title: "Criar Nova Senha",
  description: "Defina uma nova senha para sua conta AxéApp.",
};

interface Props {
  searchParams: { token?: string };
}

export default function NovaSenhaPage({ searchParams }: Props) {
  const token = searchParams.token ?? "";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Criar nova senha
          </h1>
          <p className="text-muted text-sm mt-1">
            Escolha uma senha segura para sua conta
          </p>
        </div>

        {!token ? (
          <div className="card text-center">
            <p className="text-error font-medium mb-2">Link inválido</p>
            <p className="text-sm text-muted mb-4">
              Este link de recuperação é inválido ou expirou. Solicite um novo
              link.
            </p>
            <a href="/esqueci-senha" className="btn-primary">
              Solicitar novo link
            </a>
          </div>
        ) : (
          <NovaSenhaForm token={token} />
        )}
      </div>
    </div>
  );
}
