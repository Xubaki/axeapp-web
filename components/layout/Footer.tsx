import Link from "next/link";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-foreground text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-serif font-bold text-xl mb-3">
              <Image src="/logo.png" alt="AxéApp" width={28} height={28} className="rounded-md" />
              <span>AxéApp</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Guia espiritual completo de Umbanda e Candomblé. Conectando
              pessoas às tradições afro-brasileiras com respeito e
              autenticidade.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🍎 App Store
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🤖 Google Play
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Explorar
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terreiros" className="hover:text-white transition-colors">
                  Buscar Terreiros
                </Link>
              </li>
              <li>
                <Link href="/mapa" className="hover:text-white transition-colors">
                  Mapa Interativo
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Sobre o AxéApp
                </Link>
              </li>
              <li>
                <a
                  href="https://appaxe.com.br/parceiros"
                  className="hover:text-white transition-colors"
                >
                  Terreiro Parceiro
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AxéApp. Todos os direitos reservados.</p>
          <p className="text-xs">
            Feito com ❤️ para a comunidade afro-brasileira
          </p>
        </div>
      </div>
    </footer>
  );
}
