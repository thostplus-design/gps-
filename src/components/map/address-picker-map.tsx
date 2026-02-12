"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressPickerMapProps {
  onSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  className?: string;
}

// Composant carte interne (chargé dynamiquement pour éviter SSR)
function MapInner({ onSelect, initialLat, initialLng, className }: AddressPickerMapProps) {
  const { MapContainer, TileLayer, Marker, useMapEvents, useMap } = require("react-leaflet");
  const L = require("leaflet");

  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<any>(null);

  // Icone personnalisée
  const icon = L.divIcon({
    className: "custom-marker",
    html: `<div style="width:32px;height:32px;background:#ea580c;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Reverse geocoding Nominatim
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);
      onSelect(lat, lng, addr);
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);
      onSelect(lat, lng, addr);
    }
  }, [onSelect]);

  // Recherche de lieu
  const searchPlace = useCallback(async (query: string) => {
    if (!query.trim()) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
    setSearching(false);
  }, []);

  // Debounce search
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlace(value), 300);
  }, [searchPlace]);

  // Click on map
  function MapClickHandler() {
    useMapEvents({
      click(e: any) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
      },
    });
    return null;
  }

  // Fly to when position changes
  function FlyTo() {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.flyTo(position, 16, { duration: 0.5 });
      }
      mapRef.current = map;
    }, [map, position]);
    return null;
  }

  // Ma position
  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Sélectionner une suggestion
  function selectSuggestion(item: any) {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setPosition([lat, lng]);
    setAddress(item.display_name);
    setSearchQuery("");
    setSuggestions([]);
    onSelect(lat, lng, item.display_name);
  }

  // Centre par défaut (Cotonou, Bénin)
  const defaultCenter: [number, number] = [6.3703, 2.3912];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder="Rechercher une adresse..."
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setSuggestions([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        {searching && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 animate-spin z-10" />
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
            {suggestions.map((item: any, idx: number) => (
              <button key={idx} onClick={() => selectSuggestion(item)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-start gap-2 border-b border-gray-800 last:border-0">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="relative rounded-xl overflow-hidden border border-gray-700" style={{ height: "250px" }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 16 : 13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapClickHandler />
          <FlyTo />
          {position && <Marker position={position} icon={icon} />}
        </MapContainer>

        {/* Bouton Ma position */}
        <button onClick={locateMe} disabled={locating}
          className="absolute bottom-3 right-3 z-[400] p-2.5 bg-gray-900/90 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-colors shadow-lg"
          title="Ma position">
          {locating ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
          ) : (
            <Navigation className="w-4 h-4 text-orange-400" />
          )}
        </button>
      </div>

      {/* Adresse sélectionnée */}
      {address && (
        <div className="flex items-start gap-2 px-3 py-2 bg-orange-600/10 border border-orange-500/20 rounded-lg">
          <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-300 leading-relaxed">{address}</p>
        </div>
      )}
    </div>
  );
}

// Export dynamique sans SSR
const AddressPickerMap = dynamic(() => Promise.resolve(MapInner), { ssr: false });
export default AddressPickerMap;
