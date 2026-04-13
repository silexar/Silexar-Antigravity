import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/observability';
import { 
  ShieldCheck, Activity, BarChart, 
  AlertTriangle, CheckCircle, XCircle, Loader2,
  RefreshCw, Eye
} from 'lucide-react';
import { AudioQualityService, type ComprehensiveValidationResult } from '../services/AudioQualityService';
import { type AudioMetadata } from '../components/ProfessionalAudioUpload';

interface QualityControlPanelProps {
  audioUrl: string | null;
  metadata: AudioMetadata | null;
  onValidationComplete: (passed: boolean) => void;
  onForceApprove?: () => void;
}

export const QualityControlPanel: React.FC<QualityControlPanelProps> = ({
  audioUrl,
  metadata,
  onValidationComplete,
  onForceApprove
}) => {
  const [status, setStatus] = useState<'idle' | 'validating' | 'completed'>('idle');
  const [results, setResults] = useState<ComprehensiveValidationResult | null>(null);

  useEffect(() => {
    if (audioUrl && metadata && status === 'idle') {
      startValidation();
    }
  }, [audioUrl, metadata]);

  const startValidation = async () => {
    if (!audioUrl || !metadata) return;
    setStatus('validating');
    try {
      const res = await AudioQualityService.comprehensiveAudioValidation(audioUrl, metadata);
      setResults(res);
      setStatus('completed');
      onValidationComplete(res.overallScore >= 80);
    } catch (e) {
      logger.error('Error', e instanceof Error ? e : new Error(String(e)));
      setStatus('idle');
    }
  };

  if (!audioUrl || !metadata) return null;

  const renderDetailRow = (label: string, item: { value: string | number; valid: boolean; message: string }) => (
    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-600 font-medium">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="text-slate-800 font-bold">{item.value}</span>
        {item.valid ? (
          <span className="text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
             <CheckCircle className="w-3 h-3" /> {item.message}
          </span>
        ) : (
          <span className="text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
             <XCircle className="w-3 h-3" /> {item.message}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden font-sans">
      
      {/* Header Panel */}
      <div className="bg-[#F0EDE8] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold tracking-wide uppercase text-sm">Validación Técnica de Audio</h3>
        </div>
        {status === 'validating' && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" /> Analizando...
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {status === 'completed' && results ? (
          <>
            {/* 1. Specs Técnicas */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <CheckCircle className="w-4 h-4 text-emerald-500" /> Especificaciones Técnicas
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {renderDetailRow('Formato', results.technical.specs.format)}
                {renderDetailRow('Duración', results.technical.specs.duration)}
                {renderDetailRow('Frecuencia', results.technical.specs.frequency)}
                {renderDetailRow('Canales', results.technical.specs.channels)}
                {renderDetailRow('Tamaño', results.technical.specs.fileSize)}
              </div>
            </div>

            {/* 2. Broadcast Quality */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <BarChart className="w-4 h-4 text-emerald-500" /> Calidad de Broadcast
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {renderDetailRow('Loudness', results.broadcast.specs.loudness)}
                {renderDetailRow('Peak Level', results.broadcast.specs.peakLevel)}
                {renderDetailRow('Rango Dinámico', results.broadcast.specs.dynamicRange)}
                {renderDetailRow('Respuesta Freq', results.broadcast.specs.freqResponse)}
              </div>
            </div>

            {/* 3. Content Analysis */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Eye className="w-4 h-4 text-emerald-500" /> Análisis de Contenido
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                {renderDetailRow('Transcripción', results.content.analysis.transcription)}
                {renderDetailRow('Idioma', results.content.analysis.language)}
                {renderDetailRow('Sentimiento', results.content.analysis.sentiment)}
                {renderDetailRow('Contenido', results.content.analysis.issues)}
              </div>
            </div>

            {/* 4. Brand Safety */}
             <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-blue-500" /> Brand Safety
              </h4>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                {renderDetailRow('Competencia', results.brand.safety.competition)}
                {renderDetailRow('Valores Marca', results.brand.safety.values)}
                {renderDetailRow('Claims', results.brand.safety.claims)}
                {renderDetailRow('Legal', results.brand.safety.legal)}
              </div>
            </div>

            {/* 5. Alertas de Acción Inmediata (Temporal/Legal) */}
            {(results.content.analysis.issues.valid === false || results.overallScore < 100) && (
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                  <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2 mb-3">
                     <AlertTriangle className="w-4 h-4" /> Acciones Requeridas
                  </h4>
                  <div className="space-y-2">
                     {/* Acá inyectaríamos las recomendaciones reales del ComplianceService si estuvieran en el objeto results. 
                         Como estamos mockeando en AudioQualityService la estructura, agregamos lógica visual para el demo */}
                     <div className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                        <span className="text-slate-700">Incoherencia de Calendario: "Sábado 31" no existe.</span>
                        <div className="flex gap-2">
                           <button className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded">Corregir</button>
                           <button className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded">Ignorar</button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

          </>
        ) : (
          <div className="space-y-4">
             <SkeletonRow />
             <SkeletonRow />
             <SkeletonRow />
          </div>
        )}
      </div>

      {/* Footer Score */}
      {status === 'completed' && results && (
        <div className="bg-slate-50 p-6 border-t border-slate-200 text-center">
            <h3 className="text-3xl font-black text-slate-800 mb-1">{results.overallScore}/100</h3>
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-4">(Excelente)</div>
            
            <div className="flex justify-center gap-3">
               <button 
                 onClick={startValidation}
                 className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white text-sm font-medium flex items-center gap-2"
               >
                 <RefreshCw className="w-4 h-4" /> Re-analizar
               </button>
               {results.overallScore < 80 && onForceApprove && (
                  <button 
                    onClick={onForceApprove}
                    className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm font-bold flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" /> Forzar Aprobación
                  </button>
               )}
               {results.overallScore >= 80 && (
                   <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-bold shadow-lg flex items-center gap-2">
                     <CheckCircle className="w-4 h-4" /> Aprobado Automáticamente
                   </button>
               )}
            </div>
        </div>
      )}
    </div>
  );
};

const SkeletonRow = () => (
    <div className="h-24 bg-slate-50 rounded-xl animate-pulse" />
);
