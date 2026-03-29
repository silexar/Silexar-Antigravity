/**
 * 🎯 MOBILE: Deal Urgency
 * 
 * Cards priorizadas con score visual y acción 1-toque.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Target, Phone, Mail, Calendar,
  Clock, TrendingUp, DollarSign,
} from 'lucide-react';

interface UD { id: string; cliente: string; titulo: string; valor: number; stage: string; prob: number; urgenciaScore: number; urgenciaNivel: string; diasSinContacto: number; tel: string; email: string; }

export function MobileDealUrgency() {
  const [deals, setDeals] = useState<UD[]>([]);

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=deals')
      .then(r => r.json())
      .then(d => { if (d.success) setDeals([...d.data].sort((a: UD, b: UD) => b.urgenciaScore - a.urgenciaScore)); })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-red-600" />
        <h3 className="font-bold text-lg text-slate-800">Urgencia Deals</h3>
        <span className="ml-auto text-[10px] text-red-500 font-bold">{deals.filter(d => d.urgenciaNivel === 'critica').length} críticos</span>
      </div>

      {deals.map(d => (
        <div key={d.id} className="neo-mobile-card rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black ${
              d.urgenciaNivel === 'critica' ? 'bg-red-500' : d.urgenciaNivel === 'alta' ? 'bg-amber-500' : 'bg-slate-400'
            }`}>{d.urgenciaScore}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{d.cliente}</p>
              <p className="text-[9px] text-slate-400 truncate">{d.titulo}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400">
                <span className="flex items-center gap-0.5"><DollarSign className="w-2.5 h-2.5" />${(d.valor / 1000).toFixed(0)}K</span>
                <span className="flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />{d.prob}%</span>
                <span className={`flex items-center gap-0.5 ${d.diasSinContacto > 3 ? 'text-red-500' : ''}`}><Clock className="w-2.5 h-2.5" />{d.diasSinContacto}d</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <a href={`tel:${d.tel}`} className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Phone className="w-3 h-3" />Llamar</a>
            <a href={`mailto:${d.email}`} className="flex-1 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Mail className="w-3 h-3" />Email</a>
            <button className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Calendar className="w-3 h-3" />Agenda</button>
          </div>
        </div>
      ))}
    </div>
  );
}
