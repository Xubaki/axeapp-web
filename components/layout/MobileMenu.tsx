"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, MapPin, Search, LogIn } from "lucide-react";

export function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden p-2 rounded-lg text-foreground hover:bg-gray-100 transition-colors"
        aria-label="Menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface absolute top-full left-0 right-0 z-50 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/terreiros"
              className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              <Search size={16} />
              Buscar Terreiros
            </Link>
            <Link
              href="/mapa"
              className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              <MapPin size={16} />
              Mapa Interativo
            </Link>
            <Link
              href="/sobre"
              className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              Sobre
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 border border-primary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <LogIn size={16} />
                Entrar
              </Link>
              <Link
                href="/#download"
                className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Baixar App
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
