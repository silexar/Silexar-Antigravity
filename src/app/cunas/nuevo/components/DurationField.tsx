/**
 * ⏱️ SILEXAR PULSE - Campo de Duración Contextual
 * 
 * Componente que adapta el campo de duración según el tipo de cuña
 * con auto-cálculo para textos y detección automática para audio
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Wand2, Info, AlertCircle, Check } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoCuna = 'audio' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida' | 'jingle';

interface DurationFieldProps {
  tipo: TipoCuna;
  value?: number;
  onChange: (duracion: number) => void;
  textoLocucion?: string;
  audioFile?: File;
  className?: string;
}

interface DurationConfig {
  editable: boolean;
  placeholder: string;
  helpText: string;
  min: number;
  max: number;
  defaultValue: number;
  showAICalculate: boolean;
  showAutoDetect: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN POR TIPO
// ═══════════════════════════════════════════════════════════════

const getDurationConfig = (tipo: TipoCuna): DurationConfig => {
  switch (tipo) {
    case 'audio':
    case 'jingle':
      return {
        editable: false,
        placeholder: 'Se calculará automáticamente',
        helpText: 'La duración exacta se detecta al subir el archivo de audio',
        min: 5,
        max: 180,
        defaultValue: 30,
        showAICalculate: false,
        showAutoDetect: true
      };
    
    case 'mencion':
      return {
        editable: true,
        placeholder: 'Ej: 15',
        helpText: 'Ingresa la duración estimada o deja que la IA la calcule del texto',
        min: 5,
        max: 120,
        defaultValue: 15,
        showAICalculate: true,
        showAutoDetect: false
      };
    
    case 'presentacion':
      return {
        editable: true,
        placeholder: 'Ej: 8',
        helpText: 'Tiempo estimado de locución para la presentación',
        min: 5,
        max: 30,
        defaultValue: 8,
        showAICalculate: true,
        showAutoDetect: false
      };
    
    case 'cierre':
      return {
        editable: true,
        placeholder: 'Ej: 5',
        helpText: 'Tiempo estimado de locución para el cierre',
        min: 3,
        max: 20,
        defaultValue: 5,
        showAICalculate: true,
        showAutoDetect: false
      };
    
    case 'promo_ida':
      return {
        editable: true,
        placeholder: 'Ej: 20',
        helpText: 'Duración base de la plantilla (puede variar con variables)',
        min: 10,
        max: 60,
        defaultValue: 20,
        showAICalculate: true,
        showAutoDetect: false
      };
    
    default:
      return {
        editable: true,
        placeholder: 'Ej: 30',
        helpText: 'Duración en segundos',
        min: 5,
        max: 180,
        defaultValue: 30,
        showAICalculate: false,
        showAutoDetect: false
      };
  }
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════

// Calcular duración estimada basada en palabras (aprox 150 palabras/minuto)
const calculateDurationFromText = (text: string): number => {
  if (!text.trim()) return 0;
  
  const words = text.trim().split(/\s+/).length;
  const wordsPerMinute = 150; // Velocidad promedio de locución
  const seconds = Math.ceil((words / wordsPerMinute) * 60);
  
  return Math.max(5, Math.min(seconds, 120)); // Entre 5s y 2 minutos
};

// Obtener duración de archivo de audio (simulado - en producción usar Web Audio API)
const getAudioDuration = async (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(audio.src);
      resolve(Math.ceil(audio.duration));
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(audio.src);
      resolve(30); // Default si hay error
    });
  });
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function DurationField({
  tipo,
  value,
  onChange,
  textoLocucion,
  audioFile,
  className = ''
}: DurationFieldProps) {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [isCalculating, setIsCalculating] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [suggestion, setSuggestion] = useState<number | null>(null);
  
  const config = getDurationConfig(tipo);

  // Auto-detectar duración de audio
  useEffect(() => {
    if ((tipo === 'audio' || tipo === 'jingle') && audioFile) {
      setIsCalculating(true);
      getAudioDuration(audioFile).then((duration) => {
        setLocalValue(duration.toString());
        onChange(duration);
        setAutoDetected(true);
        setIsCalculating(false);
      });
    }
  }, [audioFile, tipo, onChange]);

  // Calcular sugerencia basada en texto
  useEffect(() => {
    if (textoLocucion && config.showAICalculate) {
      const calculated = calculateDurationFromText(textoLocucion);
      if (calculated > 0) {
        setSuggestion(calculated);
      }
    }
  }, [textoLocucion, config.showAICalculate]);

  // Manejar cambio manual
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= config.min && numValue <= config.max) {
      onChange(numValue);
    }
  }, [onChange, config.min, config.max]);

  // Aplicar sugerencia de IA
  const applySuggestion = useCallback(() => {
    if (suggestion) {
      setLocalValue(suggestion.toString());
      onChange(suggestion);
      setSuggestion(null);
    }
  }, [suggestion, onChange]);

  // Calcular desde texto manualmente
  const calculateFromText = useCallback(() => {
    if (!textoLocucion) return;
    
    setIsCalculating(true);
    setTimeout(() => {
      const calculated = calculateDurationFromText(textoLocucion);
      setLocalValue(calculated.toString());
      onChange(calculated);
      setIsCalculating(false);
    }, 500); // Simular procesamiento
  }, [textoLocucion, onChange]);

  // Formatear a mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-slate-700">
        <Clock className="w-4 h-4 inline mr-1" />
        Duración (segundos)
      </label>

      {/* Input Container */}
      <div className="relative">
        <input
          type="number"
          value={localValue}
          onChange={handleChange}
          disabled={!config.editable || isCalculating}
          placeholder={config.placeholder}
          min={config.min}
          max={config.max}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all
            ${!config.editable 
              ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
              : 'bg-white text-slate-800 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400'
            }
            ${isCalculating ? 'animate-pulse' : ''}
            border-slate-200
          `}
        />
        
        {/* Indicador de duración formateada */}
        {localValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-emerald-100 rounded-lg text-sm font-medium text-emerald-700">
            {formatDuration(parseInt(localValue, 10) || 0)}
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <Info className="w-3 h-3" />
        {config.helpText}
      </p>

      {/* Auto-detect badge */}
      {autoDetected && (
        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-sm text-emerald-700">Duración detectada automáticamente del archivo</span>
        </div>
      )}

      {/* Sugerencia de IA */}
      {suggestion && !autoDetected && (
        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-700">
              Sugerencia IA: <strong>{suggestion}s</strong> ({formatDuration(suggestion)})
            </span>
          </div>
          <button
            onClick={applySuggestion}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Botón calcular desde texto */}
      {config.showAICalculate && textoLocucion && !suggestion && (
        <button
          onClick={calculateFromText}
          disabled={isCalculating}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors disabled:opacity-50"
        >
          <Wand2 className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          {isCalculating ? 'Calculando...' : 'Calcular duración desde texto'}
        </button>
      )}

      {/* Warning si está fuera de rango */}
      {localValue && (parseInt(localValue, 10) < config.min || parseInt(localValue, 10) > config.max) && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-700">
            La duración debe estar entre {config.min}s y {config.max}s
          </span>
        </div>
      )}
    </div>
  );
}
