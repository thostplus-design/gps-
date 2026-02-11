"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useAlerts } from "@/hooks/use-alerts";

export function AlertBell() {
  const { unreadCount } = useAlerts();

  return (
    <Link
      href="/alerts"
      className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
