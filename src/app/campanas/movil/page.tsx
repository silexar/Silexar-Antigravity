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
  Briefcase, Menu
} from 'lucide-react';
import { useCampanas } from '../_lib/useCampanas';
import { MobileDashboardView } from './_components/MobileDashboardView';
import { MobileCampanasList } from './_components/MobileCampanasList';
import { MobileCampanaDetail } from './_components/MobileCampanaDetail';
import { MobileNuevaCampana } from './_components/MobileNuevaCampana';

export default function MobileCampanasApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campanas' | 'alertas' | 'calendario' | 'detalle' | 'crear'>('dashboard');
  const [selectedCampanaId, setSelectedCampanaId] = useState<string | null>(null);
  
  // Custom hook refactorizado (mismas reglas de negocio que Desktop)
  const { 
    campanasFiltradas, stats, searchTerm, setSearchTerm 
  } = useCampanas();

  // Helper para Bottom Navigation
  const NavItem = ({ id, icon: Icon, label, alert = false }: { id: string; icon: React.ElementType; label: string; alert?: boolean }) => {
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
        className={`flex flex-col items-center justify-center w-full relative ${
          isActive ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <div className={`p-2 rounded-2xl transition-all ${
          isActive 
            ? 'bg-blue-50 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]' 
            : ''
        }`}>
          <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          {alert && (
            <span className="absolute top-1 right-1/4 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
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
    <div className="flex flex-col h-[100dvh] bg-[#f3f4f6] font-sans overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="px-5 pt-10 pb-4 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.03)] z-20 flex justify-between items-center rounded-b-3xl border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
              Silexar <span className="text-blue-600">Pulse</span>
            </h1>
            <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
              Campañas Mobile
            </p>
          </div>
        </div>
        
        <button className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] text-gray-500 active:shadow-inner">
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
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <Bell className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 font-bold">Centro de Alertas Silexar</p>
            <p className="text-sm text-gray-400 mt-2">Próximamente disponible</p>
          </div>
        )}
        {activeTab === 'calendario' && (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <Calendar className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 font-bold">Grilla de Programación</p>
            <p className="text-sm text-gray-400 mt-2">Próximamente disponible</p>
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON (crear campaña) */}
      {(activeTab as string) !== 'crear' && activeTab !== 'detalle' && (
        <button 
          onClick={() => setActiveTab('crear')}
          className="absolute bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] z-30 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* BOTTOM NAVIGATION (Neumorphic TIER 0) */}
      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-2 z-30 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
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
