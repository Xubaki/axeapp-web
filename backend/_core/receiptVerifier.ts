/**
 * Verificação de Recibo Server-Side
 *
 * Valida compras in-app junto ao Google Play e App Store para prevenir
 * fraudes no status premium (replay attacks, recibos falsos).
 *
 * Google Play: usa googleapis (androidpublisher v3)
 * App Store: usa a API de verificação de recibo da Apple
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PlataformaCompra = "android" | "ios";

export interface ResultadoVerificacao {
  valido: boolean;
  plano: "mensal" | "anual" | "avulso" | null;
  dataExpiracao: Date | null;
  erro?: string;
}

// ─── Google Play ──────────────────────────────────────────────────────────────

// Bundle ID real do app (gerado pelo app.config.ts)
const GOOGLE_PACKAGE_NAME = "space.manus.axe.app.t20260312071817";

/**
 * Verifica um recibo de compra do Google Play.
 * Requer GOOGLE_PLAY_SERVICE_ACCOUNT_JSON no ambiente.
 */
export async function verificarRecebitoGooglePlay(
  sku: string,
  purchaseToken: string,
): Promise<ResultadoVerificacao> {
  const serviceAccountJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    console.warn("[ReceiptVerifier] GOOGLE_PLAY_SERVICE_ACCOUNT_JSON não configurado — pulando verificação Google Play");
    return { valido: true, plano: skuParaPlano(sku), dataExpiracao: calcularExpiracao(sku), erro: "verificacao_desabilitada" };
  }

  try {
    const { google } = await import("googleapis");
    const serviceAccount = JSON.parse(serviceAccountJson);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const androidPublisher = google.androidpublisher({ version: "v3", auth });
    const isAssinatura = sku.includes("mensal") || sku.includes("anual");

    if (isAssinatura) {
      // Verificar assinatura
      const response = await androidPublisher.purchases.subscriptions.get({
        packageName: GOOGLE_PACKAGE_NAME,
        subscriptionId: sku,
        token: purchaseToken,
      });

      const data = response.data;
      const expiryTimeMs = Number(data.expiryTimeMillis ?? 0);
      const dataExpiracao = expiryTimeMs ? new Date(expiryTimeMs) : null;
      const cancelado = data.cancelReason !== undefined && data.cancelReason !== null;
      const expirado = dataExpiracao ? dataExpiracao < new Date() : false;

      return {
        valido: !cancelado && !expirado,
        plano: skuParaPlano(sku),
        dataExpiracao,
      };
    } else {
      // Verificar compra avulsa
      const response = await androidPublisher.purchases.products.get({
        packageName: GOOGLE_PACKAGE_NAME,
        productId: sku,
        token: purchaseToken,
      });

      const data = response.data;
      // purchaseState: 0 = comprado, 1 = cancelado, 2 = pendente
      const valido = data.purchaseState === 0;

      return {
        valido,
        plano: "avulso",
        dataExpiracao: null,
      };
    }
  } catch (error) {
    console.error("[ReceiptVerifier] Erro ao verificar Google Play:", error);
    return {
      valido: false,
      plano: null,
      dataExpiracao: null,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// ─── App Store ────────────────────────────────────────────────────────────────

const APPLE_VERIFY_URL_PROD = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_VERIFY_URL_SANDBOX = "https://sandbox.itunes.apple.com/verifyReceipt";

/**
 * Verifica um recibo de compra da App Store.
 * Requer APPLE_SHARED_SECRET no ambiente.
 */
export async function verificarRecebitoAppStore(
  sku: string,
  receiptData: string,
): Promise<ResultadoVerificacao> {
  const sharedSecret = process.env.APPLE_SHARED_SECRET;

  if (!sharedSecret) {
    console.warn("[ReceiptVerifier] APPLE_SHARED_SECRET não configurado — pulando verificação App Store");
    return { valido: true, plano: skuParaPlano(sku), dataExpiracao: calcularExpiracao(sku), erro: "verificacao_desabilitada" };
  }

  const body = JSON.stringify({
    "receipt-data": receiptData,
    password: sharedSecret,
    "exclude-old-transactions": true,
  });

  try {
    // Tentar produção primeiro, depois sandbox
    let response = await fetch(APPLE_VERIFY_URL_PROD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    let data: any = await response.json();

    // Status 21007 = recibo de sandbox enviado para produção → tentar sandbox
    if (data.status === 21007) {
      response = await fetch(APPLE_VERIFY_URL_SANDBOX, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      data = await response.json();
    }

    // Status 0 = OK
    if (data.status !== 0) {
      return {
        valido: false,
        plano: null,
        dataExpiracao: null,
        erro: `Apple status ${data.status}`,
      };
    }

    const isAssinatura = sku.includes("mensal") || sku.includes("anual");

    if (isAssinatura) {
      // Verificar latest_receipt_info para assinaturas
      const latestInfo: any[] = data.latest_receipt_info ?? [];
      const transacaoDoSku = latestInfo
        .filter((t: any) => t.product_id === sku)
        .sort((a: any, b: any) => Number(b.expires_date_ms) - Number(a.expires_date_ms))[0];

      if (!transacaoDoSku) {
        return { valido: false, plano: null, dataExpiracao: null, erro: "SKU não encontrado no recibo" };
      }

      const expiryMs = Number(transacaoDoSku.expires_date_ms ?? 0);
      const dataExpiracao = expiryMs ? new Date(expiryMs) : null;
      const expirado = dataExpiracao ? dataExpiracao < new Date() : true;

      return {
        valido: !expirado,
        plano: skuParaPlano(sku),
        dataExpiracao,
      };
    } else {
      // Compra avulsa: verificar in_app
      const inApp: any[] = data.receipt?.in_app ?? [];
      const transacao = inApp.find((t: any) => t.product_id === sku);

      return {
        valido: !!transacao,
        plano: "avulso",
        dataExpiracao: null,
      };
    }
  } catch (error) {
    console.error("[ReceiptVerifier] Erro ao verificar App Store:", error);
    return {
      valido: false,
      plano: null,
      dataExpiracao: null,
      erro: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function skuParaPlano(sku: string): "mensal" | "anual" | "avulso" {
  if (sku.includes("mensal")) return "mensal";
  if (sku.includes("anual")) return "anual";
  return "avulso";
}

function calcularExpiracao(sku: string): Date | null {
  if (sku.includes("mensal")) return new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
  if (sku.includes("anual")) return new Date(Date.now() + 366 * 24 * 60 * 60 * 1000);
  return null;
}

/**
 * Ponto de entrada unificado para verificação de recibo.
 * Delega para Google Play ou App Store conforme a plataforma.
 */
export async function verificarRecibo(params: {
  plataforma: PlataformaCompra;
  sku: string;
  /** Google Play: purchaseToken | App Store: receiptData (base64) */
  token: string;
}): Promise<ResultadoVerificacao> {
  if (params.plataforma === "android") {
    return verificarRecebitoGooglePlay(params.sku, params.token);
  } else {
    return verificarRecebitoAppStore(params.sku, params.token);
  }
}
