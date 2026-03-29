import React from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, 
  BarChart3, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { type SponsorshipValidationResult, type ValidationItem } from '../hooks/useSponsorshipValidator';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onForceApprove?: () => void;
  results: SponsorshipValidationResult | null;
  isValidating: boolean;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onForceApprove,
  results,
  isValidating
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isValidating ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <ShieldCheck className={`w-6 h-6 ${isValidating ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {isValidating ? 'Analizando Reglas de Negocio...' : 'Validación Completa'}
              </h3>
              <p className="text-sm text-slate-500">
                {isValidating ? 'Verificando contratos, parrilla y coherencia.' : 'Reporte de conformidad Enterprise Fortune 10'}
              </p>
            </div>
          </div>
          {/* Score Badge */}
          {results && !isValidating && (
             <div className={`px-4 py-1 rounded-full text-lg font-bold border ${
                results.overallScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                results.overallScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                'bg-red-50 text-red-700 border-red-200'
             }`}>
               {results.overallScore}/100
             </div>
          )}
        </div>

        {/* Body */}
        <div className="p-8">
          {isValidating ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
               <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
               <p className="text-slate-500 font-medium animate-pulse">Consultando servicios centrales...</p>
             </div>
          ) : results ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Col: Checklist */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Validaciones Básicas</h4>
                <div className="space-y-3">
                  {results.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <StatusIcon status={item.status} />
                       <div>
                         <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                         <p className="text-xs text-slate-500">{item.message}</p>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Missing Alert */}
                {results.missingPresentations.length > 0 && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <h5 className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-2">
                      <AlertTriangle className="w-4 h-4" /> Presentaciones Faltantes
                    </h5>
                    <ul className="space-y-2">
                      {results.missingPresentations.map((mp, idx) => (
                        <li key={idx} className="text-xs text-amber-700 flex justify-between">
                          <span>• {mp.client} ({mp.program})</span>
                          <span className="font-bold">Vence en {mp.expiresInDays} días</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Col: Saturation & Recommendations */}
              <div className="space-y-6">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Saturación del Programa</h4>
                 <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-2xl font-bold text-slate-800">{results.saturation.current}%</span>
                       <ArrowRight className="w-5 h-5 text-slate-300 mb-1" />
                       <span className={`text-2xl font-bold ${
                         results.saturation.status === 'critical' ? 'text-red-600' : 'text-slate-800'
                       }`}>
                         {results.saturation.projected}%
                       </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-500 ${
                            results.saturation.status === 'healthy' ? 'bg-emerald-500' : 
                            results.saturation.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                         }`}
                         style={{ width: `${results.saturation.projected}%` }}
                       />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                       Carga actual vs. Proyectada (Límite 80%)
                    </p>
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                       <BarChart3 className="w-4 h-4 text-violet-500" /> Recomendaciones IA
                    </h4>
                    <ul className="space-y-2">
                       <li className="text-xs text-slate-600 flex gap-2">
                         <span className="text-violet-500">•</span>
                         Programar presentación para Banco Nacional inmediatamente.
                       </li>
                       <li className="text-xs text-slate-600 flex gap-2">
                         <span className="text-violet-500">•</span>
                         Considerar rotación de creatividades para evitar fatiga.
                       </li>
                    </ul>
                 </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
           >
             Cancelar
           </button>
           
           {results && !isValidating && (
             <>
                {/* Botón de Override para Supervisor */}
                {(results.overallScore < 70 || results.saturation.status === 'critical') && onForceApprove && (
                  <button
                    onClick={onForceApprove}
                    className="px-4 py-2 rounded-xl border-2 border-amber-200 text-amber-700 font-bold hover:bg-amber-50 mr-auto transition-all flex items-center gap-2"
                    title="Requiere clave de supervisor"
                  >
                    <AlertTriangle className="w-4 h-4" /> Forzar Aprobación
                  </button>
                )}

                <button
                onClick={onConfirm}
                disabled={results.overallScore < 70 && results.saturation.status === 'critical'} // Bloqueo Enterprise
                className={`
                    px-6 py-2 rounded-xl text-white font-bold shadow-lg flex items-center gap-2 transition-all
                    ${results.overallScore >= 70 ? 'bg-emerald-600 hover:bg-emerald-700' : 
                    'bg-slate-400 cursor-not-allowed opacity-50'
                    }
                `}
                >
                {results.overallScore >= 70 ? 'Aprobar y Guardar' : 'Bloqueado por Reglas'}
                <CheckCircle2 className="w-4 h-4" />
                </button>
             </>
           )}
        </div>

      </div>
    </div>
  );
};

const StatusIcon = ({ status }: { status: ValidationItem['status'] }) => {
  if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (status === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
  return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
};
