import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre o AxéApp",
  description:
    "Conheça o AxéApp — o guia espiritual mais completo de Umbanda e Candomblé do Brasil.",
};

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Image src="/logo.png" alt="AxéApp" width={80} height={80} className="rounded-2xl mx-auto mb-4" />
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
          Sobre o AxéApp
        </h1>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Conectando pessoas às tradições afro-brasileiras com respeito,
          autenticidade e tecnologia.
        </p>
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <div className="card">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Nossa Missão
          </h2>
          <p className="text-muted leading-relaxed">
            O AxéApp nasceu da necessidade de criar um espaço digital seguro e
            respeitoso para as religiões afro-brasileiras. Nossa missão é
            facilitar o encontro entre praticantes, simpatizantes e terreiros,
            preservando a autenticidade das tradições de Umbanda, Candomblé e
            outras religiões de matriz africana.
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
            O que oferecemos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                emoji: "🗺️",
                title: "Mapa de Terreiros",
                desc: "Encontre terreiros verificados em todo o Brasil com localização precisa.",
              },
              {
                emoji: "✅",
                title: "Verificação de Qualidade",
                desc: "Todos os terreiros passam por verificação da nossa equipe.",
              },
              {
                emoji: "📱",
                title: "App Mobile",
                desc: "Disponível para iOS e Android com recursos exclusivos.",
              },
              {
                emoji: "🤝",
                title: "Comunidade",
                desc: "Conecte-se com outros praticantes e aprenda sobre as tradições.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Cadastre seu Terreiro
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            Tem um terreiro e quer aparecer no AxéApp? Baixe o aplicativo e
            cadastre seu terreiro gratuitamente. Nossa equipe verificará as
            informações e seu terreiro estará visível para toda a comunidade.
          </p>
          <Link href="/#download" className="btn-primary inline-flex">
            Baixar o app e cadastrar
          </Link>
        </div>
      </div>
    </div>
  );
}
