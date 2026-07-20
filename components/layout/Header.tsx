// Server Component — sem "use client"
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { MapPin, Search, LogIn } from "lucide-react";

// MobileMenu é client-only (usa useState) — carregado apenas no browser
const MobileMenu = dynamic(
  () => import("./MobileMenu").then((m) => m.MobileMenu),
  { ssr: false }
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-serif font-bold text-xl text-amber-700"
          >
            <Image src="/logo.png" alt="AxéApp" width={32} height={32} className="rounded-md" />
            <span>AxéApp</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/terreiros"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors"
            >
              <Search size={16} />
              Buscar Terreiros
            </Link>
            <Link
              href="/mapa"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors"
            >
              <MapPin size={16} />
              Mapa
            </Link>
            <Link
              href="/sobre"
              className="text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors"
            >
              Sobre
            </Link>
          </nav>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 border border-amber-700 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
            >
              <LogIn size={16} />
              Entrar
            </Link>
            <Link
              href="/#download"
              className="bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors"
            >
              Baixar App
            </Link>
          </div>

          {/* Mobile menu (client-only, ssr:false) */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
