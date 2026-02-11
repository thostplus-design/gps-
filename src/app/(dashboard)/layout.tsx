"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { open, toggle, close } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar open={open} onClose={close} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuToggle={toggle} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <LayoutInner>{children}</LayoutInner>
      </SidebarProvider>
    </SessionProvider>
  );
}
