import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ajuda e exclusão de dados | AxéApp",
  description: "Perguntas frequentes do AxéApp, canais de contato e como excluir a conta e os dados pessoais.",
};

const FAQ = [
  {
    pergunta: "O que é o AxéApp?",
    resposta:
      "O AxéApp é um aplicativo independente de preservação e vivência das tradições afro-brasileiras. Reúne conteúdos sobre Orixás, entidades, ervas, calendário, diário e consultas com inteligência artificial, sempre sem vínculo com uma federação ou um terreiro específico.",
  },
  {
    pergunta: "A consulta ao Orixá é uma consulta espiritual real?",
    resposta:
      "Não. A funcionalidade é uma inteligência artificial inspirada nas tradições e tem finalidade educativa e reflexiva. Para orientação espiritual de terreiro, procure uma sacerdotisa ou um sacerdote de sua confiança.",
  },
  {
    pergunta: "Quais dados o AxéApp coleta?",
    resposta:
      "Coletamos apenas o necessário para o funcionamento do serviço: informações de perfil espiritual que você escolher informar, conta opcional por e-mail e registros técnicos. Crença religiosa é dado sensível, não é vendida e não é usada para publicidade.",
  },
  {
    pergunta: "Preciso criar uma conta para usar o app?",
    resposta:
      "Não. A conta é opcional. Ela permite sincronizar alguns dados e preferências entre dispositivos.",
  },
  {
    pergunta: "Como apoio o projeto?",
    resposta:
      "O AxéApp é um projeto independente. No aplicativo, acesse Perfil e escolha Apoiar o Axé. Para outras formas de contato, escreva para erik@appaxe.com.br.",
  },
];

export default function AjudaPage() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C1810]">
      <section className="bg-gradient-to-br from-[#1F120B] via-[#4F2B13] to-[#8B5A22] text-[#F5EDD8]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#E8C06A]">CENTRAL DE AJUDA</p>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Estamos aqui para o seu caminho.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#F5EDD8]/80">
            Encontre respostas sobre o AxéApp, seus dados pessoais e os canais de contato do projeto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E8D5B0] bg-white p-6 shadow-sm sm:p-8" id="exclusao">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-[#C17F24]">LGPD</p>
          <h2 className="font-serif text-xl font-bold text-[#2C1810]">Excluir conta e dados</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#4A3520]">
            <p>
              Você pode apagar sua conta e os dados associados diretamente no aplicativo: abra <strong>Mais</strong> (ou
              Perfil), role até o fim e selecione <strong>Excluir minha conta</strong>.
            </p>
            <p>
              A exclusão é permanente. Os dados são removidos em até 30 dias, nos termos da LGPD.
            </p>
            <p>
              Se preferir solicitar por e-mail, escreva para <a className="font-medium text-[#A66B1A] underline" href="mailto:erik@appaxe.com.br">erik@appaxe.com.br</a>{" "}
              ou <a className="font-medium text-[#A66B1A] underline" href="mailto:midia@appaxe.com.br">midia@appaxe.com.br</a>. O prazo de resposta é de até 15 dias úteis.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#E8D5B0] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-xl font-bold text-[#2C1810]">Perguntas frequentes</h2>
          <div className="mt-4 divide-y divide-[#E8D5B0]">
            {FAQ.map((item) => (
              <details key={item.pergunta} className="group py-4 first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#2C1810]">
                  {item.pergunta}
                  <span className="text-xl text-[#C17F24] transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 pr-8 text-sm leading-relaxed text-[#4A3520]">{item.resposta}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#2C1810] p-6 text-[#F5EDD8] sm:p-8">
          <h2 className="font-serif text-xl font-bold">Precisa de outro tipo de ajuda?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#F5EDD8]/80">
            Conheça também a nossa <Link href="/privacidade" className="text-[#E8C06A] underline">Política de Privacidade</Link> e os <Link href="/termos" className="text-[#E8C06A] underline">Termos de Uso</Link>.
          </p>
          <Link href="/" className="mt-5 inline-flex rounded-full bg-[#C9973A] px-5 py-2.5 text-sm font-semibold text-[#2C1810] transition-colors hover:bg-[#E8C06A]">
            Voltar ao início
          </Link>
        </div>
      </section>
    </main>
  );
}
