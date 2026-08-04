/**
 * Mesma API de produção do app mobile (axeapp-mobile/constants/production-defaults.js).
 * Hostinger: ideal setar NEXT_PUBLIC_API_URL no painel; hosts legados são remapeados.
 */
const PRODUCTION_API_BASE_URL = "https://axeapp-vdtapk2t.manus.space";

/** Backends antigos/errados que não devem ser usados pelo site. */
const STALE_API_HOSTNAMES = new Set([
  "axeapp-web-production.up.railway.app",
]);

/**
 * Resolve a URL base da API (= app).
 * Env vazio ou host legado → Manus.
 * @param {string | null | undefined} candidate
 * @returns {string}
 */
function resolveApiBaseUrl(candidate) {
  const fallback = PRODUCTION_API_BASE_URL;
  const raw = String(candidate ?? "")
    .trim()
    .replace(/\/+$/, "");

  if (!raw) return fallback;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return fallback;
    }
    if (STALE_API_HOSTNAMES.has(url.hostname)) {
      console.warn(
        `[axeapp] Ignoring stale API host "${url.hostname}"; using ${fallback}`
      );
      return fallback;
    }
    return `${url.protocol}//${url.host}`.replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

module.exports = {
  PRODUCTION_API_BASE_URL,
  STALE_API_HOSTNAMES,
  resolveApiBaseUrl,
};
