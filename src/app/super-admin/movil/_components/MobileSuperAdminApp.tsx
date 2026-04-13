'use client';

import React, { useState } from 'react';
import { LayoutDashboard, Building, Activity, Bell, Zap, Menu, Shield } from 'lucide-react';
import { MobileSystemMonitor } from './MobileSystemMonitor';
import { MobileTenantManager } from './MobileTenantManager';

/* ─── DUMMY TAB COMPONENT──────────────────────────────────────── 
  We implement a basic dashboard tab to complete the shell experience
*/
function MobileDashboardTab() {
  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2C2C2A] flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Visión Global
        </h2>
        <p className="text-[#888780] mt-1">Super Admin Silexar Pulse</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-3xl border border-blue-500/30 shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Building className="w-5 h-5 text-[#2C2C2A]" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Tenants</p>
          <p className="text-3xl font-bold text-[#2C2C2A]">127</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 rounded-3xl border border-emerald-500/30 shadow-lg">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-5 h-5 text-[#2C2C2A]" />
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Uptime Global</p>
          <p className="text-3xl font-bold text-[#2C2C2A]">99.9%</p>
        </div>
      </div>

      <div className="bg-[#E8E5E0]/60 rounded-3xl p-5 border border-[#D4D1CC]/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[#2C2C2A] font-medium flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Security Feed
          </h3>
          <button className="text-xs text-blue-400 hover:text-blue-300">Ver Analítica</button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <div>
              <p className="text-sm text-[#2C2C2A]">24 intentos de login anómalos bloqueados.</p>
              <p className="text-xs text-[#888780]">Hace 2 minutos</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 opacity-50" />
            <div>
              <p className="text-sm text-[#888780]">Rotación de llaves API completada para [Tier: Enterprise].</p>
              <p className="text-xs text-[#888780]">Hace 1 hora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ title, icon: Icon, color }: { title: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
      <div className={`w-20 h-20 rounded-3xl bg-${color}-500/10 text-${color}-400 flex items-center justify-center mb-6`}>
        <Icon className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-[#2C2C2A] mb-2">{title}</h2>
      <p className="text-[#888780]">Esta sección del panel de control está siendo optimizada para la experiencia móvil TIER 0.</p>
    </div>
  );
}

/* ─── MAIN APP CONTAINER ───────────────────────────────────────── */

export function MobileSuperAdminApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenants', icon: Building },
    { id: 'monitoreo', label: 'Monitor', icon: Activity },
    { id: 'alertas', label: 'Alertas', icon: Bell },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F0EDE8] text-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F0EDE8]/80 backdrop-blur-xl border-b border-[#D4D1CC]/50 px-4 py-3 pb-safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
               <Zap className="w-6 h-6 text-[#2C2C2A]" />
             </div>
             <div>
               <h1 className="text-[#2C2C2A] font-bold leading-none">Silexar</h1>
               <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase">Super Admin</span>
             </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#E8E5E0] text-[#888780]">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <MobileDashboardTab />}
        {activeTab === 'tenants' && <MobileTenantManager />}
        {activeTab === 'monitoreo' && <MobileSystemMonitor />}
        {activeTab === 'alertas' && <PlaceholderTab title="Centro de Alertas" icon={Bell} color="orange" />}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pt-safe-bottom">
        <div className="bg-[#F0EDE8]/90 backdrop-blur-2xl border-t border-[#D4D1CC] px-2 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center justify-center w-16 h-14"
                >
                  <div className={`transition-all duration-300 flex flex-col items-center ${
                    isActive ? 'text-red-400 -translate-y-1' : 'text-[#888780]'
                  }`}>
                    {/* Active Background Glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-red-400/10 rounded-xl animate-in zoom-in-90 pointer-events-none" />
                    )}
                    
                    <Icon className={`w-6 h-6 mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : ''}`} />
                    <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
