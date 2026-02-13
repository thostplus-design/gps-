"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingCountdownProps {
  cookAcceptedAt: string;
  cookingTimeMin: number;
}

export function CookingCountdown({ cookAcceptedAt, cookingTimeMin }: CookingCountdownProps) {
  const [remaining, setRemaining] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalMs = cookingTimeMin * 60 * 1000;
    const update = () => {
      const elapsed = Date.now() - new Date(cookAcceptedAt).getTime();
      const rem = Math.max(0, totalMs - elapsed);
      setRemaining(Math.ceil(rem / 1000));
      setProgress(Math.min(100, (elapsed / totalMs) * 100));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [cookAcceptedAt, cookingTimeMin]);

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  const isOverdue = remaining === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={cn("w-4 h-4", isOverdue ? "text-red-400" : "text-orange-400")} />
          <span className={cn("text-sm font-semibold", isOverdue ? "text-red-400" : "text-white")}>
            {isOverdue ? "Temps ecoule !" : `${min}:${sec.toString().padStart(2, "0")}`}
          </span>
        </div>
        <span className="text-xs text-gray-500">{cookingTimeMin} min prevues</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-1000",
            isOverdue ? "bg-red-500" : progress > 75 ? "bg-yellow-500" : "bg-orange-500"
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
