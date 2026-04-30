/**
 * ? MOBILE: Vista de Aprobaciones de Contrato
 * 
 * Muestra los contratos pendientes de aprobaci�n del ejecutivo.
 * El aprobador puede aprobar, rechazar o solicitar cambios
 * directamente desde el m�vil con notificaciones push.
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

// ---------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------

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

// ---------------------------------------------------------------
// DATOS MOCK
// ---------------------------------------------------------------

const APROBACIONES_MOCK: AprobacionPendiente[] = [
  {
    id: 'apr-001', contratoNumero: 'SP-2025-0012', cliente: 'Banco Chile',
    ejecutivo: 'Mar�a Gonz�lez', valor: 85000000, descuento: 15,
    lineasPauta: 3, nivelRequerido: 'gerencia',
    motivo: 'Monto superior a $80M ($85.0M)',
    fechaSolicitud: '2025-03-01', urgente: true,
  },
  {
    id: 'apr-002', contratoNumero: 'SP-2025-0015', cliente: 'LATAM',
    ejecutivo: 'Carlos P�rez', valor: 200000000, descuento: 20,
    lineasPauta: 5, nivelRequerido: 'directorio',
    motivo: 'Monto superior a $150M ($200.0M)',
    fechaSolicitud: '2025-03-01', urgente: true,
  },
  {
    id: 'apr-003', contratoNumero: 'SP-2025-0018', cliente: 'Cencosud',
    ejecutivo: 'Ana L�pez', valor: 45000000, descuento: 12,
    lineasPauta: 2, nivelRequerido: 'jefatura',
    motivo: 'Descuento superior al 10% (12%)',
    fechaSolicitud: '2025-02-28', urgente: false,
  },
];

// ---------------------------------------------------------------
// COMPONENTE
// ---------------------------------------------------------------

export function MobileAprobacionView() {
  const [aprobaciones, setAprobaciones] = useState(APROBACIONES_MOCK);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [procesando, setProcesando] = useState<string | null>(null);
  const [showComentario, setShowComentario] = useState<string | null>(null);

  const handleAccion = async (id: string, accion: 'aprobar' | 'rechazar') => {
    setProcesando(id);
    // Simular llamada API � en producci�n: POST /api/contratos/{id}/aprobar
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
        <div className="w-10 h-10 rounded-xl bg-[#6888ff] flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-[#69738c]">Aprobaciones</h3>
          <p className="text-xs text-[#9aa3b8]">
            {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            {urgentes > 0 && <span className="text-[#9aa3b8] font-bold"> � {urgentes} urgente{urgentes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* LISTA */}
      {aprobaciones.length === 0 ? (
        <div className="text-center py-12 bg-[#6888ff]/5 rounded-2xl border border-[#bec8de30]">
          <CheckCircle2 className="w-16 h-16 text-[#6888ff] mx-auto" />
          <p className="mt-4 text-lg font-black text-[#6888ff]">Todo al d�a</p>
          <p className="text-sm text-[#6888ff] mt-1">No hay aprobaciones pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {aprobaciones.map(apr => (
            <div key={apr.id} className={`bg-[#dfeaff] rounded-2xl border overflow-hidden shadow-sm ${
              apr.urgente ? 'border-[#bec8de]' : 'border-[#bec8de30]'
            }`}>
              {/* HEADER CARD */}
              <button
                onClick={() => setExpandedId(expandedId === apr.id ? null : apr.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  apr.nivelRequerido === 'directorio' ? 'bg-[#dfeaff]' :
                  apr.nivelRequerido === 'gerencia' ? 'bg-[#6888ff]/10' : 'bg-[#6888ff]/10'
                }`}>
                  <Shield className={`w-4 h-4 ${
                    apr.nivelRequerido === 'directorio' ? 'text-[#9aa3b8]' :
                    apr.nivelRequerido === 'gerencia' ? 'text-[#6888ff]' : 'text-[#6888ff]'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#69738c] truncate">{apr.cliente}</p>
                    {apr.urgente && (
                      <span className="px-1.5 py-0.5 bg-[#dfeaff]0 text-white text-[8px] font-bold rounded-full">URGENTE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#9aa3b8]">{apr.contratoNumero} � {apr.ejecutivo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#69738c]">{fmtMonto(apr.valor)}</p>
                  <ChevronDown className={`w-4 h-4 text-[#9aa3b8] transition-transform ml-auto ${
                    expandedId === apr.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {/* DETALLE EXPANDIDO */}
              {expandedId === apr.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#bec8de30]">
                  {/* INFO */}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <InfoChip icon={<DollarSign className="w-3 h-3" />} label="Valor" value={fmtMonto(apr.valor)} />
                    <InfoChip icon={<Building2 className="w-3 h-3" />} label="Descuento" value={`${apr.descuento}%`} />
                    <InfoChip icon={<FileText className="w-3 h-3" />} label="L�neas" value={String(apr.lineasPauta)} />
                    <InfoChip icon={<User className="w-3 h-3" />} label="Ejecutivo" value={apr.ejecutivo.split(' ')[0]} />
                  </div>

                  {/* MOTIVO */}
                  <div className="p-2 rounded-lg bg-[#6888ff]/5 border border-[#bec8de30]">
                    <p className="text-[10px] font-bold text-[#6888ff] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Motivo de aprobaci�n
                    </p>
                    <p className="text-xs text-[#6888ff] mt-0.5">{apr.motivo}</p>
                  </div>

                  {/* COMENTARIO */}
                  {showComentario === apr.id && (
                    <div className="space-y-2">
                      <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Escribir comentario (opcional)..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-[#bec8de30] text-sm focus:ring-2 focus:ring-[#6888ff]/50 outline-none resize-none"
                      />
                    </div>
                  )}

                  {/* ACCIONES */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccion(apr.id, 'rechazar')}
                      disabled={procesando === apr.id}
                      className="flex-1 py-3 bg-[#dfeaff] border border-[#bec8de30] text-[#9aa3b8] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50"
                    >
                      {procesando === apr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                      Rechazar
                    </button>
                    <button
                      onClick={() => setShowComentario(showComentario === apr.id ? null : apr.id)}
                      className="py-3 px-3 border border-[#bec8de30] text-[#69738c] rounded-xl text-xs flex items-center justify-center active:scale-[0.97]"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAccion(apr.id, 'aprobar')}
                      disabled={procesando === apr.id}
                      className="flex-[2] py-3 bg-[#6888ff] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-emerald-200"
                    >
                      {procesando === apr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                      Aprobar
                    </button>
                  </div>

                  {/* FECHA */}
                  <p className="text-[9px] text-[#9aa3b8] text-center flex items-center justify-center gap-1">
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

// ---------------------------------------------------------------
// SUB-COMPONENTES
// ---------------------------------------------------------------

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="px-2 py-1.5 bg-[#dfeaff] rounded-lg flex items-center gap-1.5">
      <span className="text-[#9aa3b8]">{icon}</span>
      <span className="text-[10px] text-[#9aa3b8]">{label}:</span>
      <span className="text-xs font-bold text-[#69738c]">{value}</span>
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
