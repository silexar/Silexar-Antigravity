/**
 * 📤 COMPONENT: ExportOptionsModal
 * 
 * Modal de exportación avanzada con soporte multi-canal.
 * 
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState } from 'react';
import { X, Download, HardDrive, Mail, Smartphone, CheckCircle2, FileArchive } from 'lucide-react';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ExportMethod = 'drive' | 'zip' | 'email' | 'whatsapp';

export function ExportOptionsModal({ isOpen, onClose, onSuccess }: ExportOptionsModalProps) {
  const [method, setMethod] = useState<ExportMethod>('drive');
  const [isExporting, setIsExporting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
        setIsExporting(false);
        setIsDone(true);
        setTimeout(() => {
            onSuccess(); // Trigger parent transition
        }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-[#e0e5ec] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row border border-white/30">
            
            {/* SIDEBAR: METHOD SELECTION */}
            <div className="w-full md:w-1/3 bg-slate-100/50 border-r border-slate-200 p-6 flex flex-col gap-2">
                <h2 className="text-lg font-black text-slate-700 mb-4 px-2">📤 EXPORTAR</h2>
                
                <MethodButton 
                    active={method === 'drive'} 
                    onClick={() => setMethod('drive')}
                    icon={HardDrive} label="Google Drive" 
                    desc="Recomendado" 
                    color="text-blue-600"
                />
                <MethodButton 
                    active={method === 'zip'} 
                    onClick={() => setMethod('zip')}
                    icon={Download} label="Descarga ZIP" 
                    desc="Archivo local" 
                    color="text-orange-600"
                />
                <MethodButton 
                    active={method === 'email'} 
                    onClick={() => setMethod('email')}
                    icon={Mail} label="Email Pro" 
                    desc="Reporte ejecutivo" 
                    color="text-indigo-600"
                />
                <MethodButton 
                    active={method === 'whatsapp'} 
                    onClick={() => setMethod('whatsapp')}
                    icon={Smartphone} label="WhatsApp" 
                    desc="Resumen rápido" 
                    color="text-emerald-600"
                />
            </div>

            {/* CONTENT: CONFIGURATION */}
            <div className="flex-1 p-8 bg-white/50 relative">
                <button aria-label="Cerrar" onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>

                {/* DYNAMIC CONTENT BASED ON METHOD */}
                <div className="h-full flex flex-col">
                    
                    {method === 'drive' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                            <Header icon={HardDrive} title="Google Drive Enterprise" color="text-blue-600" />
                            
                            <div className="mt-6 bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">📂 Carpeta Destino</h4>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-200 shadow-sm text-sm text-slate-700 font-mono">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    /SuperMax/Verificaciones Emisión/Dic 2024/
                                </div>
                            </div>
                            
                            <ContentPreview items={['8 clips de audio (High-Res)', 'Certificado PDF Oficial', 'Metadatos XML', 'Reporte de Compliance']} />
                        </div>
                    )}

                    {method === 'zip' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                            <Header icon={Download} title="Descarga Directa Segura" color="text-orange-600" />
                            
                            <div className="mt-6 bg-orange-50/50 rounded-xl p-5 border border-orange-100 flex items-center gap-4">
                                <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                    <FileArchive className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-700 text-lg">SuperMax_Verif_15Dic.zip</p>
                                    <p className="text-sm text-slate-500">127 MB • Tiempo est: ~30s</p>
                                </div>
                            </div>
                            
                            <ContentPreview items={['Estructura de carpetas organizada', 'Audios WAV & MP3', 'Logs de sistema', 'Certificado Digital']} />
                        </div>
                    )}
                    
                    {method === 'email' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                             <Header icon={Mail} title="Email Ejecutivo" color="text-indigo-600" />
                             <div className="mt-6 space-y-4">
                                 <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                    <span className="text-xs font-bold text-indigo-400 uppercase">Destinatarios:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Chip text="ana.garcia@empresa.com" />
                                        <Chip text="maria.gonzalez@supermax.cl" />
                                        <button className="text-xs font-bold text-indigo-600 hover:underline">+ Agregar</button>
                                    </div>
                                 </div>
                                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 italic">
                                     "Estimados, adjunto verificación de emisión con evidencia completa..."
                                 </div>
                             </div>
                        </div>
                    )}

                     {method === 'whatsapp' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
                             <Header icon={Smartphone} title="WhatsApp Business" color="text-emerald-600" />
                             <div className="mt-6 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                                 <div className="flex items-center gap-3 mb-4">
                                     <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">MG</div>
                                     <div>
                                         <p className="font-bold text-slate-700">María González</p>
                                         <p className="text-xs text-slate-400">SuperMax SpA</p>
                                     </div>
                                 </div>
                                 <div className="bg-[#dcf8c6] p-3 rounded-lg rounded-tl-none text-sm text-slate-800 shadow-sm inline-block max-w-[80%]">
                                     Hola María! ✅ Verificación completada: 8/10 materiales emitidos. Te envié el detalle al correo.
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* FOOTER: SECURITY & ACTIONS */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <div className="flex flex-wrap gap-4 mb-6">
                            <SecurityToggle label="Encriptar Archivos" />
                            <SecurityToggle label="Watermark Audio" checked />
                            <SecurityToggle label="Audit Log" checked />
                        </div>

                        <div className="flex gap-4">
                             <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                             <button 
                                onClick={handleExport}
                                disabled={isExporting || isDone}
                                className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isDone ? 'bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700 hover:-translate-y-0.5'}`}
                             >
                                 {isExporting ? 'Procesando...' : isDone ? <><CheckCircle2 className="w-5 h-5" /> Exportación Exitosa</> : <><Download className="w-5 h-5" /> Ejecutar Exportación</>}
                             </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface MethodButtonProps { active: boolean; onClick: () => void; icon: React.ElementType; label: string; desc: string; color: string; }
const MethodButton = ({ active, onClick, icon: Icon, label, desc, color }: MethodButtonProps) => (
    <button 
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group ${active ? 'bg-white shadow-[inset_2px_2px_4px_#b8b9be] border border-transparent' : 'hover:bg-slate-200/50 border border-transparent'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-slate-100' : 'bg-white group-hover:bg-white/80'}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
                <p className={`text-sm font-bold ${active ? 'text-slate-800' : 'text-slate-600'}`}>{label}</p>
                <p className="text-[10px] text-slate-400">{desc}</p>
            </div>
        </div>
        {active && <div className={`w-1.5 h-1.5 rounded-full bg-slate-800`} />}
    </button>
);

interface HeaderProps { icon: React.ElementType; title: string; color: string; }
const Header = ({ icon: Icon, title, color }: HeaderProps) => (
    <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-8 h-8 ${color}`} />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
    </div>
);

const ContentPreview = ({ items }: { items: string[] }) => (
    <div className="mt-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">📋 Contenido Incluido</h4>
        <div className="grid grid-cols-2 gap-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
                </div>
            ))}
        </div>
    </div>
);

const Chip = ({ text }: { text: string }) => (
    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1">
        {text} <X className="w-3 h-3 cursor-pointer hover:text-indigo-900" />
    </span>
);

const SecurityToggle = ({ label, checked }: { label: string, checked?: boolean }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-slate-800 border-slate-800' : 'border-slate-400'}`}>
            {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
        </div>
        <span className="text-xs font-bold text-slate-500">{label}</span>
    </label>
);
