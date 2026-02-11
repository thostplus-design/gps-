"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Loader2, CheckCircle, Truck, MapPin, Clock, User, Package, Navigation, Ruler, Gauge, Wifi, Bell,
} from "lucide-react";
import { useDeliverySocket } from "@/hooks/use-delivery-socket";

const DriverMap = dynamic(() => import("@/components/map/delivery-track-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-xl"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>,
});

function fmt(m: number) { return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`; }
function fmtTime(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h${m}min` : `${m} min`; }

export default function DriverPage() {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [speed, setSpeed] = useState(0);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeTime, setRouteTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const watchRef = useRef<number | null>(null);
  const sendRef = useRef<any>(null);
  const deliveryIdRef = useRef<string | null>(null);
  const myPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const speedRef = useRef(0);
  const routeThrottle = useRef<any>(null);

  // Socket.IO: recevoir nouvelles commandes en temps reel
  useDeliverySocket({
    asDriver: true,
    onNewOrder: useCallback((data: any) => {
      // Ajouter la commande a la liste
      setPendingOrders((prev) => {
        if (prev.find((o) => o.id === data.id)) return prev;
        return [{ ...data, client: { name: data.clientName } }, ...prev];
      });
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 5000);
    }, []),
  });

  useEffect(() => {
    loadData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMyPos(p);
          myPosRef.current = p;
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  async function loadData() {
    const [pending, orders] = await Promise.all([
      fetch("/api/orders/pending").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]);
    setPendingOrders(Array.isArray(pending) ? pending : []);
    setMyDeliveries(Array.isArray(orders) ? orders.filter((o: any) => o.delivery) : []);

    const active = (Array.isArray(orders) ? orders : []).find((o: any) =>
      o.delivery && ["PICKING_UP", "DELIVERING"].includes(o.delivery.status)
    );
    if (active) {
      setActiveDelivery(active);
      deliveryIdRef.current = active.delivery.id;
      if (active.delivery.startTime) setStartTime(new Date(active.delivery.startTime));
    }
    setLoading(false);
  }

  const calcRoute = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    if (routeThrottle.current) clearTimeout(routeThrottle.current);
    routeThrottle.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`
        );
        const data = await res.json();
        if (data.routes?.[0]) {
          setRouteDistance(data.routes[0].distance);
          setRouteTime(data.routes[0].duration);
        }
      } catch {}
    }, 5000);
  }, []);

  async function acceptOrder(orderId: string) {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      await loadData();
      startTracking();
    }
  }

  function startTracking() {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(p);
        myPosRef.current = p;
        const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
        setSpeed(spd);
        speedRef.current = spd;
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000 }
    );

    sendRef.current = setInterval(async () => {
      const dId = deliveryIdRef.current;
      const pos = myPosRef.current;
      if (!dId || !pos) return;
      await fetch(`/api/deliveries/${dId}/position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: pos.lat, longitude: pos.lng, speed: speedRef.current }),
      });
    }, 5000);
  }

  function stopTracking() {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (sendRef.current) { clearInterval(sendRef.current); sendRef.current = null; }
  }

  useEffect(() => {
    if (!myPos || !activeDelivery) return;
    calcRoute(myPos, { lat: activeDelivery.deliveryLat, lng: activeDelivery.deliveryLng });
  }, [myPos?.lat, myPos?.lng, activeDelivery?.id]);

  async function updateStatus(deliveryId: string, status: string) {
    const estMin = routeTime ? Math.round(routeTime / 60) : undefined;
    await fetch(`/api/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        currentLat: myPos?.lat,
        currentLng: myPos?.lng,
        estimatedMinutes: status === "DELIVERING" ? estMin : undefined,
      }),
    });
    if (status === "DELIVERED") {
      stopTracking();
      setActiveDelivery(null);
      deliveryIdRef.current = null;
      setRouteDistance(null);
      setRouteTime(null);
      setStartTime(null);
    }
    loadData();
  }

  useEffect(() => {
    if (activeDelivery?.delivery) {
      deliveryIdRef.current = activeDelivery.delivery.id;
      startTracking();
    }
    return stopTracking;
  }, [activeDelivery?.delivery?.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  if (activeDelivery) {
    const elapsed = startTime ? Math.round((Date.now() - startTime.getTime()) / 60000) : 0;

    return (
      <div className="space-y-3">
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {activeDelivery.delivery?.status === "PICKING_UP" ? "Recuperation en cours" : "En route vers le client"}
            </p>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Depart il y a {elapsed} min
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{activeDelivery.client?.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {activeDelivery.deliveryAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-900/50 rounded-lg p-2 text-center">
              <Gauge className="w-4 h-4 text-blue-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{speed}</p>
              <p className="text-[10px] text-gray-500">km/h</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2 text-center">
              <Ruler className="w-4 h-4 text-green-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{routeDistance ? fmt(routeDistance) : "--"}</p>
              <p className="text-[10px] text-gray-500">distance</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-2 text-center">
              <Clock className="w-4 h-4 text-purple-400 mx-auto mb-0.5" />
              <p className="text-lg font-bold text-white">{routeTime ? fmtTime(routeTime) : "--"}</p>
              <p className="text-[10px] text-gray-500">restant</p>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            {activeDelivery.items?.map((i: any) => (
              <span key={i.id} className="mr-2">{i.quantity}x {i.product?.name}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-800" style={{ height: "45vh" }}>
          <DriverMap
            driverPos={myPos}
            clientPos={{ lat: activeDelivery.deliveryLat, lng: activeDelivery.deliveryLng }}
            positions={activeDelivery.delivery?.positions || []}
          />
        </div>

        <div className="flex gap-2">
          {activeDelivery.delivery?.status === "PICKING_UP" && (
            <button onClick={() => updateStatus(activeDelivery.delivery.id, "DELIVERING")}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" /> Commande recuperee - En route
            </button>
          )}
          {activeDelivery.delivery?.status === "DELIVERING" && (
            <button onClick={() => updateStatus(activeDelivery.delivery.id, "DELIVERED")}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Marquer comme livree
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Espace Livreur</h1>
          <p className="text-gray-400 text-sm mt-1">Gerez vos livraisons</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600/20 rounded-full">
          <Wifi className="w-3 h-3 text-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">Connecte</span>
        </div>
      </div>

      {/* Alerte nouvelle commande */}
      {newOrderAlert && (
        <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-3 flex items-center gap-3 animate-pulse">
          <Bell className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-400 font-medium">Nouvelle commande disponible !</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Commandes disponibles
          {pendingOrders.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">{pendingOrders.length}</span>
          )}
        </h2>
        {pendingOrders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Package className="w-10 h-10 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucune commande en attente</p>
            <p className="text-gray-600 text-xs mt-1">Les nouvelles commandes apparaitront automatiquement</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-white">{order.client?.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.deliveryAddress}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{order.totalAmount?.toLocaleString()} FCFA</span>
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {order.items?.map((i: any) => <span key={i.id || i.productId} className="mr-2">{i.quantity}x {i.product?.name || i.name}</span>)}
                </div>
                <button onClick={() => acceptOrder(order.id)}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Accepter la livraison
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {myDeliveries.filter((o) => o.delivery?.status === "DELIVERED").length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Historique</h2>
          <div className="space-y-2">
            {myDeliveries.filter((o) => o.delivery?.status === "DELIVERED").map((order) => (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{order.client?.name}</p>
                  <p className="text-xs text-gray-500">{new Date(order.delivery?.endTime || order.updatedAt).toLocaleString("fr-FR")}</p>
                </div>
                <span className="text-sm font-semibold text-green-400">{order.totalAmount?.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
