import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terreiros Parceiros — AxéApp",
  description: "Em breve: terreiros de Umbanda e Candomblé parceiros do AxéApp. Cadastre seu terreiro e apareça no mapa espiritual.",
};

export default function ParceirosPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2C1810] via-[#5C3010] to-[#8B4513] text-white">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C17F24]/20 border border-[#C17F24]/40 rounded-full px-4 py-1.5 text-sm text-[#F5C97A] font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C17F24] animate-pulse" />
            Em breve
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-6 leading-tight">
            Terreiros Parceiros
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-4">
            Estamos construindo uma rede sagrada de terreiros de Umbanda e Candomblé
            para conectar a comunidade do Axé com casas de fé autênticas e acolhedoras.
          </p>
          <p className="text-base text-[#F5C97A]/90 font-medium">
            🌿 Axé! Em breve você poderá encontrar e se conectar com terreiros parceiros pelo Brasil.
          </p>
        </div>
      </section>

      {/* Cards de benefícios */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2C1810] text-center font-serif mb-4">
          O que estamos preparando
        </h2>
        <p className="text-center text-[#6B4C2A] mb-12 max-w-xl mx-auto">
          Cada detalhe está sendo cuidado com respeito às tradições e às pessoas que as guardam.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              emoji: "🗺️",
              titulo: "Mapa Espiritual",
              desc: "Terreiros cadastrados aparecerão no mapa interativo do AxéApp, facilitando a busca por casas próximas a você.",
            },
            {
              emoji: "✅",
              titulo: "Verificação Cuidadosa",
              desc: "Cada terreiro parceiro passará por um processo de verificação para garantir autenticidade e respeito às tradições.",
            },
            {
              emoji: "📅",
              titulo: "Agenda de Giras",
              desc: "Divulgue suas giras, festas de Orixás e eventos abertos para a comunidade diretamente no app.",
            },
            {
              emoji: "🌟",
              titulo: "Selo Parceiro",
              desc: "Terreiros parceiros recebem um selo de destaque no diretório, aumentando a visibilidade para novos visitantes.",
            },
            {
              emoji: "🤝",
              titulo: "Comunidade Conectada",
              desc: "Faça parte de uma rede de terreiros comprometidos com o acolhimento, a educação e a preservação do Axé.",
            },
            {
              emoji: "📱",
              titulo: "Presença Digital",
              desc: "Tenha uma página própria no AxéApp com informações, fotos, contato e localização do seu terreiro.",
            },
          ].map((item) => (
            <div
              key={item.titulo}
              className="bg-white rounded-2xl p-6 border border-[#E8D5B0] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-[#C17F24]/10 flex items-center justify-center text-2xl mb-4">
                {item.emoji}
              </div>
              <h3 className="font-semibold text-[#2C1810] text-lg mb-2">{item.titulo}</h3>
              <p className="text-[#6B4C2A] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — cadastro antecipado */}
      <section className="bg-gradient-to-r from-[#2C1810] to-[#5C3010] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-4xl mb-4">🕯️</div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4">
            Quer cadastrar seu terreiro?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
            Estamos selecionando os primeiros terreiros parceiros. Entre em contato conosco
            e faça parte dessa rede sagrada desde o início.
          </p>
          <a
            href="mailto:contato@appaxe.com.br?subject=Quero%20ser%20Terreiro%20Parceiro%20AxéApp"
            className="inline-flex items-center gap-2 bg-[#C17F24] hover:bg-[#A66B1A] text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-base"
          >
            ✉️ Entrar em contato
          </a>
          <p className="text-white/50 text-sm mt-4">
            Responderemos em até 5 dias úteis.
          </p>
        </div>
      </section>

      {/* Voltar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <Link
          href="/"
          className="text-[#C17F24] hover:text-[#A66B1A] font-medium transition-colors text-sm"
        >
          ← Voltar para o início
        </Link>
      </div>
    </main>
  );
}
