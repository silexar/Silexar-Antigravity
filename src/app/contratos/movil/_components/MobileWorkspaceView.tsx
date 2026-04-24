/**
 * ?? MOBILE: Workspace View
 * 
 * Espacio de trabajo mobile del ejecutivo.
 * Paridad con desktop: contratos/workspace/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Briefcase, CheckSquare, Clock, Users, FileText,
  Calendar, Plus, MessageSquare
} from 'lucide-react';

interface TareaWorkspace {
  id: string;
  titulo: string;
  contrato?: string;
  cliente?: string;
  prioridad: 'alta' | 'media' | 'baja';
  tipo: 'tarea' | 'seguimiento' | 'revision' | 'llamada';
  vencimiento: string;
  completada: boolean;
}

interface NotaReciente {
  id: string;
  contenido: string;
  contrato: string;
  fecha: string;
}

const TAREAS_MOCK: TareaWorkspace[] = [
  { id: 't-1', titulo: 'Enviar propuesta renovación', contrato: 'CTR-0045', cliente: 'Falabella', prioridad: 'alta', tipo: 'tarea', vencimiento: '2025-02-28', completada: false },
  { id: 't-2', titulo: 'Seguimiento firma digital', contrato: 'CTR-0067', cliente: 'Banco Chile', prioridad: 'alta', tipo: 'seguimiento', vencimiento: '2025-02-27', completada: false },
  { id: 't-3', titulo: 'Revisar condiciones precio', contrato: 'CTR-0089', cliente: 'TechCorp', prioridad: 'media', tipo: 'revision', vencimiento: '2025-03-01', completada: false },
  { id: 't-4', titulo: 'Llamar para cierre', contrato: 'CTR-0056', cliente: 'Cencosud', prioridad: 'media', tipo: 'llamada', vencimiento: '2025-02-28', completada: true },
  { id: 't-5', titulo: 'Preparar presentación Q1', prioridad: 'baja', tipo: 'tarea', vencimiento: '2025-03-05', completada: false },
];

const NOTAS_MOCK: NotaReciente[] = [
  { id: 'n-1', contenido: 'Cliente interesado en extender el contrato 6 meses más con aumento del 10%', contrato: 'CTR-0045', fecha: '2025-02-27' },
  { id: 'n-2', contenido: 'Pendiente aprobación gerencia para descuento especial', contrato: 'CTR-0034', fecha: '2025-02-26' },
  { id: 'n-3', contenido: 'Enviada propuesta por email, confirmar recepción mañana', contrato: 'CTR-0067', fecha: '2025-02-25' },
];

const prioridadConfig: Record<string, { color: string; bg: string }> = {
  alta: { color: 'text-red-700', bg: 'bg-red-100' },
  media: { color: 'text-amber-700', bg: 'bg-amber-100' },
  baja: { color: 'text-blue-700', bg: 'bg-blue-100' },
};

const tipoIcon: Record<string, React.ReactNode> = {
  tarea: <CheckSquare className="w-4 h-4" />,
  seguimiento: <Clock className="w-4 h-4" />,
  revision: <FileText className="w-4 h-4" />,
  llamada: <Users className="w-4 h-4" />,
};

export function MobileWorkspaceView() {
  const [tareas, setTareas] = useState(TAREAS_MOCK);
  const [tab, setTab] = useState<'tareas' | 'notas'>('tareas');

  const toggleTarea = (id: string) => {
    setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: !t.completada } : t));
  };

  const pendientes = tareas.filter(t => !t.completada);
  const completadas = tareas.filter(t => t.completada);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-[#6888ff] rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-[#9aa3b8]" />
          <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest">Mi Workspace</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-[#dfeaff]/10 rounded-xl p-3 text-center">
            <p className="text-xl font-black">{pendientes.length}</p>
            <p className="text-[10px] text-[#9aa3b8]">Pendientes</p>
          </div>
          <div className="bg-[#dfeaff]/10 rounded-xl p-3 text-center">
            <p className="text-xl font-black">{completadas.length}</p>
            <p className="text-[10px] text-[#9aa3b8]">Completadas</p>
          </div>
          <div className="bg-[#dfeaff]/10 rounded-xl p-3 text-center">
            <p className="text-xl font-black">{NOTAS_MOCK.length}</p>
            <p className="text-[10px] text-[#9aa3b8]">Notas</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {(['tareas', 'notas'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-bold flex-1 ${
              tab === t ? 'bg-[#69738c] text-white' : 'bg-[#dfeaff] text-[#9aa3b8] border border-[#bec8de30]'
            }`}>
            {t === 'tareas' ? '? Tareas' : '?? Notas'}
          </button>
        ))}
      </div>

      {tab === 'tareas' ? (
        <>
          {/* PENDIENTES */}
          <div>
            <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3 px-1">Pendientes ({pendientes.length})</p>
            <div className="space-y-2">
              {pendientes.map(tarea => (
                <div key={tarea.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-3 flex items-start gap-3">
                  <button onClick={() => toggleTarea(tarea.id)} className="mt-0.5 w-5 h-5 rounded border-2 border-[#bec8de] shrink-0 active:scale-90" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#69738c] text-sm">{tarea.titulo}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {tarea.cliente && <span className="text-[10px] text-[#6888ff] font-bold">{tarea.cliente}</span>}
                      {tarea.contrato && <span className="text-[10px] text-[#9aa3b8]">{tarea.contrato}</span>}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${prioridadConfig[tarea.prioridad]?.bg} ${prioridadConfig[tarea.prioridad]?.color}`}>
                        {tarea.prioridad}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9aa3b8] mt-0.5 flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" /> {tarea.vencimiento}
                    </p>
                  </div>
                  <div className="text-[#9aa3b8]">{tipoIcon[tarea.tipo]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPLETADAS */}
          {completadas.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest mb-3 px-1">Completadas ({completadas.length})</p>
              <div className="space-y-2">
                {completadas.map(tarea => (
                  <div key={tarea.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-3 flex items-center gap-3 opacity-60">
                    <button onClick={() => toggleTarea(tarea.id)} className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckSquare className="w-3 h-3" />
                    </button>
                    <p className="font-medium text-[#9aa3b8] text-sm line-through">{tarea.titulo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD TASK */}
          <button className="w-full py-3 border-2 border-dashed border-[#bec8de] rounded-xl text-[#9aa3b8] font-bold flex items-center justify-center gap-2 active:scale-95">
            <Plus className="w-5 h-5" /> Nueva Tarea
          </button>
        </>
      ) : (
        /* NOTAS */
        <div className="space-y-3">
          {NOTAS_MOCK.map(nota => (
            <div key={nota.id} className="bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#6888ff] font-bold">{nota.contrato}</span>
                <span className="text-[10px] text-[#9aa3b8]">{nota.fecha}</span>
              </div>
              <p className="text-sm text-[#69738c]">{nota.contenido}</p>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-[#bec8de] rounded-xl text-[#9aa3b8] font-bold flex items-center justify-center gap-2 active:scale-95">
            <MessageSquare className="w-5 h-5" /> Nueva Nota
          </button>
        </div>
      )}
    </div>
  );
}
