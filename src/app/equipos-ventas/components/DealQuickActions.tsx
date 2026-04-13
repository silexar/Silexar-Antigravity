/**
 * COMPONENT: DEAL QUICK-ACTIONS — Inline Deal Actions for Executives
 * 
 * @description Popup de acciones rápidas sobre deals: llamar, enviar
 * email, agendar reunión, agregar nota, y escalar deal. Mínima fricción
 * para interacciones frecuentes del ejecutivo.
 */

'use client';

import React, { useState } from 'react';
import {
  Phone, Mail, Calendar, StickyNote, AlertTriangle,
  X, Send, Check, Clock
} from 'lucide-react';

/* ─── TYPES ───────────────────────────────────────────────────── */

interface DealQuickActionsProps {
  dealName: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  onClose: () => void;
}

type ActionId = 'call' | 'email' | 'meeting' | 'note' | 'escalate';

interface QuickAction {
  id: ActionId;
  label: string;
  icon: React.ElementType;
  color: string;
  bgHover: string;
}

const ACTIONS: QuickAction[] = [
  { id: 'call', label: 'Llamar', icon: Phone, color: 'text-emerald-600', bgHover: 'hover:bg-emerald-50' },
  { id: 'email', label: 'Email', icon: Mail, color: 'text-blue-600', bgHover: 'hover:bg-blue-50' },
  { id: 'meeting', label: 'Agendar', icon: Calendar, color: 'text-purple-600', bgHover: 'hover:bg-purple-50' },
  { id: 'note', label: 'Nota', icon: StickyNote, color: 'text-amber-600', bgHover: 'hover:bg-amber-50' },
  { id: 'escalate', label: 'Escalar', icon: AlertTriangle, color: 'text-red-600', bgHover: 'hover:bg-red-50' },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const DealQuickActions = ({ dealName, contactName, contactPhone, contactEmail, onClose }: DealQuickActionsProps) => {
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setActiveAction(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-80 animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-[#F0EDE8] text-white px-4 py-3 flex justify-between items-center">
        <div>
          <p className="text-sm font-bold">{dealName}</p>
          <p className="text-[10px] text-slate-400">{contactName}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Success state */}
      {submitted && (
        <div className="p-6 text-center animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Acción registrada</p>
          <p className="text-[10px] text-slate-400 mt-1">Actividad guardada en el timeline del deal</p>
        </div>
      )}

      {/* Action buttons grid */}
      {!submitted && !activeAction && (
        <div className="p-3 grid grid-cols-5 gap-1">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveAction(action.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${action.bgHover}`}
            >
              <action.icon size={18} className={action.color} />
              <span className="text-[10px] font-semibold text-slate-600">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Action detail panels */}
      {!submitted && activeAction === 'call' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={14} className="text-emerald-500" />
            <span>Llamar a <span className="font-semibold">{contactName}</span></span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-mono font-bold text-slate-800">{contactPhone || '+52 55 1234 5678'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveAction(null)} className="flex-1 text-xs text-slate-500 py-2 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="flex-1 text-xs font-bold bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 flex items-center justify-center gap-1">
              <Phone size={12} /> Llamar
            </button>
          </div>
        </div>
      )}

      {!submitted && activeAction === 'email' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={14} className="text-blue-500" />
            <span>Email a <span className="font-semibold">{contactEmail || 'contact@empresa.com'}</span></span>
          </div>
          <textarea
            className="w-full text-xs border border-slate-200 rounded-xl p-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Escribir mensaje rápido..."
          />
          <div className="flex gap-2">
            <button onClick={() => setActiveAction(null)} className="flex-1 text-xs text-slate-500 py-2 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="flex-1 text-xs font-bold bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 flex items-center justify-center gap-1">
              <Send size={12} /> Enviar
            </button>
          </div>
        </div>
      )}

      {!submitted && activeAction === 'meeting' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-purple-500" />
            <span>Agendar reunión</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Hoy 3PM', 'Mañana 10AM', 'Mañana 2PM'].map((slot) => (
              <button key={slot} className="text-[10px] font-semibold bg-purple-50 text-purple-700 py-2 px-1 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
                <Clock size={9} /> {slot}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveAction(null)} className="flex-1 text-xs text-slate-500 py-2 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="flex-1 text-xs font-bold bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-500">Confirmar</button>
          </div>
        </div>
      )}

      {!submitted && activeAction === 'note' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <StickyNote size={14} className="text-amber-500" />
            <span>Agregar nota al deal</span>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl p-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
            placeholder="Nota rápida..."
          />
          <div className="flex gap-2">
            <button onClick={() => setActiveAction(null)} className="flex-1 text-xs text-slate-500 py-2 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="flex-1 text-xs font-bold bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-400">Guardar</button>
          </div>
        </div>
      )}

      {!submitted && activeAction === 'escalate' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle size={14} />
            <span className="font-semibold">Escalar deal a Manager</span>
          </div>
          <p className="text-[10px] text-slate-400">Esto notificará a tu supervisor y creará un ticket de seguimiento prioritario.</p>
          <div className="flex gap-2">
            <button onClick={() => setActiveAction(null)} className="flex-1 text-xs text-slate-500 py-2 hover:bg-slate-50 rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="flex-1 text-xs font-bold bg-red-600 text-white py-2 rounded-lg hover:bg-red-500">Escalar</button>
          </div>
        </div>
      )}
    </div>
  );
};
