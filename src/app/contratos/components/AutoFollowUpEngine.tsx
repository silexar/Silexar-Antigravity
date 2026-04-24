/**
 * 🔄 DESKTOP: Motor de Auto-Seguimiento Inteligente
 * 
 * Sistema automático que genera y gestiona seguimientos:
 * - IA sugiere cuándo llamar/enviar email
 * - Programa recordatorios automáticos
 * - Genera borradores de email con contexto
 * - Tracking de propuestas sin respuesta
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform DESKTOP
 */

'use client';

import { useState } from 'react';
import {
  RefreshCw, Phone, Mail, Clock,
  CheckCircle2, AlertTriangle, Calendar,
  Sparkles, Send,
} from 'lucide-react';

interface Seguimiento {
  id: string;
  cliente: string;
  tipo: 'llamar' | 'email' | 'reunion' | 'propuesta';
  titulo: string;
  descripcion: string;
  fechaSugerida: string;
  prioridad: 'urgente' | 'hoy' | 'esta_semana' | 'proximo';
  estado: 'pendiente' | 'completado' | 'pospuesto';
  diasSinContacto: number;
  emailBorrador?: string;
}

const SEGUIMIENTOS: Seguimiento[] = [
  { id: 's1', cliente: 'Banco Chile', tipo: 'llamar', titulo: 'Confirmar renovación Q2', descripcion: 'José Rodríguez mencionó incremento 10%. Llamar para cerrar.', fechaSugerida: 'Hoy', prioridad: 'urgente', estado: 'pendiente', diasSinContacto: 2 },
  { id: 's2', cliente: 'Falabella', tipo: 'email', titulo: 'Enviar cotización navidad', descripcion: 'Solicitaron propuesta $120M. Deadline: jueves.', fechaSugerida: 'Hoy', prioridad: 'urgente', estado: 'pendiente', diasSinContacto: 1, emailBorrador: 'Estimado equipo Falabella,\n\nAdjunto cotización para campaña navideña 2025.\nIncluye: TV Canal 13 (8x), Radio Mix (40x), Digital Performance.\nPresupuesto: $120M con 12% descuento.\n\nQuedo atento a sus comentarios.' },
  { id: 's3', cliente: 'LATAM', tipo: 'reunion', titulo: 'Reunión urgente renovación', descripcion: 'Sin respuesta hace 5 días. Contrato vence en 7 días. Agendar reunión con director.', fechaSugerida: 'Mañana', prioridad: 'urgente', estado: 'pendiente', diasSinContacto: 5 },
  { id: 's4', cliente: 'Ripley', tipo: 'propuesta', titulo: 'Propuesta inicial campaña Q2', descripcion: 'Nuevo cliente potencial. Contactado en evento comercial.', fechaSugerida: 'Esta semana', prioridad: 'esta_semana', estado: 'pendiente', diasSinContacto: 7 },
  { id: 's5', cliente: 'Cencosud', tipo: 'email', titulo: 'Seguimiento propuesta enviada', descripcion: 'Propuesta enviada hace 3 días sin respuesta.', fechaSugerida: 'Mañana', prioridad: 'hoy', estado: 'pendiente', diasSinContacto: 3 },
];

export function AutoFollowUpEngine() {
  const [seguimientos, setSeguimientos] = useState(SEGUIMIENTOS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completar = (id: string) => setSeguimientos(p => p.map(s => s.id === id ? { ...s, estado: 'completado' } : s));
  const posponer = (id: string) => setSeguimientos(p => p.map(s => s.id === id ? { ...s, estado: 'pospuesto', prioridad: 'proximo' } : s));

  const pendientes = seguimientos.filter(s => s.estado === 'pendiente');
  const urgentes = pendientes.filter(s => s.prioridad === 'urgente').length;

  const tipoIcon: Record<string, React.ReactNode> = {
    llamar: <Phone className="w-4 h-4 text-blue-500" />,
    email: <Mail className="w-4 h-4 text-purple-500" />,
    reunion: <Calendar className="w-4 h-4 text-emerald-500" />,
    propuesta: <Sparkles className="w-4 h-4 text-amber-500" />,
  };

  return (
    <div className="neo-card rounded-2xl overflow-hidden">
      <div className="px-6 py-4 bg-[#dfeaff] border-b border-[#bec8de30] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-black text-lg text-[#69738c]">Auto-Seguimiento IA</h3>
            <p className="text-xs text-[#9aa3b8]">{pendientes.length} pendientes · {urgentes} urgentes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {urgentes} urgentes
          </span>
        </div>
      </div>

      <div className="divide-y divide-[#bec8de30]">
        {pendientes.map(s => {
          const isExp = expandedId === s.id;
          return (
            <div key={s.id} className="px-6 py-4">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedId(isExp ? null : s.id)}>
                {tipoIcon[s.tipo]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#69738c]">{s.titulo}</p>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      s.prioridad === 'urgente' ? 'bg-red-100 text-red-600' :
                      s.prioridad === 'hoy' ? 'bg-amber-100 text-amber-600' : 'bg-[#dfeaff] text-[#9aa3b8]'
                    }`}>{s.prioridad === 'urgente' ? '⚡ URGENTE' : s.fechaSugerida}</span>
                  </div>
                  <p className="text-xs text-[#9aa3b8] mt-0.5">{s.cliente} · {s.diasSinContacto}d sin contacto</p>
                </div>
              </div>

              {isExp && (
                <div className="mt-3 ml-7 space-y-3">
                  <p className="text-sm text-[#69738c]">{s.descripcion}</p>

                  {s.emailBorrador && (
                    <div className="p-3 bg-[#dfeaff] rounded-xl border border-[#bec8de30]">
                      <p className="text-[10px] font-bold text-[#6888ff] flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" /> Borrador IA
                      </p>
                      <pre className="text-xs text-[#6888ff] whitespace-pre-wrap font-sans">{s.emailBorrador}</pre>
                      <button className="mt-2 px-4 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 flex items-center gap-1">
                        <Send className="w-3 h-3" /> Enviar borrador
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => completar(s.id)}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completado
                    </button>
                    <button onClick={() => posponer(s.id)}
                      className="px-4 py-2 border border-[#bec8de30] text-[#69738c] text-xs font-bold rounded-xl hover:bg-[#dfeaff] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Posponer
                    </button>
                    {s.tipo === 'llamar' && (
                      <a href="tel:+56223456789" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Llamar ahora
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
