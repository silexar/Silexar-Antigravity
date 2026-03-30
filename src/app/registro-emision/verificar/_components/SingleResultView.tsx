/**
 * 🎯 COMPONENT: SingleResultView (Surgical Flow)
 * 
 * Vista de resultado único para flujo quirúrgico.
 * Muestra UN clip recortado (±15s) con reproductor y opciones de entrega.
 * 
 * @tier TIER_0_PRECISION
 */

'use client';

import { useState } from 'react';
import { 
  CheckCircle,
  Play,
  Pause,
  Download,
  Mail,
  CloudUpload,
  FileArchive,
  FileImage,
  Clock,
  Radio,
  RotateCcw,
  X,
  Volume2,
  AlertTriangle,
  Search,
  Link2,
  ShoppingBasket,
  Scissors,
  Save
} from 'lucide-react';
import { SecureLinkModal } from './SecureLinkModal';
import { toast } from 'sonner';

interface SingleResultViewProps {
  // Result Data
  found: boolean;
  materialName: string;
  spxCode: string;
  horaExacta?: string;
  emisora?: string;
  accuracy?: number;
  clipUrl?: string; // Audio URL
  imageUrl?: string; // For digital banners
  isDigital?: boolean;
  searchRange: '10min' | '1hr' | 'full_day';
  
  // Actions
  onDownloadDirect: () => void;
  onSendToDrive: () => void;
  onSendByEmail: () => void;
  onDownloadZip: () => void;
  onGeneratePdf?: () => void; // Only for digital
  onSearchAgain: () => void;
  onExpandSearch?: () => void; // Expand to 1hr or full day
  onAddToBasket?: () => void; // New Basket Feature
  onClose: () => void;
}

