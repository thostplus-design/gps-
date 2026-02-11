"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag, Clock, CheckCircle, Truck, XCircle, ArrowLeft, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  ACCEPTED: { label: "Acceptee", color: "bg-blue-500/20 text-blue-400", icon: CheckCircle },
  PREPARING: { label: "Preparation", color: "bg-orange-500/20 text-orange-400", icon: Clock },
  PICKED_UP: { label: "Recuperee", color: "bg-indigo-500/20 text-indigo-400", icon: ShoppingBag },
  DELIVERING: { label: "En livraison", color: "bg-purple-500/20 text-purple-400", icon: Truck },
  DELIVERED: { label: "Livree", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  CANCELLED: { label: "Annulee", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/livraison" className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Mes commandes</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} commande(s)</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = statusConfig[order.status] || statusConfig.PENDING;
            const Icon = st.icon;
            return (
              <Link key={order.id} href={`/livraison/order/${order.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Commande #{order.id.slice(-6)}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                  <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", st.color)}>
                    <Icon className="w-3 h-3" /> {st.label}
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-0.5">
                  {order.items?.map((item: any) => (
                    <p key={item.id}>{item.quantity}x {item.product?.name}</p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800">
                  <p className="text-sm font-bold text-blue-400">{order.totalAmount?.toLocaleString()} FCFA</p>
                  {["DELIVERING", "PICKED_UP", "ACCEPTED"].includes(order.status) && (
                    <span className="flex items-center gap-1 text-xs text-green-400"><Eye className="w-3 h-3" /> Suivre en direct</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
