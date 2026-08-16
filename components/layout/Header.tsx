// Server Component — sem "use client"
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { DONATE_URL } from "@/lib/donate";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo — v1 colorido (guia) */}
          <Link
            href="/"
            className="flex items-center gap-2 font-serif font-bold text-xl text-primary"
          >
            <Image src="/logo.png" alt="AxéApp" width={32} height={32} className="rounded-md" />
            <span>AxéApp</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/terreiros"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <Search size={16} />
              Buscar Terreiros
            </Link>
            <Link
              href="/mapa"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <MapPin size={16} />
              Mapa
            </Link>
            <Link
              href="/sobre"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Sobre
            </Link>
            <a
              href="/#doar"
              className="text-sm font-bold text-amber-800 hover:text-amber-950 transition-colors"
            >
              Apoiar
            </a>
          </nav>

          {/* CTA Desktop — Entrar oculto do público (admin: /login direto) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border-2 border-amber-500 bg-amber-400 text-amber-950 px-3 py-2 rounded-lg text-sm font-bold hover:bg-amber-500 transition-colors"
            >
              ☕ Doar
            </a>
            <Link
              href="/#download"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Baixar App
            </Link>
          </div>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
