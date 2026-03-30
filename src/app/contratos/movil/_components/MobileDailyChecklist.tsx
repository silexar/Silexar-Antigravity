/**
 * 📋 MOBILE: Checklist Diario
 * 
 * Tareas auto-generadas del día con checkbox táctil,
 * prioridades por color, y acciones rápidas.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  ClipboardList, Check, Clock, Phone,
  FileText, RefreshCw, AlertTriangle,
  ChevronDown,
} from 'lucide-react';

interface Tarea {
  id: string;
  tipo: string;
  titulo: string;
  desc: string;
  prioridad: 'alta' | 'media' | 'baja';
  completada: boolean;
  accion?: string;
}

const TAREAS: Tarea[] = [
  { id: 't1', tipo: 'aprobacion', titulo: 'Aprobar Banco Chile', desc: 'SP-2025-0012 · $85M', prioridad: 'alta', completada: false, accion: 'Aprobar' },
  { id: 't2', tipo: 'seguimiento', titulo: 'Llamar Falabella', desc: 'Propuesta #4521 · 3 días sin respuesta', prioridad: 'alta', completada: false, accion: 'Llamar' },
  { id: 't3', tipo: 'vencimiento', titulo: 'LATAM vence viernes', desc: 'SP-2024-0088 · $200M', prioridad: 'alta', completada: false, accion: 'Renovar' },
  { id: 't4', tipo: 'propuesta', titulo: 'Propuesta Ripley', desc: 'Radio Q2 · $30M', prioridad: 'media', completada: false },
  { id: 't5', tipo: 'seguimiento', titulo: 'Confirmar pauta Cencosud', desc: 'Radio Corazón 25 frases', prioridad: 'media', completada: true },
  { id: 't6', tipo: 'renovacion', titulo: 'Preparar renovación Entel', desc: 'Vence en 30 días', prioridad: 'baja', completada: false },
];

export function MobileDailyChecklist() {
  const [tareas, setTareas] = useState(TAREAS);
  const [showDone, setShowDone] = useState(false);

  const toggle = (id: string) => setTareas(p => p.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  const pendientes = tareas.filter(t => !t.completada);
  const completadas = tareas.filter(t => t.completada);
  const pct = Math.round((completadas.length / tareas.length) * 100);

  const icons: Record<string, React.ReactNode> = {
    vencimiento: <Clock className="w-3.5 h-3.5 text-orange-500" />,
    seguimiento: <Phone className="w-3.5 h-3.5 text-blue-500" />,
    propuesta: <FileText className="w-3.5 h-3.5 text-indigo-500" />,
    aprobacion: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    renovacion: <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />,
  };

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-slate-800">Checklist del Día</p>
            <p className="text-[10px] text-slate-500">{pendientes.length} pendientes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-1.5 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] font-bold text-amber-600">{pct}%</span>
        </div>
      </div>

      {/* PENDIENTES */}
      <div className="space-y-2">
        {pendientes.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-3">
            <button onClick={() => toggle(t.id)}
              className="w-5 h-5 rounded-md border-2 border-slate-300 shrink-0 active:scale-90" />
            {icons[t.tipo]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{t.titulo}</p>
              <p className="text-[10px] text-slate-500 truncate">{t.desc}</p>
            </div>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              t.prioridad === 'alta' ? 'bg-red-500' : t.prioridad === 'media' ? 'bg-amber-400' : 'bg-slate-300'
            }`} />
            {t.accion && (
              <button className="px-2 py-1 bg-indigo-600 text-white text-[9px] font-bold rounded-lg active:scale-95">
                {t.accion}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* COMPLETADAS */}
      {completadas.length > 0 && (
        <>
          <button onClick={() => setShowDone(!showDone)}
            className="w-full flex items-center gap-1 text-[10px] text-slate-400 font-bold">
            <ChevronDown className={`w-3 h-3 transition ${showDone ? 'rotate-180' : ''}`} />
            {completadas.length} completada{completadas.length !== 1 ? 's' : ''}
          </button>
          {showDone && completadas.map(t => (
            <div key={t.id} className="px-3 py-2 flex items-center gap-3 opacity-50">
              <button onClick={() => toggle(t.id)}
                className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </button>
              <p className="text-xs text-slate-500 line-through truncate">{t.titulo}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
