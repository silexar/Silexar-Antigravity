'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, CheckCircle2, 
  Activity, AlertTriangle, Play, FileVideo, Receipt, 
  History, Clock, MoreVertical, Building, Layout
} from 'lucide-react';
// Importamos un mock type hasta que conectemos con db real en la vista móvil. En prod vendría del schema.
interface CampanaMock {
  id: string;
  numeroCampana: string;
  nombreCampana: string;
  anunciante: string;
  estado: string;
  fechaInicio: string;
  fechaTermino: string;
  cumplimiento: number;
  inversion: number;
}

interface DetailProps {
  campanaId: string;
  onBack: () => void;
}

export const MobileCampanaDetail: React.FC<DetailProps> = ({ campanaId, onBack }) => {
  const [campana, setCampana] = useState<CampanaMock | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Simulamos la carga de la API para mantener el scope UI/UX.
    // En prod: fetch(`/api/campanas/${campanaId}`)
    setTimeout(() => {
      setCampana({
        id: campanaId,
        numeroCampana: `CMP-${Math.floor(Math.random() * 10000)}`,
        nombreCampana: 'Lanzamiento Q3 Premium',
        anunciante: 'Empresa Demo S.A.',
        estado: 'ejecutando',
        fechaInicio: '2025-07-01',
        fechaTermino: '2025-09-30',
        cumplimiento: 45,
        inversion: 15600000
      });
      setLoading(false);
    }, 600);
  }, [campanaId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-[100dvh] bg-gray-50 items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!campana) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ejecutando': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'planificando': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completada': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'conflictos': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`whitespace-nowrap px-4 py-3 border-b-2 font-bold transition-all text-sm ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      
      {/* HEADER */}
      <header className="bg-white px-4 pt-12 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 flex justify-between items-start rounded-b-3xl">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100 text-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 px-3 text-center">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-600 mb-1 border border-blue-100">
            {campana.numeroCampana}
          </span>
          <h1 className="text-xl font-bold text-gray-800 leading-tight truncate">{campana.nombreCampana}</h1>
        </div>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 -mr-2 rounded-full active:bg-gray-100 text-gray-800 transition-colors">
          <MoreVertical className="w-6 h-6" />
        </button>
      </header>

      {/* OVERLAY MENU */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setShowMenu(false)} />
          <div className="fixed top-24 right-4 z-40 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 duration-200">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors text-left" onClick={() => setShowMenu(false)}>
              <Play className="w-5 h-5 text-emerald-500" /> Forzar Emisión
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors text-left" onClick={() => setShowMenu(false)}>
              <Activity className="w-5 h-5 text-blue-500" /> Ver Rendimiento
            </button>
            <div className="h-px bg-gray-100 my-1 w-full" />
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors text-left" onClick={() => setShowMenu(false)}>
              <AlertTriangle className="w-5 h-5" /> Suspender Campaña
            </button>
          </div>
        </>
      )}

      {/* TABS */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide px-2">
          <TabButton id="resumen" label="Resumen" />
          <TabButton id="pautas" label="Pautas" />
          <TabButton id="materiales" label="Materiales" />
          <TabButton id="facturacion" label="Cargos" />
          <TabButton id="historial" label="Historial" />
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* Status indicator always visible */}
        <div className="mb-6 flex justify-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getEstadoColor(campana.estado)}`}>
            {campana.estado === 'ejecutando' ? <Activity className="w-4 h-4" /> : 
             campana.estado === 'planificando' ? <Clock className="w-4 h-4" /> : 
             campana.estado === 'completada' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            Estado: {campana.estado}
          </span>
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* TIER 0 ProgressBar */}
            <div className="bg-white rounded-3xl p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.03)] border border-gray-100">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-bold text-gray-700">Cumplimiento Global</span>
                <span className="text-2xl font-black text-blue-600">{campana.cumplimiento}%</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${campana.cumplimiento}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.03)] border border-gray-100">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Building className="w-4 h-4" /> Cliente y Contrato
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Anunciante</p>
                  <p className="text-[15px] font-semibold text-gray-800">{campana.anunciante}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Inversión Total</p>
                  <p className="text-[15px] font-mono text-gray-800 font-bold">${campana.inversion.toLocaleString('es-CL')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.03)] border border-gray-100">
              <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fechas de Emisión
              </h3>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inicio</p>
                  <p className="text-sm font-semibold text-gray-800">{campana.fechaInicio}</p>
                </div>
                <div className="w-px h-8 bg-gray-200 mx-2" />
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Término</p>
                  <p className="text-sm font-semibold text-gray-800">{campana.fechaTermino}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'pautas' || activeTab === 'materiales' || activeTab === 'facturacion' || activeTab === 'historial') && (
          <div className="flex flex-col items-center justify-center p-10 mt-10 text-center animate-in fade-in duration-300 bg-white rounded-3xl shadow-[4px_4px_12px_rgba(0,0,0,0.03)]">
            {activeTab === 'pautas' && <Layout className="w-16 h-16 text-blue-200 mb-6" />}
            {activeTab === 'materiales' && <FileVideo className="w-16 h-16 text-rose-200 mb-6" />}
            {activeTab === 'facturacion' && <Receipt className="w-16 h-16 text-emerald-200 mb-6" />}
            {activeTab === 'historial' && <History className="w-16 h-16 text-amber-200 mb-6" />}
            <h3 className="text-lg font-bold text-gray-600 capitalize">Vista de {activeTab}</h3>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Los detalles operativos y analíticos de esta sección están optimizados para la visualización de escritorio.
            </p>
          </div>
        )}

      </main>
    </div>
  );
};
