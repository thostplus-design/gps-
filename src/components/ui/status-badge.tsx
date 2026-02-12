import { cn } from "@/lib/utils";

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:    { bg: "bg-yellow-500/20",  text: "text-yellow-400",  label: "En attente" },
  ACCEPTED:   { bg: "bg-orange-500/20",  text: "text-orange-400",  label: "Acceptee" },
  PREPARING:  { bg: "bg-orange-500/20",  text: "text-orange-400",  label: "En preparation" },
  READY:      { bg: "bg-cyan-500/20",    text: "text-cyan-400",    label: "Prete" },
  PICKED_UP:  { bg: "bg-indigo-500/20",  text: "text-indigo-400",  label: "Recuperee" },
  DELIVERING: { bg: "bg-purple-500/20",  text: "text-purple-400",  label: "En livraison" },
  DELIVERED:  { bg: "bg-green-500/20",   text: "text-green-400",   label: "Livree" },
  CANCELLED:  { bg: "bg-red-500/20",     text: "text-red-400",     label: "Annulee" },
};

const paymentStyles: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:  { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "En attente" },
  PAID:     { bg: "bg-green-500/20",  text: "text-green-400",  label: "Paye" },
  FAILED:   { bg: "bg-red-500/20",    text: "text-red-400",    label: "Echoue" },
  REFUNDED: { bg: "bg-gray-500/20",   text: "text-gray-400",   label: "Rembourse" },
};

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment";
  className?: string;
}

export function StatusBadge({ status, type = "order", className }: StatusBadgeProps) {
  const styles = type === "payment" ? paymentStyles : statusStyles;
  const s = styles[status] || { bg: "bg-gray-500/20", text: "text-gray-400", label: status };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", s.bg, s.text, className)}>
      {s.label}
    </span>
  );
}
