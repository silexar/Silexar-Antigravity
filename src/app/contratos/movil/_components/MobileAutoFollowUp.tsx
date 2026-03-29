/**
 * 🔄 MOBILE: Auto-Seguimiento Inteligente
 * 
 * Seguimientos automáticos con acciones 1-toque:
 * llamar, enviar email, posponer, completar.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  RefreshCw, Phone, Mail, Clock,
  CheckCircle2, AlertTriangle, Calendar,
  Sparkles, ChevronDown, Send,
} from 'lucide-react';

interface Seg {
  id: string;
  cliente: string;
  tipo: 'llamar' | 'email' | 'reunion' | 'propuesta';
  titulo: string;
  desc: string;
  cuando: string;
  prio: 'urgente' | 'hoy' | 'semana';
  dias: number;
  borrador?: string;
}

const DATA: Seg[] = [
  { id: 's1', cliente: 'Banco Chile', tipo: 'llamar', titulo: 'Confirmar renovación Q2', desc: 'José mencionó +10% radio', cuando: 'Hoy', prio: 'urgente', dias: 2 },
  { id: 's2', cliente: 'Falabella', tipo: 'email', titulo: 'Enviar cotización navidad', desc: 'Deadline jueves', cuando: 'Hoy', prio: 'urgente', dias: 1, borrador: 'Estimado equipo,\nAdjunto cotización navidad.\nPresupuesto: $120M.' },
  { id: 's3', cliente: 'LATAM', tipo: 'reunion', titulo: 'Reunión renovación urgente', desc: 'Sin respuesta 5 días, vence en 7', cuando: 'Mañana', prio: 'urgente', dias: 5 },
  { id: 's4', cliente: 'Cencosud', tipo: 'email', titulo: 'Seguimiento propuesta', desc: 'Enviada hace 3 días', cuando: 'Mañana', prio: 'hoy', dias: 3 },
  { id: 's5', cliente: 'Ripley', tipo: 'propuesta', titulo: 'Propuesta nuevo cliente', desc: 'Contactado en evento', cuando: 'Esta semana', prio: 'semana', dias: 7 },
];

export function MobileAutoFollowUp() {
  const [segs, setSegs] = useState(DATA);
  const [exp, setExp] = useState<string | null>(null);

  const completar = (id: string) => setSegs(p => p.filter(s => s.id !== id));
  const urgentes = segs.filter(s => s.prio === 'urgente').length;

  const icons: Record<string, React.ReactNode> = {
    llamar: <Phone className="w-4 h-4 text-blue-500" />,
    email: <Mail className="w-4 h-4 text-purple-500" />,
    reunion: <Calendar className="w-4 h-4 text-emerald-500" />,
    propuesta: <Sparkles className="w-4 h-4 text-amber-500" />,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-lg text-slate-800">Seguimientos</h3>
        </div>
        {urgentes > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" /> {urgentes} urgentes
          </span>
        )}
      </div>

      {segs.length === 0 ? (
        <div className="text-center py-10 bg-emerald-50 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto" />
          <p className="mt-3 font-bold text-emerald-600">Todo al día</p>
        </div>
      ) : (
        <div className="space-y-2">
          {segs.map(s => {
            const isExp = exp === s.id;
            return (
              <div key={s.id} className="neo-mobile-card rounded-xl overflow-hidden">
                <button onClick={() => setExp(isExp ? null : s.id)}
                  className="w-full px-3 py-3 flex items-center gap-3 text-left">
                  {icons[s.tipo]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.titulo}</p>
                      {s.prio === 'urgente' && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[7px] font-bold rounded-full">⚡</span>}
                    </div>
                    <p className="text-[10px] text-slate-400">{s.cliente} · {s.dias}d sin contacto</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{s.cuando}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-300 transition ${isExp ? 'rotate-180' : ''}`} />
                </button>

                {isExp && (
                  <div className="px-3 pb-3 space-y-2 border-t border-slate-50 pt-2">
                    <p className="text-xs text-slate-600">{s.desc}</p>

                    {s.borrador && (
                      <div className="p-2 bg-violet-50 rounded-lg border border-violet-100">
                        <p className="text-[9px] font-bold text-violet-700 flex items-center gap-0.5 mb-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Borrador IA
                        </p>
                        <p className="text-[10px] text-violet-600 whitespace-pre-wrap">{s.borrador}</p>
                        <button className="mt-1.5 px-3 py-1 bg-violet-600 text-white text-[9px] font-bold rounded-lg active:scale-95 flex items-center gap-0.5">
                          <Send className="w-2.5 h-2.5" /> Enviar
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => completar(s.id)}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hecho
                      </button>
                      <button className="flex-1 py-2 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 active:scale-95 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Mañana
                      </button>
                      {s.tipo === 'llamar' && (
                        <a href="tel:+56223456789"
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1">
                          <Phone className="w-3 h-3" /> Llamar
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
