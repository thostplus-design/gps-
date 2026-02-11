"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import RoutingControl from "./routing-control";

interface Props {
  from: [number, number] | null;
  to: [number, number] | null;
  onRouteFound?: (summary: { totalDistance: number; totalTime: number }) => void;
}

export default function NavigateMap({ from, to, onRouteFound }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <MapContainer center={[6.5244, 3.3792]} zoom={12} className="h-full w-full" style={{ minHeight: "400px" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RoutingControl from={from} to={to} onRouteFound={onRouteFound} />
    </MapContainer>
  );
}
