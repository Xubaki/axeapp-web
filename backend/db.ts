import { eq, desc, and, sql, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  emailAuth,
  perfisEspirituais,
  entradasDiario,
  depoimentos,
  curtidasDepoimentos,
  denunciasDepoimentos,
  comentariosDepoimentos,
  curtidasComentarios,
  denunciasComentarios,
  consultasOrixas,
  assinaturasPremium,
  communityInsights,
  parceiroLeads,
  terreiros,
  analyticsEvents,
  type ParceiroLead,
  type Terreiro,
  type InsertTerreiro,
  type InsertAnalyticsEvent,
  type InsertPerfilEspiritual,
  type InsertEntradaDiario,
  type InsertDepoimento,
  type InsertComentarioDepoimento,
  type CategoriaDepoimento,
  type InsertConsultaOrixa,
  type CommunityInsights,
  type InsertAssinaturaPremium,
  passwordResetTokens,
  type PasswordResetToken,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Retorna as principais métricas de analytics do app para o painel do admin.
 */
export async function getMetricasAnalytics() {
  const db = await getDb();
  const now = new Date();
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ha7dias = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ha30dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (!db) {
    // Retornar dados simulados quando banco não está disponível
    return {
      totalUsuarios: 0,
      usuariosAtivos7d: 0,
      usuariosAtivos30d: 0,
      novosUsuarios7d: 0,
      novosUsuarios30d: 0,
      totalAssinantes: 0,
      assinantesAtivos: 0,
      assinantesMensal: 0,
      assinantesAnual: 0,
      totalConsultas: 0,
      consultasHoje: 0,
      consultas7d: 0,
      totalDepoimentos: 0,
      depoimentos7d: 0,
      totalEntradasDiario: 0,
      taxaConversao: 0,
      plataformaAndroid: 0,
      plataformaIos: 0,
      orixaMaisConsultado: null,
      ultimasAssinaturas: [],
    };
  }

  try {
    const { count, eq, gte, and, sql } = await import("drizzle-orm");

    // Usuários
    const [totalUsuariosRow] = await db.select({ c: count() }).from(users);
    const [ativos7dRow] = await db.select({ c: count() }).from(users).where(gte(users.lastSignedIn, ha7dias));
    const [ativos30dRow] = await db.select({ c: count() }).from(users).where(gte(users.lastSignedIn, ha30dias));
    const [novos7dRow] = await db.select({ c: count() }).from(users).where(gte(users.createdAt, ha7dias));
    const [novos30dRow] = await db.select({ c: count() }).from(users).where(gte(users.createdAt, ha30dias));

    // Assinaturas
    const [totalAssRow] = await db.select({ c: count() }).from(assinaturasPremium);
    const [ativosAssRow] = await db.select({ c: count() }).from(assinaturasPremium).where(eq(assinaturasPremium.status, "ativo"));
    const [mensalRow] = await db.select({ c: count() }).from(assinaturasPremium).where(and(eq(assinaturasPremium.status, "ativo"), eq(assinaturasPremium.plano, "mensal")));
    const [anualRow] = await db.select({ c: count() }).from(assinaturasPremium).where(and(eq(assinaturasPremium.status, "ativo"), eq(assinaturasPremium.plano, "anual")));
    const [androidRow] = await db.select({ c: count() }).from(assinaturasPremium).where(and(eq(assinaturasPremium.status, "ativo"), eq(assinaturasPremium.plataforma, "android")));
    const [iosRow] = await db.select({ c: count() }).from(assinaturasPremium).where(and(eq(assinaturasPremium.status, "ativo"), eq(assinaturasPremium.plataforma, "ios")));

    // Consultas
    const [totalConsRow] = await db.select({ c: count() }).from(consultasOrixas);
    const [consHojeRow] = await db.select({ c: count() }).from(consultasOrixas).where(gte(consultasOrixas.createdAt, hoje));
    const [cons7dRow] = await db.select({ c: count() }).from(consultasOrixas).where(gte(consultasOrixas.createdAt, ha7dias));

    // Orixá mais consultado
    const orixaRanking = await db
      .select({ orixaId: consultasOrixas.orixaId, orixaNome: consultasOrixas.orixaNome, total: count() })
      .from(consultasOrixas)
      .groupBy(consultasOrixas.orixaId, consultasOrixas.orixaNome)
      .orderBy(sql`count(*) desc`)
      .limit(1);

    // Depoimentos
    const [totalDepRow] = await db.select({ c: count() }).from(depoimentos);
    const [dep7dRow] = await db.select({ c: count() }).from(depoimentos).where(gte(depoimentos.createdAt, ha7dias));

    // Diário
    const [totalDiarioRow] = await db.select({ c: count() }).from(entradasDiario);

    // Últimas assinaturas
    const ultimasAssinaturas = await db
      .select({
        id: assinaturasPremium.id,
        plano: assinaturasPremium.plano,
        plataforma: assinaturasPremium.plataforma,
        status: assinaturasPremium.status,
        dataInicio: assinaturasPremium.dataInicio,
      })
      .from(assinaturasPremium)
      .orderBy(sql`${assinaturasPremium.dataInicio} desc`)
      .limit(10);

    const totalU = totalUsuariosRow?.c ?? 0;
    const totalA = ativosAssRow?.c ?? 0;
    const taxaConversao = totalU > 0 ? Math.round((totalA / totalU) * 100 * 10) / 10 : 0;

    return {
      totalUsuarios: totalU,
      usuariosAtivos7d: ativos7dRow?.c ?? 0,
      usuariosAtivos30d: ativos30dRow?.c ?? 0,
      novosUsuarios7d: novos7dRow?.c ?? 0,
      novosUsuarios30d: novos30dRow?.c ?? 0,
      totalAssinantes: totalAssRow?.c ?? 0,
      assinantesAtivos: totalA,
      assinantesMensal: mensalRow?.c ?? 0,
      assinantesAnual: anualRow?.c ?? 0,
      totalConsultas: totalConsRow?.c ?? 0,
      consultasHoje: consHojeRow?.c ?? 0,
      consultas7d: cons7dRow?.c ?? 0,
      totalDepoimentos: totalDepRow?.c ?? 0,
      depoimentos7d: dep7dRow?.c ?? 0,
      totalEntradasDiario: totalDiarioRow?.c ?? 0,
      taxaConversao,
      plataformaAndroid: androidRow?.c ?? 0,
      plataformaIos: iosRow?.c ?? 0,
      orixaMaisConsultado: orixaRanking[0] ?? null,
      ultimasAssinaturas,
    };
  } catch (error) {
    console.error("[Analytics] Erro ao buscar métricas:", error);
    throw error;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEmailAuthByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailAuth).where(eq(emailAuth.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEmailAuth(userId: number, email: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emailAuth).values({ userId, email, passwordHash });
}

// ─── Perfil Espiritual ────────────────────────────────────────────────────────

export async function getPerfilEspiritual(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(perfisEspirituais)
    .where(eq(perfisEspirituais.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertPerfilEspiritual(
  userId: number,
  data: Omit<InsertPerfilEspiritual, "userId" | "id" | "createdAt" | "updatedAt">,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getPerfilEspiritual(userId);
  if (existing) {
    await db
      .update(perfisEspirituais)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(perfisEspirituais.userId, userId));
  } else {
    await db.insert(perfisEspirituais).values({ userId, ...data });
  }
  return getPerfilEspiritual(userId);
}

// ─── Diário Espiritual ────────────────────────────────────────────────────────

export async function getEntradasDiario(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(entradasDiario)
    .where(eq(entradasDiario.userId, userId))
    .orderBy(desc(entradasDiario.createdAt));
}

export async function criarEntradaDiario(data: InsertEntradaDiario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(entradasDiario).values(data);
  return result[0].insertId;
}

export async function atualizarEntradaDiario(
  id: number,
  _userId: number,
  data: Partial<Pick<InsertEntradaDiario, "emoji" | "titulo" | "conteudo">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(entradasDiario)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(entradasDiario.id, id));
}

export async function deletarEntradaDiario(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(entradasDiario).where(eq(entradasDiario.id, id));
}

// ─── Depoimentos da Comunidade ────────────────────────────────────────────────

/**
 * Lista depoimentos visíveis, opcionalmente filtrados por categoria.
 * Retorna também os IDs curtidos pelo usuário (se userId informado).
 */
export async function getDepoimentos(
  categoria?: CategoriaDepoimento | null,
  userId?: number | null,
) {
  const db = await getDb();
  if (!db) return { depoimentos: [], curtidosPeloUsuario: [] as number[] };

  // Monta condições: sempre exclui ocultos
  const conditions = [eq(depoimentos.oculto, 0)];
  if (categoria && categoria !== "todos") {
    conditions.push(eq(depoimentos.categoria, categoria));
  }

  const rows = await db
    .select()
    .from(depoimentos)
    .where(and(...conditions))
    .orderBy(desc(depoimentos.createdAt))
    .limit(50);

  // Busca curtidas do usuário autenticado para marcar quais ele já curtiu
  let curtidosPeloUsuario: number[] = [];
  if (userId) {
    const curtidas = await db
      .select({ depoimentoId: curtidasDepoimentos.depoimentoId })
      .from(curtidasDepoimentos)
      .where(eq(curtidasDepoimentos.userId, userId));
    curtidosPeloUsuario = curtidas.map((c) => c.depoimentoId);
  }

  return { depoimentos: rows, curtidosPeloUsuario };
}

/**
 * Conta depoimentos novos (não ocultos) desde um timestamp ISO.
 * Usado para o badge de novidades na tab bar da Comunidade.
 */
export async function contarNovidades(desde: Date): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const { count, gte, eq, and } = await import("drizzle-orm");
    const [row] = await db
      .select({ c: count() })
      .from(depoimentos)
      .where(and(eq(depoimentos.oculto, 0), gte(depoimentos.createdAt, desde)));
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

export async function criarDepoimento(data: InsertDepoimento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(depoimentos).values(data);
  return result[0].insertId;
}

/**
 * Curtida autenticada com anti-duplicata via tabela dedicada.
 * Retorna { success: true } se curtiu, { alreadyLiked: true } se já havia curtido.
 */
export async function curtirDepoimento(userId: number, depoimentoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verifica se já curtiu
  const existing = await db
    .select({ id: curtidasDepoimentos.id })
    .from(curtidasDepoimentos)
    .where(
      and(
        eq(curtidasDepoimentos.userId, userId),
        eq(curtidasDepoimentos.depoimentoId, depoimentoId),
      ),
    )
    .limit(1);

  if (existing.length > 0) return { alreadyLiked: true };

  // Insere curtida e incrementa contador atomicamente
  await db.insert(curtidasDepoimentos).values({ userId, depoimentoId });
  await db
    .update(depoimentos)
    .set({ curtidas: sql`curtidas + 1` })
    .where(eq(depoimentos.id, depoimentoId));

  return { success: true };
}

/**
 * Registra uma denúncia. Ao atingir 3 denúncias, oculta o depoimento automaticamente.
 */
export async function denunciarDepoimento(
  userId: number,
  depoimentoId: number,
  motivo?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verifica se já denunciou
  const existing = await db
    .select({ id: denunciasDepoimentos.id })
    .from(denunciasDepoimentos)
    .where(
      and(
        eq(denunciasDepoimentos.userId, userId),
        eq(denunciasDepoimentos.depoimentoId, depoimentoId),
      ),
    )
    .limit(1);

  if (existing.length > 0) return { alreadyReported: true };

  // Insere denúncia e incrementa contador
  await db.insert(denunciasDepoimentos).values({ userId, depoimentoId, motivo });
  await db
    .update(depoimentos)
    .set({ denuncias: sql`denuncias + 1` })
    .where(eq(depoimentos.id, depoimentoId));

  // Auto-ocultação ao atingir 3 denúncias
  await db
    .update(depoimentos)
    .set({ oculto: 1 })
    .where(and(eq(depoimentos.id, depoimentoId), sql`denuncias >= 3`));

  return { success: true };
}

// ─── Comentários da Comunidade ─────────────────────────────────────────────────────────────────────────────────

export async function getComentarios(depoimentoId: number, userId?: number | null) {
  const db = await getDb();
  if (!db) return { comentarios: [], curtidosPeloUsuario: [] as number[] };

  const rows = await db
    .select()
    .from(comentariosDepoimentos)
    .where(
      and(
        eq(comentariosDepoimentos.depoimentoId, depoimentoId),
        eq(comentariosDepoimentos.oculto, 0),
      ),
    )
    .orderBy(desc(comentariosDepoimentos.createdAt))
    .limit(100);

  let curtidosPeloUsuario: number[] = [];
  if (userId) {
    const curtidas = await db
      .select({ comentarioId: curtidasComentarios.comentarioId })
      .from(curtidasComentarios)
      .where(eq(curtidasComentarios.userId, userId));
    curtidosPeloUsuario = curtidas.map((c) => c.comentarioId);
  }

  return { comentarios: rows, curtidosPeloUsuario };
}

export async function criarComentario(data: InsertComentarioDepoimento) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comentariosDepoimentos).values(data);
  return result[0].insertId;
}

export async function getContagemComentarios(depoimentoIds: number[]) {
  const db = await getDb();
  if (!db) return {} as Record<number, number>;
  if (depoimentoIds.length === 0) return {} as Record<number, number>;

  const rows = await db
    .select({
      depoimentoId: comentariosDepoimentos.depoimentoId,
      total: sql<number>`count(*)`,
    })
    .from(comentariosDepoimentos)
    .where(
      and(
        sql`${comentariosDepoimentos.depoimentoId} IN (${sql.join(
          depoimentoIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
        eq(comentariosDepoimentos.oculto, 0),
      ),
    )
    .groupBy(comentariosDepoimentos.depoimentoId);

  return Object.fromEntries(
    rows.map((r) => [r.depoimentoId, Number(r.total)]),
  ) as Record<number, number>;
}

export async function curtirComentario(userId: number, comentarioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select({ id: curtidasComentarios.id })
    .from(curtidasComentarios)
    .where(
      and(
        eq(curtidasComentarios.userId, userId),
        eq(curtidasComentarios.comentarioId, comentarioId),
      ),
    )
    .limit(1);

  if (existing.length > 0) return { alreadyLiked: true };

  await db.insert(curtidasComentarios).values({ userId, comentarioId });
  await db
    .update(comentariosDepoimentos)
    .set({ curtidas: sql`curtidas + 1` })
    .where(eq(comentariosDepoimentos.id, comentarioId));

  return { success: true };
}

export async function denunciarComentario(
  userId: number,
  comentarioId: number,
  motivo?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select({ id: denunciasComentarios.id })
    .from(denunciasComentarios)
    .where(
      and(
        eq(denunciasComentarios.userId, userId),
        eq(denunciasComentarios.comentarioId, comentarioId),
      ),
    )
    .limit(1);

  if (existing.length > 0) return { alreadyReported: true };

  await db.insert(denunciasComentarios).values({ userId, comentarioId, motivo });
  await db
    .update(comentariosDepoimentos)
    .set({ denuncias: sql`denuncias + 1` })
    .where(eq(comentariosDepoimentos.id, comentarioId));

  await db
    .update(comentariosDepoimentos)
    .set({ oculto: 1 })
    .where(and(eq(comentariosDepoimentos.id, comentarioId), sql`denuncias >= 3`));

  return { success: true };
}

/**
 * Exclui todos os dados do usuário e a conta em si (LGPD — art. 18, IV).
 * Remove em cascata: perfil espiritual, entradas do diário, depoimentos,
 * curtidas, denúncias e comentários associados ao userId.
 */
export async function excluirConta(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Remover curtidas e denúncias de comentários do usuário
  await db.delete(curtidasComentarios).where(eq(curtidasComentarios.userId, userId));
  await db.delete(denunciasComentarios).where(eq(denunciasComentarios.userId, userId));

  // Remover comentários do usuário
  await db.delete(comentariosDepoimentos).where(eq(comentariosDepoimentos.userId, userId));

  // Remover curtidas e denúncias de depoimentos do usuário
  await db.delete(curtidasDepoimentos).where(eq(curtidasDepoimentos.userId, userId));
  await db.delete(denunciasDepoimentos).where(eq(denunciasDepoimentos.userId, userId));

  // Remover depoimentos do usuário
  await db.delete(depoimentos).where(eq(depoimentos.userId, userId));

  // Remover entradas do diário
  await db.delete(entradasDiario).where(eq(entradasDiario.userId, userId));

  // Remover perfil espiritual
  await db.delete(perfisEspirituais).where(eq(perfisEspirituais.userId, userId));

  // Remover consultas ao Orixá
  await db.delete(consultasOrixas).where(eq(consultasOrixas.userId, userId));
  // Remover o usuário
  await db.delete(users).where(eq(users.id, userId));
}

// ─── Histórico de Consultas ao Orixá ────────────────────────────────────────

export async function salvarConsulta(data: InsertConsultaOrixa): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(consultasOrixas).values(data);
  return result[0].insertId;
}

export async function listarConsultasUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(consultasOrixas)
    .where(eq(consultasOrixas.userId, userId))
    .orderBy(desc(consultasOrixas.createdAt))
    .limit(100);
}

export async function excluirConsulta(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(consultasOrixas)
    .where(and(eq(consultasOrixas.id, id), eq(consultasOrixas.userId, userId)));
}

// ─── Assinaturas Premium ─────────────────────────────────────────────────────

/**
 * Registra uma nova assinatura/compra verificada pelo servidor.
 * Usa INSERT IGNORE para evitar duplicatas por transactionId.
 */
export async function registrarAssinatura(data: InsertAssinaturaPremium): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(assinaturasPremium).values(data);
    return result[0].insertId;
  } catch (err: unknown) {
    // Duplicata de transactionId — compra já registrada
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "ER_DUP_ENTRY") {
      return 0;
    }
    throw err;
  }
}

/**
 * Retorna a assinatura ativa mais recente do usuário.
 * Considera "ativo" qualquer assinatura com status='ativo' e sem dataExpiracao ou com dataExpiracao no futuro.
 */
export async function getAssinaturaAtiva(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const agora = new Date();
  const rows = await db
    .select()
    .from(assinaturasPremium)
    .where(
      and(
        eq(assinaturasPremium.userId, userId),
        eq(assinaturasPremium.status, "ativo"),
        sql`(${assinaturasPremium.dataExpiracao} IS NULL OR ${assinaturasPremium.dataExpiracao} > ${agora})`,
      ),
    )
    .orderBy(desc(assinaturasPremium.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Lista todas as assinaturas do usuário (para exibir no gerenciamento).
 */
export async function listarAssinaturasUsuario(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(assinaturasPremium)
    .where(eq(assinaturasPremium.userId, userId))
    .orderBy(desc(assinaturasPremium.createdAt))
    .limit(20);
}

/**
 * Marca uma assinatura como cancelada.
 */
export async function cancelarAssinatura(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(assinaturasPremium)
    .set({ status: "cancelado", updatedAt: new Date() })
    .where(and(eq(assinaturasPremium.id, id), eq(assinaturasPremium.userId, userId)));
}

/**
 * Verifica se um transactionId já foi processado (evita replay attacks).
 */
export async function transacaoJaProcessada(transactionId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ id: assinaturasPremium.id })
    .from(assinaturasPremium)
    .where(eq(assinaturasPremium.transactionId, transactionId))
    .limit(1);
  return rows.length > 0;
}

// ─── Moderação da Comunidade ─────────────────────────────────────────────────

/**
 * Lista depoimentos com denúncias (para moderação por master/senior).
 * Inclui também depoimentos já ocultos para permitir restauração.
 */
export async function getDepoimentosDenunciados() {
  const db = await getDb();
  if (!db) return [];
  const { gt, or } = await import("drizzle-orm");
  return db
    .select()
    .from(depoimentos)
    .where(or(gt(depoimentos.denuncias, 0), eq(depoimentos.oculto, 1)))
    .orderBy(desc(depoimentos.denuncias))
    .limit(100);
}

/**
 * Oculta ou restaura um depoimento (toggle).
 */
export async function toggleOcultarDepoimento(id: number, oculto: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(depoimentos)
    .set({ oculto: oculto ? 1 : 0 })
    .where(eq(depoimentos.id, id));
}

/**
 * Zera as denúncias de um depoimento (após revisão do moderador).
 */
export async function zerarDenunciasDepoimento(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(depoimentos)
    .set({ denuncias: 0 })
    .where(eq(depoimentos.id, id));
}

/**
 * Lista todos os usuários (apenas para uso admin/master).
 */
export async function listarUsuarios() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select({
      id: users.id,
      openId: users.openId,
      email: users.email,
      name: users.name,
      role: users.role,
      loginMethod: users.loginMethod,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(500);
}

/**
 * Atualiza o role de um usuário (apenas master pode chamar).
 */
export async function setUserRole(userId: number, role: "user" | "admin" | "master" | "senior"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));
}

// ─── Community Watcher (Agente de Refino) ────────────────────────────────────

/**
 * Busca os últimos N depoimentos não ocultos para análise pelo Community Watcher.
 * Retorna apenas texto e categoria (sem dados pessoais — conformidade LGPD).
 */
export async function getDepoimentosParaAnalise(limit = 50): Promise<{ texto: string; categoria: string }[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      texto: depoimentos.texto,
      categoria: depoimentos.categoria,
    })
    .from(depoimentos)
    .where(eq(depoimentos.oculto, 0))
    .orderBy(desc(depoimentos.createdAt))
    .limit(limit);
  return rows;
}

/**
 * Retorna o registro de insights mais recente (id=1 ou o único existente).
 * Retorna null se ainda não houver análise salva.
 */
export async function getCommunityInsights(): Promise<CommunityInsights | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const rows = await db
      .select()
      .from(communityInsights)
      .orderBy(desc(communityInsights.updatedAt))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Salva (upsert) os insights da comunidade.
 * Mantém apenas 1 registro — atualiza o existente ou insere o primeiro.
 */
export async function saveCommunityInsights(data: {
  topicosQuentes: string[];
  tomGeral: string;
  sugestoesLinguagem: string[];
  totalDepoimentosAnalisados: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCommunityInsights();
  const payload = {
    topicosQuentes: JSON.stringify(data.topicosQuentes),
    tomGeral: data.tomGeral,
    sugestoesLinguagem: JSON.stringify(data.sugestoesLinguagem),
    totalDepoimentosAnalisados: data.totalDepoimentosAnalisados,
  };
  if (existing) {
    await db
      .update(communityInsights)
      .set(payload)
      .where(eq(communityInsights.id, existing.id));
  } else {
    await db.insert(communityInsights).values(payload);
  }
}

// ─── Parceiros Terreiros ──────────────────────────────────────────────────────

/** Número máximo de vagas para o plano Parceiro Fundador */
const MAX_VAGAS_FUNDADOR = 30;

/**
 * Conta quantos leads com plano Parceiro Fundador já foram cadastrados.
 * Retorna { total, restantes } para exibir o contador em tempo real.
 */
export async function contarVagasFundador(): Promise<{ total: number; restantes: number }> {
  try {
    const db = await getDb();
    if (!db) return { total: 0, restantes: MAX_VAGAS_FUNDADOR };
    const { count } = await import("drizzle-orm");
    const [row] = await db
      .select({ c: count() })
      .from(parceiroLeads)
      .where(sql`${parceiroLeads.plano} LIKE '%Fundador%'`);
    const total = row?.c ?? 0;
    return { total, restantes: Math.max(0, MAX_VAGAS_FUNDADOR - total) };
  } catch {
    return { total: 0, restantes: MAX_VAGAS_FUNDADOR };
  }
}

/**
 * Salva um novo lead de terreiro parceiro.
 * Retorna o id inserido.
 */
export async function criarParceiroLead(data: {
  nomeTerreiro: string;
  tradicao: string;
  estado: string;
  dirigente: string;
  whatsapp: string;
  email?: string;
  plano: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(parceiroLeads).values({
    nomeTerreiro: data.nomeTerreiro,
    tradicao: data.tradicao,
    estado: data.estado,
    dirigente: data.dirigente,
    whatsapp: data.whatsapp,
    email: data.email ?? null,
    plano: data.plano,
  });
  return result[0].insertId;
}

/**
 * Lista todos os leads de parceiros (para o painel admin).
 */
export async function listarParceiroLeads(): Promise<ParceiroLead[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(parceiroLeads)
      .orderBy(desc(parceiroLeads.createdAt));
  } catch {
    return [];
  }
}

// ─── Terreiros ────────────────────────────────────────────────────────────────

/**
 * Lista terreiros ativos com filtros opcionais de tradição, estado e busca por nome.
 * Terreiros pagos (ouro/diamante/prata) aparecem primeiro.
 */
export async function listarTerreiros(opts?: {
  tradicao?: string;
  estado?: string;
  busca?: string;
  limite?: number;
  pendentes?: boolean; // true = apenas não verificados (para painel admin)
}): Promise<Terreiro[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    // Modo pendentes: lista terreiros ativos mas ainda não verificados
    const conditions = opts?.pendentes
      ? [eq(terreiros.ativo, 1), eq(terreiros.isVerified, 0)]
      : [eq(terreiros.ativo, 1)];
    if (!opts?.pendentes) {
      if (opts?.tradicao && opts.tradicao !== "todas") {
        conditions.push(eq(terreiros.tradicao, opts.tradicao));
      }
      if (opts?.estado) {
        conditions.push(eq(terreiros.estado, opts.estado));
      }
      if (opts?.busca) {
        conditions.push(
          or(
            like(terreiros.nome, `%${opts.busca}%`),
            like(terreiros.cidade, `%${opts.busca}%`),
          )!
        );
      }
    }
    return db
      .select()
      .from(terreiros)
      .where(and(...conditions))
      .orderBy(
        opts?.pendentes ? terreiros.createdAt : sql`FIELD(${terreiros.plano}, 'diamante', 'ouro', 'prata', 'livre')`,
        terreiros.nome
      )
      .limit(opts?.limite ?? 100);
  } catch {
    return [];
  }
}

/**
 * Retorna um terreiro pelo ID.
 */
export async function getTerreiroById(id: number): Promise<Terreiro | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(terreiros).where(eq(terreiros.id, id)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Insere um novo terreiro no banco.
 */
export async function criarTerreiro(data: Omit<InsertTerreiro, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(terreiros).values(data);
  return result[0].insertId;
}

/**
 * Atualiza dados de um terreiro existente.
 */
export async function atualizarTerreiro(id: number, data: Partial<InsertTerreiro>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(terreiros).set({ ...data, updatedAt: new Date() }).where(eq(terreiros.id, id));
}

/**
 * Retorna o terreiro vinculado a um userId (zelador dono do terreiro).
 */
export async function getTerreiroByUserId(userId: number): Promise<Terreiro | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(terreiros).where(eq(terreiros.userId, userId)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Lista terreiros ordenados por proximidade usando fórmula de Haversine em SQL.
 * Terreiros com plano pago (ouro/diamante/prata) aparecem primeiro dentro do mesmo raio.
 * @param lat latitude do usuário
 * @param lng longitude do usuário
 * @param raioKm raio máximo em km (padrão 100km)
 */
export async function listarTerreirosProximos(
  lat: number,
  lng: number,
  raioKm = 100,
  limite = 50,
): Promise<(Terreiro & { distanciaKm: number })[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    // Haversine em SQL — funciona em MySQL sem extensões
    const distanciaExpr = sql<number>`
      6371 * 2 * ASIN(SQRT(
        POWER(SIN((RADIANS(CAST(${terreiros.latitude} AS DECIMAL(10,7))) - RADIANS(${lat})) / 2), 2) +
        COS(RADIANS(${lat})) * COS(RADIANS(CAST(${terreiros.latitude} AS DECIMAL(10,7)))) *
        POWER(SIN((RADIANS(CAST(${terreiros.longitude} AS DECIMAL(10,7))) - RADIANS(${lng})) / 2), 2)
      ))
    `;
    const rows = await db
      .select({
        id: terreiros.id,
        nome: terreiros.nome,
        tradicao: terreiros.tradicao,
        dirigente: terreiros.dirigente,
        descricao: terreiros.descricao,
        endereco: terreiros.endereco,
        cidade: terreiros.cidade,
        estado: terreiros.estado,
        whatsapp: terreiros.whatsapp,
        instagram: terreiros.instagram,
        latitude: terreiros.latitude,
        longitude: terreiros.longitude,
        telefone: terreiros.telefone,
        userId: terreiros.userId,
        isVerified: terreiros.isVerified,
        plano: terreiros.plano,
        ativo: terreiros.ativo,
        createdAt: terreiros.createdAt,
        updatedAt: terreiros.updatedAt,
        distanciaKm: distanciaExpr,
      })
      .from(terreiros)
      .where(
        and(
          eq(terreiros.ativo, 1),
          sql`${terreiros.latitude} IS NOT NULL AND ${terreiros.longitude} IS NOT NULL`,
          sql`${distanciaExpr} <= ${raioKm}`,
        )
      )
      .orderBy(
        // Planos pagos primeiro, depois por distância
        sql`FIELD(${terreiros.plano}, 'diamante', 'ouro', 'prata', 'livre')`,
        distanciaExpr,
      )
      .limit(limite);
    return rows as (Terreiro & { distanciaKm: number })[];
  } catch {
    return [];
  }
}

// ─── Analytics de Conversão ───────────────────────────────────────────────────────────────────────────────────

/**
 * Registra um evento de analytics no banco.
 * Silencia erros para não impactar o fluxo principal do app.
 */
export async function registrarEventoAnalytics(
  evento: string,
  userId?: number | null,
  propriedades?: Record<string, unknown>,
  plataforma?: string,
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(analyticsEvents).values({
      evento,
      userId: userId ?? null,
      propriedades: propriedades ? JSON.stringify(propriedades) : null,
      plataforma: plataforma ?? null,
    } as InsertAnalyticsEvent);
  } catch {
    // Silencia erros de analytics — nunca deve quebrar o fluxo principal
  }
}

/**
 * Taxa de conversão: paywall_viewed → premium_purchased.
 */
export async function getTaxaConversaoAnalytics(): Promise<{ visualizacoes: number; compras: number; taxa: string }> {
  try {
    const db = await getDb();
    if (!db) return { visualizacoes: 0, compras: 0, taxa: "0%" };
    const [views] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.evento, "paywall_viewed"));
    const [purchases] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.evento, "premium_purchased"));
    const v = Number(views?.total ?? 0);
    const p = Number(purchases?.total ?? 0);
    return {
      visualizacoes: v,
      compras: p,
      taxa: v > 0 ? `${((p / v) * 100).toFixed(1)}%` : "0%",
    };
  } catch {
    return { visualizacoes: 0, compras: 0, taxa: "0%" };
  }
}

// ─── Password Reset ──────────────────────────────────────────────────────────
export async function createPasswordResetToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // Invalida tokens anteriores do mesmo usuário
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.insert(passwordResetTokens).values({ userId, tokenHash, expiresAt });
}

export async function getPasswordResetToken(tokenHash: string): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;
  const [token] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);
  return token ?? null;
}

export async function markPasswordResetTokenUsed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
}

export async function updateEmailAuthPassword(userId: number, newHash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(emailAuth).set({ passwordHash: newHash }).where(eq(emailAuth.userId, userId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
