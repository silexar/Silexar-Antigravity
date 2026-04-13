/**
 * 🚨 COMPONENT: AlertDetailsModal
 * 
 * Modal de gestión de incidentes "Zero-Friction" para notificar a programación.
 * Incluye análisis de causa raíz simulado por Cortex-Sense.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, BrainCircuit, User, Send, CheckCircle2, MessageSquare, Clock, Radio, Calendar } from 'lucide-react';
import { ResultadoVerificacion } from './ResultsView';

interface AlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: ResultadoVerificacion | null;
  onSendSuccess: () => void;
}

// Mock Programmers Data
const PROGRAMMERS_MOCK = [
    { id: '1', name: 'Roberto Silva', role: 'Programador Senior', online: true, station: 'Radio Corazón' },
    { id: '2', name: 'María Fernández', role: 'Supervisora Programación', online: true, station: 'Global' },
    { id: '3', name: 'Carlos López', role: 'Backup Programador', online: false, station: 'FM Dos' },
];

export function AlertDetailsModal({ isOpen, onClose, material, onSendSuccess }: AlertDetailsModalProps) {
  const [step, setStep] = useState<'analysis' | 'compose' | 'sending' | 'sent'>('analysis');
  const [message, setMessage] = useState('');
  const [selectedProgrammers, setSelectedProgrammers] = useState<string[]>(['1']);
  
  // Reset state on open
  useEffect(() => {
    if (isOpen && material) {
        setStep('analysis');
        setMessage(generateTemplate(material));
        setSelectedProgrammers(['1']); // Default to senior
    }
  }, [isOpen, material]);

  if (!isOpen || !material) return null;

  const handleSend = () => {
      setStep('sending');
      setTimeout(() => {
          setStep('sent');
          setTimeout(() => {
              onSendSuccess();
          }, 1500);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-[#F0EDE8]/60 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-2xl bg-[#e0e5ec] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/40">
            
            {/* Header */}
            <div className="bg-red-500 text-[#2C2C2A] p-6 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" /> MATERIAL NO ENCONTRADO
                    </h2>
                    <p className="text-red-100 text-sm font-medium mt-1 opacity-90">Protocolo de Incidencia #INT-9921</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-8">
                
                {/* 1. DETAILS PANEL */}
                <div className="bg-white rounded-xl p-5 shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff] mb-6 border border-slate-100">
                    <h3 className="text-xs font-bold text-[#888780] uppercase tracking-widest mb-4">📋 Detalles del Problema</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <DetailItem icon={Radio} label="Material" value={material.nombreMaterial} />
                        <DetailItem icon={Calendar} label="Fecha Programada" value={new Date().toLocaleDateString()} />
                        <DetailItem icon={Clock} label="Horario Esperado" value="10:30 - 17:00 (Bloque PM)" />
                        <DetailItem icon={User} label="Ejecutivo" value="Ana García" />
                    </div>
                </div>

                {/* 2. CORTEX ANALYSIS */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit className="w-5 h-5 text-purple-600" />
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">Análisis IA Cortex-Sense</h3>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-purple-800">Probabilidad de error humano:</span>
                            <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-bold">89% HIGH</span>
                        </div>
                        <ul className="space-y-1 text-purple-700 list-disc list-inside opacity-80">
                            <li>Patrón de omisión coincide con cambio de turno (14:00 hrs).</li>
                            <li>No se detectaron fallos técnicos en la señal de la emisora.</li>
                            <li>Material similar fue emitido en bloque anterior (posible confusión).</li>
                        </ul>
                    </div>
                </div>

                {/* 3. COMPOSITION GENIUS */}
                <div className="mb-6">
                     <div className="flex justify-between items-end mb-3">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                             <MessageSquare className="w-4 h-4 text-teal-600" /> Mensaje a Programación
                        </h3>
                        <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded-lg">✨ Auto-Generado</span>
                     </div>
                     <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none resize-none shadow-inner"
                     />
                </div>

                {/* 4. STAFF SELECTOR */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-[#888780] uppercase tracking-widest mb-3">👥 Destinatarios Sugeridos</h3>
                    <div className="space-y-2">
                        {PROGRAMMERS_MOCK.map(prog => (
                            <div 
                                key={prog.id}
                                onClick={() => setSelectedProgrammers(prev => prev.includes(prog.id) ? prev.filter(id => id !== prog.id) : [...prev, prog.id])} 
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedProgrammers.includes(prog.id) ? 'bg-slate-100 border-teal-400 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-[#888780] font-bold text-xs">
                                            {prog.name.substring(0,2)}
                                        </div>
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#e0e5ec] ${prog.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${selectedProgrammers.includes(prog.id) ? 'text-slate-800' : 'text-[#888780]'}`}>{prog.name}</p>
                                        <p className="text-[10px] text-[#888780] uppercase">{prog.role}</p>
                                    </div>
                                </div>
                                {selectedProgrammers.includes(prog.id) && <CheckCircle2 className="w-5 h-5 text-teal-500" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-[#888780] hover:bg-slate-200/50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSend}
                        disabled={step !== 'analysis'}
                        className={`flex-1 py-3 rounded-xl font-bold text-[#2C2C2A] shadow-lg flex items-center justify-center gap-2 transition-all ${
                            step === 'sent' ? 'bg-emerald-500' : 'bg-[#E8E5E0] hover:bg-[#D4D1CC] active:scale-95'
                        }`}
                    >
                        {step === 'analysis' && <><Send className="w-4 h-4" /> Enviar Alerta</>}
                        {step === 'sending' && "Enviando..."}
                        {step === 'sent' && <><CheckCircle2 className="w-4 h-4" /> Enviado</>}
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
}

// --- HELPERS ---

function generateTemplate(material: ResultadoVerificacion): string {
    return `Hola equipo,\n\nNecesito verificar por qué no se emitió el siguiente material reportado por el sistema de auditoría:\n\n• Material: "${material.nombreMaterial}"\n• Emisora: ${material.emisora || 'Radio Corazón'}\n• Horario esperado: Bloque PM\n\nEl sistema indica una probabilidad alta de error humano. Quedo atento a sus comentarios.\n\nSaludos.`;
}

interface DetailItemProps { icon: React.ElementType; label: string; value: string; }
function DetailItem({ icon: Icon, label, value }: DetailItemProps) {
    return (
        <div className="flex items-start gap-3 overflow-hidden">
            <Icon className="w-4 h-4 text-[#888780] mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#888780] uppercase">{label}</p>
                <p className="font-semibold text-slate-700 truncate" title={value}>{value}</p>
            </div>
        </div>
    );
}
