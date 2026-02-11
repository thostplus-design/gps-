"use client";

import { Circle, Polygon, Popup } from "react-leaflet";

interface GeofenceData {
  id: string;
  name: string;
  type: "CIRCLE" | "POLYGON";
  centerLat: number | null;
  centerLng: number | null;
  radiusMeters: number | null;
  coordinates: number[][] | null;
  color: string;
  isActive: boolean;
}

interface Props {
  geofences: GeofenceData[];
}

export default function GeofenceLayer({ geofences }: Props) {
  return (
    <>
      {geofences.map((g) => {
        if (g.type === "CIRCLE" && g.centerLat && g.centerLng && g.radiusMeters) {
          return (
            <Circle
              key={g.id}
              center={[g.centerLat, g.centerLng]}
              radius={g.radiusMeters}
              pathOptions={{
                color: g.color,
                fillColor: g.color,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: g.isActive ? undefined : "5,5",
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{g.name}</p>
                  <p className="text-gray-500">Rayon: {g.radiusMeters}m</p>
                </div>
              </Popup>
            </Circle>
          );
        }
        if (g.type === "POLYGON" && g.coordinates && g.coordinates.length >= 3) {
          const positions = g.coordinates.map((c: number[]) => [c[0], c[1]] as [number, number]);
          return (
            <Polygon
              key={g.id}
              positions={positions}
              pathOptions={{
                color: g.color,
                fillColor: g.color,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: g.isActive ? undefined : "5,5",
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{g.name}</p>
                  <p className="text-gray-500">{g.coordinates.length} points</p>
                </div>
              </Popup>
            </Polygon>
          );
        }
        return null;
      })}
    </>
  );
}
