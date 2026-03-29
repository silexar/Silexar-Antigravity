/**
 * 🎙️ MOBILE: Notas de Voz Rápidas
 * 
 * Graba y transcribe notas de voz desde el móvil.
 * IA detecta clientes, acciones y fechas.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Play, Trash2,
  Building2, Sparkles, Loader2,
} from 'lucide-react';

interface Nota {
  id: string;
  dur: string;
  fecha: string;
  texto: string;
  cliente?: string;
  accion?: string;
  estado: 'grabando' | 'transcribiendo' | 'ok';
}

export function MobileVoiceNotes() {
  const [notas, setNotas] = useState<Nota[]>([
    { id: 'v1', dur: '0:45', fecha: '14:30', texto: 'Banco Chile confirma renovación Q2 +10% radio. Agregar ADN Radio. Propuesta antes del viernes.', cliente: 'Banco Chile', accion: 'Propuesta viernes', estado: 'ok' },
    { id: 'v2', dur: '0:22', fecha: '11:15', texto: 'Falabella pide cotización navidad. Presupuesto $120M. Reunión jueves 10AM.', cliente: 'Falabella', accion: 'Reunión jueves', estado: 'ok' },
  ]);
  const [grabando, setGrabando] = useState(false);
  const [seg, setSeg] = useState(0);
  const tRef = useRef<NodeJS.Timeout | null>(null);

  const iniciar = useCallback(() => {
    setGrabando(true); setSeg(0);
    tRef.current = setInterval(() => setSeg(s => s + 1), 1000);
  }, []);

  const detener = useCallback(async () => {
    setGrabando(false);
    if (tRef.current) clearInterval(tRef.current);
    const d = `${Math.floor(seg / 60)}:${(seg % 60).toString().padStart(2, '0')}`;
    const id = `v-${Date.now()}`;
    setNotas(p => [{ id, dur: d, fecha: 'Ahora', texto: '', estado: 'transcribiendo' }, ...p]);
    await new Promise(r => setTimeout(r, 1500));
    setNotas(p => p.map(n => n.id === id ? { ...n, estado: 'ok', texto: 'Nota transcrita por IA.', cliente: 'Auto', accion: 'Pendiente' } : n));
    setSeg(0);
  }, [seg]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="w-5 h-5 text-red-500" />
        <h3 className="font-bold text-lg text-slate-800">Notas de Voz</h3>
        <span className="text-[10px] text-slate-400 ml-auto">{notas.length} notas</span>
      </div>

      {/* GRABADOR */}
      <div className={`p-6 rounded-2xl text-center ${grabando ? 'bg-red-50 border-2 border-red-200' : 'bg-slate-50 border border-dashed border-slate-200'}`}>
        {grabando ? (
          <>
            <div className="w-14 h-14 rounded-full bg-red-500 mx-auto flex items-center justify-center animate-pulse shadow-lg">
              <MicOff className="w-7 h-7 text-white" />
            </div>
            <p className="mt-2 text-2xl font-black text-red-600 font-mono">
              {Math.floor(seg / 60)}:{(seg % 60).toString().padStart(2, '0')}
            </p>
            <button onClick={detener}
              className="mt-3 px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold active:scale-95">
              Detener
            </button>
          </>
        ) : (
          <>
            <button onClick={iniciar}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 mx-auto flex items-center justify-center shadow-lg active:scale-90">
              <Mic className="w-7 h-7 text-white" />
            </button>
            <p className="mt-2 text-xs font-bold text-slate-500">Toca para grabar</p>
            <p className="text-[10px] text-slate-400">IA transcribe y detecta acciones</p>
          </>
        )}
      </div>

      {/* LISTA */}
      <div className="space-y-2">
        {notas.map(n => (
          <div key={n.id} className="p-3 neo-mobile-card rounded-xl">
            <div className="flex items-center gap-2 mb-1.5">
              {n.estado === 'transcribiendo' ? <Loader2 className="w-3 h-3 text-violet-500 animate-spin" /> : <Play className="w-3 h-3 text-slate-400" />}
              <span className="text-[10px] font-mono text-slate-500">{n.dur}</span>
              <span className="text-[10px] text-slate-400">{n.fecha}</span>
              <button onClick={() => setNotas(p => p.filter(x => x.id !== n.id))} className="ml-auto p-1 rounded bg-red-50 active:scale-90">
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
            {n.estado === 'transcribiendo' ? (
              <p className="text-[10px] text-violet-500 italic">Transcribiendo...</p>
            ) : (
              <>
                <p className="text-xs text-slate-700 leading-relaxed">{n.texto}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {n.cliente && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full flex items-center gap-0.5"><Building2 className="w-2.5 h-2.5" />{n.cliente}</span>}
                  {n.accion && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded-full flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />{n.accion}</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
