/**
 * 🔔 DESKTOP: Centro de Notificaciones Inteligente
 * 
 * Panel lateral con alertas agrupadas por prioridad, acciones
 * directas (aprobar, renovar, llamar), y filtros por tipo.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  Bell, X, CheckCircle2, AlertTriangle, Clock,
  RefreshCw, DollarSign,
  ThumbsUp,
  Sparkles, Trash2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Notificacion {
  id: string;
  tipo: 'aprobacion' | 'vencimiento' | 'renovacion' | 'pago' | 'ia' | 'urgente';
  titulo: string;
  descripcion: string;
  timestamp: string;
  leida: boolean;
  accion?: { label: string; tipo: 'aprobar' | 'renovar' | 'llamar' | 'ver' };
  contratoRef?: string;
  prioridad: 'alta' | 'media' | 'baja';
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const NOTIFS_MOCK: Notificacion[] = [
  { id: 'n1', tipo: 'aprobacion', titulo: 'Contrato Banco Chile pendiente', descripcion: 'SP-2025-0012 requiere aprobación de gerencia ($85M)', timestamp: 'Hace 5 min', leida: false, prioridad: 'alta', accion: { label: 'Aprobar', tipo: 'aprobar' }, contratoRef: 'SP-2025-0012' },
  { id: 'n2', tipo: 'urgente', titulo: 'Vencimiento crítico: LATAM', descripcion: 'Contrato SP-2024-0088 vence en 3 días. Valor: $200M', timestamp: 'Hace 15 min', leida: false, prioridad: 'alta', accion: { label: 'Renovar', tipo: 'renovar' }, contratoRef: 'SP-2024-0088' },
  { id: 'n3', tipo: 'ia', titulo: 'IA detectó oportunidad', descripcion: 'Cencosud históricamente renueva en marzo. Contactar ahora.', timestamp: 'Hace 30 min', leida: false, prioridad: 'media', accion: { label: 'Llamar', tipo: 'llamar' } },
  { id: 'n4', tipo: 'pago', titulo: 'Pago recibido: Falabella', descripcion: 'Factura #4521 pagada — $12.5M CLP', timestamp: 'Hace 1h', leida: true, prioridad: 'baja' },
  { id: 'n5', tipo: 'vencimiento', titulo: 'Contrato por vencer', descripcion: 'Cencosud SP-2024-0201 vence en 15 días', timestamp: 'Hace 2h', leida: true, prioridad: 'media', accion: { label: 'Ver', tipo: 'ver' }, contratoRef: 'SP-2024-0201' },
  { id: 'n6', tipo: 'renovacion', titulo: 'Renovación exitosa', descripcion: 'Entel renovó automáticamente SP-2024-0150 por 12 meses', timestamp: 'Hace 3h', leida: true, prioridad: 'baja' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifs, setNotifs] = useState(NOTIFS_MOCK);
  const [filtro, setFiltro] = useState<string>('todas');

  if (!isOpen) return null;

  const noLeidas = notifs.filter(n => !n.leida).length;
  const filtered = filtro === 'todas' ? notifs :
    filtro === 'no_leidas' ? notifs.filter(n => !n.leida) :
    notifs.filter(n => n.tipo === filtro);

  const marcarLeida = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const marcarTodas = () => {
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const eliminar = (id: string) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const tipoConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    aprobacion: { icon: <ThumbsUp className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600' },
    vencimiento: { icon: <Clock className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600' },
    renovacion: { icon: <RefreshCw className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
    pago: { icon: <DollarSign className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600' },
    ia: { icon: <Sparkles className="w-4 h-4" />, color: 'bg-violet-100 text-violet-600' },
    urgente: { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-100 text-red-600' },
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[420px] neo-card z-50 flex flex-col border-l border-slate-200">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h2 className="font-black text-lg text-slate-800">Notificaciones</h2>
          {noLeidas > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{noLeidas}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {noLeidas > 0 && (
            <button onClick={marcarTodas} className="text-xs text-indigo-600 font-bold hover:underline">
              Marcar todas
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto border-b border-slate-50">
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'no_leidas', label: 'No leídas' },
          { key: 'aprobacion', label: 'Aprobaciones' },
          { key: 'urgente', label: 'Urgentes' },
          { key: 'ia', label: 'IA' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filtro === f.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto" />
            <p className="mt-3 font-bold text-slate-400">Sin notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(n => {
              const cfg = tipoConfig[n.tipo] || tipoConfig.pago;
              return (
                <div key={n.id}
                  onClick={() => marcarLeida(n.id)}
                  className={`px-5 py-4 hover:bg-slate-50 cursor-pointer transition ${!n.leida ? 'bg-indigo-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold truncate ${!n.leida ? 'text-slate-800' : 'text-slate-600'}`}>
                          {n.titulo}
                        </p>
                        {!n.leida && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.descripcion}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                        <div className="flex items-center gap-2">
                          {n.accion && (
                            <button className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition"
                              onClick={e => { e.stopPropagation(); ; }}>
                              {n.accion.label}
                            </button>
                          )}
                          <button className="p-1 rounded hover:bg-slate-200"
                            onClick={e => { e.stopPropagation(); eliminar(n.id); }}>
                            <Trash2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
