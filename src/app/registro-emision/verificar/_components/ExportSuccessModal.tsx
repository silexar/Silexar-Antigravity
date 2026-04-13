/**
 * ✅ COMPONENT: ExportSuccessModal
 * 
 * Modal de confirmación final de exportación.
 * Incluye resumen de entrega, auditoría blockchain y limpieza automática.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, FileText, Database, ShieldCheck, Clock, Trash2, ExternalLink, RefreshCw, BarChart2, Phone } from 'lucide-react';

interface ExportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
}

export function ExportSuccessModal({ isOpen, onClose, onReset }: ExportSuccessModalProps) {
  const [cleanupTime, setCleanupTime] = useState(1785); // 29:45 in seconds

  useEffect(() => {
    if (isOpen) {
        setCleanupTime(1785);
        const interval = setInterval(() => {
            setCleanupTime(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[#F0EDE8]/80 backdrop-blur-md transition-opacity" />

        {/* Modal Content */}
        <div className="relative w-full max-w-2xl bg-[#e0e5ec] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/30 flex flex-col">
            
            {/* Header: Success Burst */}
            <div className="bg-emerald-500 text-[#2C2C2A] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce duration-[2000ms]">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-1">ENVÍO COMPLETADO</h2>
                    <p className="text-emerald-100 font-medium">La evidencia ha sido entregada exitosamente.</p>
                </div>
            </div>

            <div className="p-8 space-y-6">
                
                {/* 1. DELIVERY SUMMARY */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-[#888780] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Resumen de Entrega
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <SummaryItem label="Método" value="Google Drive + Email" />
                        <SummaryItem label="Destinatario" value="SuperMax SpA" />
                        <SummaryItem label="Archivos" value="12 (127 MB)" />
                        <SummaryItem label="Tiempo Total" value="3m 45s" />
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between group cursor-pointer hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs font-bold text-blue-400 uppercase">Enlace Google Drive</p>
                                <p className="text-sm font-bold text-blue-700 truncate max-w-[250px]">drive.google.com/folder/SuperMax_Verif...</p>
                            </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-500 opacity-50 group-hover:opacity-100" />
                    </div>
                </div>

                {/* 2. BLOCKCHAIN AUDIT & CLEANUP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Blockchain */}
                    <div className="bg-[#E8E5E0] text-[#5F5E5A] rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-2 right-2 opacity-10"><ShieldCheck className="w-20 h-20" /></div>
                        <h4 className="text-xs font-bold text-[#888780] uppercase tracking-widest mb-3">Auditoría Blockchain</h4>
                        <div className="space-y-2 text-xs font-mono">
                            <p><span className="text-[#888780]">Hash:</span> <span className="text-emerald-400">0x7f4a...3b8e</span></p>
                            <p><span className="text-[#888780]">Timestamp:</span> {new Date().toISOString().split('T')[1].split('.')[0]}Z</p>
                            <p className="inline-block bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold mt-1">VÁLIDA E INMUTABLE</p>
                        </div>
                    </div>

                    {/* Auto-Cleanup */}
                    <div className="bg-amber-50 text-amber-900 rounded-2xl p-5 border border-amber-100">
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Trash2 className="w-3 h-3" /> Limpieza Automática
                        </h4>
                        <div className="flex items-center gap-3">
                            <div className="text-3xl font-black tabular-nums tracking-tighter">
                                {formatTime(cleanupTime)}
                            </div>
                            <div className="text-xs leading-tight opacity-80">
                                minutos para<br/>eliminación segura
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-amber-600/60 mt-2 uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> /tmp/verificacion_001547/
                        </p>
                    </div>

                </div>

                {/* 3. NEXT ACTIONS */}
                <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-xs font-bold text-[#888780] uppercase tracking-widest mb-4">Próximas Acciones Sugeridas</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <ActionButton icon={RefreshCw} label="Nueva Verificación" onClick={onReset ?? (() => {})} variant="primary" />
                        <ActionButton icon={BarChart2} label="Ver Analytics" onClick={onClose} variant="secondary" />
                        <ActionButton icon={Phone} label="Llamar Cliente" onClick={() => window.open('tel:+56900000000', '_self')} variant="secondary" />
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}

interface SummaryItemProps { label: string; value: string; }
const SummaryItem = ({ label, value }: SummaryItemProps) => (
    <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-[#888780]">{label}</span>
        <span className="font-bold text-slate-700">{value}</span>
    </div>
);

interface ActionButtonProps { icon: React.ElementType; label: string; onClick: () => void; variant: 'primary' | 'secondary'; }
const ActionButton = ({ icon: Icon, label, onClick, variant }: ActionButtonProps) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:-translate-y-1 ${
            variant === 'primary' 
            ? 'bg-[#E8E5E0] text-[#2C2C2A] shadow-lg shadow-slate-300' 
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="text-[11px] font-bold text-center leading-tight">{label}</span>
    </button>
);
