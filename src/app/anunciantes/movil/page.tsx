/**
 * 📱 SILEXAR PULSE — Anunciantes Mobile App TIER 0
 * 
 * @description Interface móvil completa para gestión de anunciantes
 * con paridad 1:1 con desktop.
 * 
 * @version 2026.3.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Home, List, Bell, Plus, Menu, Building2 } from 'lucide-react';
import { MobileAnunciantesDashboard } from './_components/MobileAnunciantesDashboard';
import { MobileAnunciantesList } from './_components/MobileAnunciantesList';
import { MobileAnuncianteDetail } from './_components/MobileAnuncianteDetail';
import { MobileNuevoAnunciante } from './_components/MobileNuevoAnunciante';

export interface Anunciante {
  id: string;
  codigo: string;
  rut: string | null;
  nombreRazonSocial: string;
  giroActividad: string | null;
  direccion: string | null;
  ciudad: string | null;
  comunaProvincia: string | null;
  pais: string;
  emailContacto: string | null;
  telefonoContacto: string | null;
  paginaWeb: string | null;
  nombreContactoPrincipal: string | null;
  cargoContactoPrincipal: string | null;
  tieneFacturacionElectronica: boolean;
  direccionFacturacion: string | null;
  emailFacturacion: string | null;
  estado: string;
  activo: boolean;
  notas: string | null;
  fechaCreacion: string;
  fechaModificacion: string | null;
}

export default function MobileAnunciantesApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lista' | 'alertas' | 'detalle' | 'crear'>('dashboard');
  const [anunciantes, setAnunciantes] = useState<Anunciante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [selectedAnuncianteId, setSelectedAnuncianteId] = useState<string | null>(null);

  // Fetch anunciantes
  const fetchAnunciantes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/anunciantes?limit=100'); // Simplificado para mobile
      const data = await response.json();
      if (data.success) {
        setAnunciantes(data.data);
      }
    } catch {
      // /* */;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnunciantes();
  }, [fetchAnunciantes]);

  const stats = {
    total: anunciantes.length,
    activos: anunciantes.filter(a => a.activo).length,
    inactivos: anunciantes.filter(a => !a.activo).length
  };

  const handleRefresh = async () => {
    await fetchAnunciantes();
  };

  const openDetalle = (id: string) => {
    setSelectedAnuncianteId(id);
    setActiveTab('detalle');
  };

  const closeDetalle = () => {
    setSelectedAnuncianteId(null);
    setActiveTab('lista');
  };

  const openCrear = () => {
    setActiveTab('crear');
  };

  const closeCrear = () => {
    setActiveTab('lista');
    fetchAnunciantes(); // Refrescar luego de crear
  };

  // Helper para Bottom Navigation
  const NavItem = ({ id, icon: Icon, label, alert = false }: { id: 'dashboard' | 'lista' | 'alertas' | 'detalle' | 'crear'; icon: React.ElementType; label: string; alert?: boolean }) => {
    // Si estamos en detalle o crear, el nav sigue mostrando la pestaña padre o nada (mejor mostramos lista activa)
    const isActive = activeTab === id || (id === 'lista' && activeTab === 'detalle') || (id === 'dashboard' && activeTab === 'crear');
    return (
      <button 
        onClick={() => {
          if (id === 'lista') {
            setSelectedAnuncianteId(null);
          }
          setActiveTab(id);
        }}
        className={`flex flex-col items-center justify-center w-full relative ${
          isActive ? 'text-blue-600' : 'text-slate-400'
        }`}
      >
        <div className={`p-2 rounded-2xl transition-all ${
          isActive 
            ? 'bg-blue-50/80 shadow-inner' 
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

  // Vistas a pantalla completa
  if (activeTab === 'detalle' && selectedAnuncianteId) {
    return (
      <MobileAnuncianteDetail 
        anuncianteId={selectedAnuncianteId} 
        onBack={closeDetalle} 
        onUpdate={fetchAnunciantes}
      />
    );
  }

  if (activeTab === 'crear') {
    return <MobileNuevoAnunciante onBack={closeCrear} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="px-5 pt-10 pb-4 bg-white/80 backdrop-blur-xl shadow-sm z-20 flex justify-between items-center rounded-b-3xl border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200/50">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-none">
              Silexar <span className="text-blue-600">Pulse</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              Anunciantes Mobile
            </p>
          </div>
        </div>
        
        <button className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 text-slate-500 transition-all">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        {activeTab === 'dashboard' && (
          <MobileAnunciantesDashboard 
            stats={stats} 
            recentAnunciantes={anunciantes.slice(0, 3)}
            onRefresh={handleRefresh}
            onOpenNuevo={openCrear}
            onOpenList={() => setActiveTab('lista')}
            onOpenDetail={openDetalle}
            loading={loading}
          />
        )}
        {activeTab === 'lista' && (
          <MobileAnunciantesList 
            anunciantes={anunciantes} 
            loading={loading}
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            filterEstado={filterEstado}
            setFilterEstado={setFilterEstado}
            onAnuncianteSelect={openDetalle}
            onRefresh={handleRefresh}
          />
        )}
        {activeTab === 'alertas' && (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <Bell className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">Centro de Alertas</p>
            <p className="text-sm text-slate-400 mt-2">Próximamente disponible</p>
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON */}
        <button 
          onClick={openCrear}
          className="absolute bottom-24 right-5 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200/50 z-30 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>

      {/* BOTTOM NAVIGATION (Glassmorphic) */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-white/60 pb-safe pt-2 px-2 z-30 rounded-t-3xl shadow-[0_-8px_20px_rgba(0,0,0,0.05)] pb-2">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative mb-2">
          <NavItem id="dashboard" icon={Home} label="Dashboard" />
          <NavItem id="lista" icon={List} label="Lista" />
          <NavItem id="alertas" icon={Bell} label="Notificaciones" />
        </div>
      </nav>
      
    </div>
  );
}
