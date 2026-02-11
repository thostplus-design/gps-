"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface Props {
  from: [number, number] | null;
  to: [number, number] | null;
  onRouteFound?: (summary: { totalDistance: number; totalTime: number }) => void;
}

export default function RoutingControl({ from, to, onRouteFound }: Props) {
  const map = useMap();
  const routingRef = useRef<any>(null);

  useEffect(() => {
    if (!from || !to) {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
        routingRef.current = null;
      }
      return;
    }

    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    const control = (L as any).Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: true,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: (i: number, wp: any) => {
        const colors = ["#10B981", "#EF4444"];
        const labels = ["A", "B"];
        return L.marker(wp.latLng, {
          icon: L.divIcon({
            className: "custom-marker",
            html: `<div style="background:${colors[i]};width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">${labels[i]}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        });
      },
      lineOptions: {
        styles: [{ color: "#3B82F6", weight: 5, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
    });

    control.on("routesfound", (e: any) => {
      const route = e.routes[0];
      if (onRouteFound) {
        onRouteFound({
          totalDistance: route.summary.totalDistance,
          totalTime: route.summary.totalTime,
        });
      }
    });

    control.addTo(map);
    routingRef.current = control;

    return () => {
      if (routingRef.current) {
        try { map.removeControl(routingRef.current); } catch {}
        routingRef.current = null;
      }
    };
  }, [from, to, map, onRouteFound]);

  return null;
}
