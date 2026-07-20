import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { invokeLLM } from "./llm";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Agente de Refino da Comunidade (Community Watcher).
 * Analisa os últimos 50 depoimentos e salva insights no banco.
 * Chamado automaticamente a cada 6 horas.
 */
async function executarCommunityWatcher(): Promise<void> {
  try {
    const depoimentosParaAnalise = await db.getDepoimentosParaAnalise(50);
    if (depoimentosParaAnalise.length === 0) {
      console.log("[CommunityWatcher] Nenhum depoimento disponível. Análise ignorada.");
      return;
    }
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
    const response = await invokeLLM({ messages: promptAnalise });
    const rawConteudo = response.choices[0]?.message?.content;
    const conteudo = typeof rawConteudo === "string" ? rawConteudo : (rawConteudo ? JSON.stringify(rawConteudo) : "{}");
    const jsonLimpo = conteudo.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const insights = JSON.parse(jsonLimpo) as {
      topicosQuentes: string[];
      tomGeral: string;
      sugestoesLinguagem: string[];
    };
    if (!Array.isArray(insights.topicosQuentes) || typeof insights.tomGeral !== "string" || !Array.isArray(insights.sugestoesLinguagem)) {
      throw new Error("Estrutura de insights inválida");
    }
    await db.saveCommunityInsights({
      topicosQuentes: insights.topicosQuentes.slice(0, 10),
      tomGeral: insights.tomGeral.slice(0, 240),
      sugestoesLinguagem: insights.sugestoesLinguagem.slice(0, 10),
      totalDepoimentosAnalisados: depoimentosParaAnalise.length,
    });
    console.log(`[CommunityWatcher] ✅ Insights atualizados: ${depoimentosParaAnalise.length} depoimentos analisados.`);
  } catch (error) {
    console.error("[CommunityWatcher] ❌ Erro na análise automática:", error);
    // Silencioso — não interrompe o servidor
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Páginas legais públicas (exigidas por Google Play e App Store)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.join(__dirname, "../public");

  // Servir arquivos estáticos da pasta public (PDFs, imagens, etc.)
  app.use(express.static(publicDir));

  app.get("/privacidade", (_req, res) => {
    res.redirect(301, "/privacidade.pdf");
  });
  app.get("/termos", (_req, res) => {
    res.redirect(301, "/termos.pdf");
  });
  app.get("/parceiros", (_req, res) => {
    res.sendFile(path.join(publicDir, "parceiros/index.html"));
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });

  // ─── Agente de Refino da Comunidade (Community Watcher) ──────────────────────
  // Executa a primeira análise 2 minutos após o servidor iniciar (aguarda dados carregarem)
  // e depois repete a cada 6 horas automaticamente.
  const SEIS_HORAS_MS = 6 * 60 * 60 * 1000;
  const DELAY_INICIAL_MS = 2 * 60 * 1000; // 2 minutos
  setTimeout(() => {
    console.log("[CommunityWatcher] 🔍 Iniciando primeira análise da comunidade...");
    executarCommunityWatcher();
    setInterval(() => {
      console.log("[CommunityWatcher] 🔄 Executando análise periódica (6h)...");
      executarCommunityWatcher();
    }, SEIS_HORAS_MS);
  }, DELAY_INICIAL_MS);
}

startServer().catch(console.error);
