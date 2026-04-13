/**
 * 🛡️ MOBILE: Objection Handler
 * 
 * Cards expandibles para manejo durante la llamada.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Search, DollarSign, Swords,
  Clock, Puzzle, FileText, Heart,
  CheckCircle2, Copy, Sparkles, ChevronDown,
} from 'lucide-react';

interface Obj { id: string; categoria: string; objecion: string; respuesta: string; tasaExito: number; vecesUsada: number; ejemplo: string; }

const CATS: Record<string, { icon: React.ElementType; color: string }> = {
  precio: { icon: DollarSign, color: 'bg-red-100 text-red-600' },
  competencia: { icon: Swords, color: 'bg-orange-100 text-orange-600' },
  timing: { icon: Clock, color: 'bg-amber-100 text-amber-600' },
  features: { icon: Puzzle, color: 'bg-blue-100 text-blue-600' },
  contrato: { icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
  confianza: { icon: Heart, color: 'bg-pink-100 text-pink-600' },
};

export function MobileObjectionHandler() {
  const [objs, setObjs] = useState<Obj[]>([]);
  const [search, setSearch] = useState('');
  const [exp, setExp] = useState<string | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=objeciones')
      .then(r => r.json())
      .then(d => { if (d.success) setObjs(d.data); })
      .catch((error) => {
        console.error('[MobileObjectionHandler] Failed to load objeciones:', error);
      });
  }, []);

  const filtered = objs.filter(o =>
    !search || o.objecion.toLowerCase().includes(search.toLowerCase())
  );

  const copy = (id: string, t: string) => { navigator.clipboard.writeText(t); setCopied(id); setTimeout(() => setCopied(''), 2000); };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-rose-600" />
        <h3 className="font-bold text-lg text-slate-800">Objeciones</h3>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar objeción..."
          aria-label="Buscar objeción"
          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-rose-400" />
      </div>

      {/* LIST */}
      {filtered.map(o => {
        const cfg = CATS[o.categoria];
        const CatIcon = cfg?.icon || DollarSign;
        const isExp = exp === o.id;
        return (
          <div key={o.id} className="neo-mobile-card rounded-xl overflow-hidden">
            <button onClick={() => setExp(isExp ? null : o.id)}
              className="w-full p-3 flex items-center gap-2 text-left">
              <div className={`w-6 h-6 rounded-lg ${cfg?.color || 'bg-slate-100 text-slate-600'} flex items-center justify-center`}><CatIcon className="w-3 h-3" /></div>
              <p className="flex-1 text-[10px] font-bold text-slate-800 line-clamp-1">&#34;{o.objecion}&#34;</p>
              <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />{o.tasaExito}%</span>
              <ChevronDown className={`w-3 h-3 text-slate-300 transition ${isExp ? 'rotate-180' : ''}`} />
            </button>

            {isExp && (
              <div className="px-3 pb-3 space-y-2">
                <div className="p-2 bg-violet-50 rounded-lg border border-violet-100">
                  <p className="text-[9px] font-bold text-violet-700 flex items-center gap-0.5 mb-0.5"><Sparkles className="w-2.5 h-2.5" />Respuesta</p>
                  <p className="text-[10px] text-slate-700 leading-relaxed">{o.respuesta}</p>
                  <button onClick={() => copy(o.id, o.respuesta)}
                    className="mt-1.5 px-2 py-1 bg-violet-600 text-white text-[9px] font-bold rounded active:scale-95 flex items-center gap-1">
                    {copied === o.id ? <><CheckCircle2 className="w-2.5 h-2.5" />OK</> : <><Copy className="w-2.5 h-2.5" />Copiar</>}
                  </button>
                </div>
                {o.ejemplo && (
                  <p className="text-[9px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">{o.ejemplo}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
