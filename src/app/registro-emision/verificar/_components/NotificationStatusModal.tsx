/**
 * 📬 COMPONENT: NotificationStatusModal
 * 
 * Modal de seguimiento en tiempo real para alertas enviadas a programación.
 * Simula respuestas de programadores y estado de tickets.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, User, Smartphone, Mail, RefreshCw, Send } from 'lucide-react';

interface NotificationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConsultation: () => void;
}

export function NotificationStatusModal({ isOpen, onClose, onNewConsultation }: NotificationStatusModalProps) {
  const [elapsed, setElapsed] = useState(0);
interface ProgrammerStatus { id: string; name: string; status: 'pending' | 'offline' | 'assigned'; lastSeen: string; response: string | null; }
  const [programmersStatus, setProgrammersStatus] = useState<ProgrammerStatus[]>([
      { id: '1', name: 'Roberto Silva', status: 'pending', lastSeen: 'Hace 5 min', response: null },
      { id: '2', name: 'María Fernández', status: 'pending', lastSeen: 'En línea', response: null },
      { id: '3', name: 'Carlos López', status: 'offline', lastSeen: 'Offline', response: null },
  ]);

  // Simulation Effect
  useEffect(() => {
    if (isOpen) {
        setElapsed(0);
        // Reset statuses
        setProgrammersStatus(prev => prev.map(p => ({ ...p, status: p.id === '3' ? 'offline' : 'pending', response: null })));

        // Simulate Maria taking the case after 3 seconds
        const timer1 = setTimeout(() => {
            setProgrammersStatus(prev => prev.map(p => p.id === '2' ? { 
                ...p, 
                status: 'assigned', 
                response: 'Estoy revisando, te respondo en 15 min.',
                lastSeen: 'Escribiendo...'
            } : p));
        }, 3500);

        // Timer for elapsed time
        const interval = setInterval(() => setElapsed(e => e + 1), 1000);

        return () => {
            clearTimeout(timer1);
            clearInterval(interval);
        };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-lg bg-[#e0e5ec] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/40">
            
            {/* Header */}
            <div className="bg-emerald-500 text-white p-6 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Send className="w-5 h-5" /> NOTIFICACIÓN ENVIADA
                    </h2>
                    <p className="text-emerald-100 text-sm font-medium mt-1 opacity-90">Sistema de Seguimiento • ID: ALT-2024-001547</p>
                </div>
                <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* STATUS SUMMARY */}
                <div className="bg-white rounded-xl p-4 shadow-inner border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Estado Actual</p>
                            <p className="font-bold text-emerald-600">Enviada a 3 programadores</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase">Tiempo Transcurrido</p>
                        <p className="font-mono text-slate-700 font-bold">{Math.floor(elapsed / 60).toString().padStart(2,'0')}:{(elapsed % 60).toString().padStart(2,'0')}</p>
                    </div>
                </div>

                {/* PROGRAMMERS LIST */}
                <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" /> Respuestas del Equipo
                    </h3>
                    <div className="space-y-3">
                        {programmersStatus.map(prog => (
                            <div key={prog.id} className={`p-3 rounded-xl border transition-all ${
                                prog.status === 'assigned' ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 
                                prog.status === 'pending' ? 'bg-amber-50 border-amber-100' : 'bg-slate-100/50 border-slate-200 opacity-70'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            prog.status === 'assigned' ? 'bg-emerald-500' : 
                                            prog.status === 'pending' ? 'bg-amber-400' : 'bg-slate-400'
                                        }`} />
                                        <span className="font-bold text-slate-700 text-sm">{prog.name}</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">{prog.status === 'assigned' ? '🟢 ASIGNADO' : prog.status === 'pending' ? '🟡 PENDIENTE' : '🔴 OFFLINE'}</span>
                                </div>
                                
                                {prog.status === 'assigned' && (
                                    <div className="mt-2 text-sm text-emerald-800 bg-emerald-100/50 p-2 rounded-lg italic flex gap-2">
                                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                                        "{prog.response}"
                                    </div>
                                )}
                                
                                {prog.status === 'pending' && (
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Último visto: {prog.lastSeen}</span>
                                        <button className="text-[10px] font-bold text-amber-600 hover:text-amber-800 bg-amber-100 px-2 py-1 rounded-full flex items-center gap-1">
                                            🔔 Recordar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* AUTO-MESSAGE TO CLIENT */}
                {programmersStatus.some(p => p.status === 'assigned') && (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 animate-in slide-in-from-bottom-2 fade-in">
                        <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Notificación Automática a Ejecutivo
                        </h4>
                        <p className="text-sm text-blue-800 italic">
                            "Ana García, tu consulta ha sido asignada a María Fernández. Te contactará directamente para resolver el tema (Est. 30 min)."
                        </p>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={onNewConsultation} className="py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-sm transition-all">
                        <RefreshCw className="w-4 h-4" /> Nueva Consulta
                    </button>
                    <button className="py-3 bg-slate-800 text-white hover:bg-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Smartphone className="w-4 h-4" /> Contactar Directo
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
