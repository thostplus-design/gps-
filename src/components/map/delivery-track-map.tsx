"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const driverIcon = L.divIcon({
  className: "driver-marker",
  html: `<div style="position:relative;"><div style="width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,0.15);position:absolute;top:-10px;left:-10px;animation:dp 1.5s infinite;"></div><div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:2;"></div></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const clientIcon = L.divIcon({
  className: "client-marker",
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#10B981;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;border-radius:50%;background:white;transform:rotate(45deg);"></div></div>`,
  iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30],
});

const css = `@keyframes dp{0%{transform:scale(.5);opacity:1}100%{transform:scale(1.8);opacity:0}}`;

function FitAll({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [points, map]);
  return null;
}

interface Props {
  driverPos: { lat: number; lng: number } | null;
  clientPos: { lat: number; lng: number };
  positions: { latitude: number; longitude: number; timestamp: string }[];
}

export default function DeliveryTrackMap({ driverPos, clientPos, positions }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const center: [number, number] = driverPos ? [driverPos.lat, driverPos.lng] : [clientPos.lat, clientPos.lng];
  const trail: [number, number][] = positions.map((p) => [p.latitude, p.longitude]);
  const fitPoints: [number, number][] = [[clientPos.lat, clientPos.lng]];
  if (driverPos) fitPoints.push([driverPos.lat, driverPos.lng]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <MapContainer center={center} zoom={14} className="h-full w-full" zoomControl={false}>
        <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitAll points={fitPoints} />

        {/* Trace du livreur */}
        {trail.length >= 2 && <Polyline positions={trail} pathOptions={{ color: "#3B82F6", weight: 3, opacity: 0.6, dashArray: "6,4" }} />}

        {/* Livreur */}
        {driverPos && (
          <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon}>
            <Popup><div className="text-sm"><p className="font-semibold text-blue-600">Livreur</p><p className="text-xs text-gray-500">{driverPos.lat.toFixed(5)}, {driverPos.lng.toFixed(5)}</p></div></Popup>
          </Marker>
        )}

        {/* Client */}
        <Marker position={[clientPos.lat, clientPos.lng]} icon={clientIcon}>
          <Popup><div className="text-sm"><p className="font-semibold text-green-600">Votre position</p></div></Popup>
        </Marker>
      </MapContainer>
    </>
  );
}
