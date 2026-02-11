"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, User, Map, Settings, X } from "lucide-react";
import { AlertBell } from "./alert-bell";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const mobileMenuItems = [
    { label: "Carte", href: "/map", icon: Map },
    { label: "Profil", href: "/settings", icon: User },
  ];

  return (
    <>
      <header className="h-14 sm:h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle - uniquement desktop */}
          <button
            onClick={onMenuToggle}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg hidden lg:block"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mini menu mobile (Carte + Profil) */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg lg:hidden"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm text-gray-400">Bienvenue,</h2>
            <p className="text-white font-medium text-sm">{session?.user?.name || "Utilisateur"}</p>
          </div>
          <p className="text-white font-medium text-sm sm:hidden">{session?.user?.name || "Utilisateur"}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <AlertBell />
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-800">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              title="Deconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown mobile: Carte + Profil */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute top-14 left-2 z-50 bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-xl lg:hidden min-w-[140px]">
            {mobileMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-600/20 text-blue-400" : "text-gray-400 active:bg-gray-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
