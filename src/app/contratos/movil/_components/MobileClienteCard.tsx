/**
 * ?? MOBILE: Ficha Cliente Rápida
 * 
 * Vista compacta 360° del cliente: contacto 1-toque,
 * historial, preferencias, oportunidades.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import {
  Building2, Phone, Mail, Star,
  DollarSign, FileText, TrendingUp,
  Radio, Tv, Globe, ArrowUpRight,
} from 'lucide-react';

const CL = {
  nombre: 'Banco Chile', rubro: 'Banca', score: 92,
  contacto: 'José Rodríguez', tel: '+56 2 2345 6789', email: 'jrodriguez@bancochile.cl',
  valorHist: 340e6, contratos: 4, tasaRenov: 100, pagoDias: 38,
  prefs: ['Radio FM prime', 'TV estelar', 'Digital SEM'],
  hist: [
    { num: 'SP-2024-0142', val: 85e6, est: 'activo' },
    { num: 'SP-2024-0089', val: 75e6, est: 'completado' },
    { num: 'SP-2023-0201', val: 90e6, est: 'completado' },
  ],
  ops: [
    { titulo: 'Campaña tarjeta Q2', val: 95e6, prob: 85 },
    { titulo: 'App Móvil', val: 40e6, prob: 60 },
  ],
};

export function MobileClienteCard() {
  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="bg-[#6888ff] rounded-2xl p-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-200" />
          <div className="flex-1">
            <h3 className="font-black text-lg">{CL.nombre}</h3>
            <p className="text-xs text-blue-200">{CL.rubro} · {CL.contacto}</p>
          </div>
          <div className="px-2 py-1 bg-[#dfeaff]/20 rounded-lg">
            <Star className="w-3 h-3 text-amber-300 inline" />
            <span className="text-xs font-bold ml-0.5">{CL.score}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <a href={`tel:${CL.tel}`} className="flex-1 py-2 bg-[#dfeaff]/20 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 active:scale-95">
            <Phone className="w-3.5 h-3.5" /> Llamar
          </a>
          <a href={`mailto:${CL.email}`} className="flex-1 py-2 bg-[#dfeaff]/20 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 active:scale-95">
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        <MiniStat icon={<DollarSign className="w-3 h-3 text-emerald-500" />} val={`$${(CL.valorHist / 1e6).toFixed(0)}M`} lbl="Histórico" />
        <MiniStat icon={<FileText className="w-3 h-3 text-[#6888ff]" />} val={String(CL.contratos)} lbl="Contratos" />
        <MiniStat icon={<TrendingUp className="w-3 h-3 text-blue-500" />} val={`${CL.tasaRenov}%`} lbl="Renovación" />
        <MiniStat icon={<DollarSign className="w-3 h-3 text-amber-500" />} val={`${CL.pagoDias}d`} lbl="Pago prom." />
      </div>

      {/* PREFERENCIAS */}
      <div className="flex flex-wrap gap-1.5">
        {CL.prefs.map((p) => (
          <span key={p} className="px-2.5 py-1 bg-[#dfeaff] text-[#6888ff] text-[10px] font-bold rounded-full flex items-center gap-1">
            {p.includes('Radio') ? <Radio className="w-2.5 h-2.5" /> : p.includes('TV') ? <Tv className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
            {p}
          </span>
        ))}
      </div>

      {/* HISTORIAL */}
      <div>
        <p className="text-[10px] font-bold text-[#9aa3b8] mb-1.5">Contratos</p>
        {CL.hist.map((h) => (
          <div key={h.num} className="flex items-center gap-2 py-1.5 border-b border-[#bec8de30]">
            <span className="text-[10px] font-mono text-[#6888ff]">{h.num}</span>
            <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full ${h.est === 'activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-[#dfeaff] text-[#9aa3b8]'}`}>{h.est}</span>
            <span className="text-xs font-bold text-[#69738c] ml-auto">${(h.val / 1e6).toFixed(0)}M</span>
          </div>
        ))}
      </div>

      {/* OPORTUNIDADES */}
      <div>
        <p className="text-[10px] font-bold text-[#9aa3b8] mb-1.5">Oportunidades</p>
        {CL.ops.map((o) => (
          <div key={o.titulo} className="p-2.5 bg-amber-50 rounded-xl border border-[#bec8de30] mb-1.5 flex items-center gap-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
            <div className="flex-1">
              <p className="text-xs font-bold text-[#69738c]">{o.titulo}</p>
              <p className="text-[10px] text-[#9aa3b8]">${(o.val / 1e6).toFixed(0)}M · {o.prob}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ icon, val, lbl }: { icon: React.ReactNode; val: string; lbl: string }) {
  return (
    <div className="neo-mobile-stat rounded-xl p-2 text-center">
      <div className="mx-auto w-fit">{icon}</div>
      <p className="text-sm font-black text-[#69738c] mt-0.5">{val}</p>
      <p className="text-[8px] text-[#9aa3b8]">{lbl}</p>
    </div>
  );
}
