import { int, mysqlEnum, mysqlTable, text, timestamp, tinyint, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "master", "senior"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Autenticação nativa por e-mail (senha hasheada com bcrypt).
 */
export const emailAuth = mysqlTable("email_auth", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailAuth = typeof emailAuth.$inferSelect;
export type InsertEmailAuth = typeof emailAuth.$inferInsert;

/**
 * Perfil espiritual do usuário.
 */
export const perfisEspirituais = mysqlTable("perfis_espirituais", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  nomeEspiritual: varchar("nomeEspiritual", { length: 120 }),
  orixaRegente: varchar("orixaRegente", { length: 64 }),
  orixaJunto: varchar("orixaJunto", { length: 64 }),
  tradicao: varchar("tradicao", { length: 64 }),
  genero: mysqlEnum("genero", ["masculino", "feminino", "nao-binario", "prefiro-nao-informar"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerfilEspiritual = typeof perfisEspirituais.$inferSelect;
export type InsertPerfilEspiritual = typeof perfisEspirituais.$inferInsert;

/**
 * Entradas do diário espiritual.
 */
export const entradasDiario = mysqlTable("entradas_diario", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  emoji: varchar("emoji", { length: 8 }).notNull().default("✨"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EntradaDiario = typeof entradasDiario.$inferSelect;
export type InsertEntradaDiario = typeof entradasDiario.$inferInsert;

/**
 * Categorias válidas para depoimentos da comunidade.
 */
export const CATEGORIAS_DEPOIMENTO = [
  "todos",
  "experiencias",
  "sonhos",
  "agradecimentos",
  "duvidas",
  "oferendas",
  "pontos",
] as const;

export type CategoriaDepoimento = (typeof CATEGORIAS_DEPOIMENTO)[number];

/**
 * Depoimentos da comunidade — com categoria e controle de denúncias.
 */
export const depoimentos = mysqlTable("depoimentos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null para visitantes não autenticados
  nomeAutor: varchar("nomeAutor", { length: 120 }).notNull(),
  tradicaoAutor: varchar("tradicaoAutor", { length: 64 }),
  texto: text("texto").notNull(),
  curtidas: int("curtidas").default(0).notNull(),
  categoria: mysqlEnum("categoria", [
    "todos",
    "experiencias",
    "sonhos",
    "agradecimentos",
    "duvidas",
    "oferendas",
    "pontos",
  ]).default("experiencias").notNull(),
  denuncias: int("denuncias").default(0).notNull(),
  oculto: int("oculto").default(0).notNull(), // 0 = visível, 1 = oculto por denúncias
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Depoimento = typeof depoimentos.$inferSelect;
export type InsertDepoimento = typeof depoimentos.$inferInsert;

/**
 * Curtidas individuais por usuário — garante anti-duplicata no nível do banco.
 */
export const curtidasDepoimentos = mysqlTable(
  "curtidas_depoimentos",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    depoimentoId: int("depoimentoId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCurtida: uniqueIndex("unique_curtida").on(table.userId, table.depoimentoId),
  }),
);

export type CurtidaDepoimento = typeof curtidasDepoimentos.$inferSelect;

/**
 * Denúncias de depoimentos — uma por usuário por depoimento.
 */
export const denunciasDepoimentos = mysqlTable(
  "denuncias_depoimentos",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    depoimentoId: int("depoimentoId").notNull(),
    motivo: varchar("motivo", { length: 120 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDenuncia: uniqueIndex("unique_denuncia").on(table.userId, table.depoimentoId),
  }),
);

export type DenunciaDepoimento = typeof denunciasDepoimentos.$inferSelect;

/**
 * Comentários nas publicações da comunidade.
 */
export const comentariosDepoimentos = mysqlTable("comentarios_depoimentos", {
  id: int("id").autoincrement().primaryKey(),
  depoimentoId: int("depoimentoId").notNull(),
  userId: int("userId"), // null para visitantes não autenticados
  nomeAutor: varchar("nomeAutor", { length: 120 }).notNull(),
  tradicaoAutor: varchar("tradicaoAutor", { length: 64 }),
  texto: text("texto").notNull(),
  curtidas: int("curtidas").default(0).notNull(),
  denuncias: int("denuncias").default(0).notNull(),
  oculto: int("oculto").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComentarioDepoimento = typeof comentariosDepoimentos.$inferSelect;
export type InsertComentarioDepoimento = typeof comentariosDepoimentos.$inferInsert;

/**
 * Curtidas individuais em comentários — garante anti-duplicata.
 */
export const curtidasComentarios = mysqlTable(
  "curtidas_comentarios",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    comentarioId: int("comentarioId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCurtidaComentario: uniqueIndex("unique_curtida_comentario").on(table.userId, table.comentarioId),
  }),
);

export type CurtidaComentario = typeof curtidasComentarios.$inferSelect;

/**
 * Denúncias de comentários.
 */
export const denunciasComentarios = mysqlTable(
  "denuncias_comentarios",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    comentarioId: int("comentarioId").notNull(),
    motivo: varchar("motivo", { length: 120 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueDenunciaComentario: uniqueIndex("unique_denuncia_comentario").on(table.userId, table.comentarioId),
  }),
);

export type DenunciaComentario = typeof denunciasComentarios.$inferSelect;

/**
 * Histórico de consultas ao Orixá — apenas para usuários autenticados.
 */
export const consultasOrixas = mysqlTable("consultas_orixas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orixaId: varchar("orixaId", { length: 64 }).notNull(),
  orixaNome: varchar("orixaNome", { length: 120 }).notNull(),
  orixaEmoji: varchar("orixaEmoji", { length: 8 }).notNull(),
  pergunta: text("pergunta").notNull(),
  resposta: text("resposta").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsultaOrixa = typeof consultasOrixas.$inferSelect;
export type InsertConsultaOrixa = typeof consultasOrixas.$inferInsert;

/**
 * Assinaturas premium — registra compras verificadas pelo servidor.
 */
export const assinaturasPremium = mysqlTable("assinaturas_premium", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plano: mysqlEnum("plano", ["mensal", "anual", "avulso"]).notNull(),
  sku: varchar("sku", { length: 128 }).notNull(),
  plataforma: mysqlEnum("plataforma", ["android", "ios"]).notNull(),
  transactionId: varchar("transactionId", { length: 256 }).notNull().unique(),
  status: mysqlEnum("status", ["ativo", "expirado", "cancelado"]).default("ativo").notNull(),
  dataInicio: timestamp("dataInicio").defaultNow().notNull(),
  dataExpiracao: timestamp("dataExpiracao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssinaturaPremium = typeof assinaturasPremium.$inferSelect;
export type InsertAssinaturaPremium = typeof assinaturasPremium.$inferInsert;

/**
 * Insights da comunidade gerados pelo Agente de Refino (Community Watcher).
 * Armazena análise periódica dos depoimentos para enriquecer o contexto do Orixá Virtual.
 * Apenas 1 registro é mantido (id=1), atualizado a cada 6 horas.
 */
export const communityInsights = mysqlTable("community_insights", {
  id: int("id").autoincrement().primaryKey(),
  topicosQuentes: text("topicosQuentes").notNull(), // JSON array de strings
  tomGeral: varchar("tomGeral", { length: 240 }).notNull(),
  sugestoesLinguagem: text("sugestoesLinguagem").notNull(), // JSON array de strings
  totalDepoimentosAnalisados: int("totalDepoimentosAnalisados").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityInsights = typeof communityInsights.$inferSelect;
export type InsertCommunityInsights = typeof communityInsights.$inferInsert;

/**
 * Leads de terreiros interessados em ser parceiros do Axé App.
 * Captados pela landing page /parceiros.
 */
export const parceiroLeads = mysqlTable("parceiro_leads", {
  id: int("id").autoincrement().primaryKey(),
  nomeTerreiro: varchar("nomeTerreiro", { length: 200 }).notNull(),
  tradicao: varchar("tradicao", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  dirigente: varchar("dirigente", { length: 200 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  plano: varchar("plano", { length: 100 }).notNull().default("Parceiro Fundador (Ouro por R$ 29,90/mês)"),
  status: mysqlEnum("status", ["novo", "contatado", "convertido", "descartado"]).default("novo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ParceiroLead = typeof parceiroLeads.$inferSelect;
export type InsertParceiroLead = typeof parceiroLeads.$inferInsert;

/**
 * Terreiros cadastrados no diretório do Axé App.
 * Inclui terreiros parceiros (pagos) e gratuitos.
 * Coordenadas geográficas para exibição no mapa.
 */
export const terreiros = mysqlTable("terreiros", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  tradicao: varchar("tradicao", { length: 100 }).notNull(),
  dirigente: varchar("dirigente", { length: 200 }),
  descricao: text("descricao"),
  endereco: varchar("endereco", { length: 400 }),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }),
  instagram: varchar("instagram", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  telefone: varchar("telefone", { length: 20 }),
  userId: int("userId"), // zelador dono do terreiro (null = cadastrado pelo admin)
  isVerified: tinyint("isVerified").default(0).notNull(), // verificado pelo admin
  plano: mysqlEnum("plano", ["livre", "prata", "ouro", "diamante"]).default("livre").notNull(),
  ativo: tinyint("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Terreiro = typeof terreiros.$inferSelect;
export type InsertTerreiro = typeof terreiros.$inferInsert;

/**
 * Eventos de analytics para rastrear conversão Free → Premium.
 * Eventos: paywall_viewed, premium_purchased, consulta_realizada,
 * quiz_concluido, desafio_concluido, onboarding_concluido.
 * userId é opcional para rastrear eventos de usuários não autenticados.
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  evento: varchar("evento", { length: 100 }).notNull(),
  userId: int("userId"),
  propriedades: text("propriedades"), // JSON stringificado com metadados do evento
  plataforma: varchar("plataforma", { length: 20 }), // "ios" | "android" | "web"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Tokens para recuperação de senha por e-mail.
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
