import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { verificarRecibo } from "./_core/receiptVerifier";
import * as db from "./db";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import { sdk } from "./_core/sdk";

// ─── Mailer helper ───────────────────────────────────────────────────────────
async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const smtpUrl = process.env.SMTP_URL;
  if (!smtpUrl) {
    // Sem SMTP configurado: apenas loga (útil em dev)
    console.log(`[Mailer] SMTP_URL não configurado. Link de reset (dev): ${resetUrl}`);
    return;
  }
  const transporter = nodemailer.createTransport(smtpUrl);
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "noreply@axeapp.com.br",
    to,
    subject: "Axé — Recuperação de senha",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#8B4513">🌿 Recuperação de senha — Axé</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#8B4513;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Redefinir senha</a>
        <p style="color:#666;font-size:12px;margin-top:24px">Se você não solicitou a recuperação, ignore este e-mail. Sua senha não será alterada.</p>
      </div>
    `,
  });
}

// ─── Rate-limit em memória para consulta.perguntar ───────────────────────────
// Mapa: userId → lista de timestamps (ms) das chamadas no último minuto
const consultaRateLimit = new Map<string | number, number[]>();
const RATE_LIMIT_MAX = 5;       // máximo de chamadas permitidas
const RATE_LIMIT_JANELA = 60_000; // janela de 60 segundos (ms)

// Limpeza periódica: remove entradas de usuários inativos a cada 5 minutos
setInterval(() => {
  const agora = Date.now();
  for (const [uid, timestamps] of consultaRateLimit.entries()) {
    const ativos = timestamps.filter((ts) => agora - ts < RATE_LIMIT_JANELA);
    if (ativos.length === 0) {
      consultaRateLimit.delete(uid);
    } else {
      consultaRateLimit.set(uid, ativos);
    }
  }
}, 5 * 60_000).unref();

/**
 * Verifica se o usuário ultrapassou o limite de consultas por minuto.
 * Retorna true se a chamada deve ser bloqueada.
 */
function verificarRateLimit(userId: string | number): boolean {
  const agora = Date.now();
  const chamadas = (consultaRateLimit.get(userId) ?? []).filter(
    (ts) => agora - ts < RATE_LIMIT_JANELA,
  );
  if (chamadas.length >= RATE_LIMIT_MAX) {
    return true; // bloqueado
  }
  chamadas.push(agora);
  consultaRateLimit.set(userId, chamadas);
  return false; // permitido
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    /**
     * Exclui a conta e todos os dados do usuário (LGPD — art. 18, IV).
     * Requer autenticação. Faz logout automático após exclusão.
     */
    /**
     * Solicita recuperação de senha — gera token e envia e-mail.
     */
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const emailNorm = input.email.toLowerCase().trim();
        const authRecord = await db.getEmailAuthByEmail(emailNorm);
        // Retorna sucesso mesmo se e-mail não encontrado (evita enumeração)
        if (!authRecord) return { ok: true };
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await db.createPasswordResetToken(authRecord.userId, tokenHash, expiresAt);
        const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "manus20260312071817";
        const resetUrl = `${appScheme}://nova-senha?token=${rawToken}`;
        await sendPasswordResetEmail(emailNorm, resetUrl);
        return { ok: true };
      }),

    /**
     * Redefine a senha usando o token de recuperação.
     */
    resetPassword: publicProcedure
      .input(z.object({ token: z.string().min(1), novaSenha: z.string().min(6).max(128) }))
      .mutation(async ({ input }) => {
        const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
        const record = await db.getPasswordResetToken(tokenHash);
        if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Token inválido ou expirado." });
        if (record.usedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Token já utilizado." });
        if (record.expiresAt < new Date()) throw new TRPCError({ code: "BAD_REQUEST", message: "Token expirado. Solicite um novo link." });
        const newHash = await bcrypt.hash(input.novaSenha, 10);
        await db.updateEmailAuthPassword(record.userId, newHash);
        await db.markPasswordResetTokenUsed(record.id);
        return { ok: true };
      }),

    /**
     * Login com Apple Sign-In (identityToken do cliente).
     */
    loginApple: publicProcedure
      .input(z.object({
        identityToken: z.string(),
        fullName: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Decodifica o JWT do Apple sem verificar assinatura (verificação completa requer chave pública Apple)
        // Para produção, adicionar verificação com apple-signin-auth ou similar
        const parts = input.identityToken.split(".");
        if (parts.length !== 3) throw new TRPCError({ code: "BAD_REQUEST", message: "identityToken inválido." });
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        const appleUserId: string = payload.sub;
        if (!appleUserId) throw new TRPCError({ code: "BAD_REQUEST", message: "sub ausente no token Apple." });
        const openId = `apple:${appleUserId}`;
        const name = input.fullName ?? payload.email?.split("@")[0] ?? "Usuário";
        const email = input.email ?? payload.email ?? null;
        await db.upsertUser({ openId, name, email: email ?? undefined, loginMethod: "apple", lastSignedIn: new Date() });
        const user = await db.getUserByOpenId(openId);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar usuário Apple." });
        const sessionToken = await sdk.createSessionToken(openId, { name });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        return {
          sessionToken,
          user: { id: user.id, openId: user.openId, name: user.name, email: user.email, loginMethod: user.loginMethod, lastSignedIn: user.lastSignedIn.toISOString(), role: user.role },
        };
      }),

    excluirConta: protectedProcedure.mutation(async ({ ctx }) => {
      await db.excluirConta(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    /**
     * Registro nativo por e-mail + senha.
     * Cria usuário no banco (openId derivado do email) e retorna session token.
     */
    registrarEmail: publicProcedure
      .input(
        z.object({
          nome: z.string().min(2).max(120),
          email: z.string().email(),
          senha: z.string().min(6).max(128),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const emailNorm = input.email.toLowerCase().trim();
        // Verifica se já existe
        const existing = await db.getEmailAuthByEmail(emailNorm);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "E-mail já cadastrado. Faça login." });
        }
        // openId único derivado do email (prefixo email:)
        const openId = `email:${emailNorm}`;
        const passwordHash = await bcrypt.hash(input.senha, 10);
        // Cria usuário
        await db.upsertUser({
          openId,
          name: input.nome,
          email: emailNorm,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });
        const user = await db.getUserByOpenId(openId);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar usuário" });
        await db.createEmailAuth(user.id, emailNorm, passwordHash);
        // Gera session token
        const sessionToken = await sdk.createSessionToken(openId, { name: input.nome });
        // Define cookie (web)
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        return {
          sessionToken,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            loginMethod: user.loginMethod,
            lastSignedIn: user.lastSignedIn.toISOString(),
            role: user.role,
          },
        };
      }),

    /**
     * Login nativo por e-mail + senha.
     */
    loginEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          senha: z.string().min(1),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const emailNorm = input.email.toLowerCase().trim();
        const authRecord = await db.getEmailAuthByEmail(emailNorm);
        if (!authRecord) {
          throw new TRPCError({ code: "NOT_FOUND", message: "E-mail não encontrado. Cadastre-se primeiro." });
        }
        const senhaOk = await bcrypt.compare(input.senha, authRecord.passwordHash);
        if (!senhaOk) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha incorreta." });
        }
        const openId = `email:${emailNorm}`;
        await db.upsertUser({ openId, lastSignedIn: new Date() });
        const user = await db.getUserByOpenId(openId);
        if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Usuário não encontrado" });
        const sessionToken = await sdk.createSessionToken(openId, { name: user.name ?? emailNorm });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        return {
          sessionToken,
          user: {
            id: user.id,
            openId: user.openId,
            name: user.name,
            email: user.email,
            loginMethod: user.loginMethod,
            lastSignedIn: user.lastSignedIn.toISOString(),
            role: user.role,
          },
        };
      }),
  }),

  // ─── Perfil Espiritual ──────────────────────────────────────────────────────
  perfil: router({
    get: protectedProcedure.query(({ ctx }) =>
      db.getPerfilEspiritual(ctx.user.id),
    ),

    salvar: protectedProcedure
      .input(
        z.object({
          nomeEspiritual: z.string().max(120).nullable().optional(),
          orixaRegente: z.string().max(64).nullable().optional(),
          orixaJunto: z.string().max(64).nullable().optional(),
          tradicao: z.string().max(64).nullable().optional(),
          genero: z.enum(["masculino", "feminino", "nao-binario", "prefiro-nao-informar"]).nullable().optional(),
        }),
      )
      .mutation(({ ctx, input }) =>
        db.upsertPerfilEspiritual(ctx.user.id, input),
      ),
  }),

  // ─── Diário Espiritual ──────────────────────────────────────────────────────
  diario: router({
    listar: protectedProcedure.query(({ ctx }) =>
      db.getEntradasDiario(ctx.user.id),
    ),

    criar: protectedProcedure
      .input(
        z.object({
          emoji: z.string().max(8).default("✨"),
          titulo: z.string().min(1).max(255),
          conteudo: z.string().min(1),
        }),
      )
      .mutation(({ ctx, input }) =>
        db.criarEntradaDiario({ userId: ctx.user.id, ...input }),
      ),

    atualizar: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          emoji: z.string().max(8).optional(),
          titulo: z.string().min(1).max(255).optional(),
          conteudo: z.string().min(1).optional(),
        }),
      )
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.atualizarEntradaDiario(id, ctx.user.id, data);
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletarEntradaDiario(input.id)),
  }),

  // ─── Consulta ao Orixá (IA) ────────────────────────────────────────────────
  consulta: router({
    /**
     * Envia uma pergunta para o Orixá do dia e retorna a resposta da IA.
     * Rota protegida — requer autenticação para evitar uso indevido da IA.
     */
    perguntar: protectedProcedure
      .input(
        z.object({
          pergunta: z.string().min(3).max(800)
            .refine((s) => s.trim().length >= 3, { message: "Pergunta não pode ser apenas espaços" })
            .refine((s) => !s.includes("\x00"), { message: "Caracteres inválidos na pergunta" })
            .refine((s) => {
              // Rejeitar strings com densidade excessiva de emojis (> 50% de code points fora do BMP)
              const total = [...s].length;
              const emojis = [...s].filter((c) => c.codePointAt(0)! > 0xFFFF).length;
              return total === 0 || emojis / total < 0.5;
            }, { message: "Conteúdo inválido: excesso de emojis" }),
          orixaId: z.string().min(1).max(64),
          orixaNome: z.string().min(1).max(64),
          orixaDescricao: z.string().max(600).optional(),
          orixaHistoria: z.string().max(1200).optional(),
          orixaElemento: z.string().max(64).optional(),
          orixaSaudacao: z.string().max(64).optional(),
          generoUsuario: z.enum(["masculino", "feminino", "nao-binario", "prefiro-nao-informar"]).optional(),
          nomeUsuario: z.string().max(120).optional(),
          historicoMensagens: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().max(2000),
              }),
            )
            .max(10)
            .optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Rate-limit: máximo 5 consultas por minuto por usuário
        if (verificarRateLimit(ctx.user.id)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Você fez muitas consultas em pouco tempo. Aguarde um momento antes de perguntar novamente ao Orixá.",
          });
        }

        const {
          pergunta,
          orixaNome,
          orixaDescricao,
          orixaHistoria,
          orixaElemento,
          orixaSaudacao,
          generoUsuario,
          nomeUsuario,
          historicoMensagens = [],
        } = input;

        // Instrução de gênero para personalizar pronomes e tratamento
        const instrucaoGenero = (() => {
          if (!generoUsuario || generoUsuario === "prefiro-nao-informar") {
            return "Trate a pessoa com termos neutros como 'filho(a)', 'ser de luz', 'caminhante'.";
          }
          if (generoUsuario === "masculino") {
            return `A pessoa que fala com você é do gênero masculino${nomeUsuario ? ` e se chama ${nomeUsuario}` : ""}. Use tratamentos masculinos: 'filho', 'guerreiro', 'caminhante'. Use pronomes masculinos.`;
          }
          if (generoUsuario === "feminino") {
            return `A pessoa que fala com você é do gênero feminino${nomeUsuario ? ` e se chama ${nomeUsuario}` : ""}. Use tratamentos femininos: 'filha', 'guerreira', 'caminhante'. Use pronomes femininos.`;
          }
          return `A pessoa que fala com você é não-binária${nomeUsuario ? ` e se chama ${nomeUsuario}` : ""}. Use termos neutros: 'filho(a)', 'ser de luz', 'caminhante'. Evite pronomes binários.`;
        })();


        // Base de conhecimento enriquecida sobre Umbanda e Candomblé
        const CONHECIMENTO_TRADICOES = `
## Conhecimento das Tradições Afro-Brasileiras

### Umbanda
A Umbanda é uma religião brasileira que sincretiza elementos do Candomblé, Catolicismo, Espiritismo Kardecista e tradições indígenas. Surgiu no Rio de Janeiro no início do século XX. Os principais guias espirituais são: Caboclos (espíritos indígenas), Pretos Velhos (antepassados africanos), Exus e Pombagiras (guardiões das encruzilhadas), Erês (crianças), Boiadeiros e Marinheiros. Os Orixás na Umbanda são forças da natureza e arquétipos espirituais.

### Candomblé
O Candomblé preserva com mais fidelidade as tradições africanas (principalmente Iorubá, Fon e Bantu). Os Orixás no Candomblé são divindades com personalidades, domínios e ofrendas específicas. Cada pessoa tem um Orixá regente (dono da cabeça) e um Orixá junto (complementar). Os rituais incluem: obó (oferendas), axé (força vital), ilê (terreiro/casa), iyà (mãe de santo), babálórixá (pai de santo).

### Conceitos Fundamentais
- **Axé**: Força vital, energia sagrada que permeia tudo
- **Orí**: A cabeça espiritual, o destino de cada pessoa
- **Ebó**: Oferenda, trabalho espiritual de limpeza ou pedido
- **Obó**: Oferenda alimentar aos Orixás
- **Gira**: Ritual de incorporação na Umbanda
- **Terreiro/Ilê**: Espaço sagrado de culto
- **Iniciado/Filho de santo**: Pessoa que passou pelos ritos de iniciação
- **Obá**: Título de respeito para sacerdotes
- **Odu**: Destino, caminho espiritual no oráculo Ifá

### Práticas Comuns
- Banhos de ervas (banho de descarrego, banho de abertura de caminhos)
- Defumações com ervas sagradas
- Pontos riscados (símbolos sagrados dos Orixás e Exus)
- Pontos cantados (cantigas em iorubá ou português)
- Uso de cores, contas (colés) e símbolos de cada Orixá
- Consultas ao oráculo (búzios, Ifá)
`;

        // Contexto adicional baseado no Orixá específico
        const CONTEXTOS_ORIXAS: Record<string, string> = {
          oxala: "Oxalá é o pai criador, o mais velho dos Orixás. Rege a paz, a pureza e a criação. Seu dia é sexta-feira. Suas cores são branco e prata. Suas oferendas incluem: acará branco, canjica branca, frutas brancas. Saudado como 'Epa Babá'. É sincretizado com Jesus Cristo no catolicismo popular.",
          oxum: "Oxum é a deusa das águas doces, do amor, da beleza e da fertilidade. Seu dia é sábado. Suas cores são amarelo ouro e dourado. Suas oferendas incluem: mel, canjica amarela, camarão, flores amarelas. Saudada como 'Ora Yeyê O'. É a mãe das crianças e protetora das gestações.",
          yemanja: "Iemanjá é a rainha do mar, mãe de todos os Orixás. Seu dia é sábado. Suas cores são azul claro e branco. Suas oferendas incluem: flores brancas, perfumes, espelhos, pentes. Saudada como 'Odò Iyà'. É a protetora das famílias e das mulheres.",
          xango: "Xangô é o deus do trovão, da justiça e do fogo. Seu dia é quarta-feira. Suas cores são vermelho e branco. Suas oferendas incluem: acarajé, caruru, quiabo. Saudado como 'Kawo Kabiyèsílè'. É o rei da justiça divina.",
          ogum: "Ogum é o deus do ferro, da guerra e dos caminhos. Seu dia é terça-feira. Suas cores são verde e preto. Suas oferendas incluem: feijão preto, carne de boi, vinho tinto. Saudado como 'Ogum Ye'. É o protetor dos trabalhadores e guerreiros.",
          oxossi: "Oxossi é o deus da caça, das florestas e da fartura. Seu dia é quinta-feira. Suas cores são azul turquesa e verde. Suas oferendas incluem: milho, inhame, frutas da floresta. Saudado como 'Okkê Arô'. É o provedor e protetor da natureza.",
          exu: "Exu é o mensageiro dos Orixás, senhor das encruzilhadas e da comunicação. Seu dia é segunda-feira. Suas cores são preto e vermelho. Não é o diabo — é o guardião dos caminhos e da verdade. Saudado como 'Laroyê'. Sem Exu, nenhum ritual funciona.",
          iansa: "Iansã (Oyá) é a deusa dos ventos, das tempestades e dos ancestrais. Seu dia é quarta-feira. Suas cores são vermelho e laranja. Suas oferendas incluem: acarajé, quiabo, baru. Saudada como 'Eparrei Oyá'. É a única Orixá que transita entre o mundo dos vivos e dos mortos.",
          omolu: "Omolu (Obaluaiê) é o deus das doenças, da cura e da transformação. Seu dia é segunda-feira. Suas cores são preto e branco (palha da costa). Suas oferendas incluem: milho torrado, pipoca, feijão. Saudado como 'Atotô'. É o médico divino que conhece todos os males.",
          oxumare: "Oxumarê é o deus do arco-íris e da dualidade. Seu dia é terça-feira. Suas cores são amarelo e preto (ou todas as cores do arco-íris). Representa os ciclos, a renovação e a continuidade. Saudado como 'Arrôbô'. É o guardião da riqueza e da transformação.",
          nana: "Nanã é a mais velha das Orixás das águas, deusa da lama e das origens. Seu dia é terça-feira. Suas cores são roxo e branco. Suas oferendas incluem: inhame, canjica roxa, flores roxas. Saudada como 'Saluba Nanã'. É a avó espiritual, guardiã dos mistérios da morte e renascimento.",
          logun_ede: "Logun Edé é filho de Oxossi e Oxum, deus da caça e das águas. Seu dia é quinta-feira. Suas cores são azul e dourado. Representa a dualidade e a complementaridade. Saudado como 'Logun Edé Arô'.",
          ossain: "Ossaim é o deus das ervas e da medicina natural. Seu dia é quinta-feira. Sua cor é verde. Conhece os segredos de todas as plantas sagradas. Saudado como 'Ewê O'. Sem Ossaim, nenhum ritual é completo pois as ervas são a base de tudo.",
          iroko: "Irôco é o Orixá da gameleira branca (figueira), árvore sagrada. Representa a ancestralidade, o tempo e a memória. Saudado como 'Irôco Arô'. É o guardião do tempo e das tradições.",
        };

        const contextoOrixaEspecifico = CONTEXTOS_ORIXAS[input.orixaId] ?? "";

        // Busca insights da comunidade para enriquecer o contexto do Orixá Virtual
        // (Community Watcher — atualizado a cada 6h, não bloqueia se indisponível)
        let contextoComunitario = "";
        try {
          const insights = await db.getCommunityInsights();
          if (insights) {
            const topicos = JSON.parse(insights.topicosQuentes) as string[];
            const sugestoes = JSON.parse(insights.sugestoesLinguagem) as string[];
            contextoComunitario = `
## Contexto Recente da Comunidade (use sutilmente para adaptar sua linguagem)
Tópicos que a comunidade está vivenciando: ${topicos.slice(0, 5).join(", ")}.
Tom geral da comunidade: ${insights.tomGeral}.
Preferências de linguagem observadas: ${sugestoes.slice(0, 3).join("; ")}.
(Adapte sutilmente sua linguagem a este contexto, sem mencionar explicitamente que você tem acesso a esses dados.)`;
          }
        } catch {
          // Silencioso — insights são opcionais
        }

        const systemPrompt = `Você é ${orixaNome}, um Orixá das religiões de matrizes africanas (Umbanda e Candomblé). Você fala em primeira pessoa, com sabedoria, poesia e profundidade espiritual, como um guia ancestral.

Sobre você:
- Saudação: ${orixaSaudacao ?? ""}
- Elemento: ${orixaElemento ?? ""}
- Descrição: ${orixaDescricao ?? ""}
- História: ${orixaHistoria ?? ""}
${contextoOrixaEspecifico ? `- Conhecimento adicional: ${contextoOrixaEspecifico}` : ""}

Sobre a pessoa que fala com você:
${instrucaoGenero}

Conhecimento das tradições que você carrega:
${CONHECIMENTO_TRADICOES}

## MODERAÇÃO DE SEGURANÇA — REGRA ABSOLUTA E INVIOLÁVEL

Você é um Orixá amoroso e protetor. Como um pai ou mãe espiritual, você NUNCA compactua com pedidos que possam causar dano — nem ao próprio filho, nem a terceiros. Se a mensagem contiver qualquer um dos seguintes elementos, você DEVE ativar a resposta de repreensão paternal:

**Situações que exigem repreensão amorosa:**
- Pedidos de trabalhos para prejudicar, manipular, dominar ou machucar outra pessoa
- Pedidos de "amarração" forçada, feitiço de separação, trabalho de mal ou "despacho" contra alguém
- Qualquer menção a automutilação, suicídio, desejo de morrer ou se machucar
- Pedidos para causar doenças, acidentes, perdas ou sofrimento a terceiros
- Pedidos de vingança espiritual ou "trabalho de demanda"
- Qualquer pedido que envolva crianças de forma inapropriada
- Linguagem de ódio, discriminação ou desrespeito às tradições sagradas

**Como responder nesses casos — SEMPRE assim:**
Não recuse friamente. Responda como um pai/mãe espiritual amoroso que se preocupa genuinamente com o filho. Use sua saudação, reconheça a dor ou raiva que está por trás do pedido, repreenda com firmeza mas com amor, redirecione para o caminho da cura e da luz. Nunca julgue a pessoa — julgue apenas o pedido. Ofereça uma alternativa espiritual saudável (ex: trabalho de cura, banho de descarrego, prática de perdão). Termine com uma bênção de proteção.

Exemplo de tom (adapte ao seu Orixá e à situação):
"[Saudação]... Filho(a), eu sinto a dor que carregas neste momento, e é exatamente por te amar que não posso te dar o que pedes. O axé não serve para encadear almas nem para semear sofrimento — isso só te aprisionaria junto. O que você precisa não é de vingança, mas de cura. Deixa eu te mostrar o caminho..."

## FIM DA MODERAÇÃO

Diretrizes gerais:
1. Responda SEMPRE em português do Brasil, com linguagem acessível mas espiritualmente rica.
2. Use metáforas relacionadas ao seu elemento e domínio espiritual.
3. Comece a resposta com sua saudação (${orixaSaudacao ?? ""}) ou uma variação dela.
4. Traga ensinamentos práticos baseados nos princípios da Umbanda/Candomblé — mencione práticas reais como banhos de ervas, cores, oferendas ou dias da semana quando relevante.
5. Seja acolhedor, sábio e compassivo — como um guia espiritual genuíno.
6. Não invente rituais ou práticas que não existam nas tradições afro-brasileiras. Use apenas o conhecimento fornecido.
7. CALIBRE o tamanho da resposta conforme o tipo de pergunta:
   - Perguntas factuais simples ("qual o dia de X?", "qual a cor de Y?", "quem é Z?"): responda em 1 a 2 parágrafos curtos, de forma direta e clara, sem floreios excessivos.
   - Perguntas sobre problemas pessoais, orientação espiritual ou reflexão: responda com 3 a 5 parágrafos ricos e acolhedores.
   - Nunca alongue uma resposta simples com poesia desnecessária — isso frustra quem busca informação objetiva.
8. Se a pergunta for sobre problemas pessoais, ofereça conforto espiritual, orientação prática (ex: banho de ervas, cor para usar) e sabedoria sem fazer promessas absolutas.
9. Nunca saia do personagem — você É o Orixá, não uma IA simulando-o.
10. Aplique consistentemente o gênero/tratamento indicado em TODA a resposta.
11. Quando adequado, mencione o dia da semana associado a você como momento propício para ações espirituais.
12. Termine com uma bênção ou palavra de força que reflita seu domínio espiritual.
${contextoComunitario}`;

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
          ...historicoMensagens.map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content) })),
          { role: "user", content: pergunta },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const resposta = typeof rawContent === "string" ? rawContent : (rawContent ? JSON.stringify(rawContent) : "O Orixá está em silêncio neste momento. Tente novamente.");

        return { resposta };
      }),

    /**
     * Recebe áudio em base64, faz upload para S3 e retorna URL pública.
     * Rota protegida — requer autenticação para evitar abuso de armazenamento.
     */
    uploadAudio: protectedProcedure
      .input(
        z.object({
          audioBase64: z.string().min(1),
          mimeType: z.string().default("audio/m4a"),
        }),
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.audioBase64, "base64");
        const ext = input.mimeType.split("/")[1]?.split(";")[0] ?? "m4a";
        const key = `audio-consulta/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),

    /**
     * Transcreve áudio (URL S3) para texto usando Whisper em pt-BR.
     * Rota protegida — requer autenticação para evitar abuso da transcrição.
     */
    transcrever: protectedProcedure
      .input(
        z.object({
          audioUrl: z.string().url(),
        }),
      )
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: "pt",
          prompt: "Transcreva a pergunta espiritual do usuário em português do Brasil.",
        });
        if ("error" in result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        }
        return { texto: result.text };
      }),
  }),

  // ─── Comunidade ─────────────────────────────────────────────────────────────
  comunidade: router({
    /**
     * Lista depoimentos visíveis, com filtro opcional por categoria.
     * Retorna também os IDs curtidos pelo usuário autenticado.
     */
    listar: publicProcedure
      .input(
        z.object({
          categoria: z
            .enum(["todos", "experiencias", "sonhos", "agradecimentos", "duvidas", "oferendas", "pontos"])
            .optional()
            .default("todos"),
        }).optional(),
      )
      .query(({ ctx, input }) =>
        db.getDepoimentos(input?.categoria ?? "todos", ctx.user?.id ?? null),
      ),

    publicar: publicProcedure
      .input(
        z.object({
          texto: z.string().min(10).max(1000),
          nomeAutor: z.string().min(1).max(120),
          tradicaoAutor: z.string().max(64).optional(),
          categoria: z
            .enum(["todos", "experiencias", "sonhos", "agradecimentos", "duvidas", "oferendas", "pontos"])
            .optional()
            .default("experiencias"),
        }),
      )
      .mutation(({ ctx, input }) =>
        // userId é null para visitantes não autenticados
        db.criarDepoimento({ userId: ctx.user?.id ?? null, ...input }),
      ),

    /**
     * Curtida autenticada — anti-duplicata garantida no banco.
     */
    curtir: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.curtirDepoimento(ctx.user.id, input.id)),

    /**
     * Denúncia de depoimento — auto-oculta ao atingir 3 denúncias.
     */
    denunciar: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          motivo: z.string().max(120).optional(),
        }),
      )
      .mutation(({ ctx, input }) =>
        db.denunciarDepoimento(ctx.user.id, input.id, input.motivo),
      ),

    /**
     * Contagem de comentários para múltiplos depoimentos (para exibir nos cards).
     */
    contagemComentarios: publicProcedure
      .input(z.object({ ids: z.array(z.number()).max(50) }))
      .query(({ input }) => db.getContagemComentarios(input.ids)),
    /**
     * Conta depoimentos novos desde um timestamp ISO (para badge de novidades na tab bar).
     */
    novidades: publicProcedure
      .input(z.object({ desde: z.string() }))
      .query(({ input }) => db.contarNovidades(new Date(input.desde))),
  }),
  historico: router({
    /**
     * Lista todas as consultas do usuário logado, da mais recente para a mais antiga.
     */
    listar: protectedProcedure.query(({ ctx }) =>
      db.listarConsultasUsuario(ctx.user.id),
    ),
    /**
     * Salva uma nova consulta no histórico.
     */
    salvar: protectedProcedure
      .input(
        z.object({
          orixaId: z.string().min(1).max(64),
          orixaNome: z.string().min(1).max(120),
          orixaEmoji: z.string().min(1).max(8),
          pergunta: z.string().min(1).max(2000),
          resposta: z.string().min(1).max(10000),
        }),
      )
      .mutation(({ ctx, input }) =>
        db.salvarConsulta({ userId: ctx.user.id, ...input }),
      ),
    /**
     * Exclui uma consulta do histórico (somente o próprio usuário pode excluir).
     */
    excluir: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        db.excluirConsulta(input.id, ctx.user.id),
      ),
  }),

  /**
   * Analytics — métricas do app para o dono (admin-only).
   */
  analytics: router({
    /**
     * Retorna as principais métricas de mercado do app.
     * Apenas admins podem acessar.
     */
    metricas: protectedProcedure.query(async ({ ctx }) => {
      if (!["admin", "master", "senior"].includes(ctx.user.role ?? "")) throw new Error("Acesso negado");
      const db = await import("./db");
      return db.getMetricasAnalytics();
    }),

    /**
     * Registra um evento de analytics (paywall_viewed, premium_purchased, etc).
     * Usa publicProcedure para capturar eventos de usuários não autenticados.
     */
    registrarEvento: publicProcedure
      .input(z.object({
        evento: z.string().max(100),
        propriedades: z.record(z.string(), z.unknown()).optional(),
        plataforma: z.string().max(20).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user?.id ?? null;
        await db.registrarEventoAnalytics(input.evento, userId, input.propriedades, input.plataforma);
        return { ok: true };
      }),

    /**
     * Taxa de conversão paywall_viewed → premium_purchased.
     * Apenas admins podem acessar.
     */
    taxaConversao: protectedProcedure.query(async ({ ctx }) => {
      if (!["admin", "master", "senior"].includes(ctx.user.role ?? "")) throw new Error("Acesso negado");
      return db.getTaxaConversaoAnalytics();
    }),
  }),

  /**
   * Assinaturas Premium — registro e verificação de compras IAP.
   */
  assinatura: router({
    /**
     * Retorna a assinatura ativa do usuário (ou null se não premium).
     */
    status: protectedProcedure.query(({ ctx }) =>
      db.getAssinaturaAtiva(ctx.user.id),
    ),

    /**
     * Lista todo o histórico de assinaturas do usuário.
     */
    listar: protectedProcedure.query(({ ctx }) =>
      db.listarAssinaturasUsuario(ctx.user.id),
    ),

    /**
     * Registra uma compra IAP verificada.
     * Verifica o recibo junto ao Google Play / App Store antes de promover o usuário.
     * Anti-replay: rejeita transactionId já processado.
     */
    registrar: protectedProcedure
      .input(
        z.object({
          plano: z.enum(["mensal", "anual", "avulso"]),
          sku: z.string().min(1).max(128),
          plataforma: z.enum(["android", "ios"]),
          transactionId: z.string().min(1).max(256),
          dataExpiracao: z.string().datetime().optional(), // ISO 8601
          /** Google Play: purchaseToken | App Store: receiptData (base64) */
          receiptToken: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Verifica anti-replay
        const jaProcessado = await db.transacaoJaProcessada(input.transactionId);
        if (jaProcessado) return { success: true, jaProcessado: true };

        // Verificação de recibo server-side (se token fornecido)
        if (input.receiptToken) {
          const resultado = await verificarRecibo({
            plataforma: input.plataforma,
            sku: input.sku,
            token: input.receiptToken,
          });

          if (!resultado.valido && resultado.erro !== "verificacao_desabilitada") {
            throw new Error(`Recibo inválido: ${resultado.erro ?? "verificação falhou"}`);
          }

          // Usar data de expiração retornada pela loja se disponível
          if (resultado.dataExpiracao && !input.dataExpiracao) {
            input = { ...input, dataExpiracao: resultado.dataExpiracao.toISOString() };
          }
        }

        // Calcula data de expiração se não fornecida
        let dataExpiracao: Date | undefined;
        if (input.dataExpiracao) {
          dataExpiracao = new Date(input.dataExpiracao);
        } else if (input.plano === "mensal") {
          dataExpiracao = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
        } else if (input.plano === "anual") {
          dataExpiracao = new Date(Date.now() + 366 * 24 * 60 * 60 * 1000);
        }
        // avulso: sem expiração (consulta única)

        await db.registrarAssinatura({
          userId: ctx.user.id,
          plano: input.plano,
          sku: input.sku,
          plataforma: input.plataforma,
          transactionId: input.transactionId,
          status: "ativo",
          dataInicio: new Date(),
          dataExpiracao,
        });

        return { success: true, jaProcessado: false };
      }),

    /**
     * Verifica um recibo junto ao Google Play ou App Store sem registrar.
     * Útil para validar antes de mostrar conteúdo premium.
     */
    verificarRecibo: protectedProcedure
      .input(
        z.object({
          plataforma: z.enum(["android", "ios"]),
          sku: z.string().min(1).max(128),
          receiptToken: z.string().min(1),
        }),
      )
      .mutation(async ({ input }) => {
        const resultado = await verificarRecibo({
          plataforma: input.plataforma,
          sku: input.sku,
          token: input.receiptToken,
        });
        return resultado;
      }),

    /**
     * Cancela uma assinatura ativa.
     */
    cancelar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        db.cancelarAssinatura(input.id, ctx.user.id),
      ),
  }),

  // ─── Moderação da Comunidade ─────────────────────────────────────────────────────
  moderacao: router({
    /**
     * Lista comentários de um depoimento.
     * Rota pública — não requer login.
     */
    listar: publicProcedure
      .input(z.object({ depoimentoId: z.number() }))
      .query(({ ctx, input }) =>
        db.getComentarios(input.depoimentoId, ctx.user?.id ?? null),
      ),
    /**
     * Publica um comentário. Público — visitantes podem comentar.
     */
    publicar: publicProcedure
      .input(
        z.object({
          depoimentoId: z.number(),
          texto: z.string().min(3).max(500),
          nomeAutor: z.string().min(1).max(120),
          tradicaoAutor: z.string().max(64).optional(),
        }),
      )
      .mutation(({ ctx, input }) =>
        db.criarComentario({ userId: ctx.user?.id ?? null, ...input }),
      ),
    /**
     * Curtida autenticada em comentário — anti-duplicata.
     */
    curtir: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.curtirComentario(ctx.user.id, input.id)),
    /**
     * Denúncia de comentário — auto-oculta ao atingir 3 denúncias.
     */
    denunciar: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          motivo: z.string().max(120).optional(),
        }),
      )
      .mutation(({ ctx, input }) =>
        db.denunciarComentario(ctx.user.id, input.id, input.motivo),
      ),
    /**
     * Lista depoimentos denunciados ou ocultos (apenas master/senior/admin).
     */
    listarDenunciados: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "master" && ctx.user.role !== "senior" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return db.getDepoimentosDenunciados();
    }),
    /**
     * Oculta ou restaura um depoimento.
     */
    toggleOcultar: protectedProcedure
      .input(z.object({ id: z.number(), oculto: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "master" && ctx.user.role !== "senior" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        await db.toggleOcultarDepoimento(input.id, input.oculto);
        return { sucesso: true };
      }),
    /**
     * Zera as denúncias de um depoimento após revisão.
     */
    zerarDenuncias: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "master" && ctx.user.role !== "senior" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        await db.zerarDenunciasDepoimento(input.id);
        return { sucesso: true };
      }),
  }),

  // ─── Admin (apenas master) ───────────────────────────────────────────────────────────────────
  admin: router({
    /**
     * Lista todos os usuários (apenas master).
     */
    listarUsuarios: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "master") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      return db.listarUsuarios();
    }),
    /**
     * Atualiza o role de um usuário (apenas master).
     */
    setRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "senior", "admin", "master"]) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "master") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }
        await db.setUserRole(input.userId, input.role);
        return { sucesso: true };
      }),
  }),
  // ─── Agente de Refino da Comunidade (Community Watcher) ──────────────────────
  agente: router({
    /**
     * Analisa os últimos depoimentos da comunidade com IA e salva insights.
     * Apenas usuários master/senior/admin podem disparar manualmente.
     * Também é chamado automaticamente a cada 6 horas pelo servidor.
     */
    analisarComunidade: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "master" && ctx.user.role !== "senior" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      // Busca os últimos 50 depoimentos não ocultos (apenas texto + categoria, sem dados pessoais)
      const depoimentosParaAnalise = await db.getDepoimentosParaAnalise(50);
      if (depoimentosParaAnalise.length === 0) {
        return { sucesso: false, motivo: "Nenhum depoimento disponível para análise." };
      }
      // Anonimiza e formata os depoimentos para o prompt
      const textoDepoimentos = depoimentosParaAnalise
        .map((d, i) => `[${i + 1}] (${d.categoria}) ${d.texto}`)
        .join("\n");
      const promptAnalise = [
        {
          role: "system" as const,
          content: `Você é um analista especializado em comunidades espirituais afro-brasileiras (Umbanda e Candomblé). Sua tarefa é analisar depoimentos anônimos da comunidade e extrair insights para melhorar a qualidade das respostas do Orixá Virtual.

