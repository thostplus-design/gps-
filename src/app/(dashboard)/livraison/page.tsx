"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ShoppingBag, UtensilsCrossed, ShoppingCart, Pill, Smartphone, Package,
  Plus, Minus, MapPin, Search, X, Store, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  shopName: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  RESTAURANT: { label: "Restaurants", icon: UtensilsCrossed, color: "text-orange-400" },
  GROCERY: { label: "Epicerie", icon: ShoppingCart, color: "text-green-400" },
  PHARMACY: { label: "Pharmacie", icon: Pill, color: "text-blue-400" },
  ELECTRONICS: { label: "Electronique", icon: Smartphone, color: "text-purple-400" },
  OTHER: { label: "Autre", icon: Package, color: "text-gray-400" },
};

export default function LivraisonPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [address, setAddress] = useState("");
  const [addressLat, setAddressLat] = useState("");
  const [addressLng, setAddressLng] = useState("");
  const [note, setNote] = useState("");
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing && existing.quantity > 1) return prev.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter((i) => i.product.id !== productId);
    });
  }

  function getCartCount(productId: string) {
    return cart.find((i) => i.product.id === productId)?.quantity || 0;
  }

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const filtered = products.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.shopName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.shopName]) acc[p.shopName] = [];
    acc[p.shopName].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  async function placeOrder() {
    if (!address || !addressLat || !addressLng) return;
    setOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          deliveryAddress: address,
          deliveryLat: parseFloat(addressLat),
          deliveryLng: parseFloat(addressLng),
          note,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setCart([]);
        setShowOrder(false);
        setShowCart(false);
        router.push(`/livraison/order/${order.id}`);
      }
    } finally {
      setOrdering(false);
    }
  }

  function useMyPosition() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setAddressLat(String(pos.coords.latitude));
      setAddressLng(String(pos.coords.longitude));
      setAddress(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
    }, () => {}, { enableHighAccuracy: true });
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Livraison</h1>
        <p className="text-gray-400 text-sm mt-1">Commandez et suivez votre livraison en direct</p>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un plat, un produit, un restaurant..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory("all")}
          className={cn("px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors", activeCategory === "all" ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white")}>
          Tout
        </button>
        {Object.entries(categoryConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors",
                activeCategory === key ? "bg-blue-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white")}>
              <Icon className="w-4 h-4" /> {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Mes commandes link */}
      <button onClick={() => router.push("/livraison/order")}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
        <span className="text-sm text-gray-300 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-blue-400" /> Mes commandes</span>
        <ArrowRight className="w-4 h-4 text-gray-500" />
      </button>

      {/* Produits par boutique */}
      {Object.entries(grouped).map(([shop, items]) => (
        <div key={shop} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">{shop}</span>
          </div>
          <div className="divide-y divide-gray-800">
            {items.map((p) => {
              const count = getCartCount(p.id);
              const cat = categoryConfig[p.category];
              return (
                <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{p.name}</p>
                    {p.description && <p className="text-xs text-gray-500 truncate">{p.description}</p>}
                    <p className="text-sm font-semibold text-blue-400 mt-0.5">{p.price.toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {count > 0 && (
                      <>
                        <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-white font-semibold w-5 text-center">{count}</span>
                      </>
                    )}
                    <button onClick={() => addToCart(p)} className="w-7 h-7 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full text-white">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">Aucun produit trouve</p>
        </div>
      )}

      {/* Barre panier fixe */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 p-4 lg:left-64">
          {!showOrder ? (
            <button onClick={() => setShowOrder(true)}
              className="w-full flex items-center justify-between py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm font-semibold">{totalItems} article(s)</span>
              </span>
              <span className="text-sm font-bold">{total.toLocaleString()} FCFA</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold text-sm">Confirmer la commande</p>
                <button onClick={() => setShowOrder(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              {/* Resume panier */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {cart.map((i) => (
                  <div key={i.product.id} className="flex justify-between text-xs text-gray-400">
                    <span>{i.quantity}x {i.product.name}</span>
                    <span>{(i.product.price * i.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-gray-800 pt-2">
                <span>Total</span><span>{total.toLocaleString()} FCFA</span>
              </div>
              {/* Adresse livraison */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Adresse de livraison *</label>
                <div className="flex gap-2">
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500" />
                  <button onClick={useMyPosition} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-blue-400" title="Ma position">
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="any" value={addressLat} onChange={(e) => setAddressLat(e.target.value)} placeholder="Latitude"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
                <input type="number" step="any" value={addressLng} onChange={(e) => setAddressLng(e.target.value)} placeholder="Longitude"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Note pour le livreur (optionnel)"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-blue-500" />
              <button onClick={placeOrder} disabled={ordering || !address || !addressLat || !addressLng}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {ordering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                Commander • {total.toLocaleString()} FCFA
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
