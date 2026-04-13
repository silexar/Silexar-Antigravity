/**
 * 🎵 SILEXAR PULSE — Cuñas Mobile App TIER 0
 * 
 * @description Centro de Operaciones móvil para Cuñas/Spots
 * con métricas en vivo, biblioteca de audios y panele de alertas,
 * además de vistas detalladas y botón de pánico operativo.
 * Paridad 1:1 con desktop.
 * 
 * @version 2026.3.0
 * @tier TIER_0_FORTUNE_10
 * @platform MOBILE
 */

'use client';

import React, { useState } from 'react';

import {
  Home, Radio, AlertTriangle, MonitorPlay, Menu, Music
} from 'lucide-react';
import type { Cuna, MetricasOperativas } from '../_lib/types';
import { MobileCunasDashboard } from './_components/MobileCunasDashboard';
import { MobileCunasList } from './_components/MobileCunasList';
import { MobileCunaDetail } from './_components/MobileCunaDetail';
import { MobileAlertasPanel } from './_components/MobileAlertasPanel';

export default function MobileCunasApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cunas' | 'alertas' | 'estudio'>('dashboard');
  const [selectedCunaId, setSelectedCunaId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Custom states para UI móvil (en prod vienen del hook real)
  const [searchTerm, setSearchTerm] = useState('');

  // 1. MOCK DATA PARA LA UI MÓVIL (Representando el backend Silexar TIER 0)
  const mockStats: MetricasOperativas = {
    totalCunas: 3450,
    enAire: 1240,
    pendientesValidacion: 12,
    porVencer: 5,
    tasaAprobacion: 98.5,
    emisionesHoy: 450,
    cambioVsAyer: 2.4,
  };

  const mockCunas: Cuna[] = [
    {
      id: 'c1',
      spxCodigo: 'SPX-099',
      nombre: 'Promo Verano 2026',
      tipo: 'audio',
      anuncianteNombre: 'Falabella',
      producto: null,
      duracionSegundos: 30,
      duracionFormateada: '00:30',
      estado: 'en_aire',
      urgencia: 'programada',
      diasRestantes: 60,
      scoreTecnico: 95,
      scoreBrandSafety: 99,
      totalEmisiones: 1450,
      fechaCreacion: '2026-01-01',
      esCritica: false,
      audioUrl: '',
      programacion: {
        emisoraId: 'rad1',
        emisoraNombre: 'Radioactiva',
        proximaEmision: '2026-02-14T10:30:00Z',
        horarioBloque: '10:00 - 12:00',
        frecuencia: 'Diaria',
        totalEmisorasHoy: 12
      }
    },
    {
      id: 'c2',
      spxCodigo: 'SPX-102',
      nombre: 'Institucional Marzo',
      tipo: 'audio',
      anuncianteNombre: 'Banco de Chile',
      producto: null,
      duracionSegundos: 45,
      duracionFormateada: '00:45',
      estado: 'pendiente_validacion',
      urgencia: 'critica',
      diasRestantes: 15,
      scoreTecnico: 60,
      scoreBrandSafety: 85,
      totalEmisiones: 0,
      fechaCreacion: '2026-03-01',
      esCritica: true,
      audioUrl: '',
    },
    {
      id: 'c3',
      spxCodigo: 'SPX-105',
      nombre: 'Microprograma Tendencias',
      tipo: 'presentacion',
      anuncianteNombre: 'Entel',
      producto: 'Fibra Optica',
      duracionSegundos: 120,
      duracionFormateada: '02:00',
      estado: 'aprobada',
      urgencia: 'programada',
      diasRestantes: 90,
      scoreTecnico: 99,
      scoreBrandSafety: 100,
      totalEmisiones: 0,
      fechaCreacion: '2026-02-15',
      esCritica: false,
      audioUrl: '',
      programacion: {
        emisoraId: 'rom2',
        emisoraNombre: 'Romántica',
        proximaEmision: '2026-02-15T08:00:00Z',
        horarioBloque: '08:00 - 09:00',
        frecuencia: 'L-V',
        totalEmisorasHoy: 1
      }
    }
  ];

  const handlePlayToggle = (id: string) => {
    setPlayingId(prev => prev === id ? null : id);
  };

  // Helper para Bottom Navigation
  const NavItem = ({ id, icon: Icon, label, alert = false }: { id: 'dashboard' | 'cunas' | 'alertas' | 'estudio'; icon: React.ElementType; label: string; alert?: boolean }) => {
    const isActive = activeTab === id || (id === 'cunas' && selectedCunaId !== null);
    return (
      <button 
        onClick={() => {
          if (id === 'cunas') setSelectedCunaId(null);
          setActiveTab(id);
        }}
        className={`flex flex-col items-center justify-center w-full relative ${
          isActive ? 'text-indigo-600' : 'text-gray-400'
        }`}
      >
        <div className={`p-2 rounded-2xl transition-all ${
          isActive 
            ? 'bg-indigo-50 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]' 
            : ''
        }`}>
          <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          {alert && (
            <span className="absolute top-1 right-1/4 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
          {label}
        </span>
      </button>
    );
  };

  // FULL SCREEN ROUTING
  if (selectedCunaId) {
    return <MobileCunaDetail cunaId={selectedCunaId} onBack={() => setSelectedCunaId(null)} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f3f4f6] font-sans overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="px-5 pt-10 pb-4 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.03)] z-20 flex justify-between items-center rounded-b-3xl border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <Radio className="w-5 h-5 text-indigo-50" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
              Silexar <span className="text-indigo-600">Pulse</span>
            </h1>
            <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
              Dalet Operations
            </p>
          </div>
        </div>
        
        <button className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] text-gray-500 active:shadow-inner">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ÁREA DE CONTENIDO (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        {activeTab === 'dashboard' && <MobileCunasDashboard metricas={mockStats} alertas={[]} />}
        {activeTab === 'cunas' && (
          <MobileCunasList 
            cunas={mockCunas} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onCunaSelect={setSelectedCunaId}
            onPlay={handlePlayToggle}
            playingId={playingId}
          />
        )}
        {activeTab === 'alertas' && <MobileAlertasPanel />}
        {activeTab === 'estudio' && (
          <div className="flex flex-col items-center justify-center py-20 opacity-60 animate-in fade-in duration-500">
            <MonitorPlay className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 font-bold">Monitor de EstudioDalet</p>
            <p className="text-sm text-center text-gray-400 mt-2 px-10">
              Visualización de pauta en vivo no disponible en formato móvil. Redirija a tablet o desktop.
            </p>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION (Neumorphic TIER 0) */}
      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-2 z-30 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative mb-2">
          <NavItem id="dashboard" icon={Home} label="Status" />
          <NavItem id="cunas" icon={Music} label="Biblioteca" />
          <NavItem id="alertas" icon={AlertTriangle} label="Alertas" alert={mockStats.pendientesValidacion > 0} />
          <NavItem id="estudio" icon={MonitorPlay} label="En Vivo" />
        </div>
      </nav>
      
    </div>
  );
}
