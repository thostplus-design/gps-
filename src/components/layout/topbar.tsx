"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Menu, User, Settings } from "lucide-react";
import { AlertBell } from "./alert-bell";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <header className="h-14 sm:h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle - uniquement desktop */}
        <button
          onClick={onMenuToggle}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg hidden lg:block"
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

        {/* Avatar avec dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
              {/* Info utilisateur */}
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || "Utilisateur"}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || ""}</p>
              </div>

              {/* Liens */}
              <div className="p-1">
                <Link
                  href="/settings"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Deconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
