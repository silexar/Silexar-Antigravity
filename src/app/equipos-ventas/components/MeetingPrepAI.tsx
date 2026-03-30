/**
 * 📋 DESKTOP: Meeting Prep IA — Preparador de Reuniones
 * 
 * Auto-genera brief antes de cada reunión: bio contacto,
 * historial, objeciones, talking points, docs relevantes.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, User, Clock, FileText,
  AlertTriangle, CheckCircle2, Sparkles,
  ArrowRight, BookOpen,
} from 'lucide-react';

interface Reunion {
  id: string; titulo: string; fecha: string; contacto: string;
  cargo: string; empresa: string; dealId: string;
  bio: string; historial: string[]; objeciones: string[];
  talkingPoints: string[]; docs: string[];
}

export function MeetingPrepAI() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [selected, setSelected] = useState<Reunion | null>(null);

  useEffect(() => {
    fetch('/api/equipos-ventas/deals?tipo=reuniones')
      .then(r => r.json())
      .then(d => { if (d.success) { setReuniones(d.data); setSelected(d.data[0]); } })
      .catch(() => {});
  }, []);

  const r = selected;
  if (!r) return <div className="neo-card rounded-2xl p-8 text-center text-slate-400">Sin reuniones programadas</div>;

  const fechaObj = new Date(r.fecha);
  const ahora = new Date();
  const diffMin = Math.max(0, Math.round((fechaObj.getTime() - ahora.getTime()) / 60000));
  const enMinutos = diffMin < 60;

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="font-black text-lg text-slate-800">Meeting Prep IA</h2>
            <p className="text-xs text-slate-500">{reuniones.length} reuniones próximas</p>
          </div>
        </div>
        {enMinutos && (
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            ¡En {diffMin} min!
          </span>
        )}
      </div>

      {/* REUNION SELECTOR */}
      <div className="px-6 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto">
        {reuniones.map(re => (
          <button key={re.id} onClick={() => setSelected(re)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition ${
              selected?.id === re.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>{re.empresa}</button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {/* MEETING INFO */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="font-bold text-sm text-slate-800">{r.titulo}</p>
            <p className="text-xs text-slate-500">{new Date(r.fecha).toLocaleString('es-CL')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-slate-800">{r.contacto}</p>
            <p className="text-[10px] text-slate-400">{r.cargo} · {r.empresa}</p>
          </div>
        </div>

        {/* BIO */}
        <div>
          <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2"><User className="w-3 h-3" /> Sobre el contacto</p>
          <p className="text-sm text-slate-700 bg-blue-50 rounded-xl p-3 border border-blue-100">{r.bio}</p>
        </div>

        {/* HISTORIAL */}
        <div>
          <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2"><Clock className="w-3 h-3" /> Historial de Interacciones</p>
          <div className="space-y-1.5">
            {r.historial.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {h}
              </div>
            ))}
          </div>
        </div>

        {/* OBJECIONES PREVIAS */}
        {r.objeciones.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2"><AlertTriangle className="w-3 h-3 text-amber-500" /> Objeciones Conocidas</p>
            <div className="space-y-1.5">
              {r.objeciones.map((o, i) => (
                <p key={i} className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">{o}</p>
              ))}
            </div>
          </div>
        )}

        {/* TALKING POINTS */}
        <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100">
          <p className="text-xs font-bold text-violet-700 flex items-center gap-1 mb-2"><Sparkles className="w-3 h-3" /> Talking Points Sugeridos por IA</p>
          {r.talkingPoints.map((tp, i) => (
            <p key={i} className="text-sm text-violet-600 mt-1.5 flex items-start gap-1.5">
              <ArrowRight className="w-3 h-3 shrink-0 mt-0.5" /> {tp}
            </p>
          ))}
        </div>

        {/* DOCUMENTOS */}
        <div>
          <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2"><FileText className="w-3 h-3" /> Documentos Relevantes</p>
          <div className="flex gap-2 flex-wrap">
            {r.docs.map((doc, i) => (
              <button key={i} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-200">
                <FileText className="w-3 h-3" /> {doc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
