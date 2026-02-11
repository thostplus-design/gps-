"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Car, Users, Package, MapPin, Navigation, Shield, Bell,
  Activity, Gauge, Route, Clock, Zap, TrendingUp, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-400">Erreur de chargement des statistiques</p>;
  }

  const cards = [
    { label: "Appareils", value: stats.devices.total, sub: `${stats.devices.active} actif(s)`, icon: MapPin, color: "text-blue-400", bg: "bg-blue-500/10", href: "/devices" },
    { label: "Vehicules", value: stats.devices.byType?.find((d: any) => d.type === "VEHICLE")?._count || 0, icon: Car, color: "text-cyan-400", bg: "bg-cyan-500/10", href: "/vehicles" },
    { label: "Personnes", value: stats.devices.byType?.find((d: any) => d.type === "PERSON")?._count || 0, icon: Users, color: "text-green-400", bg: "bg-green-500/10", href: "/persons" },
    { label: "Assets", value: stats.devices.byType?.find((d: any) => d.type === "ASSET")?._count || 0, icon: Package, color: "text-yellow-400", bg: "bg-yellow-500/10", href: "/assets" },
    { label: "Trajets", value: stats.trips.total, sub: `${stats.trips.active} en cours`, icon: Route, color: "text-purple-400", bg: "bg-purple-500/10", href: "/trips" },
    { label: "Geofences", value: stats.geofences.active, sub: "actives", icon: Shield, color: "text-indigo-400", bg: "bg-indigo-500/10", href: "/geofences" },
    { label: "Alertes", value: stats.alerts.unread, sub: `sur ${stats.alerts.total} total`, icon: Bell, color: "text-red-400", bg: "bg-red-500/10", href: "/alerts" },
    { label: "Positions GPS", value: stats.positions.total.toLocaleString("fr-FR"), icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", href: "/map" },
  ];

  const tripStats = [
    { label: "Distance totale", value: `${stats.trips.totalDistanceKm} km`, icon: Gauge, color: "text-blue-400" },
    { label: "Duree totale", value: `${Math.round(stats.trips.totalDurationMin / 60)}h ${stats.trips.totalDurationMin % 60}min`, icon: Clock, color: "text-green-400" },
    { label: "Vitesse moyenne", value: `${stats.trips.avgSpeed} km/h`, icon: TrendingUp, color: "text-yellow-400" },
    { label: "Vitesse max", value: `${stats.trips.maxSpeed} km/h`, icon: Zap, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Vue d ensemble de votre flotte</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-2 rounded-lg", card.bg)}>
                  <Icon className={cn("w-4 h-4", card.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              {card.sub && <p className="text-xs text-gray-600">{card.sub}</p>}
            </Link>
          );
        })}
      </div>

      {/* Stats trajets */}
      {stats.trips.completed > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Statistiques trajets</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tripStats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <Icon className={cn("w-5 h-5 mb-2", s.color)} />
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Derniers trajets */}
      {stats.trips.recent?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Derniers trajets</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3 text-gray-400 font-medium">Appareil</th>
                    <th className="text-left p-3 text-gray-400 font-medium hidden sm:table-cell">Statut</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Distance</th>
                    <th className="text-left p-3 text-gray-400 font-medium hidden md:table-cell">Duree</th>
                    <th className="text-left p-3 text-gray-400 font-medium hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.trips.recent.map((trip: any) => (
                    <tr key={trip.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="p-3">
                        <Link href={`/trips/${trip.id}`} className="text-white hover:text-blue-400 transition-colors">
                          {trip.device?.name || "—"}
                        </Link>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          trip.status === "IN_PROGRESS" ? "bg-green-500/20 text-green-400" :
                          trip.status === "COMPLETED" ? "bg-blue-500/20 text-blue-400" :
                          "bg-gray-700 text-gray-400"
                        )}>
                          {trip.status === "IN_PROGRESS" ? "En cours" : trip.status === "COMPLETED" ? "Termine" : "Annule"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">{trip.distanceKm} km</td>
                      <td className="p-3 text-gray-300 hidden md:table-cell">{trip.durationMinutes} min</td>
                      <td className="p-3 text-gray-500 hidden lg:table-cell">
                        {new Date(trip.startTime).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
