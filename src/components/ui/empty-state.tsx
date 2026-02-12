import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, message, children, className }: EmptyStateProps) {
  return (
    <div className={cn("bg-gray-900 border border-gray-800 rounded-xl p-8 text-center", className)}>
      <Icon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
      <p className="text-gray-400 text-sm">{message}</p>
      {children}
    </div>
  );
}
