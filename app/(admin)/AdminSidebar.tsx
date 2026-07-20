"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MapPin, CheckSquare, LogOut, Users } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface Props {
  user: SessionUser;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/terreiros", label: "Terreiros", icon: MapPin },
  { href: "/admin/aprovacoes", label: "Aprovações", icon: CheckSquare },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
];

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-foreground text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-serif font-bold text-white">AxéApp</p>
            <p className="text-xs text-white/50">Painel Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : (pathname ?? "").startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name ?? "Admin"}
            </p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
