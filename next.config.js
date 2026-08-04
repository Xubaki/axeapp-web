const path = require("path");
const {
  resolveApiBaseUrl,
} = require("./constants/production-defaults.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para compatibilidade com Node.js tradicional (Hostinger)
  // Nota: standalone requer que todas as páginas sejam dinâmicas ou estáticas puras.
  // Para Hostinger, usamos o build padrão com server-side rendering.
  // output: "standalone",

  // Injeta no bundle (client + server) a mesma API do app mobile.
  // Hosts legados (ex.: Railway) são remapeados em resolveApiBaseUrl.
  env: {
    NEXT_PUBLIC_API_URL: resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  },

  // Otimização de imagens — desabilitado para hospedagem compartilhada
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Webpack — evitar problemas com módulos server-only no cliente.
  // Next 16 usa Turbopack por padrão; o build de produção na Hostinger
  // chama `next build --webpack` (ver package.json) por causa desta config.
  webpack: (config, { isServer }) => {
    // Garante alias @/ no build da Hostinger (webpack + SWC WASM)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Excluir pasta backend do bundle do Next.js
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /backend/,
    };
    return config;
  },

  // Silencia falso positivo se alguém rodar build sem --webpack
  turbopack: {},

  // Excluir pasta backend do TypeScript check do Next.js
  transpilePackages: [],
};

module.exports = nextConfig;
