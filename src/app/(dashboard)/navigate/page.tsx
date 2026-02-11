"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navigation, MapPin, Clock, Ruler, RotateCcw, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigateMap = dynamic(() => import("@/components/map/navigate-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-xl">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  ),
});

export default function NavigatePage() {
  const [fromLat, setFromLat] = useState("");
  const [fromLng, setFromLng] = useState("");
  const [toLat, setToLat] = useState("");
  const [toLng, setToLng] = useState("");
  const [from, setFrom] = useState<[number, number] | null>(null);
  const [to, setTo] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ totalDistance: number; totalTime: number } | null>(null);
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/positions/latest")
      .then((r) => r.json())
      .then((data) => setDevices(Array.isArray(data) ? data : []));
  }, []);

  const handleRouteFound = useCallback((summary: { totalDistance: number; totalTime: number }) => {
    setRouteInfo(summary);
  }, []);

  function calculate() {
    const fLat = parseFloat(fromLat);
    const fLng = parseFloat(fromLng);
    const tLat = parseFloat(toLat);
    const tLng = parseFloat(toLng);
    if (isNaN(fLat) || isNaN(fLng) || isNaN(tLat) || isNaN(tLng)) return;
    setFrom([fLat, fLng]);
    setTo([tLat, tLng]);
    setRouteInfo(null);
  }

  function reset() {
    setFrom(null);
    setTo(null);
    setRouteInfo(null);
    setFromLat("");
    setFromLng("");
    setToLat("");
    setToLng("");
  }

  function useDevicePosition(target: "from" | "to", deviceId: string) {
    const device = devices.find((d: any) => d.id === deviceId);
    if (!device?.position) return;
    if (target === "from") {
      setFromLat(String(device.position.latitude));
      setFromLng(String(device.position.longitude));
    } else {
      setToLat(String(device.position.latitude));
      setToLng(String(device.position.longitude));
    }
  }

  function formatDistance(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  }

  function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    return `${m} min`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Navigation</h1>
        <p className="text-gray-400 text-sm mt-1">Calculer un itineraire entre deux points</p>
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-4">
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-green-400 font-medium mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" /> Point de depart (A)
              </label>
              {devices.length > 0 && (
                <select
                  onChange={(e) => { if (e.target.value) useDevicePosition("from", e.target.value); }}
                  className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs mb-2 focus:outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">-- Utiliser la position d un appareil --</option>
                  {devices.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  value={fromLat}
                  onChange={(e) => setFromLat(e.target.value)}
                  placeholder="Latitude"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  step="any"
                  value={fromLng}
                  onChange={(e) => setFromLng(e.target.value)}
                  placeholder="Longitude"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-red-400 font-medium mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" /> Destination (B)
              </label>
              {devices.length > 0 && (
                <select
                  onChange={(e) => { if (e.target.value) useDevicePosition("to", e.target.value); }}
                  className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs mb-2 focus:outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="">-- Utiliser la position d un appareil --</option>
                  {devices.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  value={toLat}
                  onChange={(e) => setToLat(e.target.value)}
                  placeholder="Latitude"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  step="any"
                  value={toLng}
                  onChange={(e) => setToLng(e.target.value)}
                  placeholder="Longitude"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={calculate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <Search className="w-4 h-4" /> Calculer
              </button>
              <button
                onClick={reset}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {routeInfo && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" /> Itineraire
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <Ruler className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-white font-semibold">{formatDistance(routeInfo.totalDistance)}</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white font-semibold">{formatDuration(routeInfo.totalTime)}</p>
                  <p className="text-xs text-gray-500">Duree estimee</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-[500px] lg:h-[calc(100vh-12rem)] rounded-xl overflow-hidden border border-gray-800">
          <NavigateMap from={from} to={to} onRouteFound={handleRouteFound} />
        </div>
      </div>
    </div>
  );
}
