/**
 * COMPONENT: AGENDA INTERACTIVA — Enhanced Executive Calendar
 * 
 * @description Agenda mejorada con eventos expandibles, detalles del
 * contacto/cliente, prep checklist, quick-actions por evento,
 * y persistencia del estado de prep completado.
 */

'use client';

import React, { useState } from 'react';
import {
  Calendar, Clock, ChevronDown, ChevronUp, Phone,
  Mail, MapPin, CheckSquare, Square, Video,
  Building, User, FileText
} from 'lucide-react';

/* ─── MOCK DATA ──────────────────────────────────────────────── */

interface AgendaEvent {
  id: string;
  title: string;
  time: string;
  type: 'demo' | 'call' | 'meeting' | 'internal' | 'followup';
  client: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  dealValue?: number;
  prepChecklist: string[];
  notes: string;
}

const EVENTS: AgendaEvent[] = [
  {
    id: 'ev-1', title: 'Demo Plataforma — TechCorp', time: '10:00 - 11:00',
    type: 'demo', client: 'TechCorp SA', contactName: 'María González',
    contactRole: 'VP de Tecnología', contactPhone: '+52 55 1234 5678',
    contactEmail: 'mgonzalez@techcorp.com', location: 'Zoom Meeting',
    dealValue: 50000,
    prepChecklist: ['Revisar deck de producto', 'Verificar demo environment', 'Preparar pricing customizado'],
    notes: 'Interesados en módulo de analytics. Mencionar caso de éxito de RetailMax.'
  },
  {
    id: 'ev-2', title: 'Call Cierre — Retail Giant', time: '11:30 - 12:00',
    type: 'call', client: 'Retail Giant', contactName: 'Carlos Herrera',
    contactRole: 'Director Comercial', contactPhone: '+52 55 8765 4321',
    contactEmail: 'cherrera@retailgiant.com', location: 'Llamada telefónica',
    dealValue: 120000,
    prepChecklist: ['Revisar última propuesta', 'Preparar contraoferta'],
    notes: 'Deal cierra en 3 días. Pedir confirmación de presupuesto.'
  },
  {
    id: 'ev-3', title: 'Almuerzo con Prospect', time: '01:00 - 02:00',
    type: 'meeting', client: 'FinanzasPlus', contactName: 'Laura Vega',
    contactRole: 'CEO', contactPhone: '+52 55 5555 1234',
    contactEmail: 'lvega@finanzasplus.com', location: 'Restaurante La Capital',
    prepChecklist: ['Investigar FinanzasPlus en LinkedIn', 'Llevar tarjetas de presentación'],
    notes: 'Primera reunión. Discovery meeting. No presionar venta.'
  },
  {
    id: 'ev-4', title: 'Follow-up HealthTech', time: '02:30 - 03:00',
    type: 'followup', client: 'HealthTech Labs', contactName: 'Pedro Ramírez',
    contactRole: 'CTO', contactPhone: '+52 55 9999 8888',
    contactEmail: 'pramirez@healthtech.com', location: 'Google Meet',
    dealValue: 35000,
    prepChecklist: ['Enviar resumen de última reunión previo a la call'],
    notes: 'Revisar integración con su sistema actual.'
  },
  {
    id: 'ev-5', title: 'Weekly 1:1 con Manager', time: '04:00 - 04:30',
    type: 'internal', client: 'Interno', contactName: 'Carlos López',
    contactRole: 'Sales Manager', contactPhone: '', contactEmail: '',
    location: 'Sala de Reuniones B',
    prepChecklist: ['Actualizar pipeline', 'Preparar preguntas de coaching'],
    notes: 'Discutir estrategia Q2 y progreso de deals.'
  },
];

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  demo: { bg: 'bg-purple-500', text: 'text-purple-600', icon: Video },
  call: { bg: 'bg-blue-500', text: 'text-blue-600', icon: Phone },
  meeting: { bg: 'bg-emerald-500', text: 'text-emerald-600', icon: Building },
  internal: { bg: 'bg-slate-400', text: 'text-slate-600', icon: User },
  followup: { bg: 'bg-amber-500', text: 'text-amber-600', icon: Mail },
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const AgendaInteractiva = () => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [completedPrep, setCompletedPrep] = useState<Record<string, boolean[]>>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('agenda-prep-state');
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return {};
  });

  const togglePrep = (eventId: string, index: number) => {
    setCompletedPrep(prev => {
      const evPrep = prev[eventId] || [];
      const updated = [...evPrep];
      updated[index] = !updated[index];
      const next = { ...prev, [eventId]: updated };
      // Persist to localStorage
      try { localStorage.setItem('agenda-prep-state', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const getPrepProgress = (eventId: string, total: number) => {
    const done = (completedPrep[eventId] || []).filter(Boolean).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-orange-500" />
          Agenda de Hoy
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{EVENTS.length} eventos</span>
        </h3>
        <div className="flex gap-2">
          {Object.entries(TYPE_STYLES).map(([key, style]) => {
            const Icon = style.icon;
            return (
              <div key={key} className={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center`} title={key}>
                <Icon size={10} className="text-white" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="divide-y divide-slate-50">
        {EVENTS.map((event) => {
          const isExpanded = expandedEvent === event.id;
          const style = TYPE_STYLES[event.type];
          const Icon = style.icon;
          const prep = getPrepProgress(event.id, event.prepChecklist.length);

          return (
            <div key={event.id}>
              {/* Collapsed Row */}
              <button
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors text-left"
              >
                <div className={`w-1.5 h-12 rounded-full ${style.bg} flex-shrink-0`} />
                <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{event.title}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> {event.time} • {event.client}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Prep Progress */}
                  {prep.total > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${prep.pct === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          style={{ width: `${prep.pct}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${prep.pct === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {prep.done}/{prep.total}
                      </span>
                    </div>
                  )}
                  {event.dealValue && (
                    <span className="text-xs font-bold text-emerald-600">${(event.dealValue / 1000).toFixed(0)}K</span>
                  )}
                  {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 animate-in slide-in-from-top-1 duration-200">
                  <div className="ml-14 space-y-4">
                    {/* Contact + Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Contacto</p>
                        <p className="text-sm font-semibold text-slate-800">{event.contactName}</p>
                        <p className="text-xs text-slate-500">{event.contactRole}</p>
                        {event.contactPhone && (
                          <a href={`tel:${event.contactPhone}`} className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                            <Phone size={10} /> {event.contactPhone}
                          </a>
                        )}
                        {event.contactEmail && (
                          <a href={`mailto:${event.contactEmail}`} className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                            <Mail size={10} /> {event.contactEmail}
                          </a>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Ubicación</p>
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" /> {event.location}
                        </p>
                        {event.notes && (
                          <>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Notas</p>
                            <p className="text-xs text-slate-600 italic">{event.notes}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Prep Checklist */}
                    {event.prepChecklist.length > 0 && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <p className="text-[10px] uppercase font-bold text-amber-600 mb-2 flex items-center gap-1">
                          <FileText size={10} /> Checklist de Preparación
                        </p>
                        <div className="space-y-1.5">
                          {event.prepChecklist.map((item, i) => {
                            const isDone = completedPrep[event.id]?.[i];
                            return (
                              <button
                                key={`${item}-${i}`}
                                onClick={() => togglePrep(event.id, i)}
                                className="flex items-center gap-2 text-left w-full hover:bg-amber-100/50 rounded-lg px-1 py-0.5 transition-colors"
                              >
                                {isDone
                                  ? <CheckSquare size={14} className="text-emerald-500 flex-shrink-0" />
                                  : <Square size={14} className="text-amber-400 flex-shrink-0" />
                                }
                                <span className={`text-xs ${isDone ? 'text-slate-400 line-through' : 'text-amber-800'}`}>
                                  {item}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
};
