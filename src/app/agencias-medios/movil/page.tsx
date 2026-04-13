/**
 * 📱 SILEXAR PULSE — Agencias de Medios Mobile App TIER 0
 * 
 * @description Interface móvil para gestión de agencias de medios 
 * con paridad 1:1 con desktop.
 * 
 * @version 2026.3.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Home, List, Bell, Plus, Menu, Landmark } from 'lucide-react';
import { MobileMediosDashboard } from './_components/MobileMediosDashboard';
import { MobileMediosList } from './_components/MobileMediosList';

export interface AgenciaMedios {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  nombreComercial: string | null;
  tipoAgencia: string;
  ciudad: string | null;
  emailContacto: string | null;
  telefonoContacto: string | null;
  comisionPorcentaje: number;
  estado: string;
  activa: boolean;
  fechaCreacion: string;
}

export default function MobileAgenciasMediosApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lista' | 'alertas'>('dashboard');
  const [agencias, setAgencias] = useState<AgenciaMedios[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');

  // Fetch agencias
  const fetchAgencias = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint mock, en prod: /api/agencias-medios
      const response = await fetch('/api/agencias-medios?limit=100'); 
      const data = await response.json();
      if (data.success) {
        setAgencias(data.data);
      }
    } catch {
      // /* */;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencias();
  }, [fetchAgencias]);

  const stats = {
    total: agencias.length,
    activas: agencias.filter(a => a.activa).length,
    inactiva: agencias.filter(a => !a.activa).length
  };

  const handleRefresh = async () => {
    await fetchAgencias();
  };

  const openCrear = () => {
    alert('Navegar a creación de agencia de medios');
  };

  // Helper para Bottom Navigation
  const NavItem = ({ id, icon: Icon, label, alert = false }: { id: 'dashboard' | 'lista' | 'alertas'; icon: React.ElementType; label: string; alert?: boolean }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex flex-col items-center justify-center w-full relative ${
          isActive ? 'text-blue-600' : 'text-slate-400'
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
        <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="px-5 pt-10 pb-4 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.03)] z-20 flex justify-between items-center rounded-b-3xl border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-none">
              Silexar <span className="text-indigo-600">Pulse</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              Agencias Medios
            </p>
          </div>
        </div>
        
        <button className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-[4px_4px_12px_rgba(0,0,0,0.05),-4px_-4px_12px_rgba(255,255,255,0.8)] text-slate-500 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] transition-all">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        {activeTab === 'dashboard' && (
          <MobileMediosDashboard 
            stats={stats} 
            recentAgencias={agencias.slice(0, 3)}
            onRefresh={handleRefresh}
            onOpenNuevo={openCrear}
            onOpenList={() => setActiveTab('lista')}
            loading={loading}
          />
        )}
        {activeTab === 'lista' && (
          <MobileMediosList 
            agencias={agencias} 
            loading={loading}
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            filterTipo={filterTipo}
            setFilterTipo={setFilterTipo}
            onAgenciaSelect={(id) => alert(`Detalle agencia: ${id}`)}
          />
        )}
        {activeTab === 'alertas' && (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <Bell className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">Centro de Alertas</p>
            <p className="text-sm text-slate-400 mt-2">No hay notificaciones</p>
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={openCrear}
        className="absolute bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_16px_rgba(79,70,229,0.4)] z-30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 pb-safe pt-2 px-2 z-30 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-2">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative mb-2">
          <NavItem id="dashboard" icon={Home} label="Dashboard" />
          <NavItem id="lista" icon={List} label="Agencias" />
          <NavItem id="alertas" icon={Bell} label="Alertas" />
        </div>
      </nav>
      
    </div>
  );
}
