/**
 * 📋 MOBILE: Meeting Prep
 * 
 * Card ultra-compacta para revisar camino a la reunión.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, User, AlertTriangle,
  Sparkles, ArrowRight, FileText, ChevronDown,
} from 'lucide-react';

interface MR { id: string; titulo: string; fecha: string; contacto: string; cargo: string; empresa: string; bio: string; historial: string[]; objeciones: string[]; talkingPoints: string[]; docs: string[]; }

export function MobileMeetingPrep() {
  const [reuniones, setReuniones] = useState<MR[]>([]);
  const [sec, setSec] = useState<string>('');

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=reuniones')
      .then(r => r.json())
      .then(d => { if (d.success) setReuniones(d.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-lg text-slate-800">Meeting Prep</h3>
      </div>

      {reuniones.map(r => (
        <div key={r.id} className="neo-mobile-card rounded-xl overflow-hidden">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-bold text-slate-800 flex-1">{r.titulo}</p>
              <span className="text-[9px] text-slate-400">{new Date(r.fecha).toLocaleDateString('es-CL')}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <User className="w-3 h-3" /> {r.contacto} · {r.cargo} · {r.empresa}
            </div>
          </div>

          {/* EXPANDABLE SECTIONS */}
          {(['bio', 'objeciones', 'talking', 'docs'] as const).map(s => (
            <div key={s}>
              <button onClick={() => setSec(sec === `${r.id}-${s}` ? '' : `${r.id}-${s}`)}
                className="w-full px-3 py-2 border-t border-slate-50 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                {s === 'bio' ? <User className="w-3 h-3 text-blue-500" /> : s === 'objeciones' ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : s === 'talking' ? <Sparkles className="w-3 h-3 text-violet-500" /> : <FileText className="w-3 h-3 text-slate-400" />}
                {s === 'bio' ? 'Bio' : s === 'objeciones' ? `Objeciones (${r.objeciones.length})` : s === 'talking' ? 'Talking Points' : `Docs (${r.docs.length})`}
                <ChevronDown className={`w-2.5 h-2.5 ml-auto transition ${sec === `${r.id}-${s}` ? 'rotate-180' : ''}`} />
              </button>
              {sec === `${r.id}-${s}` && (
                <div className="px-3 pb-2 space-y-1">
                  {s === 'bio' && <p className="text-[10px] text-slate-600 bg-blue-50 p-2 rounded-lg">{r.bio}</p>}
                  {s === 'objeciones' && r.objeciones.map((o, i) => <p key={i} className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg">{o}</p>)}
                  {s === 'talking' && r.talkingPoints.map((tp, i) => <p key={i} className="text-[10px] text-violet-600 flex items-start gap-1"><ArrowRight className="w-2.5 h-2.5 mt-0.5 shrink-0" />{tp}</p>)}
                  {s === 'docs' && r.docs.map((d, i) => <p key={i} className="text-[10px] text-slate-600 flex items-center gap-1"><FileText className="w-2.5 h-2.5" />{d}</p>)}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {reuniones.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Sin reuniones programadas</p>}
    </div>
  );
}
