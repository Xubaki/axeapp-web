import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contato — AxéApp",
  description: "Entre em contato com a equipe do AxéApp. Dúvidas, sugestões, parcerias e suporte.",
};

const CANAIS = [
  {
    emoji: "✉️",
    titulo: "Contato Geral",
    desc: "Dúvidas, sugestões e feedbacks sobre o app.",
    email: "contato@appaxe.com.br",
    assunto: "Contato%20AxéApp",
  },
  {
    emoji: "🤝",
    titulo: "Parcerias e Terreiros",
    desc: "Quer cadastrar seu terreiro ou propor uma parceria?",
    email: "contato@appaxe.com.br",
    assunto: "Parceria%20AxéApp",
  },
  {
    emoji: "🔒",
    titulo: "Privacidade e LGPD",
    desc: "Solicitações de dados, exclusão de conta ou questões legais.",
    email: "erik@appaxe.com.br",
    assunto: "Privacidade%20LGPD%20AxéApp",
  },
  {
    emoji: "🚨",
    titulo: "Canal de Denúncias",
    desc: "Conteúdo inadequado ou violações dos Termos de Uso.",
    email: "denuncia@appaxe.com.br",
    assunto: "Denúncia%20AxéApp",
  },
];

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2C1810] via-[#5C3010] to-[#8B4513] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-4xl mb-4">🕯️</div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3">Fale com a gente</h1>
          <p className="text-white/75 max-w-xl mx-auto leading-relaxed">
            Estamos aqui para ouvir. Seja uma dúvida, uma sugestão ou uma parceria —
            responderemos com atenção e cuidado.
          </p>
        </div>
      </section>

      {/* Cards de canais */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CANAIS.map((canal) => (
            <a
              key={canal.titulo}
              href={`mailto:${canal.email}?subject=${canal.assunto}`}
              className="group bg-white rounded-2xl p-6 border border-[#E8D5B0] shadow-sm hover:shadow-md hover:border-[#C17F24]/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#C17F24]/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#C17F24]/20 transition-colors">
                  {canal.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C1810] text-base mb-1">{canal.titulo}</h3>
                  <p className="text-[#6B4C2A] text-sm mb-3 leading-relaxed">{canal.desc}</p>
                  <span className="text-[#C17F24] text-sm font-medium group-hover:underline">
                    {canal.email}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Info adicional */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-[#E8D5B0] text-center">
          <div className="text-3xl mb-3">⏱️</div>
          <h2 className="font-semibold text-[#2C1810] text-lg mb-2">Tempo de resposta</h2>
          <p className="text-[#6B4C2A] text-sm leading-relaxed max-w-md mx-auto">
            Respondemos e-mails em até <strong>5 dias úteis</strong>. Solicitações relacionadas
            à LGPD são atendidas em até <strong>15 dias úteis</strong>, conforme a lei.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="text-[#C17F24] hover:text-[#A66B1A] font-medium transition-colors text-sm"
          >
            ← Voltar para o início
          </Link>
        </div>
      </section>
    </main>
  );
}
