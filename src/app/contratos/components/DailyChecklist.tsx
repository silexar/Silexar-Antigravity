/**
 * 📋 DESKTOP: Checklist Diario del Ejecutivo
 * 
 * Auto-generado con: vencimientos, seguimientos,
 * propuestas sin respuesta, aprobaciones pendientes,
 * renovaciones próximas.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  ClipboardList, Check, Clock, Phone,
  FileText, RefreshCw, AlertTriangle,
  ChevronDown, ChevronUp,
} from 'lucide-react';

interface TareaChecklist {
  id: string;
  tipo: 'vencimiento' | 'seguimiento' | 'propuesta' | 'aprobacion' | 'renovacion';
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  completada: boolean;
  accion?: string;
}

const HOY: TareaChecklist[] = [
  { id: 't1', tipo: 'aprobacion', titulo: 'Aprobar contrato Banco Chile', descripcion: 'SP-2025-0012 — $85M, espera desde ayer', prioridad: 'alta', completada: false, accion: 'Aprobar' },
  { id: 't2', tipo: 'seguimiento', titulo: 'Llamar a Falabella', descripcion: 'Seguimiento propuesta #4521 enviada hace 3 días', prioridad: 'alta', completada: false, accion: 'Llamar' },
  { id: 't3', tipo: 'vencimiento', titulo: 'Contrato LATAM vence viernes', descripcion: 'SP-2024-0088 — $200M, coordinar renovación', prioridad: 'alta', completada: false, accion: 'Renovar' },
  { id: 't4', tipo: 'propuesta', titulo: 'Enviar propuesta a Ripley', descripcion: 'Campaña radio Q2, presupuesto $30M', prioridad: 'media', completada: false, accion: 'Crear' },
  { id: 't5', tipo: 'seguimiento', titulo: 'Confirmar pauta Cencosud', descripcion: 'Validar disponibilidad Radio Corazón 25 frases', prioridad: 'media', completada: true },
  { id: 't6', tipo: 'renovacion', titulo: 'Preparar renovación Entel', descripcion: 'Vence en 30 días, revisar condiciones actuales', prioridad: 'baja', completada: false },
];

export function DailyChecklist() {
  const [tareas, setTareas] = useState(HOY);
  const [showCompleted, setShowCompleted] = useState(false);

  const toggle = (id: string) => setTareas(p => p.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  const pendientes = tareas.filter(t => !t.completada);
  const completadas = tareas.filter(t => t.completada);
  const progreso = Math.round((completadas.length / tareas.length) * 100);

  const tipoIcon: Record<string, React.ReactNode> = {
    vencimiento: <Clock className="w-4 h-4 text-orange-500" />,
    seguimiento: <Phone className="w-4 h-4 text-blue-500" />,
    propuesta: <FileText className="w-4 h-4 text-indigo-500" />,
    aprobacion: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    renovacion: <RefreshCw className="w-4 h-4 text-emerald-500" />,
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-800">Checklist del Día</h3>
            <p className="text-[10px] text-slate-500">{pendientes.length} pendientes · {completadas.length} completadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <span className="text-xs font-bold text-amber-600">{progreso}%</span>
        </div>
      </div>

      {/* PENDIENTES */}
      <div className="divide-y divide-slate-50">
        {pendientes.map(t => (
          <div key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
            <button onClick={() => toggle(t.id)}
              className="w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center hover:border-indigo-400 transition shrink-0" />
            {tipoIcon[t.tipo]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{t.titulo}</p>
              <p className="text-[10px] text-slate-500 truncate">{t.descripcion}</p>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
              t.prioridad === 'alta' ? 'bg-red-100 text-red-600' :
              t.prioridad === 'media' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>{t.prioridad}</span>
            {t.accion && (
              <button className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition">
                {t.accion}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* COMPLETADAS */}
      {completadas.length > 0 && (
        <div className="border-t border-slate-100">
          <button onClick={() => setShowCompleted(!showCompleted)}
            className="w-full px-5 py-2 flex items-center gap-2 text-xs text-slate-400 hover:bg-slate-50">
            {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {completadas.length} completada{completadas.length !== 1 ? 's' : ''}
          </button>
          {showCompleted && completadas.map(t => (
            <div key={t.id} className="px-5 py-2 flex items-center gap-3 opacity-50">
              <button onClick={() => toggle(t.id)}
                className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </button>
              <p className="text-sm text-slate-500 line-through">{t.titulo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
