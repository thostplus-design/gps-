import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-gray-900 border border-gray-800 rounded-xl",
        hover && "hover:border-gray-700 transition-colors cursor-pointer",
        onClick && "hover:border-gray-700 transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function CardHeader({ children, className, border = true }: CardHeaderProps) {
  return (
    <div className={cn("px-4 py-3", border && "border-b border-gray-800", className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
