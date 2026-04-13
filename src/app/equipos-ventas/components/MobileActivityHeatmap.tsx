/**
 * 🗺️ MOBILE: Activity Heatmap Compacto
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, Flame, TrendingUp, Phone, Mail, Calendar, Briefcase,
} from 'lucide-react';

interface DL { fecha: string; llamadas: number; emails: number; reuniones: number; deals: number; total: number; }

export function MobileActivityHeatmap() {
  const [logs, setLogs] = useState<DL[]>([]);

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=activity-log')
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.data); })
      .catch((error) => {
        console.error('[MobileActivityHeatmap] Failed to load activity log:', error);
      });
  }, []);

  const maxT = Math.max(...logs.map(l => l.total), 1);
  const total = logs.reduce((s, d) => s + d.total, 0);
  const streak = logs.filter(l => l.total > 0).length;

  const intensity = (v: number) => {
    const p = v / maxT;
    if (p === 0) return 'bg-slate-100';
    if (p < 0.25) return 'bg-emerald-200';
    if (p < 0.5) return 'bg-emerald-300';
    if (p < 0.75) return 'bg-emerald-400';
    return 'bg-emerald-600';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-lg text-slate-800">Mi Actividad</h3>
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="neo-mobile-stat rounded-xl p-2 text-center">
          <TrendingUp className="w-3 h-3 text-emerald-500 mx-auto" />
          <p className="text-sm font-black text-slate-800">{total}</p>
          <p className="text-[8px] text-slate-400">Total</p>
        </div>
        <div className="neo-mobile-stat rounded-xl p-2 text-center">
          <Flame className="w-3 h-3 text-orange-500 mx-auto" />
          <p className="text-sm font-black text-slate-800">{streak}d</p>
          <p className="text-[8px] text-slate-400">Streak</p>
        </div>
        <div className="neo-mobile-stat rounded-xl p-2 text-center">
          <BarChart3 className="w-3 h-3 text-purple-500 mx-auto" />
          <p className="text-sm font-black text-slate-800">{logs.length > 0 ? Math.round(total / logs.length) : 0}</p>
          <p className="text-[8px] text-slate-400">Prom/día</p>
        </div>
      </div>

      {/* MINI HEATMAP */}
      <div className="neo-mobile-card rounded-xl p-3">
        <p className="text-[9px] font-bold text-slate-400 mb-1.5">Últimos 30 días</p>
        <div className="flex gap-0.5 flex-wrap">
          {logs.map((l, i) => (
            <div key={`${l}-${i}`} className={`w-[14px] h-[14px] rounded-sm ${intensity(l.total)}`} />
          ))}
        </div>
      </div>

      {/* BREAKDOWN */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Phone, label: 'Llamadas', val: logs.reduce((s, d) => s + d.llamadas, 0), color: 'text-blue-500' },
          { icon: Mail, label: 'Emails', val: logs.reduce((s, d) => s + d.emails, 0), color: 'text-purple-500' },
          { icon: Calendar, label: 'Reuniones', val: logs.reduce((s, d) => s + d.reuniones, 0), color: 'text-emerald-500' },
          { icon: Briefcase, label: 'Deals', val: logs.reduce((s, d) => s + d.deals, 0), color: 'text-amber-500' },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-2 p-2 neo-mobile-card rounded-lg">
            <m.icon className={`w-3 h-3 ${m.color}`} />
            <p className="text-xs font-black text-slate-800">{m.val}</p>
            <p className="text-[9px] text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
