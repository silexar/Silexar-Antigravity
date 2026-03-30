/**
 * ✅ MOBILE: Vista de Aprobaciones de Contrato
 * 
 * Muestra los contratos pendientes de aprobación del ejecutivo.
 * El aprobador puede aprobar, rechazar o solicitar cambios
 * directamente desde el móvil con notificaciones push.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Shield, CheckCircle2, MessageSquare,
  Clock, ChevronDown, AlertTriangle, Loader2,
  DollarSign, Building2, FileText, User,
  ThumbsUp, ThumbsDown,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AprobacionPendiente {
  id: string;
  contratoNumero: string;
  cliente: string;
  ejecutivo: string;
  valor: number;
  descuento: number;
  lineasPauta: number;
  nivelRequerido: 'jefatura' | 'gerencia' | 'directorio';
  motivo: string;
  fechaSolicitud: string;
  urgente: boolean;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const APROBACIONES_MOCK: AprobacionPendiente[] = [
  {
    id: 'apr-001', contratoNumero: 'SP-2025-0012', cliente: 'Banco Chile',
    ejecutivo: 'María González', valor: 85000000, descuento: 15,
    lineasPauta: 3, nivelRequerido: 'gerencia',
    motivo: 'Monto superior a $80M ($85.0M)',
    fechaSolicitud: '2025-03-01', urgente: true,
  },
  {
    id: 'apr-002', contratoNumero: 'SP-2025-0015', cliente: 'LATAM',
    ejecutivo: 'Carlos Pérez', valor: 200000000, descuento: 20,
    lineasPauta: 5, nivelRequerido: 'directorio',
    motivo: 'Monto superior a $150M ($200.0M)',
    fechaSolicitud: '2025-03-01', urgente: true,
  },
  {
    id: 'apr-003', contratoNumero: 'SP-2025-0018', cliente: 'Cencosud',
    ejecutivo: 'Ana López', valor: 45000000, descuento: 12,
    lineasPauta: 2, nivelRequerido: 'jefatura',
    motivo: 'Descuento superior al 10% (12%)',
    fechaSolicitud: '2025-02-28', urgente: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export function MobileAprobacionView() {
  const [aprobaciones, setAprobaciones] = useState(APROBACIONES_MOCK);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [procesando, setProcesando] = useState<string | null>(null);
  const [showComentario, setShowComentario] = useState<string | null>(null);

  const handleAccion = async (id: string, accion: 'aprobar' | 'rechazar') => {
    setProcesando(id);
    // Simular llamada API — en producción: POST /api/contratos/{id}/aprobar
    ;
    await new Promise(resolve => setTimeout(resolve, 1200));
    setAprobaciones(prev => prev.filter(a => a.id !== id));
    setProcesando(null);
    setComentario('');
    setShowComentario(null);
  };

  const pendientes = aprobaciones.length;
  const urgentes = aprobaciones.filter(a => a.urgente).length;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-800">Aprobaciones</h3>
          <p className="text-xs text-slate-500">
            {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            {urgentes > 0 && <span className="text-red-500 font-bold"> · {urgentes} urgente{urgentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* LISTA */}
      {aprobaciones.length === 0 ? (
        <div className="text-center py-12 bg-emerald-50 rounded-2xl border border-emerald-100">
          <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto" />
          <p className="mt-4 text-lg font-black text-emerald-600">Todo al día</p>
          <p className="text-sm text-emerald-500 mt-1">No hay aprobaciones pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {aprobaciones.map(apr => (
            <div key={apr.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
              apr.urgente ? 'border-red-200' : 'border-slate-100'
            }`}>
              {/* HEADER CARD */}
              <button
                onClick={() => setExpandedId(expandedId === apr.id ? null : apr.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  apr.nivelRequerido === 'directorio' ? 'bg-red-100' :
                  apr.nivelRequerido === 'gerencia' ? 'bg-amber-100' : 'bg-blue-100'
                }`}>
                  <Shield className={`w-4 h-4 ${
                    apr.nivelRequerido === 'directorio' ? 'text-red-500' :
                    apr.nivelRequerido === 'gerencia' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-800 truncate">{apr.cliente}</p>
                    {apr.urgente && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full">URGENTE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{apr.contratoNumero} · {apr.ejecutivo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{fmtMonto(apr.valor)}</p>
                  <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ml-auto ${
                    expandedId === apr.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {/* DETALLE EXPANDIDO */}
              {expandedId === apr.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-50">
                  {/* INFO */}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <InfoChip icon={<DollarSign className="w-3 h-3" />} label="Valor" value={fmtMonto(apr.valor)} />
                    <InfoChip icon={<Building2 className="w-3 h-3" />} label="Descuento" value={`${apr.descuento}%`} />
                    <InfoChip icon={<FileText className="w-3 h-3" />} label="Líneas" value={String(apr.lineasPauta)} />
                    <InfoChip icon={<User className="w-3 h-3" />} label="Ejecutivo" value={apr.ejecutivo.split(' ')[0]} />
                  </div>

                  {/* MOTIVO */}
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Motivo de aprobación
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">{apr.motivo}</p>
                  </div>

                  {/* COMENTARIO */}
                  {showComentario === apr.id && (
                    <div className="space-y-2">
                      <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Escribir comentario (opcional)..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                      />
                    </div>
                  )}

                  {/* ACCIONES */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccion(apr.id, 'rechazar')}
                      disabled={procesando === apr.id}
                      className="flex-1 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50"
                    >
                      {procesando === apr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                      Rechazar
                    </button>
                    <button
                      onClick={() => setShowComentario(showComentario === apr.id ? null : apr.id)}
                      className="py-3 px-3 border border-slate-200 text-slate-600 rounded-xl text-xs flex items-center justify-center active:scale-[0.97]"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAccion(apr.id, 'aprobar')}
                      disabled={procesando === apr.id}
                      className="flex-[2] py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-emerald-200"
                    >
                      {procesando === apr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                      Aprobar
                    </button>
                  </div>

                  {/* FECHA */}
                  <p className="text-[9px] text-slate-400 text-center flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Solicitado: {fmtDate(apr.fechaSolicitud)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════════════════════════════════

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-2 py-1.5 bg-slate-50 rounded-lg flex items-center gap-1.5">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[10px] text-slate-400">{label}:</span>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

function fmtMonto(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function fmtDate(f: string): string {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
