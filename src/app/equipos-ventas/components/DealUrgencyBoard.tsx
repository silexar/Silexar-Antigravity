/**
 * 🎯 DESKTOP: Deal Urgency Board — Priorización Inteligente
 * 
 * Score dinámico: dias sin contacto + probabilidad + valor + fecha límite.
 * Lista priorizada con acción sugerida.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle, Clock, TrendingUp, DollarSign,
  Phone, Mail, Calendar,
  Target,
} from 'lucide-react';

interface UrgentDeal {
  id: string; cliente: string; titulo: string; valor: number;
  stage: string; prob: number; urgenciaScore: number; urgenciaNivel: string;
  diasSinContacto: number; fechaCierre: string; contacto: string; tel: string; email: string;
}

export function DealUrgencyBoard() {
  const [deals, setDeals] = useState<UrgentDeal[]>([]);
  const [filter, setFilter] = useState<'all' | 'critica' | 'alta'>('all');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=deals')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setDeals([...d.data].sort((a: UrgentDeal, b: UrgentDeal) => b.urgenciaScore - a.urgenciaScore));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? deals : deals.filter(d => d.urgenciaNivel === filter);

  const getAccion = (d: UrgentDeal): { texto: string; icono: React.ReactNode; color: string } => {
    if (d.diasSinContacto > 5) return { texto: 'Llamar ahora', icono: <Phone className="w-3 h-3" />, color: 'bg-red-600' };
    if (d.stage === 'negociacion') return { texto: 'Enviar propuesta', icono: <Mail className="w-3 h-3" />, color: 'bg-purple-600' };
    if (d.stage === 'propuesta') return { texto: 'Follow-up', icono: <Mail className="w-3 h-3" />, color: 'bg-blue-600' };
    return { texto: 'Agendar reunión', icono: <Calendar className="w-3 h-3" />, color: 'bg-emerald-600' };
  };

  const getRazon = (d: UrgentDeal): string => {
    if (d.diasSinContacto > 5) return `${d.diasSinContacto} días sin contacto — riesgo de enfriamiento`;
    if (d.urgenciaNivel === 'critica') return `Deal alto valor ($${(d.valor / 1000).toFixed(0)}K) con cierre próximo`;
    if (d.stage === 'negociacion') return 'En negociación — momentum crítico';
    return `Probabilidad ${d.prob}% — requiere acción para avanzar`;
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-red-600" />
          <div>
            <h2 className="font-black text-lg text-slate-800">Deal Urgency Board</h2>
            <p className="text-xs text-slate-500">{deals.filter(d => d.urgenciaNivel === 'critica' || d.urgenciaNivel === 'alta').length} deals requieren atención inmediata</p>
          </div>
        </div>
        <div className="flex gap-1">
          {(['all', 'critica', 'alta'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {f === 'all' ? 'Todos' : f === 'critica' ? '🔴 Críticos' : '🟡 Altos'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {filtered.map((d) => {
          const accion = getAccion(d);
          return (
            <div key={d.id} className="px-6 py-4 hover:bg-slate-50 transition">
              <div className="flex items-center gap-4">
                {/* SCORE */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg ${
                  d.urgenciaNivel === 'critica' ? 'bg-gradient-to-br from-red-500 to-red-600 neo-glow-red' :
                  d.urgenciaNivel === 'alta' ? 'bg-gradient-to-br from-amber-500 to-orange-500 neo-glow-yellow' :
                  'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  {d.urgenciaScore}
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-800">{d.cliente}</p>
                    <span className="text-[10px] text-slate-400">{d.titulo}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-500" /> {getRazon(d)}
                  </p>
                </div>

                {/* METRICS */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${(d.valor / 1000).toFixed(0)}K</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{d.prob}%</span>
                  <span className={`flex items-center gap-1 ${d.diasSinContacto > 3 ? 'text-red-500' : ''}`}><Clock className="w-3 h-3" />{d.diasSinContacto}d</span>
                </div>

                {/* ACTION */}
                <button className={`px-4 py-2 ${accion.color} text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:opacity-90 transition`}>
                  {accion.icono} {accion.texto}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
