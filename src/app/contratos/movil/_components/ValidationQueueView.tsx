/**
 * ?? MOBILE: Validation Queue View
 * 
 * Cola de borradores auto-generados por IA para revisi�n y aprobaci�n.
 * Un supervisor puede ver todos los borradores, su confianza,
 * y aprobar/rechazar en lotes.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, Sparkles, RefreshCw,
  Mic, MessageSquare, Mail, Zap, Camera, FileText,
  ChevronRight, TrendingUp
} from 'lucide-react';
import { useValidationQueue } from '../../_shared/useSmartCapture';
import type { BorradorEnCola } from '../../_shared/useSmartCapture';
import { formatCurrency } from '../../_shared/useContratos';

// ---------------------------------------------------------------
// MOCK QUEUE DATA
// ---------------------------------------------------------------

const MOCK_QUEUE: BorradorEnCola[] = [
  { id: 'draft-001', cliente: 'Banco Chile', valor: 85000000, metodo: 'voice', confianza: 92, requiereValidacion: false, timestamp: new Date().toISOString(), lineasPauta: 3 },
  { id: 'draft-002', cliente: 'TechCorp', valor: 95000000, metodo: 'whatsapp', confianza: 78, requiereValidacion: true, timestamp: new Date(Date.now() - 3600000).toISOString(), lineasPauta: 2 },
  { id: 'draft-003', cliente: 'SuperMax', valor: 35000000, metodo: 'quick', confianza: 95, requiereValidacion: false, timestamp: new Date(Date.now() - 7200000).toISOString(), lineasPauta: 2 },
  { id: 'draft-004', cliente: 'Nuevo Cliente XY', valor: 0, metodo: 'text', confianza: 42, requiereValidacion: true, timestamp: new Date(Date.now() - 10800000).toISOString(), lineasPauta: 0 },
  { id: 'draft-005', cliente: 'Falabella', valor: 120000000, metodo: 'email', confianza: 88, requiereValidacion: false, timestamp: new Date(Date.now() - 14400000).toISOString(), lineasPauta: 4 },
];

// ---------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export function ValidationQueueView() {
  const { loading, refresh } = useValidationQueue();
  const [queue, setQueue] = useState<BorradorEnCola[]>(MOCK_QUEUE);
  const [filter, setFilter] = useState<'todos' | 'pendientes' | 'listos'>('todos');

  useEffect(() => { refresh(); }, [refresh]);

  const filteredQueue = queue.filter(b => {
    if (filter === 'pendientes') return b.requiereValidacion;
    if (filter === 'listos') return !b.requiereValidacion;
    return true;
  });

  const stats = {
    total: queue.length,
    listos: queue.filter(b => !b.requiereValidacion).length,
    pendientes: queue.filter(b => b.requiereValidacion).length,
    valorTotal: queue.reduce((s, b) => s + b.valor, 0),
  };

  const aprobarBorrador = (id: string) => {
    setQueue(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* STATS */}
      <div className="bg-[#6888ff] rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-[#9aa3b8] uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6888ff]" /> Cola de Borradores IA
          </h3>
          <button onClick={refresh} className="p-1.5 rounded-lg bg-[#69738c] active:scale-90">
            <RefreshCw className={`w-3.5 h-3.5 text-[#9aa3b8] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#dfeaff]/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{stats.total}</p>
            <p className="text-[10px] text-[#9aa3b8] font-bold">Total</p>
          </div>
          <div className="bg-[#6888ff]/50/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#6888ff]">{stats.listos}</p>
            <p className="text-[10px] text-[#6888ff] font-bold">Listos</p>
          </div>
          <div className="bg-[#6888ff]/50/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#6888ff]">{stats.pendientes}</p>
            <p className="text-[10px] text-[#6888ff] font-bold">Revisar</p>
          </div>
        </div>
      </div>

      {/* FILTER CHIPS */}
      <div className="flex gap-2">
        {[
          { id: 'todos' as const, label: 'Todos', count: stats.total },
          { id: 'listos' as const, label: 'Listos', count: stats.listos },
          { id: 'pendientes' as const, label: 'Pendientes', count: stats.pendientes },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
              filter === f.id
                ? 'bg-[#6888ff] text-white shadow-lg shadow-[#6888ff]/20'
                : 'bg-[#dfeaff] text-[#9aa3b8] border border-[#bec8de30]'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* QUEUE LIST */}
      {filteredQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <CheckCircle2 className="w-16 h-16 text-[#6888ff] mb-3" />
          <p className="font-bold text-[#9aa3b8]">Cola vac�a</p>
          <p className="text-xs text-[#9aa3b8] mt-1">Todos los borradores han sido procesados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQueue.map(borrador => (
            <BorradorCard
              key={borrador.id}
              borrador={borrador}
              onAprobar={() => aprobarBorrador(borrador.id)}
              onRechazar={() => aprobarBorrador(borrador.id)}
            />
          ))}
        </div>
      )}

      {/* BATCH ACTION */}
      {stats.listos > 0 && (
        <button
          onClick={() => setQueue(prev => prev.filter(b => b.requiereValidacion))}
          className="w-full py-4 bg-[#6888ff] rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5" /> Aprobar {stats.listos} Listos
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------

function BorradorCard({ borrador, onAprobar, onRechazar }: {
  borrador: BorradorEnCola;
  onAprobar: () => void;
  onRechazar: () => void;
}) {
  const metodoIcon: Record<string, React.ReactNode> = {
    voice: <Mic className="w-4 h-4" />,
    text: <FileText className="w-4 h-4" />,
    whatsapp: <MessageSquare className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    quick: <Zap className="w-4 h-4" />,
    photo: <Camera className="w-4 h-4" />,
  };

  const metodoColor: Record<string, string> = {
    voice: 'bg-[#dfeaff] text-[#9aa3b8]',
    text: 'bg-[#6888ff]/10 text-[#6888ff]',
    whatsapp: 'bg-[#6888ff]/10 text-[#6888ff]',
    email: 'bg-[#6888ff]/10 text-[#6888ff]',
    quick: 'bg-[#6888ff]/10 text-[#6888ff]',
    photo: 'bg-[#dfeaff] text-[#69738c]',
  };

  const timeAgo = (() => {
    const ms = Date.now() - new Date(borrador.timestamp).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  })();

  return (
    <div className={`bg-[#dfeaff] rounded-xl border overflow-hidden ${
      borrador.requiereValidacion ? 'border-[#bec8de]' : 'border-[#bec8de30]'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metodoColor[borrador.metodo] || 'bg-[#dfeaff] text-[#69738c]'}`}>
              {metodoIcon[borrador.metodo]}
            </div>
            <div>
              <p className="font-bold text-[#69738c] text-sm">{borrador.cliente}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[#9aa3b8]">{borrador.metodo.toUpperCase()}</span>
                <span className="text-[10px] text-[#9aa3b8]">�</span>
                <span className="text-[10px] text-[#9aa3b8] flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {timeAgo}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#69738c]">{borrador.valor > 0 ? formatCurrency(borrador.valor) : '�'}</p>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ml-auto w-fit ${
              borrador.confianza >= 85 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
              borrador.confianza >= 60 ? 'bg-[#6888ff]/10 text-[#6888ff]' :
              'bg-[#dfeaff] text-[#9aa3b8]'
            }`}>
              <TrendingUp className="w-2.5 h-2.5" /> {borrador.confianza}%
            </span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex border-t border-[#bec8de30]">
        <button onClick={onRechazar} className="flex-1 py-2.5 text-xs font-bold text-[#9aa3b8] flex items-center justify-center gap-1 active:bg-[#dfeaff]">
          <XCircle className="w-4 h-4" /> Rechazar
        </button>
        <div className="w-px bg-[#dfeaff]" />
        <button className="flex-1 py-2.5 text-xs font-bold text-[#6888ff] flex items-center justify-center gap-1 active:bg-[#6888ff]/5">
          <ChevronRight className="w-4 h-4" /> Revisar
        </button>
        <div className="w-px bg-[#dfeaff]" />
        <button onClick={onAprobar} className="flex-1 py-2.5 text-xs font-bold text-[#6888ff] flex items-center justify-center gap-1 active:bg-[#6888ff]/5">
          <CheckCircle2 className="w-4 h-4" /> Aprobar
        </button>
      </div>
    </div>
  );
}
