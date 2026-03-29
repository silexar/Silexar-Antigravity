/**
 * 📝 SILEXAR PULSE - Editor Inteligente de Guiones TIER 0
 * 
 * Editor de texto enriquecido con análisis en tiempo real por Cortex Voice AI.
 * Diseño neuromórfico enterprise.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

import React, { useRef, useEffect, useState } from 'react';
import { logger } from '@/lib/observability';
import { 
  Type, Bold, Italic, Sparkles, Clock, 
  Mic, PlayCircle, Save, 
  Wand2, Layers, FileUp, X, FileText, Eye, EyeOff 
} from 'lucide-react';
import useScriptAnalysis from '../hooks/useScriptAnalysis';
import { documentExtractService, type ExtractedScript } from '../services/DocumentExtractService';
import { DynamicVariablesEngine } from '../services/DynamicVariablesEngine';
import { VariablePicker } from './VariablePicker';
// import { formatFileSize } from '../utils/audioExporter';

import { VoiceConfigModal } from './VoiceConfigModal';
import { type VoiceConfig } from '@/lib/cortex/cortex-voice';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SmartScriptEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  onGenerateAudio?: (text: string, config?: Partial<VoiceConfig>) => Promise<void>;
  brandName?: string;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

const ToolButton = ({ 
  icon: Icon, label, onClick, active = false, disabled = false 
}: { 
  icon: React.ElementType; label: string; onClick: () => void; active?: boolean; disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`
      p-2 rounded-lg transition-all duration-200 flex items-center gap-2
      ${active 
        ? 'bg-violet-100 text-violet-700 shadow-sm' 
        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
      }
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="text-xs font-medium hidden lg:inline">{label}</span>
  </button>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const SmartScriptEditor: React.FC<SmartScriptEditorProps> = ({
  initialValue,
  onChange,
  onGenerateAudio,
  brandName,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedScripts, setExtractedScripts] = useState<ExtractedScript[] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Enterprise Logic State
  const [showVoiceConfig, setShowVoiceConfig] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resolvedPreviewText, setResolvedPreviewText] = useState('');
  
  const { 
    text, 
    setText, 
    analysis, 
    insertTag 
  } = useScriptAnalysis(initialValue, { brandNames: brandName ? [brandName] : [] });

  // Sincronizar cambios externos
  useEffect(() => {
    onChange(text);
  }, [text, onChange]);

  // Actualizar preview dinámico
  useEffect(() => {
    if (showPreview) {
      // Mock Context para preview inmediato
      const mockContext = {
        advertiser: { commercialName: brandName || 'Cliente Modelo' },
        event: { date: new Date(Date.now() + 86400000 * 5), currentPrice: 15000 }
      };
      setResolvedPreviewText(DynamicVariablesEngine.resolveVariables(text, mockContext));
    }
  }, [text, showPreview, brandName]);

  // Manejador de inserción de variables
  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    // Insertar variable en la posición del cursor
    const newText = currentText.substring(0, start) + variable + currentText.substring(end);
    setText(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  // Manejador de inserción de etiquetas
  const handleInsertTag = (tagType: 'ENFASIS' | 'PAUSA' | 'DELETREO') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);
    
    let replacement = '';
    
    if (tagType === 'PAUSA') {
      replacement = insertTag('PAUSA');
    } else if (tagType === 'ENFASIS') {
      replacement = `[ÉNFASIS]${selectedText || 'texto'}[/ÉNFASIS]`;
    } else if (tagType === 'DELETREO') {
      replacement = `[DELETREO]${selectedText || 'texto'}[/DELETREO]`;
    }

    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    setText(newText);
    
    // Restaurar foco (next tick)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const scripts = await documentExtractService.extractScripts(file);
      setExtractedScripts(scripts);
    } catch (error) {
      logger.error('Error extracting scripts', error instanceof Error ? error : undefined);
    } finally {
      setIsExtracting(false);
      // Reset input
      e.target.value = '';
    }
  };

  const selectScript = (script: ExtractedScript) => {
    setText(script.content);
    setExtractedScripts(null);
  };

  // Wrapper para manejar la confirmación del modal y generación
  const handleVoiceGeneration = async (config: Partial<VoiceConfig>) => {
    // const textToGenerate = showPreview ? resolvedPreviewText : text; // Generar lo que se ve - Unused variable removed
    // Si hay variables sin resolver en modo RAW, quizás deberíamos resolverlas antes de generar
    // Por seguridad, siempre intentamos resolver antes de mandar a audio si no estamos en preview
    const finalText = showPreview ? resolvedPreviewText : DynamicVariablesEngine.resolveVariables(text, {
       advertiser: { commercialName: brandName || 'Cliente' }
    });

    if (onGenerateAudio) {
      await onGenerateAudio(finalText, config);
    }
    setShowVoiceConfig(false);
  };

  // ... (rest of render logic needs update to include VariablePicker)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Modal de Configuración de Voz */}
      <VoiceConfigModal 
        isOpen={showVoiceConfig}
        onClose={() => setShowVoiceConfig(false)}
        onConfirm={handleVoiceGeneration}
      />

      {/* Columna Izquierda: Editor */}
      <div className="lg:col-span-2 space-y-4 relative">
        
        {/* ... (Existing Modal Selection Script & Toolbar logic stays here) ... */}

        {extractedScripts && (
          <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* ... script selection list ... */}
             <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Guiones Detectados
              </h3>
              <button onClick={() => setExtractedScripts(null)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {extractedScripts.map((script) => (
                <button
                  key={script.id}
                  onClick={() => selectScript(script)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all group"
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-700 group-hover:text-violet-700">{script.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                      ~{script.estimatedDuration}s
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {script.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 rounded-xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
          <ToolButton icon={FileUp} label={isExtracting ? "Analizando..." : "Importar Guión"} onClick={() => fileInputRef.current?.click()} disabled={disabled || isExtracting} />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx,.txt" 
            onChange={handleFileUpload} 
          />
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <ToolButton icon={Bold} label="Negrita" onClick={() => {}} disabled={disabled} />
          <ToolButton icon={Italic} label="Cursiva" onClick={() => {}} disabled={disabled} />
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <ToolButton icon={Sparkles} label="Énfasis" onClick={() => handleInsertTag('ENFASIS')} disabled={disabled} />
          <ToolButton icon={Clock} label="Pausa (1s)" onClick={() => handleInsertTag('PAUSA')} disabled={disabled} />
          <ToolButton icon={Type} label="Deletreo" onClick={() => handleInsertTag('DELETREO')} disabled={disabled} />
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <ToolButton 
            icon={showPreview ? EyeOff : Eye} 
            label={showPreview ? "Editar" : "Ver Variables"} 
            onClick={() => setShowPreview(!showPreview)} 
            active={showPreview}
            disabled={disabled} 
          />
          <ToolButton icon={Wand2} label="Mejorar con IA" onClick={() => {}} disabled={disabled} />
        </div>

        {/* Dynamic Variable Picker Panel (Collapsible or always visible in large screens) */}
        {!showPreview && (
          <div className="mb-2">
            <VariablePicker onInsert={handleInsertVariable} />
          </div>
        )}

        {/* Text Area */}
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={showPreview ? resolvedPreviewText : text}
            onChange={(e) => !showPreview && setText(e.target.value)}
            disabled={disabled || showPreview}
            placeholder={showPreview ? "Vista previa del guión con variables resueltas..." : "Escribe el guión de la cuña aquí. Usa variables como {FECHA}..."}
            className={`
              w-full h-80 p-6 rounded-2xl border-2 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.02)] resize-none outline-none transition-all text-lg leading-relaxed font-medium
              ${showPreview 
                ? 'bg-violet-50 border-violet-200 text-violet-900 cursor-not-allowed' 
                : 'bg-white border-slate-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 text-slate-700'
              }
            `}
            style={{ fontFamily: '"Inter", sans-serif' }}
          />
          {/* Label de estado Preview */}
          {showPreview && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg animate-pulse">
              Modo Vista Previa
            </div>
          )}
          
          {/* Contador flotante simple */}
          <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded-full backdrop-blur">
            {text.length} caracteres
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center">
          <button className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar Borrador
          </button>

          <div className="flex gap-3">
            <button 
              disabled={disabled}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Preview Texto
            </button>
            <button 
              onClick={() => setShowVoiceConfig(true)}
              disabled={disabled || !text.trim()}
              className="px-6 py-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Generar Audio IA
            </button>
          </div>
        </div>

      </div>

      {/* Columna Derecha: Panel de Análisis Inteligente */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <Layers className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-lg">Cortex Analysis</h3>
          </div>

          {!analysis ? (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm italic">
              Escribe para comenzar el análisis...
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {/* Tiempo Estimado - Métrica Principal */}
              <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm text-slate-300">Tiempo Estimado</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    analysis.estimatedSeconds > 30 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {analysis.estimatedSeconds > 30 ? 'Excede 30s' : 'Óptimo'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">{analysis.estimatedSeconds}s</span>
                  <span className="text-sm text-slate-400">({analysis.timeRange.min}-{analysis.timeRange.max}s)</span>
                </div>
                {/* Barra de progreso de tiempo (base 30s) */}
                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      analysis.estimatedSeconds > 30 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (analysis.estimatedSeconds / 30) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Grid de Métricas Secundarias */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Palabras</span>
                  <span className="text-xl font-bold">{analysis.wordCount}</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Sílabas</span>
                  <span className="text-xl font-bold">{analysis.syllableCount}</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Velocidad</span>
                  <span className="text-xl font-bold">{analysis.adjustedWPM} <span className="text-xs font-normal text-slate-500">wpm</span></span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 block mb-1">Complejidad</span>
                  <span className={`text-xl font-bold capitalize ${
                    analysis.complexityLevel === 'alta' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {analysis.complexityLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sugerencias IA */}
        {analysis && analysis.suggestions.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <h4 className="flex items-center gap-2 text-amber-800 font-semibold mb-3 text-sm">
              <Sparkles className="w-4 h-4" />
              Sugerencias de Optimización
            </h4>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-amber-900/80 leading-snug">
                  <span className="text-amber-500">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Guía Rápida */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <h4 className="font-semibold text-slate-700 text-sm mb-3">Sintaxis Especial</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-violet-600 font-mono">[PAUSA:Xs]</code>
              <span>Silencio de X segundos</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-violet-600 font-mono">[ÉNFASIS]...[/]</code>
              <span>Mayor intensidad</span>
            </div>
            <div className="flex items-center justify-between">
              <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-violet-600 font-mono">[DELETREO]...[/]</code>
              <span>Lectura letra a letra</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartScriptEditor;
