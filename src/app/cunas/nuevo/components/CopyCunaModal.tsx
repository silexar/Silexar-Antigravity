import React, { useState, useEffect } from 'react';
import { Copy, X, Check, AlertCircle, Wand2 } from 'lucide-react';
import { SmartCopyService } from '../services/SmartCopyService';

// Minimal interface for the structure we rely on
interface SimpleCunaData {
  nombre?: string;
  codigo?: string;
  [key: string]: unknown;
}

interface CopyCunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCuna: SimpleCunaData; 
  onConfirm: (newCunaData: SimpleCunaData) => void;
}

export const CopyCunaModal = ({ isOpen, onClose, originalCuna, onConfirm }: CopyCunaModalProps) => {
  const [newName, setNewName] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (originalCuna && isOpen) {
       setNewName(SmartCopyService.generateVersionedName(originalCuna.nombre || 'Campaña Sin Nombre'));
       setObservations('');
    }
  }, [originalCuna, isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
     const copy = await SmartCopyService.createSmartCopy(originalCuna, { newName });
     onConfirm({ ...copy, observaciones: observations });
     onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F0EDE8]/60 backdrop-blur-sm p-4 animate-in fade-in">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-[#2C2C2A]">
             <div className="flex justify-between items-start">
                <div>
                   <h2 className="text-xl font-bold flex items-center gap-2">
                      <Copy className="w-6 h-6" /> Copiar Cuña Inteligente
                   </h2>
                   <p className="text-violet-100 text-sm mt-1">Optimizada para crear series y versiones rápidamente.</p>
                </div>
                <button onClick={onClose} aria-label="Cerrar" className="text-[#2C2C2A]/80 hover:text-[#2C2C2A] hover:bg-white/10 p-1 rounded-lg">
                   <X className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="p-8 space-y-8">
             
             {/* Info de Origen y Destino */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-xs font-bold text-[#888780] uppercase tracking-wider">Cuña Original</label>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-sm">
                      <div className="font-bold text-slate-800 mb-1">{originalCuna?.nombre}</div>
                      <div>{originalCuna?.codigo || 'SPX-ORIGINAL'}</div>
                   </div>
                   
                   <div className="space-y-2 mt-4">
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                         <Check className="w-3 h-3" /> INFORMACIÓN QUE SE COPIA
                      </div>
                      <ul className="text-xs text-[#888780] space-y-1 ml-4 list-disc">
                         <li>Datos de Cliente y Producto</li>
                         <li>Fechas de Vigencia</li>
                         <li>Configuración de Distribución</li>
                         <li>Alertas de Vencimientos</li>
                      </ul>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-bold text-[#888780] uppercase tracking-wider">Nueva Cuña (Destino)</label>
                   <div className="space-y-3">
                      <input
                        aria-label="Nombre de la nueva versión"
                        className="w-full p-3 bg-white border-2 border-violet-100 rounded-xl focus:border-violet-500 outline-none text-slate-800 font-bold"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nombre de la nueva versión"
                      />
                      <textarea
                        aria-label="Observaciones para esta versión"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-400 outline-none text-sm text-slate-600 resize-none"
                        rows={3}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Observaciones para esta versión (Opcional)"
                      />
                   </div>

                   <div className="space-y-2 mt-2">
                       <div className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> NO SE COPIA (Requiere Nuevo)
                       </div>
                       <ul className="text-xs text-[#888780] space-y-1 ml-4 list-disc">
                          <li>Archivo de Audio (Cargar nuevo)</li>
                          <li>Textos de Mención</li>
                          <li>Historial de Envíos</li>
                       </ul>
                   </div>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-violet-600 font-bold bg-violet-50 px-3 py-1.5 rounded-full">
                   <Wand2 className="w-3 h-3" /> Sugerencia: Se mantendrán las mismas validaciones legales.
                </div>
                <div className="flex gap-3">
                   <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-[#888780] font-bold hover:bg-slate-50">Cancelar</button>
                   <button 
                     onClick={handleCopy}
                     className="px-6 py-2.5 rounded-xl bg-violet-600 text-[#2C2C2A] font-bold hover:bg-violet-700 shadow-lg shadow-violet-200 flex items-center gap-2"
                   >
                      <Copy className="w-4 h-4" /> Crear Copia
                   </button>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};
