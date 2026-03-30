/**
 * 📅 MOBILE: Vista Calendario
 * 
 * Calendario mensual compacto con event dots, panel de detalle por día,
 * y categorización de eventos. Adaptación de calendario/page.tsx.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Clock,
  FileText, DollarSign, Users, AlertTriangle,
  Bell, RefreshCw
} from 'lucide-react';
import type { EventoCalendario, TipoEvento } from '../../_shared/types';

// ═══════════════════════════════════════════════════════════════
// MESES Y DIAS
// ═══════════════════════════════════════════════════════════════

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

// ═══════════════════════════════════════════════════════════════
// TIPO CONFIG
// ═══════════════════════════════════════════════════════════════

const TIPO_CONFIG: Record<TipoEvento, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  vencimiento: { label: 'Vencimiento', color: 'text-red-600', bg: 'bg-red-500', icon: AlertTriangle },
  renovacion: { label: 'Renovación', color: 'text-amber-600', bg: 'bg-amber-500', icon: RefreshCw },
  reunion: { label: 'Reunión', color: 'text-purple-600', bg: 'bg-purple-500', icon: Users },
  pago: { label: 'Pago', color: 'text-emerald-600', bg: 'bg-emerald-500', icon: DollarSign },
  obligacion: { label: 'Obligación', color: 'text-blue-600', bg: 'bg-blue-500', icon: FileText },
  recordatorio: { label: 'Recordatorio', color: 'text-slate-600', bg: 'bg-slate-500', icon: Bell },
};

// ═══════════════════════════════════════════════════════════════
// MOCK EVENTS
// ═══════════════════════════════════════════════════════════════

function generarEventosMock(): EventoCalendario[] {
  const hoy = new Date();
  const eventos: EventoCalendario[] = [];
  const tipos: TipoEvento[] = ['vencimiento', 'renovacion', 'reunion', 'pago', 'obligacion', 'recordatorio'];
  const clientes = ['Banco Chile', 'Falabella', 'Cencosud', 'Ripley', 'LATAM', 'Entel', 'Paris'];
  const acciones = ['Renovar contrato', 'Reunión ejecutiva', 'Fecha de pago', 'Entrega material', 'Revisión trimestral', 'Vencimiento póliza', 'Firma digital'];

  for (let i = -5; i < 30; i++) {
    if (Math.random() > 0.4) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      eventos.push({
        id: `ev-${i}`,
        tipo,
        titulo: acciones[Math.floor(Math.random() * acciones.length)],
        descripcion: `${clientes[Math.floor(Math.random() * clientes.length)]}`,
        fecha: fecha.toISOString().split('T')[0],
        horaInicio: tipo === 'reunion' ? `${9 + Math.floor(Math.random() * 8)}:00` : undefined,
        horaFin: tipo === 'reunion' ? `${10 + Math.floor(Math.random() * 8)}:00` : undefined,
        todoElDia: tipo !== 'reunion',
        clienteNombre: clientes[Math.floor(Math.random() * clientes.length)],
        valor: tipo === 'pago' ? Math.floor(Math.random() * 50000000) + 5000000 : undefined,
        prioridad: Math.random() > 0.7 ? 'alta' : Math.random() > 0.5 ? 'media' : 'baja',
        completado: i < 0 ? Math.random() > 0.3 : false,
      });
    }
  }
  return eventos;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function MobileCalendarioView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const eventos = useMemo(() => generarEventosMock(), []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday=0
  const daysInMonth = lastDay.getDate();

  const cambiarMes = (delta: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + delta);
    setCurrentDate(next);
  };

  const getEventosForDay = (dateStr: string) => eventos.filter(e => e.fecha === dateStr);

  const selectedEventsFiltered = getEventosForDay(selectedDate);
  const hoyStr = new Date().toISOString().split('T')[0];

  // Count events by type for the month
  const monthEvents = eventos.filter(e => {
    const d = new Date(e.fecha);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div className="space-y-5">
      {/* MONTH HEADER */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
        <button onClick={() => cambiarMes(-1)} className="p-2 rounded-xl bg-slate-50 active:bg-slate-100">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="text-center">
          <p className="font-bold text-slate-800">{MESES[month]} {year}</p>
          <p className="text-[10px] text-slate-400">{monthEvents.length} eventos</p>
        </div>
        <button onClick={() => cambiarMes(1)} className="p-2 rounded-xl bg-slate-50 active:bg-slate-100">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getEventosForDay(dateStr);
            const isToday = dateStr === hoyStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                  isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                  isToday ? 'bg-indigo-50 text-indigo-700' :
                  'text-slate-600'
                }`}
              >
                <span className={`text-sm ${isSelected || isToday ? 'font-bold' : 'font-medium'}`}>{day}</span>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white/70' : TIPO_CONFIG[ev.tipo]?.bg || 'bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY EVENTS */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <span className="text-xs font-bold text-indigo-600">{selectedEventsFiltered.length} eventos</span>
        </div>

        {selectedEventsFiltered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">Sin eventos para este día</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedEventsFiltered.map(evento => (
              <EventCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING URGENTS */}
      {eventos.filter(e => e.prioridad === 'alta' && !e.completado && e.fecha >= hoyStr).length > 0 && (
        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 px-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Próximos Urgentes
          </p>
          <div className="space-y-2">
            {eventos
              .filter(e => e.prioridad === 'alta' && !e.completado && e.fecha >= hoyStr)
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .slice(0, 3)
              .map(evento => (
                <EventCard key={evento.id} evento={evento} showDate />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: EventCard
// ═══════════════════════════════════════════════════════════════

function EventCard({ evento, showDate }: { evento: EventoCalendario; showDate?: boolean }) {
  const config = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.recordatorio;
  const Icon = config.icon;

  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-4 flex items-start gap-3 ${
      evento.completado ? 'opacity-50' : ''
    }`}>
      <div className={`w-9 h-9 rounded-lg ${config.bg} text-white flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${evento.completado ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {evento.titulo}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {evento.clienteNombre && (
            <span className="text-xs text-slate-500">{evento.clienteNombre}</span>
          )}
          {evento.horaInicio && (
            <span className="text-xs text-slate-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {evento.horaInicio}
              {evento.horaFin && ` - ${evento.horaFin}`}
            </span>
          )}
          {showDate && (
            <span className="text-xs text-indigo-600 font-bold">
              {new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        {evento.valor && (
          <p className="text-xs font-bold text-emerald-600">${(evento.valor / 1000000).toFixed(0)}M</p>
        )}
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${config.bg}/10 ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
