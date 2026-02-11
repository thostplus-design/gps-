"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, User } from "lucide-react";
import { AlertBell } from "./alert-bell";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-14 sm:h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
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
  );
}
