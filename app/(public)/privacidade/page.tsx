import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — AxéApp",
  description: "Política de Privacidade do AxéApp — como coletamos, usamos e protegemos seus dados.",
};

const SECOES = [
  { titulo: "Apresentação", conteudo: `O aplicativo Axé — Guia Espiritual de Umbanda e Candomblé respeita a sua privacidade e está comprometido com a proteção dos seus dados pessoais.\n\nEsta Política descreve como coletamos, usamos, armazenamos, compartilhamos e protegemos suas informações, em conformidade com a LGPD (Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº 12.965/2014), as políticas do Google Play e as diretrizes da App Store (seção 5.1).",` },
  { titulo: "1. Responsável pelo Tratamento", conteudo: `Responsável: Erik Ferris\nEncarregado de Dados (DPO): Erik Ferris\nE-mail: erik@appaxe.com.br\nPrazo de resposta: até 15 dias úteis",` },
  { titulo: "2. Dados que Coletamos", conteudo: `O Axé adota o princípio da minimização de dados — coletamos apenas o estritamente necessário:\n\n• Perfil voluntário (nome espiritual, Orixá regente, tradição, gênero) — base: consentimento\n• Conta opcional (e-mail, senha em hash) — base: consentimento\n• Preferências locais (configurações, histórico de consultas) — base: legítimo interesse\n• Dados técnicos (versão do SO, logs de erro anônimos) — base: legítimo interesse\n• Registro de aceite dos Termos (data/hora) — base: obrigação legal\n\nO Axé NÃO coleta: localização GPS, contatos, câmera, microfone, dados biométricos, dados financeiros, identificadores de publicidade (IDFA/GAID) nem dados de navegação em outros apps.",` },
  { titulo: "3. Dados Sensíveis (Crença Religiosa)", conteudo: `Crença religiosa e origem étnica são dados pessoais sensíveis (art. 5º, II da LGPD). O Axé trata esses dados:\n\n• Somente com base no seu consentimento específico e destacado (art. 11, I da LGPD)\n• Exclusivamente para personalizar sua experiência espiritual no App\n• Sem compartilhamento com terceiros para fins comerciais ou publicitários\n• Você pode alterar ou excluir essas informações a qualquer momento nas configurações",` },
  { titulo: "4. Como Usamos seus Dados", conteudo: `Funcionamento do App: Exibir conteúdos personalizados, salvar preferências e manter o histórico local do Diário Espiritual.\n\nConsulta ao Orixá (IA): O texto das suas consultas é enviado a um serviço de IA de terceiro para gerar a resposta. Esse conteúdo não é armazenado permanentemente em nossos servidores nem usado para treinar modelos de IA sem seu consentimento.\n\nAutenticação: Quando você cria uma conta, seu e-mail e senha (em hash) são usados para autenticação e sincronização entre dispositivos.\n\nDiagnóstico: Logs de erro anônimos são usados para identificar e corrigir falhas técnicas.",` },
  { titulo: "5. Compartilhamento de Dados", conteudo: `O Axé NÃO vende, aluga ou comercializa seus dados. O compartilhamento ocorre apenas em situações limitadas:\n\n• Provedor de IA: texto das consultas ao Orixá (para gerar respostas)\n• Infraestrutura de nuvem: dados de conta para hospedagem (com criptografia TLS)\n• Buy Me a Coffee: nenhum dado do App é compartilhado\n• Google Play / Apple: dados de compra em funcionalidades pagas futuras\n• Autoridades legais: somente quando exigido por ordem judicial\n\nNenhum dado é compartilhado para fins publicitários.",` },
  { titulo: "6. Armazenamento e Segurança", conteudo: `Armazenamento local: A maior parte dos dados fica no seu dispositivo (AsyncStorage). Esses dados não saem do dispositivo a menos que você crie uma conta.\n\nArmazenamento em nuvem (conta opcional): Criptografia em trânsito via TLS 1.2+, senhas armazenadas como hash bcrypt, acesso restrito por autenticação e firewall.\n\nRetenção:\n• Dados de conta ativa: enquanto a conta existir\n• Após exclusão de conta: excluídos em até 30 dias\n• Logs de erro anônimos: até 90 dias\n• Registro de aceite dos Termos: 5 anos (obrigação legal)",` },
  { titulo: "7. Seus Direitos (LGPD — arts. 17 a 22)", conteudo: `Você tem os seguintes direitos sobre seus dados:\n\n• Confirmação da existência de tratamento\n• Acesso aos dados tratados\n• Correção de dados incorretos\n• Anonimização, bloqueio ou eliminação\n• Portabilidade dos dados (formato JSON)\n• Eliminação dos dados tratados com base em consentimento\n• Revogação do consentimento a qualquer tempo\n• Oposição ao tratamento\n\nPara exercer qualquer direito, entre em contato: erik@appaxe.com.br\n\nSe não obtiver resposta satisfatória, contate a ANPD: gov.br/anpd",` },
  { titulo: "8. Proteção de Crianças e Adolescentes", conteudo: `O Axé não é destinado a crianças com menos de 14 anos. O App não coleta intencionalmente dados de menores de 14 anos. Caso identificados, esses dados serão imediatamente excluídos. O App não exibe publicidade de qualquer natureza.",` },
  { titulo: "9. Cookies e Rastreamento", conteudo: `O Axé NÃO utiliza cookies de rastreamento, pixels de rastreamento, SDKs de publicidade nem ferramentas de análise comportamental de terceiros (como Google Analytics, Facebook Pixel, Firebase Analytics ou similares).\n\nA versão web pode utilizar cookies de sessão estritamente necessários para autenticação, sem fins de rastreamento.",` },
  { titulo: "10. Transferência Internacional de Dados", conteudo: `O serviço de IA utilizado na Consulta ao Orixá pode processar dados em servidores fora do Brasil. Quando isso ocorrer, o Desenvolvedor garante que o provedor adota salvaguardas adequadas de proteção de dados, conforme art. 33 da LGPD.",` },
  { titulo: "11. Funcionalidades Pagas e Dados Financeiros", conteudo: `O Axé poderá oferecer funcionalidades pagas em versões futuras. Nesse caso, os pagamentos serão processados exclusivamente pelo Google Play Billing (Android) ou Apple In-App Purchase (iOS). O Desenvolvedor NÃO armazena dados de cartão de crédito ou informações financeiras.",` },
  { titulo: "12. Alterações nesta Política", conteudo: `O Desenvolvedor poderá atualizar esta Política a qualquer tempo. Alterações relevantes serão comunicadas por notificação no App e/ou por e-mail, com antecedência mínima de 15 dias. A versão vigente estará sempre disponível em Mais → Política de Privacidade.",` },
  { titulo: "13. Canal de Denúncias", conteudo: `O Axé disponibiliza um canal exclusivo para denúncias de conteúdo inadequado, violações de direitos, uso indevido da plataforma ou qualquer comportamento que contrarie nossos Termos de Uso e valores espirituais.\n\nCanal oficial de denúncias:\nE-mail: denuncia@appaxe.com.br\n\nTodas as denúncias são tratadas com sigilo e serão analisadas em até 7 dias úteis. O Axé se reserva o direito de remover conteúdo e suspender contas que violem as diretrizes da comunidade.",` },
  { titulo: "14. Contato", conteudo: `DPO: Erik Ferris\nE-mail: erik@appaxe.com.br\nPrazo: até 15 dias úteis\n\nAutoridade Nacional de Proteção de Dados (ANPD): gov.br/anpd",` }
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2C1810] via-[#5C3010] to-[#8B4513] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3">Política de Privacidade</h1>
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
