'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Play, Pause, AlertTriangle, 
  CheckCircle2, FileAudio, RotateCcw,
  Activity, Radio, ShieldAlert
} from 'lucide-react';
import { Cuna } from '../../_lib/types';
import { calcularTiempoRestante } from '../../_lib/components';

interface DetailProps {
  cunaId: string;
  onBack: () => void;
}

export const MobileCunaDetail: React.FC<DetailProps> = ({ cunaId, onBack }) => {
  const [cuna, setCuna] = useState<Cuna | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingState, setProcessingState] = useState<string | null>(null);

  useEffect(() => {
    // MOCK DATA for Mobile demo
    setTimeout(() => {
      setCuna({
        id: cunaId,
        spxCodigo: 'SPX-001',
        nombre: 'Oferta Electro Cyber',
        estado: 'en_aire',
        anuncianteNombre: 'Falabella',
        producto: null,
        tipo: 'audio',
        duracionSegundos: 30,
        duracionFormateada: '00:30',
        audioUrl: '',
        urgencia: 'programada',
        diasRestantes: 20,
        scoreTecnico: 95,
        scoreBrandSafety: 90,
        totalEmisiones: 345,
        esCritica: false,
        fechaCreacion: '2025-07-01',
        programacion: {
          emisoraId: 'EM-001',
          proximaEmision: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
          emisoraNombre: 'Radioactiva',
          horarioBloque: '10:00-11:00',
          frecuencia: 'diaria',
          totalEmisorasHoy: 2,
        }
      } as Cuna);
      setLoading(false);
    }, 600);
  }, [cunaId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 h-full bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cuna) return null;

  const handleAction = (action: string) => {
    setProcessingState(action);
    setTimeout(() => {
      setProcessingState(null);
      if (action === 'panic') {
        setCuna({ ...cuna, estado: 'pausada' });
      }
    }, 1500);
  };

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'en_aire': return 'bg-emerald-100 text-emerald-700';
      case 'pausada': return 'bg-rose-100 text-rose-700';
      case 'aprobada': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      
      {/* HEADER */}
      <header className="bg-white px-4 pt-12 pb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-20 flex justify-between items-start rounded-b-3xl">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-gray-100 text-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 px-3 text-center">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide mb-1 ${getBadgeStyle(cuna.estado)}`}>
            {cuna.estado === 'en_aire' && <Activity className="w-3 h-3" />}
            {cuna.estado === 'pausada' && <AlertTriangle className="w-3 h-3" />}
            {cuna.estado === 'aprobada' && <CheckCircle2 className="w-3 h-3" />}
            {cuna.estado.toUpperCase().replace('_', ' ')}
          </span>
          <h1 className="text-xl font-bold text-gray-800 leading-tight truncate">{cuna.nombre}</h1>
          <p className="text-sm text-indigo-600 font-semibold mt-0.5">{cuna.spxCodigo}</p>
        </div>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* PLAYER NEUROMÓRFICO */}
        <div className="bg-white rounded-3xl p-6 shadow-[6px_6px_16px_rgba(0,0,0,0.04),-6px_-6px_16px_rgba(255,255,255,0.8)] border border-gray-100 flex flex-col items-center">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${
              isPlaying 
                ? 'bg-indigo-100 text-indigo-600 shadow-[inset_4px_4px_10px_rgba(0,0,0,0.06),inset_-4px_-4px_10px_rgba(255,255,255,0.8)]' 
                : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-[6px_6px_16px_rgba(79,70,229,0.3),-4px_-4px_12px_rgba(255,255,255,0.8)]'
            }`}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          
          <div className="w-full h-10 flex items-center gap-1 px-4 opacity-50">
            {/* Fake Waveform */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={`${_}-${i}`} className="flex-1 bg-indigo-200 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }} />
            ))}
          </div>
          
          <div className="w-full flex justify-between text-xs font-bold text-gray-400 mt-2 px-1">
            <span>00:00</span>
            <span>{cuna.duracionFormateada}</span>
          </div>
        </div>

        {/* METADATA INFO */}
        <div className="bg-white rounded-3xl p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <FileAudio className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anunciante • Campaña</p>
              <p className="font-semibold text-gray-800 text-sm truncate">{cuna.anuncianteNombre}</p>
              <p className="font-bold text-indigo-600 text-[11px] truncate">{(cuna as unknown as { campanaNombre?: string }).campanaNombre}</p>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100" />

          {cuna.programacion && (
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                   <Radio className="w-3 h-3 text-indigo-500" /> Próxima Emisión
                 </p>
                 <p className="font-bold text-gray-800 text-sm">{cuna.programacion.emisoraNombre}</p>
                 <p className="text-xs text-indigo-600 font-semibold">{calcularTiempoRestante(cuna.programacion.proximaEmision).texto}</p>
               </div>
               <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rendimiento</p>
                <div className="flex items-center gap-1 justify-end">
                  <span className="font-black text-emerald-500 text-lg">{cuna.scoreTecnico}</span>
                  <span className="text-[10px] font-bold text-gray-400">/ 100</span>
                </div>
               </div>
             </div>
          )}
        </div>

        {/* OPERACIONES / ACTION GRID */}
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 pt-2">Acciones Operativas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction('aprobar')}
            disabled={processingState !== null}
            className="bg-white p-4 rounded-2xl flex flex-col gap-2 items-start shadow-[4px_4px_10px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
            <span className="text-sm font-bold text-gray-700">Aprobar Audio</span>
          </button>
          
          <button 
            onClick={() => handleAction('reemplazar')}
            disabled={processingState !== null}
            className="bg-white p-4 rounded-2xl flex flex-col gap-2 items-start shadow-[4px_4px_10px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95 transition-transform"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><RotateCcw className="w-5 h-5" /></div>
            <span className="text-sm font-bold text-gray-700">Pedir Reemplazo</span>
          </button>
        </div>

        {/* PANIC SWITCH */}
        {cuna.estado === 'en_aire' && (
          <button 
            onClick={() => handleAction('panic')}
            disabled={processingState !== null}
            className={`w-full mt-4 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 border transition-all active:scale-95 ${
              processingState === 'panic' 
                ? 'bg-rose-100 border-rose-200 text-rose-500' 
                : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_8px_20px_rgba(225,29,72,0.3)] border-red-400 text-white'
            }`}
          >
            {processingState === 'panic' ? (
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldAlert className="w-8 h-8 opacity-90" />
                <span className="font-black tracking-wide text-lg">DETENER EMISIÓN (PANIC)</span>
                <span className="text-xs font-semibold opacity-75">Baja inmediata de todas las señales</span>
              </>
            )}
          </button>
        )}

      </main>
    </div>
  );
};
