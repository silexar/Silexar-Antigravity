/**
 * 🚀 DESKTOP: Deal Room — Vista 360° de Oportunidad
 * 
 * Timeline, stakeholders, docs, pasos IA, acciones directas.
 * Todo en una sola pantalla sin cambiar de sistema.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase, Phone, Mail, Calendar,
  TrendingUp, Clock, AlertTriangle,
  FileText, Sparkles,
  ArrowRight, Send, Video,
} from 'lucide-react';

interface Deal {
  id: string; cliente: string; contacto: string; email: string; tel: string;
  titulo: string; valor: number; stage: string; prob: number;
  urgenciaScore: number; urgenciaNivel: string; diasSinContacto: number; fechaCierre: string;
  actividades: { tipo: string; fecha: string; desc: string }[];
  stakeholders: { nombre: string; cargo: string; influencia: number; posicion: string }[];
}

export function DealRoom() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selected, setSelected] = useState<Deal | null>(null);
  const [tab, setTab] = useState<'timeline' | 'stakeholders' | 'docs' | 'ia'>('timeline');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=deals')
      .then(r => r.json())
      .then(d => { if (d.success) { setDeals(d.data); setSelected(d.data[0]); } })
      .catch(() => {});
  }, []);

  const dl = selected;
  if (!dl) return <div className="neo-card rounded-2xl p-8 text-center text-slate-400">Cargando Deal Room...</div>;

  const stageColors: Record<string, string> = {
    prospecto: 'bg-slate-400', calificado: 'bg-blue-500', propuesta: 'bg-indigo-500',
    negociacion: 'bg-amber-500', cerrado_ganado: 'bg-emerald-500', cerrado_perdido: 'bg-red-500',
  };

  const posColors: Record<string, string> = {
    champion: 'bg-emerald-100 text-emerald-700', supporter: 'bg-blue-100 text-blue-700',
    neutral: 'bg-slate-100 text-slate-600', blocker: 'bg-red-100 text-red-700',
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="font-black text-lg">{dl.titulo}</h2>
            <p className="text-xs text-slate-400">{dl.cliente} · {dl.contacto}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 ${stageColors[dl.stage] || 'bg-slate-500'} text-white text-xs font-bold rounded-full`}>
            {dl.stage.replace(/_/g, ' ')}
          </span>
          <span className="text-xl font-black">${(dl.valor / 1000).toFixed(0)}K</span>
        </div>
      </div>

      {/* DEAL SELECTOR + KPIs */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-4">
        <select value={dl.id} onChange={e => setSelected(deals.find(d => d.id === e.target.value) || null)}
          className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer">
          {deals.map(d => <option key={d.id} value={d.id}>{d.cliente} — {d.titulo}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-slate-500"><TrendingUp className="w-3 h-3" /> {dl.prob}% prob</span>
          <span className={`flex items-center gap-1 ${dl.diasSinContacto > 3 ? 'text-red-500' : 'text-slate-500'}`}>
            <Clock className="w-3 h-3" /> {dl.diasSinContacto}d sin contacto
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            dl.urgenciaNivel === 'critica' ? 'bg-red-100 text-red-600' :
            dl.urgenciaNivel === 'alta' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
          }`}>Urgencia: {dl.urgenciaScore}</span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2">
        <a href={`tel:${dl.tel}`} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-blue-700"><Phone className="w-3 h-3" /> Llamar</a>
        <a href={`mailto:${dl.email}`} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-purple-700"><Mail className="w-3 h-3" /> Email</a>
        <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-700"><Calendar className="w-3 h-3" /> Agendar</button>
        <button className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-amber-700"><Send className="w-3 h-3" /> Propuesta</button>
        <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-indigo-700"><Video className="w-3 h-3" /> Meet</button>
      </div>

      {/* TABS */}
      <div className="px-6 border-b border-slate-100 flex gap-1">
        {(['timeline', 'stakeholders', 'docs', 'ia'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-bold transition ${tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {t === 'timeline' ? 'Timeline' : t === 'stakeholders' ? 'Stakeholders' : t === 'docs' ? 'Documentos' : 'IA Insights'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* TIMELINE */}
        {tab === 'timeline' && (
          <div className="space-y-3">
            {dl.actividades.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  a.tipo === 'llamada' ? 'bg-blue-100' : a.tipo === 'email' ? 'bg-purple-100' : 'bg-emerald-100'
                }`}>
                  {a.tipo === 'llamada' ? <Phone className="w-4 h-4 text-blue-600" /> :
                   a.tipo === 'email' ? <Mail className="w-4 h-4 text-purple-600" /> :
                   <Calendar className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{a.desc}</p>
                  <p className="text-[10px] text-slate-400">{a.fecha} · {a.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STAKEHOLDERS */}
        {tab === 'stakeholders' && (
          <div className="space-y-3">
            {dl.stakeholders.map((s, i) => (
              <div key={i} className="neo-card rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {s.nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">{s.nombre}</p>
                  <p className="text-[10px] text-slate-500">{s.cargo}</p>
                </div>
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.influencia}%` }} />
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${posColors[s.posicion] || 'bg-slate-100 text-slate-500'}`}>
                  {s.posicion}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* DOCS */}
        {tab === 'docs' && (
          <div className="space-y-2">
            <div className="neo-card rounded-xl p-3 flex items-center gap-3"><FileText className="w-4 h-4 text-blue-500" /><span className="text-sm font-bold text-slate-700">Propuesta_v2.pdf</span><span className="ml-auto text-[10px] text-slate-400">2.4 MB</span></div>
            <div className="neo-card rounded-xl p-3 flex items-center gap-3"><FileText className="w-4 h-4 text-emerald-500" /><span className="text-sm font-bold text-slate-700">ROI_Calculator.xlsx</span><span className="ml-auto text-[10px] text-slate-400">340 KB</span></div>
            <div className="neo-card rounded-xl p-3 flex items-center gap-3"><FileText className="w-4 h-4 text-purple-500" /><span className="text-sm font-bold text-slate-700">NDA_Signed.pdf</span><span className="ml-auto text-[10px] text-slate-400">180 KB</span></div>
          </div>
        )}

        {/* IA INSIGHTS */}
        {tab === 'ia' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
              <p className="text-xs font-bold text-violet-700 flex items-center gap-1 mb-2"><Sparkles className="w-3 h-3" /> Próximos Pasos Sugeridos</p>
              {['Agendar reunión cierre con CTO', 'Enviar comparativo vs CompetitorX a CFO', 'Preparar prueba de concepto técnica'].map((p, i) => (
                <p key={i} className="text-xs text-violet-600 mt-1 flex items-start gap-1"><ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /> {p}</p>
              ))}
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-2"><AlertTriangle className="w-3 h-3" /> Riesgos Detectados</p>
              <p className="text-xs text-amber-600">CFO Sarah Chen aún en posición neutral — considere enviar business case financiero personalizado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
