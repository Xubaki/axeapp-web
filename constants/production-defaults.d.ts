export const PRODUCTION_API_BASE_URL: string;
export const STALE_API_HOSTNAMES: Set<string>;
export function resolveApiBaseUrl(
  candidate?: string | null
): string;
