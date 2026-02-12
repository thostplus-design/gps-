import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type ColorVariant = "orange" | "green" | "purple" | "yellow" | "cyan" | "red" | "amber";

const gradientColors: Record<ColorVariant, { bg: string; border: string; text: string; icon: string }> = {
  orange: { bg: "from-orange-600/20 to-orange-600/5", border: "border-orange-500/20", text: "text-orange-400/70", icon: "text-orange-400" },
  green:  { bg: "from-green-600/20 to-green-600/5",  border: "border-green-500/20",  text: "text-green-400/70",  icon: "text-green-400" },
  purple: { bg: "from-purple-600/20 to-purple-600/5", border: "border-purple-500/20", text: "text-purple-400/70", icon: "text-purple-400" },
  yellow: { bg: "from-yellow-600/20 to-yellow-600/5", border: "border-yellow-500/20", text: "text-yellow-400/70", icon: "text-yellow-400" },
  cyan:   { bg: "from-cyan-600/20 to-cyan-600/5",   border: "border-cyan-500/20",   text: "text-cyan-400/70",   icon: "text-cyan-400" },
  red:    { bg: "from-red-600/20 to-red-600/5",     border: "border-red-500/20",     text: "text-red-400/70",    icon: "text-red-400" },
  amber:  { bg: "from-amber-600/20 to-amber-600/5", border: "border-amber-500/20",   text: "text-amber-400/70",  icon: "text-amber-400" },
};

const badgeColors: Record<ColorVariant, string> = {
  orange: "bg-orange-500/10",
  green:  "bg-green-500/10",
  purple: "bg-purple-500/10",
  yellow: "bg-yellow-500/10",
  cyan:   "bg-cyan-500/10",
  red:    "bg-red-500/10",
  amber:  "bg-amber-500/10",
};

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sublabel?: string;
  color?: ColorVariant;
  className?: string;
}

export function StatCard({ icon: Icon, value, label, sublabel, color = "orange", className }: StatCardProps) {
  const c = gradientColors[color];
  return (
    <div className={cn("bg-gradient-to-br", c.bg, "border", c.border, "rounded-xl p-4", className)}>
      <Icon className={cn("w-5 h-5 mb-2", c.icon)} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className={cn("text-xs", c.text)}>{label}</p>
      {sublabel && <p className="text-[10px] text-gray-500 mt-0.5">{sublabel}</p>}
    </div>
  );
}

interface StatCardBadgeProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: ColorVariant;
  className?: string;
}

export function StatCardBadge({ icon: Icon, value, label, color = "orange", className }: StatCardBadgeProps) {
  const c = gradientColors[color];
  return (
    <div className={cn("bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3", className)}>
      <div className={cn("p-2.5 rounded-xl", badgeColors[color])}>
        <Icon className={cn("w-5 h-5", c.icon)} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

interface StatCardCenteredProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  color?: ColorVariant;
  className?: string;
}

export function StatCardCentered({ icon: Icon, value, label, color = "orange", className }: StatCardCenteredProps) {
  const c = gradientColors[color];
  return (
    <div className={cn("bg-gray-900 border border-gray-800 rounded-xl p-4 text-center", className)}>
      {Icon && <Icon className={cn("w-5 h-5 mx-auto mb-1", c.icon)} />}
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
