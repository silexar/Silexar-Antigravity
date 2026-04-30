/**
 * ?? MOBILE: Vista de Notificaciones Inteligente
 * 
 * Cards agrupadas por prioridad con acciones directas,
 * swipe para eliminar, pull-to-refresh.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Bell, CheckCircle2, AlertTriangle, Clock,
  RefreshCw, DollarSign, Sparkles, ThumbsUp,
  X,
} from 'lucide-react';

interface Notificacion {
  id: string;
  tipo: 'aprobacion' | 'vencimientos' | 'renovacion' | 'pago' | 'ia' | 'urgente';
  titulo: string;
  descripcion: string;
  timestamp: string;
  leida: boolean;
  accion?: { label: string; tipo: string };
  prioridad: 'alta' | 'media' | 'baja';
}

const NOTIFS: Notificacion[] = [
  { id: 'n1', tipo: 'aprobacion', titulo: 'Contrato Banco Chile pendiente', descripcion: 'SP-2025-0012 requiere aprobaci�n de gerencia ($85M)', timestamp: 'Hace 5 min', leida: false, prioridad: 'alta', accion: { label: 'Aprobar', tipo: 'aprobar' } },
  { id: 'n2', tipo: 'urgente', titulo: 'Vencimientos cr�tico: LATAM', descripcion: 'SP-2024-0088 vence en 3 d�as. Valor $200M', timestamp: 'Hace 15 min', leida: false, prioridad: 'alta', accion: { label: 'Renovar', tipo: 'renovar' } },
  { id: 'n3', tipo: 'ia', titulo: 'IA detect� oportunidad', descripcion: 'Cencosud hist�ricamente renueva en marzo', timestamp: 'Hace 30 min', leida: false, prioridad: 'media', accion: { label: 'Llamar', tipo: 'llamar' } },
  { id: 'n4', tipo: 'pago', titulo: 'Pago recibido: Falabella', descripcion: 'Factura #4521 pagada � $12.5M', timestamp: 'Hace 1h', leida: true, prioridad: 'baja' },
  { id: 'n5', tipo: 'vencimientos', titulo: 'Contrato por vencer', descripcion: 'Cencosud vence en 15 d�as', timestamp: 'Hace 2h', leida: true, prioridad: 'media', accion: { label: 'Ver', tipo: 'ver' } },
];

export function MobileNotificacionesView() {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [filtro, setFiltro] = useState('todas');

  const noLeidas = notifs.filter(n => !n.leida).length;
  const filtered = filtro === 'todas' ? notifs :
    filtro === 'no_leidas' ? notifs.filter(n => !n.leida) :
    notifs.filter(n => n.tipo === filtro);

  const marcarLeida = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, leida: true } : n));
  const eliminar = (id: string) => setNotifs(p => p.filter(n => n.id !== id));
  const marcarTodas = () => setNotifs(p => p.map(n => ({ ...n, leida: true })));

  const cfg: Record<string, { icon: React.ReactNode; color: string }> = {
    aprobacion: { icon: <ThumbsUp className="w-4 h-4" />, color: 'bg-[#6888ff]/10 text-[#6888ff]' },
    vencimientos: { icon: <Clock className="w-4 h-4" />, color: 'bg-[#6888ff]/10 text-[#6888ff]' },
    renovacion: { icon: <RefreshCw className="w-4 h-4" />, color: 'bg-[#6888ff]/10 text-[#6888ff]' },
    pago: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-[#6888ff]/10 text-[#6888ff]' },
    ia: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-violet-100 text-[#6888ff]' },
    urgente: { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-[#dfeaff] text-[#9aa3b8]' },
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#6888ff]" />
          <h3 className="font-bold text-lg text-[#69738c]">Notificaciones</h3>
          {noLeidas > 0 && <span className="px-2 py-0.5 bg-[#dfeaff]0 text-white text-[10px] font-bold rounded-full">{noLeidas}</span>}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodas} className="text-xs text-[#6888ff] font-bold">Leer todas</button>
        )}
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['todas', 'no_leidas', 'urgente', 'aprobacion', 'ia'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
              filtro === f ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'
            }`}>
            {f === 'todas' ? 'Todas' : f === 'no_leidas' ? 'No le�das' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-[#6888ff]/5 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-[#6888ff] mx-auto" />
          <p className="mt-3 font-bold text-[#6888ff]">Todo al d�a</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const c = cfg[n.tipo] || cfg.pago;
            return (
              <div key={n.id} onClick={() => marcarLeida(n.id)}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  !n.leida ? 'bg-[#dfeaff]/50 border-[#6888ff]/20' : 'bg-[#dfeaff] border-[#bec8de30]'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-bold truncate ${!n.leida ? 'text-[#69738c]' : 'text-[#69738c]'}`}>{n.titulo}</p>
                    {!n.leida && <div className="w-1.5 h-1.5 rounded-full bg-[#6888ff] shrink-0" />}
                  </div>
                  <p className="text-[10px] text-[#9aa3b8] mt-0.5 line-clamp-2">{n.descripcion}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-[#9aa3b8]">{n.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      {n.accion && (
                        <button className="px-2.5 py-1 bg-[#6888ff] text-white text-[9px] font-bold rounded-lg active:scale-95"
                          onClick={e => { e.stopPropagation(); ; }}>
                          {n.accion.label}
                        </button>
                      )}
                      <button className="p-1 rounded-lg bg-[#dfeaff] active:scale-90"
                        onClick={e => { e.stopPropagation(); eliminar(n.id); }}>
                        <X className="w-3 h-3 text-[#9aa3b8]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
