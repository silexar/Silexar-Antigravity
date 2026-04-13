import React, { useState } from 'react';
import { logger } from '@/lib/observability';
import { 
  X, Play, Music, Mic, Zap, 
  Settings2, Gauge 
} from 'lucide-react';
import { PREMIUM_VOICES, type VoiceConfig } from '@/lib/cortex/cortex-voice';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface VoiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: Partial<VoiceConfig>) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const VoiceConfigModal: React.FC<VoiceConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<Partial<VoiceConfig>>({
    voiceId: PREMIUM_VOICES[0].id,
    speed: 1.0,
    pitch: 0,
    emotion: 'professional',
    backgroundNoise: 'studio',
    compression: 'mp3_320'
  });

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onConfirm(config);
    } catch (e) {
      logger.error('Error', e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0EDE8]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Cortex Voice AI</h3>
              <p className="text-sm text-[#888780]">Configuración de Generación Neural</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-[#888780] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Columna Izq: Selección de Voz */}
          <div className="space-y-6">
            <label className="block text-sm font-semibold text-slate-700">Seleccionar Voz Neural</label>
            <div className="grid gap-3 max-h-60 overflow-y-auto pr-1">
              {PREMIUM_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setConfig({ ...config, voiceId: voice.id })}
                  className={`
                    w-full text-left p-3 rounded-xl border flex items-center justify-between group transition-all
                    ${config.voiceId === voice.id 
                      ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' 
                      : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      config.voiceId === voice.id ? 'bg-violet-600 text-[#2C2C2A]' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {voice.lang.substring(3)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{voice.name}</div>
                      <div className="text-xs text-[#888780]">{voice.gender === 'male' ? 'Masculino' : 'Femenino'} • {voice.lang}</div>
                    </div>
                  </div>
                  {config.voiceId === voice.id && (
                    <Zap className="w-4 h-4 text-violet-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Emociones */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Tono Emocional</label>
              <div className="flex flex-wrap gap-2">
                {['neutral', 'professional', 'happy', 'dramatic'].map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => setConfig({ ...config, emotion: emotion as VoiceConfig['emotion'] })}
                    className={`
                      px-3 py-1.5 text-xs font-medium rounded-full border transition-all capitalize
                      ${config.emotion === emotion 
                        ? 'bg-violet-100 border-violet-200 text-violet-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }
                    `}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Der: Ajustes Finos */}
          <div className="space-y-6">
            
            {/* Speed */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-[#888780]" /> Velocidad
                </label>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{config.speed?.toFixed(1)}x</span>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1"
                value={config.speed}
                onChange={(e) => setConfig({ ...config, speed: parseFloat(e.target.value) })}
                aria-label="Velocidad de voz"
                className="w-full accent-violet-600"
              />
            </div>

            {/* Pitch */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#888780]" /> Tono (Pitch)
                </label>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{config.pitch}</span>
              </div>
              <input
                type="range" min="-10" max="10" step="1"
                value={config.pitch}
                onChange={(e) => setConfig({ ...config, pitch: parseInt(e.target.value) })}
                aria-label="Tono (Pitch)"
                className="w-full accent-violet-600"
              />
            </div>

            {/* Post-Processing */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Compresión Radio</span>
                <button
                  onClick={() => setConfig({ ...config, compression: config.compression === 'wav_48' ? 'mp3_320' : 'wav_48' })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${config.compression === 'mp3_320' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${config.compression === 'mp3_320' ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Ruido de Fondo</span>
                 <select 
                  value={config.backgroundNoise}
                  onChange={(e) => setConfig({...config, backgroundNoise: e.target.value as VoiceConfig['backgroundNoise']})}
                  className="text-xs border-none bg-slate-100 rounded px-2 py-1 text-slate-600 focus:ring-0"
                >
                   <option value="studio-clean">Studio Clean</option>
                   <option value="office">Oficina</option>
                   <option value="street">Calle</option>
                 </select>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-[#888780]">
            <Settings2 className="w-4 h-4" />
            <span>Usando motor neural v2.5</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                px-6 py-2 rounded-xl text-[#2C2C2A] font-medium shadow-lg flex items-center gap-2 transition-all
                ${isGenerating 
                  ? 'bg-slate-400 cursor-wait' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-indigo-500/25 hover:scale-[1.02]'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Generar Audio
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoiceConfigModal;
