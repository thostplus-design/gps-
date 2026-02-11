"use client";

import { useEffect, useState, useCallback } from "react";

interface AlertSummary {
  unreadCount: number;
}

export function useAlerts() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts?isRead=false");
      const data = await res.json();
      setUnreadCount(Array.isArray(data) ? data.length : 0);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { unreadCount, refresh };
}
