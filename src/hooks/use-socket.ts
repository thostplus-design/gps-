"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}
