/**
 * ?? MOBILE: Timeline de Comunicaciones
 * 
 * Historial mobile de: emails, llamadas, notas,
 * cambios de estado, docs adjuntos.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  MessageSquare, Mail, Phone, Edit3,
  CheckCircle2, Paperclip, Clock,
} from 'lucide-react';

interface Evento {
  id: string;
  tipo: 'email' | 'llamada' | 'nota' | 'estado' | 'documento';
  titulo: string;
  desc: string;
  autor: string;
  fecha: string;
}

const EVENTOS: Evento[] = [
  { id: 'e1', tipo: 'estado', titulo: 'Enviado a aprobación', desc: 'Gerencia — monto >$80M', autor: 'Sistema', fecha: '01 Mar 14:30' },
  { id: 'e2', tipo: 'email', titulo: 'Propuesta enviada', desc: 'PDF tarifas Q2 2025', autor: 'María G.', fecha: '01 Mar 11:15' },
  { id: 'e3', tipo: 'llamada', titulo: 'Llamada Gte. Comercial', desc: '12 min — descuento 15%', autor: 'María G.', fecha: '28 Feb 16:00' },
  { id: 'e4', tipo: 'nota', titulo: 'Prefiere radio AM', desc: 'Radio Corazón horario prime', autor: 'Carlos P.', fecha: '27 Feb 10:30' },
  { id: 'e5', tipo: 'documento', titulo: 'Cotización adjunta', desc: 'Cotización_BancoChile.pdf', autor: 'María G.', fecha: '26 Feb 09:00' },
  { id: 'e6', tipo: 'email', titulo: 'Solicitud del cliente', desc: 'Campaña radio 2 meses', autor: 'Cliente', fecha: '25 Feb 15:45' },
];

export function MobileTimelineView() {
  const [filtro, setFiltro] = useState('todos');
  const filtered = filtro === 'todos' ? EVENTOS : EVENTOS.filter(e => e.tipo === filtro);

  const cfg: Record<string, { icon: React.ReactNode; color: string }> = {
    email: { icon: <Mail className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-500' },
    llamada: { icon: <Phone className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-500' },
    nota: { icon: <Edit3 className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-500' },
    estado: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-[#dfeaff] text-[#6888ff]' },
    documento: { icon: <Paperclip className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-500' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#6888ff]" />
        <h3 className="font-bold text-lg text-[#69738c]">Actividad</h3>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['todos', 'email', 'llamada', 'nota'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
              filtro === f ? 'bg-[#6888ff] text-white' : 'bg-[#dfeaff] text-[#9aa3b8]'
            }`}>
            {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-[#dfeaff]" />

        <div className="space-y-1">
          {filtered.map(e => {
            const c = cfg[e.tipo];
            return (
              <div key={e.id} className="flex items-start gap-3 relative pl-1 py-2">
                <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center shrink-0 z-10`}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0 bg-[#dfeaff] rounded-xl border border-[#bec8de30] p-3">
                  <p className="text-xs font-bold text-[#69738c]">{e.titulo}</p>
                  <p className="text-[10px] text-[#9aa3b8] mt-0.5">{e.desc}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-[#9aa3b8]">
                    <span>{e.autor}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {e.fecha}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