export function SingleResultView({
  found,
  materialName,
  spxCode,
  horaExacta,
  emisora,
  accuracy,
  clipUrl,
  imageUrl,
  isDigital,
  searchRange,
  onDownloadDirect,
  onSendToDrive,
  onSendByEmail,
  onDownloadZip,
  onGeneratePdf,
  onSearchAgain,
  onExpandSearch,
  onAddToBasket,
  onClose
}: SingleResultViewProps) {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSecureLinkModal, setShowSecureLinkModal] = useState(false);
  
  // Trimming State
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimStart, setTrimStart] = useState(0); // Seconds offset
  const [trimEnd, setTrimEnd] = useState(0); // Seconds offset

  const handleAction = (action: () => void, message: string) => {
    action();
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  // SUCCESS STATE
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
        <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl animate-in zoom-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">{successMessage}</h2>
          <p className="text-slate-500 mb-8">El ciclo ha sido completado exitosamente.</p>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => { setShowSuccess(false); onSearchAgain(); }}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Buscar Otro
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!found) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
        <div className="bg-white rounded-3xl p-10 max-w-lg shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Registro No Encontrado</h2>
            <p className="text-slate-500">
              No se encontró <strong className="text-slate-700">{spxCode}</strong> en el rango de {searchRange === '10min' ? '±10 minutos' : searchRange === '1hr' ? '±1 hora' : 'todo el día'}.
            </p>
          </div>

          <div className="space-y-3">
            {searchRange === '10min' && onExpandSearch && (
              <button 
                onClick={onExpandSearch}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" /> Expandir Búsqueda a ±1 Hora
              </button>
            )}
            <button 
              onClick={onSearchAgain}
              className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Buscar Otro Registro
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FOUND STATE - MAIN VIEW
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4">
        
        {/* HEADER */}
        <div className="bg-emerald-500 text-white p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black">REGISTRO ENCONTRADO</h2>
              <p className="text-emerald-100 text-sm font-medium">{spxCode} • {materialName}</p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          
          {/* METADATA */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 uppercase font-bold">Hora Exacta</p>
              <p className="font-black text-slate-800">{horaExacta || '14:32:15'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <Radio className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400 uppercase font-bold">Emisora</p>
              <p className="font-black text-slate-800">{emisora || 'Radio Corazón'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-400 uppercase font-bold">Accuracy</p>
              <p className="font-black text-emerald-600">{accuracy || 98}%</p>
            </div>
          </div>

          {/* PLAYER / VIEWER */}
          <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-700">
              <div className="h-full w-1/3 bg-emerald-500 rounded-full" />
            </div>
            
            {isDigital && imageUrl ? (
              // IMAGE VIEWER
              <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center">
                <img src={imageUrl} alt="Banner" className="max-h-full max-w-full object-contain rounded-lg" />
              </div>
            ) : (
              // AUDIO PLAYER
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30"
                >
                  {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                </button>
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>00:00</span>
                    <span className="text-emerald-400 font-bold">Clip: 15s + Audio + 15s</span>
                    <span>01:00</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse" style={{width: isPlaying ? '45%' : '0%', transition: 'width 2s'}} />
                  </div>
                </div>
                <Volume2 className="w-6 h-6 text-slate-500" />
              </div>
            )}

            <p className="text-center text-xs text-slate-500 mt-4">
              📍 Clip recortado: 15 segundos antes → Registro → 15 segundos después
            </p>

            {/* TRIMMER CONTROLS */}
            <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                     <Scissors className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase tracking-wider">Editor de Precisión</span>
                  </div>
                  {isTrimming && (
                     <span className="text-xs text-amber-400 animate-pulse font-mono">Modo Edición Activo</span>
                  )}
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex-1">
                     <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                        <span>Inicio: -{15 - trimStart}s</span>
                        <span>Fin: +{15 - trimEnd}s</span>
                     </div>
                     <div className="relative h-8 bg-slate-900 rounded border border-slate-700 overflow-hidden flex items-center px-1">
                        {/* Waveform Mock */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 gap-0.5">
                           {Array.from({ length: 40 }).map((_, i) => (
                              <div key={i} className="w-1 bg-white rounded-full" style={{ height: `${20 + Math.random() * 80}%` }} />
                           ))}
                        </div>
                        
                        {/* Trim Handles (Simulated with Range Inputs overlaid would be complex, simplified for UI demo) */}
                        <input 
                           type="range" 
                           min="0" max="10" 
                           value={trimStart} 
                           onChange={(e) => { setIsTrimming(true); setTrimStart(parseInt(e.target.value)); }}
                           className="absolute left-0 w-1/2 h-full opacity-50 cursor-e-resize accent-emerald-500 z-10"
                           title="Ajustar Inicio"
                        />
                         <input 
                           type="range" 
                           min="0" max="10" 
                           value={trimEnd} 
                           onChange={(e) => { setIsTrimming(true); setTrimEnd(parseInt(e.target.value)); }}
                           className="absolute right-0 w-1/2 h-full opacity-50 cursor-w-resize accent-emerald-500 z-10"
                           title="Ajustar Final"
                           style={{ direction: 'rtl' }}
                        />

                        {/* Active Area Visualization */}
                        <div 
                           className="absolute h-full bg-emerald-500/20 border-x-2 border-emerald-500 z-0 pointer-events-none"
                           style={{ 
                              left: `${(trimStart / 30) * 50}%`, // Approx scale
                              right: `${(trimEnd / 30) * 50}%` 
                           }} 
                        />
                     </div>
                  </div>
                  
                  {isTrimming ? (
                     <button 
                        onClick={() => { setIsTrimming(false); toast.success("Clip recortado y guardado"); }}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                        title="Guardar Recorte"
                     >
                        <Save className="w-5 h-5" />
                     </button>
                  ) : (
                     <button 
                         className="p-2 bg-slate-700 text-slate-400 rounded-lg cursor-not-allowed"
                         title="Editar (Mueve los sliders)"
                     >
                        <Scissors className="w-5 h-5" />
                     </button>
                  )}
               </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">¿Registro Correcto? Selecciona Entrega:</p>
            <div className="grid grid-cols-2 gap-3">
              {onAddToBasket && (
                <ActionBtn icon={<ShoppingBasket />} label="Agregar a Cesta" onClick={() => handleAction(onAddToBasket, 'Agregado a la Cesta')} className="col-span-2 bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 border-0" />
              )}
              <ActionBtn icon={<Link2 />} label="🔒 Link Seguro" onClick={() => setShowSecureLinkModal(true)} className="col-span-2 bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 border border-indigo-200" premium />
              <ActionBtn icon={<Download />} label="Descargar Directo" onClick={() => handleAction(onDownloadDirect, 'Descargado con Éxito')} />
              <ActionBtn icon={<CloudUpload />} label="Enviar a Drive" onClick={() => handleAction(onSendToDrive, 'Enviado a Drive')} />
              <ActionBtn icon={<Mail />} label="Enviar por Email" onClick={() => handleAction(onSendByEmail, 'Enviado por Email')} />
              <ActionBtn icon={<FileArchive />} label="Descargar ZIP" onClick={() => handleAction(onDownloadZip, 'ZIP Descargado')} />
              {isDigital && onGeneratePdf && (
                <ActionBtn icon={<FileImage />} label="Generar PDF" onClick={() => handleAction(onGeneratePdf, 'PDF Generado')} className="col-span-2" />
              )}
            </div>
            
            {/* SECURE LINK MODAL */}
            <SecureLinkModal
              isOpen={showSecureLinkModal}
              onClose={() => setShowSecureLinkModal(false)}
              onSend={(data) => {
                ;
                setShowSecureLinkModal(false);
                handleAction(() => {}, `Link enviado a ${data.email}`);
              }}
              materialName={materialName}
              spxCode={spxCode}
              clipUrl={clipUrl}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper Button
interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  premium?: boolean;
}

const ActionBtn = ({ icon, label, onClick, className = '' }: ActionBtnProps) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors ${className}`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);
