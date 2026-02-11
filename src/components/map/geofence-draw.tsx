"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Circle, Polygon, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const centerIcon = L.divIcon({
  className: "custom-marker",
  html: '<div style="background:#3B82F6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const pointIcon = L.divIcon({
  className: "custom-marker",
  html: '<div style="background:#EF4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

interface Props {
  type: "CIRCLE" | "POLYGON";
  color: string;
  radiusMeters: number;
  onCircleChange: (lat: number, lng: number, radius: number) => void;
  onPolygonChange: (coords: number[][]) => void;
}

function MapClickHandler({
  type,
  onCircleClick,
  onPolygonClick,
}: {
  type: string;
  onCircleClick: (lat: number, lng: number) => void;
  onPolygonClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (type === "CIRCLE") {
        onCircleClick(e.latlng.lat, e.latlng.lng);
      } else {
        onPolygonClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function GeofenceDrawMap({ type, color, radiusMeters, onCircleChange, onPolygonChange }: Props) {
  const [mounted, setMounted] = useState(false);
  const [circleCenter, setCircleCenter] = useState<[number, number] | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const prevType = useRef(type);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (prevType.current !== type) {
      setCircleCenter(null);
      setPolygonPoints([]);
      prevType.current = type;
    }
  }, [type]);

  useEffect(() => {
    if (circleCenter) {
      onCircleChange(circleCenter[0], circleCenter[1], radiusMeters);
    }
  }, [circleCenter, radiusMeters, onCircleChange]);

  useEffect(() => {
    onPolygonChange(polygonPoints.map(([lat, lng]) => [lat, lng]));
  }, [polygonPoints, onPolygonChange]);

  if (!mounted) return null;

  return (
    <MapContainer center={[6.5244, 3.3792]} zoom={12} className="h-full w-full" style={{ minHeight: "400px" }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler
        type={type}
        onCircleClick={(lat, lng) => setCircleCenter([lat, lng])}
        onPolygonClick={(lat, lng) => setPolygonPoints((prev) => [...prev, [lat, lng]])}
      />
      {type === "CIRCLE" && circleCenter && (
        <>
          <Circle
            center={circleCenter}
            radius={radiusMeters}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
          />
          <Marker position={circleCenter} icon={centerIcon} />
        </>
      )}
      {type === "POLYGON" && polygonPoints.length > 0 && (
        <>
          {polygonPoints.length >= 3 && (
            <Polygon
              positions={polygonPoints}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
            />
          )}
          {polygonPoints.map((p, i) => (
            <Marker key={i} position={p} icon={pointIcon} />
          ))}
        </>
      )}
    </MapContainer>
  );
}
