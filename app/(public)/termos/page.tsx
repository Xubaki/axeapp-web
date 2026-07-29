import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — AxéApp",
  description: "Termos de Uso do aplicativo AxéApp — Guia Espiritual de Umbanda e Candomblé.",
};

const SECOES = [
  { titulo: "Apresentação", conteudo: `O aplicativo Axé — Guia Espiritual de Umbanda e Candomblé é uma plataforma digital independente dedicada à preservação, ao estudo e à vivência das tradições espirituais afro-brasileiras, incluindo Umbanda, Candomblé e demais Matrizes Africanas. O App é desenvolvido e mantido de forma independente, sem vínculo institucional com qualquer terreiro, federação, denominação religiosa ou organização oficial.\n\nO Axé oferece funcionalidades gratuitas e, opcionalmente, funcionalidades adicionais mediante pagamento (Cláusula 8).\n\nEstes Termos são regidos pela legislação brasileira, em especial pela LGPD (Lei nº 13.709/2018), pelo Marco Civil da Internet (Lei nº 12.965/2014), pelo CDC (Lei nº 8.078/1990) e pelo ECA (Lei nº 8.069/1990).',` },
  { titulo: "Cláusula 1 — Definições", conteudo: `App / Serviço: O aplicativo Axé e todos os seus recursos, conteúdos e funcionalidades.\nUsuário: Toda pessoa natural que instala, acessa ou utiliza o App.\nConta: Perfil de acesso criado voluntariamente pelo Usuário.\nIA / Orixá Digital: Funcionalidade de consulta espiritual mediada por inteligência artificial generativa.\nDados Sensíveis: Dados sobre crença religiosa, origem étnica ou racial, conforme art. 5º, II da LGPD.\nDesenvolvedor: O responsável pelo desenvolvimento e manutenção do App.",` },
  { titulo: "Cláusula 2 — Acesso e Elegibilidade", conteudo: `O Axé é destinado a pessoas com 14 (quatorze) anos de idade ou mais. Usuários entre 14 e 17 anos são considerados adolescentes nos termos do ECA.\n\nO Axé adota o modelo freemium: o acesso básico é gratuito e inclui o catálogo de Orixás e entidades, ervas sagradas, calendário litúrgico, glossário, diário espiritual e mini-jogo. Recursos premium — como a Consulta ao Orixá com IA, o Curso Raízes do Axé e os Trabalhos Virtuais — estão disponíveis mediante assinatura, cujos preços e condições são informados de forma clara antes de qualquer transação, em conformidade com o art. 39, IV do CDC.\n\nO botão \\"Apoiar o Axé ☕\\" representa uma contribuição voluntária do Usuário, distinta das funcionalidades pagas.",` },
  { titulo: "Cláusula 3 — Natureza do Conteúdo Espiritual", conteudo: `3.1 O Axé é um espaço de preservação cultural e espiritual das tradições afro-brasileiras. Todo o conteúdo tem finalidade educativa, cultural e de apoio à vivência espiritual individual, sem constituir prescrição médica, diagnóstico de saúde, aconselhamento jurídico, financeiro ou psicológico.\n\n3.2 A funcionalidade \\"Consulta ao Orixá\\" utiliza inteligência artificial generativa. As respostas NÃO representam a manifestação real de entidades espirituais. Em situações de crise emocional ou emergência, busque auxílio profissional (CVV: 188 | SAMU: 192).\n\n3.3 O Axé respeita a liberdade de crença e de culto (art. 5º, VI da CF). Conteúdos que atentem contra a dignidade das tradições afro-brasileiras ou de qualquer outra crença são expressamente proibidos.",` },
  { titulo: "Cláusula 4 — Conduta do Usuário", conteudo: `São expressamente vedadas as seguintes condutas:\n\n4.1 Utilizar o App para fins ilegais, fraudulentos ou que causem dano a terceiros;\n\n4.2 Publicar conteúdo com discurso de ódio, intolerância religiosa, racismo ou discriminação (Lei nº 7.716/1989 e Lei nº 9.459/1997);\n\n4.3 Reproduzir, distribuir ou comercializar o conteúdo do App sem autorização;\n\n4.4 Tentar acessar sistemas ou dados de outros usuários sem autorização;\n\n4.5 Usar o App para disseminar desinformação religiosa ou explorar a fé de terceiros;\n\n4.6 Usar a IA para gerar conteúdo ofensivo ou discriminatório.\n\nPara reportar violações desta cláusula, utilize o canal oficial de denúncias: denuncia@appaxe.com.br",` },
  { titulo: "Cláusula 5 — Propriedade Intelectual", conteudo: `5.1 Todo o conteúdo original do Axé é de titularidade do Desenvolvedor, protegido pela Lei de Direitos Autorais (Lei nº 9.610/1998).\n\n5.2 O Axé reconhece que parte do conhecimento das tradições afro-brasileiras pertence ao patrimônio cultural imaterial do povo brasileiro (art. 216 da CF e Convenção UNESCO 2003).\n\n5.3 O Usuário mantém a titularidade sobre o conteúdo que produz no App (como entradas do Diário Espiritual).",` },
  { titulo: "Cláusula 6 — Proteção de Dados (LGPD)", conteudo: `O Axé coleta apenas os dados estritamente necessários:\n\n• Perfil voluntário: Nome, Orixá regente, gênero (opcional) — base: consentimento (art. 7º, I)\n• Conta (opcional): E-mail, senha (hash) — base: consentimento (art. 7º, I)\n• Uso do App: Preferências, histórico local — base: legítimo interesse (art. 7º, IX)\n• Técnicos: Logs de erro, versão do SO — base: legítimo interesse (art. 7º, IX)\n\nCrencia religiosa e origem étnica são dados sensíveis (art. 5º, II da LGPD) e não são compartilhados com terceiros para fins comerciais.\n\nSeus direitos (arts. 17 a 22 da LGPD): acesso, correção, eliminação, portabilidade, revogação do consentimento e oposição ao tratamento.",` },
  { titulo: "Cláusula 7 — Uso de Inteligência Artificial", conteudo: `As consultas ao Orixá podem ser processadas por modelos de linguagem de terceiros, sujeitos às suas políticas de privacidade. O Desenvolvedor não utiliza o conteúdo das consultas para treinamento de IA sem consentimento explícito. As respostas são de natureza probabilística e não garantem precisão.",` },
  { titulo: "Cláusula 8 — Modelo Comercial, Doações e Funcionalidades Pagas", conteudo: `8.1 Funcionalidades Gratuitas (acesso básico): Catálogo de Orixás e entidades, ervas sagradas, calendário litúrgico, glossário, diário espiritual e mini-jogo Adinkra Match são gratuitos. Usuários gratuitos podem ver anúncios discretos (banner e vídeo opcional para ganhar consultas extras). Os anúncios são exibidos com parcimônia e nunca interrompem a experiência espiritual.\n\n8.2 Funcionalidades Premium (Axé Premium): Consulta ao Orixá com IA, Curso Raízes do Axé e Trabalhos Virtuais estão disponíveis mediante assinatura mensal ou anual. Assinantes Premium não vêem nenhum tipo de anúncio. O preço e condições são informados previamente (art. 39, IV do CDC). O Usuário tem direito de arrependimento de 7 dias (art. 49 do CDC). Cobranças via Google Play Billing ou Apple In-App Purchase.\n\n8.3 Doações Voluntárias: O botão \\"Apoiar o Axé ☕\\" é uma contribuição voluntária via Buy Me a Coffee (buymeacoffee.com/axeapp), distinta das funcionalidades pagas.",` },
  { titulo: "Cláusula 9 — Limitação de Responsabilidade", conteudo: `O Axé é fornecido \\"no estado em que se encontra\\" (as is). O Desenvolvedor não garante disponibilidade ininterrupta e não se responsabiliza por danos decorrentes do uso das respostas de IA, links externos ou falhas de infraestrutura de terceiros.",` },
  { titulo: "Cláusula 9-A — Isenção de Responsabilidade Religiosa e Profissional", conteudo: `Os serviços prestados pelo Axé App têm caráter estritamente informativo, educacional e de entretenimento.\n\nOs desenvolvedores e mantenedores do aplicativo não se responsabilizam por:\n\n• Decisões pessoais, rituais realizados ou interpretações feitas pelos usuários com base nas informações contidas na plataforma;\n\n• Orientações de natureza psicológica, médica, jurídica ou financeira — o aplicativo não oferece tais serviços;\n\n• Variações doutrinárias entre diferentes tradições (Umbanda, Candomblé, Tambor de Mina, Quimbanda, etc.), dado que cada terreiro possui sua própria corrente e fundamentos;\n\n• Decisões de iniciação, obrigações rituais ou práticas espirituais realizadas com base no conteúdo do app.\n\nO uso do aplicativo é de inteira responsabilidade do usuário, que deve exercer seu discernimento crítico e seguir as orientações de sua liderança religiosa competente.",` },
  { titulo: "Cláusula 10 — Canal de Denúncias", conteudo: `O Axé disponibiliza um canal exclusivo para denúncias de conteúdo inadequado, violações dos presentes Termos, uso indevido da plataforma ou qualquer comportamento que contrarie os valores espirituais e a legislação brasileira.\n\nCanal oficial de denúncias:\nE-mail: denuncia@appaxe.com.br\n\nTodas as denúncias são tratadas com sigilo e analisadas em até 7 dias úteis. O Axé se reserva o direito de remover conteúdo e suspender ou encerrar contas que violem estas diretrizes.",` },
  { titulo: "Cláusula 11 — Contato e DPO", conteudo: `Encarregado de Proteção de Dados (DPO): Erik Ferris\nE-mail: erik@appaxe.com.br\nPrazo de resposta: até 15 dias úteis (art. 18, § 3º da LGPD)",` },
  { titulo: "Cláusula 12 — Menores de Idade", conteudo: `O App não é destinado a crianças com menos de 14 anos. Usuários gratuitos podem ver anúncios discretos de terceiros (Google AdMob); assinantes Premium não vêem publicidade. Caso dados de crianças sejam identificados, serão imediatamente excluídos.",` },
  { titulo: "Cláusula 13 — Alterações nos Termos", conteudo: `O Desenvolvedor poderá atualizar estes Termos a qualquer tempo. Alterações relevantes serão comunicadas com antecedência mínima de 15 dias. O uso continuado do App implica aceitação dos novos Termos.",` },
  { titulo: "Cláusula 14 — Disposições Gerais", conteudo: `Estes Termos constituem o acordo integral entre o Usuário e o Desenvolvedor. Caso qualquer disposição seja considerada inválida, as demais permanecem em vigor.",` },
  { titulo: "Cláusula 15 — Foro e Lei Aplicável", conteudo: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca do Rio de Janeiro — RJ para dirimir quaisquer controvérsias, ressalvada a competência de juizado especial cível (Lei nº 9.099/1995) em favor do Usuário consumidor.",` }
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2C1810] via-[#5C3010] to-[#8B4513] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3">Termos de Uso</h1>
          <p className="text-white/70 text-sm">Última atualização: Junho de 2025</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="space-y-10">
          {SECOES.map((secao, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8D5B0] shadow-sm">
              <h2 className="text-lg font-bold text-[#2C1810] mb-4 font-serif">{secao.titulo}</h2>
              <div className="text-[#4A3520] text-sm leading-relaxed space-y-3">
                {secao.conteudo.split("\n\n").map((para, j) => (
                  <p key={j} className="whitespace-pre-line">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[#C17F24] hover:text-[#A66B1A] font-medium transition-colors text-sm">
            ← Voltar para o início
          </Link>
        </div>
      </section>
    </main>
  );
}
