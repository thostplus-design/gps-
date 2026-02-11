"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Loader2, ShoppingBag, CheckCircle, Truck, MapPin, Navigation, ArrowRight,
  Clock, User, Phone, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DriverMap = dynamic(() => import("@/components/map/delivery-track-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-xl"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>,
});

export default function DriverPage() {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const watchRef = useRef<number | null>(null);
  const sendRef = useRef<any>(null);

  useEffect(() => {
    loadData();
    // Geolocate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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
    if (active) setActiveDelivery(active);
    setLoading(false);
  }

  async function acceptOrder(orderId: string) {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      loadData();
      startTracking();
    }
  }

  function startTracking() {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyPos(p);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000 }
    );

    // Envoyer position toutes les 10s
    sendRef.current = setInterval(async () => {
      if (!activeDelivery?.delivery?.id || !myPos) return;
      await fetch(`/api/deliveries/${activeDelivery.delivery.id}/position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: myPos.lat, longitude: myPos.lng, speed: 0 }),
      });
    }, 10000);
  }

  function stopTracking() {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    if (sendRef.current) { clearInterval(sendRef.current); sendRef.current = null; }
  }

  async function updateStatus(deliveryId: string, status: string) {
    await fetch(`/api/deliveries/${deliveryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        currentLat: myPos?.lat,
        currentLng: myPos?.lng,
        estimatedMinutes: status === "DELIVERING" ? 15 : undefined,
      }),
    });
    if (status === "DELIVERED") {
      stopTracking();
      setActiveDelivery(null);
    }
    loadData();
  }

  useEffect(() => {
    if (activeDelivery?.delivery) startTracking();
    return stopTracking;
  }, [activeDelivery?.delivery?.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Espace Livreur</h1>
        <p className="text-gray-400 text-sm mt-1">Gerez vos livraisons</p>
      </div>

      {/* Livraison active */}
      {activeDelivery && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl overflow-hidden">
          <div className="p-4">
            <p className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Livraison en cours
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
              <div>
                <p className="text-sm text-white font-medium">{activeDelivery.client?.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {activeDelivery.deliveryAddress}</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              {activeDelivery.items?.map((i: any) => (
                <span key={i.id} className="mr-2">{i.quantity}x {i.product?.name}</span>
              ))}
            </div>
          </div>
          <div className="h-48">
            <DriverMap
              driverPos={myPos}
              clientPos={{ lat: activeDelivery.deliveryLat, lng: activeDelivery.deliveryLng }}
              positions={activeDelivery.delivery?.positions || []}
            />
          </div>
          <div className="p-4 flex gap-2">
            {activeDelivery.delivery?.status === "PICKING_UP" && (
              <button onClick={() => updateStatus(activeDelivery.delivery.id, "DELIVERING")}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" /> Commande recuperee - En route
              </button>
            )}
            {activeDelivery.delivery?.status === "DELIVERING" && (
              <button onClick={() => updateStatus(activeDelivery.delivery.id, "DELIVERED")}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Livree
              </button>
            )}
          </div>
        </div>
      )}

      {/* Commandes en attente */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-2">Commandes disponibles</h2>
        {pendingOrders.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <Package className="w-10 h-10 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Aucune commande en attente</p>
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
                  {order.items?.map((i: any) => <span key={i.id} className="mr-2">{i.quantity}x {i.product?.name}</span>)}
                </div>
                <button onClick={() => acceptOrder(order.id)} disabled={!!activeDelivery}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Accepter la livraison
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique */}
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
