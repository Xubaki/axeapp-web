/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para compatibilidade com Node.js tradicional (Hostinger)
  // Nota: standalone requer que todas as páginas sejam dinâmicas ou estáticas puras.
  // Para Hostinger, usamos o build padrão com server-side rendering.
  // output: "standalone",

  // Variáveis de ambiente públicas expostas ao browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.appaxe.com.br",
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

  // Webpack — evitar problemas com módulos server-only no cliente
  webpack: (config, { isServer }) => {
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

  // Excluir pasta backend do TypeScript check do Next.js
  transpilePackages: [],
};

module.exports = nextConfig;
