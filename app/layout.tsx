import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AxéApp — Guia Espiritual de Umbanda e Candomblé",
    template: "%s | AxéApp",
  },
  description:
    "Encontre terreiros de Umbanda e Candomblé perto de você. Guia espiritual completo com mapa interativo, informações sobre as tradições do Axé e comunidade.",
  keywords: [
    "umbanda",
    "candomblé",
    "terreiro",
    "orixás",
    "espiritismo",
    "tradições do axé",
    "axé",
    "guia espiritual",
  ],
  authors: [{ name: "AxéApp" }],
  creator: "AxéApp",
  publisher: "AxéApp",
  metadataBase: new URL("https://appaxe.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://appaxe.com.br",
    siteName: "AxéApp",
    title: "AxéApp — Guia Espiritual de Umbanda e Candomblé",
    description:
      "Encontre terreiros, aprenda sobre as tradições do Axé e conecte-se com a comunidade espiritual.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AxéApp — Guia Espiritual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AxéApp — Guia Espiritual de Umbanda e Candomblé",
    description:
      "Encontre terreiros, aprenda sobre as tradições do Axé e conecte-se com a comunidade espiritual.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "4QhBZ1VxoeR0Y-usF5uS6oZGnkpYXjvJKgkN5JY73c0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
