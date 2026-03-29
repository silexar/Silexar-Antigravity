/**
 * 🛡️ DESKTOP: Objection Handler IA — Manejo de Objeciones
 * 
 * Base de conocimiento searchable con respuestas,
 * estadísticas de éxito, ejemplos reales.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Search, DollarSign, Swords,
  Clock, Puzzle, FileText, Heart,
  CheckCircle2, Star,
  ChevronDown, Copy, Sparkles,
} from 'lucide-react';

interface Objecion {
  id: string; categoria: string; objecion: string; respuesta: string;
  tasaExito: number; vecesUsada: number; ejemplo: string;
}

const CAT_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  precio: { icon: DollarSign, label: 'Precio', color: 'bg-red-100 text-red-600' },
  competencia: { icon: Swords, label: 'Competencia', color: 'bg-orange-100 text-orange-600' },
  timing: { icon: Clock, label: 'Timing', color: 'bg-amber-100 text-amber-600' },
  features: { icon: Puzzle, label: 'Features', color: 'bg-blue-100 text-blue-600' },
  contrato: { icon: FileText, label: 'Contrato', color: 'bg-indigo-100 text-indigo-600' },
  confianza: { icon: Heart, label: 'Confianza', color: 'bg-pink-100 text-pink-600' },
};

export function ObjectionHandler() {
  const [objeciones, setObjeciones] = useState<Objecion[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=objeciones')
      .then(r => r.json())
      .then(d => { if (d.success) setObjeciones(d.data); })
      .catch(() => {});
  }, []);

  const filtered = objeciones.filter(o =>
    (!catFilter || o.categoria === catFilter) &&
    (!search || o.objecion.toLowerCase().includes(search.toLowerCase()) || o.respuesta.toLowerCase().includes(search.toLowerCase()))
  );

  const copyResp = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 flex items-center gap-3">
        <Shield className="w-5 h-5 text-rose-600" />
        <div>
          <h2 className="font-black text-lg text-slate-800">Objection Handler IA</h2>
          <p className="text-xs text-slate-500">Base de conocimiento con {objeciones.length} respuestas probadas</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar objeción... ej: 'caro', 'competidor', 'largo'"
            aria-label="Buscar objeción"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-rose-400" />
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${!catFilter ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>Todas</button>
          {Object.entries(CAT_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setCatFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${catFilter === key ? cfg.color : 'bg-slate-100 text-slate-500'}`}>
              <cfg.icon className="w-3 h-3" /> {cfg.label}
            </button>
          ))}
        </div>

        {/* OBJECTIONS LIST */}
        <div className="space-y-2">
          {filtered.map(o => {
            const cfg = CAT_CONFIG[o.categoria] || CAT_CONFIG.precio;
            const isExp = expanded === o.id;
            return (
              <div key={o.id} className={`rounded-xl border transition overflow-hidden ${isExp ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}>
                <button onClick={() => setExpanded(isExp ? null : o.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${cfg.color}`}>{cfg.label}</span>
                  <p className="flex-1 text-sm font-bold text-slate-800">&#34;{o.objecion}&#34;</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{o.tasaExito}%</span>
                    <span>{o.vecesUsada}x</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-300 transition ${isExp ? 'rotate-180' : ''}`} />
                </button>

                {isExp && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* SUGGESTED RESPONSE */}
                    <div className="p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
                      <p className="text-[10px] font-bold text-violet-700 flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3" /> Respuesta Sugerida</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{o.respuesta}</p>
                      <button onClick={() => copyResp(o.id, o.respuesta)}
                        className="mt-2 px-3 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-violet-700">
                        {copied === o.id ? <><CheckCircle2 className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar respuesta</>}
                      </button>
                    </div>

                    {/* EXAMPLE */}
                    {o.ejemplo && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mb-1"><Star className="w-3 h-3" /> Caso Real</p>
                        <p className="text-xs text-emerald-700">{o.ejemplo}</p>
                      </div>
                    )}

                    {/* STATS BAR */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Tasa de éxito:</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${o.tasaExito}%` }} />
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{o.tasaExito}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
