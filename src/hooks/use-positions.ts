"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./use-socket";

interface PositionUpdate {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  batteryLevel: number | null;
  timestamp: string;
}

export function usePositions(initialDevices: any[]) {
  const [devices, setDevices] = useState<any[]>(initialDevices);
  const socketRef = useSocket();

  useEffect(() => {
    setDevices(initialDevices);
  }, [initialDevices]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("subscribe:all");

    const handleUpdate = (data: PositionUpdate) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === data.deviceId
            ? {
                ...d,
                status: "ACTIVE",
                batteryLevel: data.batteryLevel ?? d.batteryLevel,
                position: {
                  latitude: data.latitude,
                  longitude: data.longitude,
                  speed: data.speed,
                  heading: data.heading,
                  timestamp: data.timestamp,
                },
              }
            : d
        )
      );
    };

    socket.on("position:update", handleUpdate);
    return () => {
      socket.off("position:update", handleUpdate);
    };
  }, [socketRef]);

  return devices;
}
