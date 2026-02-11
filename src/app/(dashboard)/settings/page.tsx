"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, Shield, Bell, Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [
    { key: "profile", label: "Profil", icon: User },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Securite", icon: Shield },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Parametres</h1>
        <p className="text-gray-400 text-sm mt-1">Gerez votre compte et vos preferences</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {activeTab === "profile" && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Informations du profil</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ""}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ""}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                disabled
              />
              <p className="text-xs text-gray-600 mt-1">L email ne peut pas etre modifie</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <input
                type="text"
                value="Administrateur"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm"
                disabled
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Sauvegarde !" : "Sauvegarder"}
            </button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Preferences de notifications</h2>
            {[
              { label: "Alertes geofence", desc: "Entrees et sorties de zones" },
              { label: "Batterie faible", desc: "Quand un appareil descend sous 20%" },
              { label: "Exces de vitesse", desc: "Depassement des limites configurees" },
              { label: "Appareil hors ligne", desc: "Perte de signal d un appareil" },
              { label: "SOS", desc: "Alertes d urgence" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4 max-w-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Securite</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              {saved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              {saved ? "Sauvegarde !" : "Changer le mot de passe"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
