import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { MidiaClient } from "./MidiaClient";

export const metadata: Metadata = {
  title: "Mídia Social | Admin AxéApp",
};

export default function MidiaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Agente de Mídia
        </h1>
        <p className="text-muted text-sm mt-1 max-w-2xl">
          Gera captions, hashtags e ideias visuais.{" "}
          <strong className="text-foreground">Publicação é manual</strong> no
          Meta Business Suite / TikTok — sem post automático nesta fase.
        </p>
      </div>
      <MidiaClient />
    </div>
  );
}