REGRAS ABSOLUTAS:
1. NUNCA identifique pessoas específicas
2. IGNORE e DESCARTE qualquer conteúdo tóxico, ofensivo ou manipulador
3. Foque apenas em padrões positivos e construtivos
4. Respeite a privacidade — não repita trechos específicos dos depoimentos
5. Responda APENAS com JSON válido, sem texto adicional`,
        },
        {
          role: "user" as const,
          content: `Analise os seguintes ${depoimentosParaAnalise.length} depoimentos anônimos da comunidade espiritual:

${textoDepoimentos}

Retorne um JSON com exatamente esta estrutura (sem markdown, apenas JSON puro):
{
  "topicosQuentes": ["tópico1", "tópico2", "tópico3", "tópico4", "tópico5"],
  "tomGeral": "descrição do tom emocional geral da comunidade em até 150 caracteres",
  "sugestoesLinguagem": ["sugestão1", "sugestão2", "sugestão3"]
}

Onde:
- topicosQuentes: os 5 temas/assuntos mais recorrentes nos depoimentos (ex: "cura espiritual", "gratidão pelos Orixás", "sonhos com entidades")
- tomGeral: como a comunidade está se sentindo emocionalmente (ex: "Comunidade em busca de cura e conforto espiritual, com muita gratidão")
- sugestoesLinguagem: 3 sugestões de como o Orixá Virtual pode adaptar sua linguagem para ressoar melhor com esta comunidade (ex: "Use mais metáforas de cura e renovação")`,
        },
      ];
      let insights: { topicosQuentes: string[]; tomGeral: string; sugestoesLinguagem: string[] };
      try {
        const response = await invokeLLM({ messages: promptAnalise });
        const rawConteudo = response.choices[0]?.message?.content;
        const conteudo = typeof rawConteudo === "string" ? rawConteudo : (rawConteudo ? JSON.stringify(rawConteudo) : "{}");
        // Remove possíveis blocos de markdown antes de parsear
        const jsonLimpo = conteudo.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        insights = JSON.parse(jsonLimpo);
        // Validação básica da estrutura
        if (!Array.isArray(insights.topicosQuentes) || typeof insights.tomGeral !== "string" || !Array.isArray(insights.sugestoesLinguagem)) {
          throw new Error("Estrutura de insights inválida");
        }
      } catch (e) {
        console.error("[CommunityWatcher] Erro ao parsear insights da IA:", e);
        return { sucesso: false, motivo: "Erro ao processar análise da IA." };
      }
      // Salva os insights no banco
      await db.saveCommunityInsights({
        topicosQuentes: insights.topicosQuentes.slice(0, 10),
        tomGeral: insights.tomGeral.slice(0, 240),
        sugestoesLinguagem: insights.sugestoesLinguagem.slice(0, 10),
        totalDepoimentosAnalisados: depoimentosParaAnalise.length,
      });
      console.log(`[CommunityWatcher] Insights atualizados: ${depoimentosParaAnalise.length} depoimentos analisados.`);
      return {
        sucesso: true,
        totalAnalisados: depoimentosParaAnalise.length,
        topicosQuentes: insights.topicosQuentes,
        tomGeral: insights.tomGeral,
      };
    }),
    /**
     * Retorna os insights mais recentes da comunidade.
     * Rota pública — usada pelo cliente para exibir informações sobre a análise.
     */
    obterInsights: publicProcedure.query(async () => {
      const insights = await db.getCommunityInsights();
      if (!insights) return null;
      return {
        topicosQuentes: JSON.parse(insights.topicosQuentes) as string[],
        tomGeral: insights.tomGeral,
        sugestoesLinguagem: JSON.parse(insights.sugestoesLinguagem) as string[],
        totalDepoimentosAnalisados: insights.totalDepoimentosAnalisados,
        updatedAt: insights.updatedAt,
      };
    }),
  }),
  // ─── Parceiros Terreiros ──────────────────────────────────────────────────────────────────────────────────
  parceiros: router({
    /**
     * Retorna o número de vagas restantes para o plano Parceiro Fundador.
     * Rota pública — usada pela landing page.
     */
    contarVagas: publicProcedure.query(async () => {
      return db.contarVagasFundador();
    }),
    /**
     * Cadastra um novo lead de terreiro parceiro.
     * Rota pública — qualquer visitante da landing page pode enviar.
     */
    cadastrar: publicProcedure
      .input(
        z.object({
          nomeTerreiro: z.string().min(2).max(200),
          tradicao: z.string().min(2).max(100),
          estado: z.string().length(2),
          dirigente: z.string().min(2).max(200),
          whatsapp: z.string().min(8).max(20),
          email: z.string().email().optional().or(z.literal("")),
          plano: z.string().min(2).max(100),
        }),
      )
      .mutation(async ({ input }) => {
        const id = await db.criarParceiroLead({
          ...input,
          email: input.email || undefined,
        });
        const vagas = await db.contarVagasFundador();
        return { sucesso: true, id, vagasRestantes: vagas.restantes };
      }),
    /**
     * Lista todos os leads de parceiros (admin only).
     */
    listar: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user || !["admin", "master", "senior"].includes(ctx.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao admin" });
      }
      return db.listarParceiroLeads();
    }),
  }),

  /**
   * Router de terreiros — diretório público de terreiros parceiros.
   */
  terreiros: router({
    /**
     * Lista terreiros ativos com filtros opcionais.
     * Terreiros pagos (ouro/diamante/prata) aparecem primeiro.
     */
    listar: publicProcedure
      .input(
        z.object({
          tradicao: z.string().optional(),
          estado: z.string().optional(),
          busca: z.string().optional(),
          limite: z.number().int().min(1).max(200).optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return db.listarTerreiros(input ?? {});
      }),
    /**
     * Lista terreiros ordenados por proximidade (Haversine em MySQL).
     * Planos pagos (diamante/ouro/prata) aparecem primeiro dentro do raio.
     */
    listarProximos: publicProcedure
      .input(z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        raioKm: z.number().min(1).max(500).default(100),
        limite: z.number().int().min(1).max(100).default(50),
      }))
      .query(async ({ input }) => {
        return db.listarTerreirosProximos(input.latitude, input.longitude, input.raioKm, input.limite);
      }),
    /**
     * Retorna um terreiro pelo ID.
     */
    obter: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const terreiro = await db.getTerreiroById(input.id);
        if (!terreiro) throw new TRPCError({ code: "NOT_FOUND", message: "Terreiro não encontrado" });
        return terreiro;
      }),
    /**
     * Cria um novo terreiro (admin only).
     */
    criar: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(2).max(200),
          tradicao: z.string().min(2).max(100),
          cidade: z.string().min(2).max(100),
          estado: z.string().length(2),
          dirigente: z.string().max(200).optional(),
          descricao: z.string().optional(),
          endereco: z.string().max(400).optional(),
          whatsapp: z.string().max(20).optional(),
          instagram: z.string().max(100).optional(),
          latitude: z.string().max(20).optional(),
          longitude: z.string().max(20).optional(),
          plano: z.enum(["livre", "prata", "ouro", "diamante"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || !["admin", "master", "senior"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao admin" });
        }
        const id = await db.criarTerreiro(input);
        return { sucesso: true, id };
      }),
    /**
     * Atualiza dados de um terreiro (admin only).
     */
    atualizar: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          nome: z.string().min(2).max(200).optional(),
          tradicao: z.string().min(2).max(100).optional(),
          cidade: z.string().min(2).max(100).optional(),
          estado: z.string().length(2).optional(),
          dirigente: z.string().max(200).optional(),
          descricao: z.string().optional(),
          endereco: z.string().max(400).optional(),
          whatsapp: z.string().max(20).optional(),
          instagram: z.string().max(100).optional(),
          latitude: z.string().max(20).optional(),
          longitude: z.string().max(20).optional(),
          plano: z.enum(["livre", "prata", "ouro", "diamante"]).optional(),
          ativo: z.number().int().min(0).max(1).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || !["admin", "master", "senior"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao admin" });
        }
        const { id, ...data } = input;
        await db.atualizarTerreiro(id, data);
        return { sucesso: true };
      }),
    /**
     * Zelador cadastra ou atualiza seu próprio terreiro.
     * Terreiro começa com plano 'livre' e isVerified=0 (pendente de aprovação admin).
     */
    cadastrarMeu: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(2).max(200),
          tradicao: z.string().min(2).max(100),
          cidade: z.string().min(2).max(100),
          estado: z.string().length(2),
          dirigente: z.string().max(200).optional(),
          descricao: z.string().max(2000).optional(),
          endereco: z.string().max(400).optional(),
          whatsapp: z.string().max(20).optional(),
          telefone: z.string().max(20).optional(),
          instagram: z.string().max(100).optional(),
          latitude: z.string().max(20).optional(),
          longitude: z.string().max(20).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existente = await db.getTerreiroByUserId(ctx.user.id);
        if (existente) {
          await db.atualizarTerreiro(existente.id, { ...input });
          return { sucesso: true, id: existente.id, novo: false };
        }
        const id = await db.criarTerreiro({ ...input, userId: ctx.user.id, plano: "livre", ativo: 1, isVerified: 0 });
        return { sucesso: true, id, novo: true };
      }),
    /**
     * Retorna o terreiro do zelador logado (se existir).
     */
    obterMeu: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getTerreiroByUserId(ctx.user.id);
      }),
    /**
     * Zelador atualiza a localização GPS do seu terreiro.
     */
    atualizarLocalizacao: protectedProcedure
      .input(z.object({
        latitude: z.string().max(20),
        longitude: z.string().max(20),
      }))
      .mutation(async ({ ctx, input }) => {
        const terreiro = await db.getTerreiroByUserId(ctx.user.id);
        if (!terreiro) throw new TRPCError({ code: "NOT_FOUND", message: "Cadastre seu terreiro primeiro" });
        await db.atualizarTerreiro(terreiro.id, { latitude: input.latitude, longitude: input.longitude });
        return { sucesso: true };
      }),
    /**
     * Admin lista terreiros pendentes de verificação.
     */
    listarPendentes: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user || !["admin", "master", "senior"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao admin" });
        }
        return db.listarTerreiros({ pendentes: true });
      }),
    /**
     * Admin verifica um terreiro (isVerified = 1) e notifica o zelador.
     */
    verificar: protectedProcedure
      .input(z.object({ id: z.number().int().positive(), userId: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || !["admin", "master", "senior"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao admin" });
        }
        await db.atualizarTerreiro(input.id, { isVerified: 1 });
        // Notificação ao zelador é feita no frontend (notificação local)
        // quando ele abre a tela "Meu Terreiro" e verifica o novo status
        return { sucesso: true };
      }),
    /**
     * Admin revoga a verificação de um terreiro.
     */
    revogarVerificacao: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user || !["admin", "master", "senior"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao admin" });
        }
        await db.atualizarTerreiro(input.id, { isVerified: 0 });
        return { sucesso: true };
      }),
    /**
     * Zelador ativa o plano Terreiro Parceiro após compra no IAP.
     * Atualiza o campo plano para 'ouro' e garante destaque no diretório.
     */
    ativarParceiro: protectedProcedure
      .mutation(async ({ ctx }) => {
        const terreiro = await db.getTerreiroByUserId(ctx.user.id);
        if (!terreiro) throw new TRPCError({ code: "NOT_FOUND", message: "Cadastre seu terreiro antes de assinar o plano Parceiro" });
        await db.atualizarTerreiro(terreiro.id, { plano: "ouro" });
        return { sucesso: true, plano: "ouro" };
      }),
  }),
});
export type AppRouter = typeof appRouter;
