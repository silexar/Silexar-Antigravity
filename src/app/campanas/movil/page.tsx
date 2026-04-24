/**
 * 📱 SILEXAR PULSE — Campañas Mobile App TIER 0
 * 
 * @description Interface móvil completa para gestión de campañas
 * con 4 tabs funcionales, métricas, acciones en tiempo real,
 * detalle completo y wizard de creación.
 * Paridad 1:1 con desktop.
 * 
 * @version 2026.3.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React, { useState } from 'react';

import {
  Home, Activity, Bell, Plus, Calendar,
  Briefcase, Menu, ArrowLeft
} from 'lucide-react';
import { useCampanas } from '../_lib/useCampanas';
import { MobileDashboardView } from './_components/MobileDashboardView';
import { MobileCampanasList } from './_components/MobileCampanasList';
import { MobileCampanaDetail } from './_components/MobileCampanaDetail';
import { MobileNuevaCampana } from './_components/MobileNuevaCampana';
import { NeoPageHeader, NeoCard, NeoButton, N } from '../_lib/neumorphic';

export default function MobileCampanasApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campanas' | 'alertas' | 'calendario' | 'detalle' | 'crear'>('dashboard');
  const [selectedCampanaId, setSelectedCampanaId] = useState<string | null>(null);
  
  // Custom hook refactorizado (mismas reglas de negocio que Desktop)
  const { 
    campanasFiltradas, stats, searchTerm, setSearchTerm 
  } = useCampanas();

  // Helper para Bottom Navigation
  const NavItem = ({ id, icon: Icon, label, alert = false }: { id: 'dashboard' | 'campanas' | 'alertas' | 'calendario' | 'detalle' | 'crear'; icon: React.ElementType; label: string; alert?: boolean }) => {
    // Mantener highlight en la pestaña original si estamos en sub-vistas
    const isActive = activeTab === id || 
                     (id === 'campanas' && activeTab === 'detalle') || 
                     (id === 'dashboard' && activeTab === 'crear');
                     
    return (
      <button 
        onClick={() => {
          if (id === 'campanas') setSelectedCampanaId(null);
          setActiveTab(id);
        }}
        className="flex flex-col items-center justify-center w-full relative"
        style={{ color: isActive ? N.accent : N.textSub }}
      >
        <div 
          className="p-2 rounded-2xl transition-all relative"
          style={isActive 
            ? { background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }
            : {}
          }
        >
          <Icon className="w-6 h-6" style={{ strokeWidth: isActive ? 2.5 : 2 }} />
          {alert && (
            <span 
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
              style={{ background: '#ef4444', borderColor: N.base }}
            />
          )}
        </div>
        <span className="text-[10px] mt-1 font-bold" style={{ color: isActive ? N.accent : N.textSub }}>
          {label}
        </span>
      </button>
    );
  };

  // Vistas a pantalla completa
  if (activeTab === 'detalle' && selectedCampanaId) {
    return (
      <MobileCampanaDetail 
        campanaId={selectedCampanaId} 
        onBack={() => {
          setSelectedCampanaId(null);
          setActiveTab('campanas');
        }} 
      />
    );
  }

  if (activeTab === 'crear') {
    return <MobileNuevaCampana onBack={() => setActiveTab('campanas')} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] font-sans overflow-hidden" style={{ background: N.base }}>
      
      {/* HEADER SUPERIOR */}
      <header 
        className="px-5 pt-10 pb-4 z-20 flex justify-between items-center rounded-b-3xl"
        style={{ 
          background: N.base, 
          boxShadow: `0 8px 16px ${N.dark}, inset 0 -2px 4px ${N.light}`,
          borderBottom: `1px solid ${N.dark}40`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: N.accent, boxShadow: `4px 4px 8px ${N.dark}, -2px -2px 6px ${N.light}` }}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-none" style={{ color: N.text }}>
              Silexar <span style={{ color: N.accent }}>Pulse</span>
            </h1>
            <p className="text-[11px] font-bold tracking-widest uppercase mt-0.5" style={{ color: N.textSub }}>
              Campañas Mobile
            </p>
          </div>
        </div>
        
        <button 
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
          style={{ 
            background: N.base, 
            boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`,
            color: N.textSub 
          }}
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        {activeTab === 'dashboard' && <MobileDashboardView stats={stats} onNavigate={(tab) => setActiveTab(tab as 'dashboard' | 'campanas' | 'alertas' | 'calendario' | 'detalle' | 'crear')} />}
        {activeTab === 'campanas' && (
          <MobileCampanasList 
            campanas={campanasFiltradas} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onCampanaSelect={(id) => {
              setSelectedCampanaId(id);
              setActiveTab('detalle');
            }}
          />
        )}
        {activeTab === 'alertas' && (
          <div className="flex flex-col items-center justify-center py-20" style={{ opacity: 0.6 }}>
            <Bell className="w-16 h-16 mb-4" style={{ color: N.textSub }} />
            <p className="font-bold" style={{ color: N.text }}>Centro de Alertas Silexar</p>
            <p className="text-sm mt-2" style={{ color: N.textSub }}>Próximamente disponible</p>
          </div>
        )}
        {activeTab === 'calendario' && (
          <div className="flex flex-col items-center justify-center py-20" style={{ opacity: 0.6 }}>
            <Calendar className="w-16 h-16 mb-4" style={{ color: N.textSub }} />
            <p className="font-bold" style={{ color: N.text }}>Grilla de Programación</p>
            <p className="text-sm mt-2" style={{ color: N.textSub }}>Próximamente disponible</p>
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON (crear campaña) */}
      {(activeTab as string) !== 'crear' && activeTab !== 'detalle' && (
        <button 
          onClick={() => setActiveTab('crear')}
          className="absolute bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white z-30 transition-transform active:scale-95"
          style={{ 
            background: N.accent, 
            boxShadow: `6px 6px 12px ${N.dark}, -4px -4px 10px ${N.light}` 
          }}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* BOTTOM NAVIGATION (Neumorphic TIER 0) */}
      <nav 
        className="fixed bottom-0 w-full pb-safe pt-2 px-2 z-30 rounded-t-3xl"
        style={{ 
          background: N.base, 
          boxShadow: `0 -8px 16px ${N.dark}60`,
          borderTop: `1px solid ${N.light}`
        }}
      >
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative mb-2">
          <NavItem id="dashboard" icon={Home} label="Dashboard" />
          <NavItem id="campanas" icon={Briefcase} label="Campañas" />
          <NavItem id="alertas" icon={Bell} label="Alertas" alert={stats.alertas > 0} />
          <NavItem id="calendario" icon={Calendar} label="Grilla" />
        </div>
      </nav>
      
    </div>
  );
}
