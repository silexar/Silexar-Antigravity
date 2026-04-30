/**
 * ?? MOBILE: Auto-Seguimiento Inteligente
 * 
 * Seguimientos autom�ticos con acciones 1-toque:
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
  { id: 's1', cliente: 'Banco Chile', tipo: 'llamar', titulo: 'Confirmar renovaci�n Q2', desc: 'Jos� mencion� +10% radio', cuando: 'Hoy', prio: 'urgente', dias: 2 },
  { id: 's2', cliente: 'Falabella', tipo: 'email', titulo: 'Enviar cotizaci�n navidad', desc: 'Deadline jueves', cuando: 'Hoy', prio: 'urgente', dias: 1, borrador: 'Estimado equipo,\nAdjunto cotizaci�n navidad.\nPresupuesto: $120M.' },
  { id: 's3', cliente: 'LATAM', tipo: 'reunion', titulo: 'Reuni�n renovaci�n urgente', desc: 'Sin respuesta 5 d�as, vence en 7', cuando: 'Ma�ana', prio: 'urgente', dias: 5 },
  { id: 's4', cliente: 'Cencosud', tipo: 'email', titulo: 'Seguimiento propuesta', desc: 'Enviada hace 3 d�as', cuando: 'Ma�ana', prio: 'hoy', dias: 3 },
  { id: 's5', cliente: 'Ripley', tipo: 'propuesta', titulo: 'Propuesta nuevo cliente', desc: 'Contactado en evento', cuando: 'Esta semana', prio: 'semana', dias: 7 },
];

export function MobileAutoFollowUp() {
  const [segs, setSegs] = useState(DATA);
  const [exp, setExp] = useState<string | null>(null);

  const completar = (id: string) => setSegs(p => p.filter(s => s.id !== id));
  const urgentes = segs.filter(s => s.prio === 'urgente').length;

  const icons: Record<string, React.ReactNode> = {
    llamar: <Phone className="w-4 h-4 text-[#6888ff]" />,
    email: <Mail className="w-4 h-4 text-[#6888ff]" />,
    reunion: <Calendar className="w-4 h-4 text-[#6888ff]" />,
    propuesta: <Sparkles className="w-4 h-4 text-[#6888ff]" />,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[#6888ff]" />
          <h3 className="font-bold text-lg text-[#69738c]">Seguimientos</h3>
        </div>
        {urgentes > 0 && (
          <span className="px-2 py-0.5 bg-[#dfeaff] text-[#9aa3b8] text-[10px] font-bold rounded-full flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" /> {urgentes} urgentes
          </span>
        )}
      </div>

      {segs.length === 0 ? (
        <div className="text-center py-10 bg-[#6888ff]/5 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-[#6888ff] mx-auto" />
          <p className="mt-3 font-bold text-[#6888ff]">Todo al d�a</p>
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
                      <p className="text-xs font-bold text-[#69738c] truncate">{s.titulo}</p>
                      {s.prio === 'urgente' && <span className="px-1.5 py-0.5 bg-[#dfeaff]0 text-white text-[7px] font-bold rounded-full">?</span>}
                    </div>
                    <p className="text-[10px] text-[#9aa3b8]">{s.cliente} � {s.dias}d sin contacto</p>
                  </div>
                  <span className="text-[10px] text-[#9aa3b8]">{s.cuando}</span>
                  <ChevronDown className={`w-3 h-3 text-[#9aa3b8] transition ${isExp ? 'rotate-180' : ''}`} />
                </button>

                {isExp && (
                  <div className="px-3 pb-3 space-y-2 border-t border-[#bec8de30] pt-2">
                    <p className="text-xs text-[#69738c]">{s.desc}</p>

                    {s.borrador && (
                      <div className="p-2 bg-[#dfeaff] rounded-lg border border-[#bec8de30]">
                        <p className="text-[9px] font-bold text-[#6888ff] flex items-center gap-0.5 mb-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Borrador IA
                        </p>
                        <p className="text-[10px] text-[#6888ff] whitespace-pre-wrap">{s.borrador}</p>
                        <button className="mt-1.5 px-3 py-1 bg-violet-600 text-white text-[9px] font-bold rounded-lg active:scale-95 flex items-center gap-0.5">
                          <Send className="w-2.5 h-2.5" /> Enviar
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => completar(s.id)}
                        className="flex-1 py-2 bg-[#6888ff] text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hecho
                      </button>
                      <button className="flex-1 py-2 border border-[#bec8de30] rounded-lg text-[10px] font-bold text-[#69738c] active:scale-95 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Ma�ana
                      </button>
                      {s.tipo === 'llamar' && (
                        <a href="tel:+56223456789"
                          className="flex-1 py-2 bg-[#6888ff] text-white rounded-lg text-[10px] font-bold active:scale-95 flex items-center justify-center gap-1">
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
