/**
 * 💬 DESKTOP: Timeline de Comunicaciones por Contrato
 * 
 * Historial centralizado de: emails, llamadas, notas,
 * cambios de estado, documentos. Con filtros por tipo.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  MessageSquare, Mail, Phone,
  Edit3, CheckCircle2,
  Paperclip, Clock,
} from 'lucide-react';

interface Evento {
  id: string;
  tipo: 'email' | 'llamada' | 'nota' | 'estado' | 'documento';
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string;
  hora: string;
}

const EVENTOS: Evento[] = [
  { id: 'e1', tipo: 'estado', titulo: 'Contrato enviado a aprobación', descripcion: 'Nivel: Gerencia — Motivo: monto >$80M', autor: 'Sistema', fecha: '01 Mar', hora: '14:30' },
  { id: 'e2', tipo: 'email', titulo: 'Propuesta enviada al cliente', descripcion: 'PDF adjunto con tarifas Q2 2025 y condiciones especiales', autor: 'María González', fecha: '01 Mar', hora: '11:15' },
  { id: 'e3', tipo: 'llamada', titulo: 'Llamada con Gerente Comercial', descripcion: 'Duración: 12 min. Acordaron descuento 15% y pago 45 días', autor: 'María González', fecha: '28 Feb', hora: '16:00' },
  { id: 'e4', tipo: 'nota', titulo: 'Nota: cliente prefiere radio AM', descripcion: 'Banco Chile históricamente usa Radio Corazón en horario prime', autor: 'Carlos Pérez', fecha: '27 Feb', hora: '10:30' },
  { id: 'e5', tipo: 'documento', titulo: 'Cotización formal adjunta', descripcion: 'Cotización_BancoChile_Q2_2025.pdf — 1.8MB', autor: 'María González', fecha: '26 Feb', hora: '09:00' },
  { id: 'e6', tipo: 'email', titulo: 'Solicitud inicial del cliente', descripcion: 'Email de José Rodríguez solicitando campaña radio 2 meses', autor: 'Cliente', fecha: '25 Feb', hora: '15:45' },
  { id: 'e7', tipo: 'estado', titulo: 'Contrato creado como borrador', descripcion: 'Origen: Smart Capture IA — Confianza: 92%', autor: 'Sistema', fecha: '25 Feb', hora: '15:50' },
];

export function TimelineComunicaciones() {
  const [filtro, setFiltro] = useState('todos');

  const filtered = filtro === 'todos' ? EVENTOS : EVENTOS.filter(e => e.tipo === filtro);

  const tipoConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    email: { icon: <Mail className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-100' },
    llamada: { icon: <Phone className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    nota: { icon: <Edit3 className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-100' },
    estado: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    documento: { icon: <Paperclip className="w-4 h-4" />, color: 'text-purple-500', bg: 'bg-purple-100' },
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-800">Actividad del Contrato</h3>
          <span className="text-xs text-slate-400">{filtered.length} eventos</span>
        </div>
        <div className="flex gap-2">
          {['todos', 'email', 'llamada', 'nota', 'estado', 'documento'].map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                filtro === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>
              {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* LÍNEA VERTICAL */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />

        <div className="divide-y divide-slate-50">
          {filtered.map(e => {
            const cfg = tipoConfig[e.tipo];
            return (
              <div key={e.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition relative">
                <div className={`w-8 h-8 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 z-10`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{e.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{e.descripcion}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span>{e.autor}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {e.fecha} · {e.hora}</span>
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
