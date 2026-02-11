"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Loader2, ArrowLeft, Clock, CheckCircle, Truck, ShoppingBag, MapPin,
  Gauge, Ruler, User, Phone, XCircle, Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TrackMap = dynamic(() => import("@/components/map/delivery-track-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-900 rounded-xl"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>,
});

const statusSteps = [
  { key: "PENDING", label: "En attente", icon: Clock },
  { key: "ACCEPTED", label: "Acceptee", icon: CheckCircle },
  { key: "PICKED_UP", label: "Recuperee", icon: ShoppingBag },
  { key: "DELIVERING", label: "En livraison", icon: Truck },
  { key: "DELIVERED", label: "Livree", icon: CheckCircle },
];

function getStepIndex(status: string) {
  const i = statusSteps.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    loadOrder();
    pollRef.current = setInterval(loadOrder, 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  async function loadOrder() {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    setOrder(data);
    if (data.delivery?.currentLat && data.delivery?.currentLng) {
      setDriverPos({ lat: data.delivery.currentLat, lng: data.delivery.currentLng });
    }
    if (data.delivery?.estimatedMinutes) setEta(data.delivery.estimatedMinutes);
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  if (!order) return <p className="text-gray-400">Commande introuvable</p>;

  const currentStep = getStepIndex(order.status);
  const isActive = ["ACCEPTED", "PICKED_UP", "DELIVERING"].includes(order.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/livraison/order" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-white">Commande #{(order.id as string).slice(-6)}</h1>
          <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
        </div>
      </div>

      {/* Progress bar */}
      {order.status !== "CANCELLED" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            {statusSteps.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    done ? "bg-green-500" : "bg-gray-800")}>
                    <Icon className={cn("w-4 h-4", done ? "text-white" : "text-gray-600")} />
                  </div>
                  <span className={cn("text-[10px] text-center", done ? "text-green-400" : "text-gray-600")}>{step.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex mt-1 px-4">
            {statusSteps.slice(0, -1).map((_, i) => (
              <div key={i} className={cn("flex-1 h-1 rounded mx-0.5", i < currentStep ? "bg-green-500" : "bg-gray-800")} />
            ))}
          </div>
        </div>
      )}

      {/* Carte suivi en direct */}
      {isActive && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" /> Suivi en direct
            </p>
            {eta && <span className="text-xs text-green-400">~{eta} min restantes</span>}
          </div>
          <div className="h-64 sm:h-80">
            <TrackMap
              driverPos={driverPos}
              clientPos={{ lat: order.deliveryLat, lng: order.deliveryLng }}
              positions={order.delivery?.positions || []}
            />
          </div>
        </div>
      )}

      {/* Livreur */}
      {order.delivery && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2">Livreur</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{order.delivery.driver?.name}</p>
              <p className="text-xs text-gray-500">
                {order.delivery.status === "PICKING_UP" ? "Se dirige vers le restaurant" :
                 order.delivery.status === "DELIVERING" ? "En route vers vous" :
                 order.delivery.status === "DELIVERED" ? "Livree" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Historique mouvements livreur */}
      {order.delivery?.positions?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-white mb-2">Historique mouvements du livreur</p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {order.delivery.positions.map((pos: any, i: number) => (
              <div key={pos.id} className="flex items-center gap-3 text-xs py-1 border-b border-gray-800/50 last:border-0">
                <span className="text-gray-600 w-5">{i + 1}</span>
                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-gray-400">{pos.latitude.toFixed(5)}, {pos.longitude.toFixed(5)}</span>
                {pos.speed && <span className="text-gray-500">{pos.speed} km/h</span>}
                <span className="text-gray-600 ml-auto">{new Date(pos.timestamp).toLocaleTimeString("fr-FR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm font-semibold text-white mb-2">Articles</p>
        <div className="space-y-2">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-300">{item.quantity}x {item.product?.name}</span>
              <span className="text-gray-400">{item.price?.toLocaleString()} FCFA</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-800">
            <span>Total</span><span>{order.totalAmount?.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-1">Adresse de livraison</p>
        <p className="text-sm text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /> {order.deliveryAddress}</p>
      </div>
    </div>
  );
}
