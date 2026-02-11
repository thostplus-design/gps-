"use client";

import { useEffect, useState } from "react";
import GPSMap from "@/components/map/map-loader";
import { usePositions } from "@/hooks/use-positions";
import { Loader2, Car, Users, Package, MapPin, RefreshCw, Send, Crosshair, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = { VEHICLE: Car, PERSON: Users, ASSET: Package };
const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500",
  INACTIVE: "bg-gray-500",
  MAINTENANCE: "bg-yellow-500",
  LOST: "bg-red-500",
};

export default function MapPage() {
  const [initialDevices, setInitialDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [trackLat, setTrackLat] = useState("");
  const [trackLng, setTrackLng] = useState("");
  const [trackSerial, setTrackSerial] = useState("");
  const [trackDevices, setTrackDevices] = useState<any[]>([]);
  const [manualMarker, setManualMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [trackMsg, setTrackMsg] = useState("");
  const [geofences, setGeofences] = useState<any[]>([]);

  const devices = usePositions(initialDevices);

  useEffect(() => {
    Promise.all([
      fetch("/api/positions/latest").then((r) => r.json()),
      fetch("/api/devices").then((r) => r.json()),
      fetch("/api/geofences").then((r) => r.json()),
    ]).then(([posData, devData, geoData]) => {
      setInitialDevices(Array.isArray(posData) ? posData : []);
      setTrackDevices(Array.isArray(devData) ? devData : []);
      setGeofences(Array.isArray(geoData) ? geoData.filter((g: any) => g.isActive) : []);
      setLoading(false);
    });
  }, []);

  function refresh() {
    fetch("/api/positions/latest")
      .then((r) => r.json())
      .then((data) => setInitialDevices(Array.isArray(data) ? data : []));
  }

  function viewPosition() {
    const lat = parseFloat(trackLat);
    const lng = parseFloat(trackLng);
    if (isNaN(lat) || isNaN(lng)) return setTrackMsg("Coordonnees invalides");
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return setTrackMsg("Coordonnees hors limites");
    setManualMarker({ lat, lng });
    setTrackMsg(`Position affichee: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }

  async function sendPosition() {
    const lat = parseFloat(trackLat);
    const lng = parseFloat(trackLng);
    if (isNaN(lat) || isNaN(lng)) return setTrackMsg("Coordonnees invalides");
    if (!trackSerial) return setTrackMsg("Selectionnez un appareil");

    setSending(true);
    setTrackMsg("");
    try {
      const res = await fetch("/api/tracking/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialNumber: trackSerial, latitude: lat, longitude: lng, speed: 0 }),
      });
      if (res.ok) {
        setTrackMsg("Position envoyee avec succes !");
        setManualMarker({ lat, lng });
        refresh();
      } else {
        const err = await res.json();
        setTrackMsg(err.error || "Erreur envoi");
      }
    } catch {
      setTrackMsg("Erreur reseau");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Carte temps reel</h1>
          <p className="text-gray-400 text-sm mt-1">{devices.length} appareil(s) localise(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg" title="Rafraichir">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowTracking(!showTracking)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
              showTracking ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            )}
          >
            <Crosshair className="w-4 h-4" />
            <span className="hidden sm:inline">Tracking</span>
          </button>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="sm:hidden px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm"
          >
            {showPanel ? "Masquer" : "Liste"}
          </button>
        </div>
      </div>

      {showTracking && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-blue-400" />
            Tracking manuel - Saisir des coordonnees
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={trackLat}
                onChange={(e) => setTrackLat(e.target.value)}
                placeholder="Ex: 6.5244"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={trackLng}
                onChange={(e) => setTrackLng(e.target.value)}
                placeholder="Ex: 3.3792"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Appareil (optionnel)</label>
              <select
                value={trackSerial}
                onChange={(e) => setTrackSerial(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Aucun (voir seulement) --</option>
                {trackDevices.map((d: any) => (
                  <option key={d.id} value={d.serialNumber}>{d.name} ({d.serialNumber})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={viewPosition}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                <Eye className="w-4 h-4" /> Voir
              </button>
              <button
                onClick={sendPosition}
                disabled={sending || !trackSerial}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer
              </button>
            </div>
          </div>
          {trackMsg && (
            <p className={cn("text-xs mt-2", trackMsg.includes("succes") || trackMsg.includes("affichee") ? "text-green-400" : "text-red-400")}>
              {trackMsg}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <div className={cn(
          "w-72 shrink-0 bg-gray-900 border border-gray-800 rounded-xl overflow-y-auto",
          "hidden sm:block",
          showPanel && "!block fixed inset-x-4 bottom-4 top-40 z-20 w-auto sm:relative sm:inset-auto sm:w-72"
        )}>
          <div className="p-3 border-b border-gray-800 sticky top-0 bg-gray-900 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">{devices.length} appareil(s)</p>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Temps reel actif" />
          </div>
          {devices.length === 0 ? (
            <div className="p-4 text-center">
              <MapPin className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucun appareil localise</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {devices.map((d) => {
                const Icon = typeIcons[d.type] || MapPin;
                return (
                  <div key={d.id} className="p-3 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-white text-sm font-medium truncate">{d.name}</span>
                      <span className={cn("w-2 h-2 rounded-full shrink-0 ml-auto", statusColors[d.status])} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {d.position?.speed != null && <span>{d.position.speed} km/h</span>}
                      {d.batteryLevel != null && <span>{d.batteryLevel}%</span>}
                      {d.position?.timestamp && (
                        <span>{new Date(d.position.timestamp).toLocaleTimeString("fr-FR")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-gray-800">
          <GPSMap devices={devices} manualMarker={manualMarker} geofences={geofences} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
