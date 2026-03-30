/**
 * 🚀 MOBILE: Deal Room Compacto
 * 
 * Vista 360° mobile de cada deal con swipe, acciones 1-toque.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase, Phone, Mail, Calendar,
  TrendingUp, Clock, Sparkles, ArrowRight,
  ChevronDown, Users, Send,
} from 'lucide-react';

interface Deal {
  id: string; cliente: string; contacto: string; email: string; tel: string;
  titulo: string; valor: number; stage: string; prob: number;
  urgenciaScore: number; urgenciaNivel: string; diasSinContacto: number;
  actividades: { tipo: string; fecha: string; desc: string }[];
  stakeholders: { nombre: string; cargo: string; influencia: number; posicion: string }[];
}

export function MobileDealRoom() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selId, setSelId] = useState('');
  const [sec, setSec] = useState<'timeline' | 'team' | 'ia' | ''>('');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=deals')
      .then(r => r.json())
      .then(d => { if (d.success) { setDeals(d.data); setSelId(d.data[0]?.id || ''); } })
      .catch(() => {});
  }, []);

  const dl = deals.find(d => d.id === selId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-lg text-slate-800">Deal Room</h3>
      </div>

      {/* DEAL SELECTOR */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {deals.map(d => (
          <button key={d.id} onClick={() => setSelId(d.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
              selId === d.id ? 'bg-indigo-600 text-white' : 'neo-mobile-card text-slate-600'
            }`}>
            {d.cliente}
          </button>
        ))}
      </div>

      {dl && (
        <>
          {/* DEAL CARD */}
          <div className="neo-mobile-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-slate-800">{dl.titulo}</h4>
              <span className="text-lg font-black text-slate-800">${(dl.valor / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded-full font-bold ${
                dl.urgenciaNivel === 'critica' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}>Score: {dl.urgenciaScore}</span>
              <span className="text-slate-400"><TrendingUp className="w-3 h-3 inline" /> {dl.prob}%</span>
              <span className={dl.diasSinContacto > 3 ? 'text-red-500' : 'text-slate-400'}><Clock className="w-3 h-3 inline" /> {dl.diasSinContacto}d</span>
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex gap-2 mt-3">
              <a href={`tel:${dl.tel}`} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Phone className="w-3 h-3" />Llamar</a>
              <a href={`mailto:${dl.email}`} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Mail className="w-3 h-3" />Email</a>
              <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Calendar className="w-3 h-3" />Agenda</button>
              <button className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-bold text-center active:scale-95 flex items-center justify-center gap-1"><Send className="w-3 h-3" />Prop.</button>
            </div>
          </div>

          {/* EXPANDABLE SECTIONS */}
          {(['timeline', 'team', 'ia'] as const).map(s => (
            <div key={s}>
              <button onClick={() => setSec(sec === s ? '' : s)}
                className="w-full neo-mobile-card rounded-xl px-3 py-2.5 flex items-center gap-2 text-left">
                {s === 'timeline' ? <Clock className="w-4 h-4 text-blue-500" /> : s === 'team' ? <Users className="w-4 h-4 text-indigo-500" /> : <Sparkles className="w-4 h-4 text-violet-500" />}
                <span className="text-xs font-bold text-slate-700">{s === 'timeline' ? 'Timeline' : s === 'team' ? `Stakeholders (${dl.stakeholders.length})` : 'IA Insights'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-300 ml-auto transition ${sec === s ? 'rotate-180' : ''}`} />
              </button>
              {sec === s && (
                <div className="mt-1 px-1 space-y-1.5">
                  {s === 'timeline' && dl.actividades.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      {a.tipo === 'llamada' ? <Phone className="w-3 h-3 text-blue-500" /> : a.tipo === 'email' ? <Mail className="w-3 h-3 text-purple-500" /> : <Calendar className="w-3 h-3 text-emerald-500" />}
                      <div className="flex-1"><p className="text-[10px] font-bold text-slate-700">{a.desc}</p><p className="text-[9px] text-slate-400">{a.fecha}</p></div>
                    </div>
                  ))}
                  {s === 'team' && dl.stakeholders.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[9px] font-bold">{st.nombre.split(' ').map(n => n[0]).join('')}</div>
                      <div className="flex-1"><p className="text-[10px] font-bold text-slate-700">{st.nombre}</p><p className="text-[9px] text-slate-400">{st.cargo}</p></div>
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full ${st.posicion === 'champion' ? 'bg-emerald-100 text-emerald-600' : st.posicion === 'blocker' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{st.posicion}</span>
                    </div>
                  ))}
                  {s === 'ia' && (
                    <div className="p-2.5 bg-violet-50 rounded-xl border border-violet-100">
                      {['Agendar reunión cierre', 'Enviar comparativo', 'Preparar POC'].map((p, i) => (
                        <p key={i} className="text-[10px] text-violet-600 mt-0.5 flex items-start gap-1"><ArrowRight className="w-2.5 h-2.5 mt-0.5 shrink-0" />{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
