/**
 * 🎛️ SILEXAR PULSE - Editor de Audio Profesional DAW TIER 0
 * 
 * Componente enterprise tipo DAW con:
 * - Waveform estéreo visual (L/R)
 * - Controles de transporte completos
 * - Timeline interactivo con seek
 * - Herramientas de edición (trim, normalize, fades, denoise)
 * - Análisis en tiempo real (Peak, RMS, Freq, Dynamic Range)
 * - Exportación profesional
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 * @security ENTERPRISE_GRADE
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, Square, SkipBack, SkipForward,
  Volume2, VolumeX, Scissors, Sliders, Music2,
  VolumeIcon, Download, RotateCcw, X, Settings,
  Check, AlertTriangle, Info, Loader2, Save, Zap,
  Crop, Scissors as ScissorsIcon
} from 'lucide-react';

import { useAudioProcessor, type AudioAnalysis, type WaveformData } from '../hooks/useAudioProcessor';
import { AudioExporter, exportAudioProfessional, formatFileSize } from '../utils/audioExporter';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ProfessionalAudioEditorProps {
  file: File | null;
  cunaId: string;
  cunaName: string;
  onSave?: (blob: Blob, filename: string) => void;
  onClose?: () => void;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicPanel = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string 
}) => (
  <div className={`
    rounded-2xl p-4 
    bg-gradient-to-br from-slate-800 to-slate-900
    shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),inset_-2px_-2px_4px_rgba(0,0,0,0.3)]
    border border-slate-700/50
    ${className}
  `}>
    {children}
  </div>
);

const TransportButton = ({
  onClick,
  active = false,
  disabled = false,
  children,
  size = 'md',
  variant = 'default',
  ariaLabel
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'danger';
  ariaLabel?: string;
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const variants = {
    default: active 
      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
      : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300 hover:from-slate-500 hover:to-slate-600',
    primary: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${sizes[size]} rounded-xl flex items-center justify-center
        transition-all duration-200 hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  );
};

const ToolButton = ({
  onClick,
  active = false,
  disabled = false,
  loading = false,
  children,
  label
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
      transition-all duration-200 hover:scale-[1.02]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${active
        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg'
        : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 hover:text-white border border-slate-600/50'
      }
    `}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    <span>{label}</span>
  </button>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE WAVEFORM
// ═══════════════════════════════════════════════════════════════

const WaveformDisplay = ({
  waveformData,
  currentTime,
  duration,
  onSeek,
  onSelectionChange,
  selection,
  isPlaying
}: {
  waveformData: WaveformData | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onSelectionChange: (start: number | null, end: number | null) => void;
  selection: { start: number; end: number } | null;
  isPlaying: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const getTimeFromEvent = (e: React.MouseEvent) => {
    if (!containerRef.current || !duration) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    return (x / rect.width) * duration;
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!duration) return;
    const time = getTimeFromEvent(e);
    setIsDragging(true);
    setDragStart(time);
    onSelectionChange(time, time); // Iniciar selección
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStart === null || !duration) return;
    const time = getTimeFromEvent(e);
    onSelectionChange(Math.min(dragStart, time), Math.max(dragStart, time));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    // Verificar si fue un click (sin selección)
    if (selection && Math.abs(selection.end - selection.start) < 0.1) {
      onSelectionChange(null, null); // Limpiar selección
      onSeek(selection.start); // Seek al punto
    }
  };
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const selectionStartPct = selection && duration > 0 ? (selection.start / duration) * 100 : 0;
  const selectionWidthPct = selection && duration > 0 ? ((selection.end - selection.start) / duration) * 100 : 0;
  
  if (!waveformData) {
    return (
      <div className="h-32 rounded-xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
        <div className="text-slate-500 flex items-center gap-2">
          <Music2 className="w-5 h-5" />
          <span>Carga un archivo de audio para ver el waveform</span>
        </div>
      </div>
    );
  }
  
  const barCount = waveformData.leftChannel.length;
  
  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative h-32 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 overflow-hidden cursor-crosshair border border-slate-700/50 group select-none"
    >
      {/* Grid de fondo */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(10)].map((_, i) => (
          <div 
            key={`${_}-${i}`} 
            className="absolute w-px h-full bg-slate-600"
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
      </div>
      
      {/* Línea central */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-600/50" />
      
      {/* Waveform L (arriba) */}
      <div className="absolute inset-x-0 top-0 h-1/2 flex items-end justify-center gap-px px-1">
        {waveformData.leftChannel.map((value, i) => {
          const isPlayed = (i / barCount) * 100 < progress;
          return (
            <div
              key={`L-${i}`}
              className={`flex-1 rounded-t-sm transition-colors duration-100 ${
                isPlayed 
                  ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' 
                  : 'bg-gradient-to-t from-slate-500 to-slate-400'
              }`}
              style={{ height: `${value * 100}%`, minHeight: '2px' }}
            />
          );
        })}
      </div>
      
      {/* Waveform R (abajo, invertido) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-start justify-center gap-px px-1">
        {waveformData.rightChannel.map((value, i) => {
          const isPlayed = (i / barCount) * 100 < progress;
          return (
            <div
              key={`R-${i}`}
              className={`flex-1 rounded-b-sm transition-colors duration-100 ${
                isPlayed 
                  ? 'bg-gradient-to-b from-violet-500 to-violet-400' 
                  : 'bg-gradient-to-b from-slate-500 to-slate-400'
              }`}
              style={{ height: `${value * 100}%`, minHeight: '2px' }}
            />
          );
        })}
      </div>
      
      {/* Indicador de posición */}
      <div 
        className={`absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-75 ${isPlaying ? '' : 'opacity-70'}`}
        style={{ left: `${progress}%` }}
      />
      
      {/* Labels de canal */}
      <div className="absolute top-1 left-2 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">L</div>
      <div className="absolute bottom-1 left-2 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">R</div>
      
      {/* Selección Overlay */}
      {selection && (
        <div 
          className="absolute top-0 bottom-0 bg-violet-500/20 border-x border-violet-400/50 backdrop-blur-[1px]"
          style={{ 
            left: `${selectionStartPct}%`, 
            width: `${selectionWidthPct}%` 
          }}
        >
          <div className="absolute top-0 left-0 bg-violet-500 text-[9px] text-white px-1 rounded-br">
            {formatTime(selection.start)}
          </div>
          <div className="absolute bottom-0 right-0 bg-violet-500 text-[9px] text-white px-1 rounded-tl">
            {formatTime(selection.end)}
          </div>
        </div>
      )}
      
      {/* Hover tooltip */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 pointer-events-none">
        {isDragging ? 'Soltar para seleccionar' : 'Arrastra para seleccionar'}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE ANÁLISIS
// ═══════════════════════════════════════════════════════════════

const AnalysisPanel = ({ analysis }: { analysis: AudioAnalysis | null }) => {
  if (!analysis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {['Peak Level', 'RMS Level', 'Freq Range', 'Dynamic Range'].map((label) => (
          <div key={label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-slate-600">--</p>
          </div>
        ))}
      </div>
    );
  }
  
  const metrics = [
    {
      label: 'Peak Level',
      value: `${analysis.peakDb.toFixed(1)} dB`,
      ok: analysis.compliance.peakOk,
      hint: analysis.compliance.peakOk ? 'Óptimo' : 'Muy alto'
    },
    {
      label: 'RMS Level',
      value: `${analysis.rmsDb.toFixed(1)} dB`,
      ok: analysis.compliance.rmsOk,
      hint: analysis.compliance.rmsOk ? 'Broadcast Safe' : 'Fuera de rango'
    },
    {
      label: 'Freq Range',
      value: `${analysis.frequencyRange.low}Hz - ${(analysis.frequencyRange.high / 1000).toFixed(1)}kHz`,
      ok: analysis.compliance.frequencyOk,
      hint: analysis.compliance.frequencyOk ? 'Radio Ready' : 'Revisar'
    },
    {
      label: 'Dynamic Range',
      value: `${analysis.dynamicRange.toFixed(1)} dB`,
      ok: analysis.compliance.dynamicRangeOk,
      hint: analysis.compliance.dynamicRangeOk ? 'Buena compresión' : 'Ajustar'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <div 
          key={metric.label} 
          className={`p-3 rounded-xl border transition-colors ${
            metric.ok 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-400">{metric.label}</p>
            {metric.ok ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <p className={`text-lg font-bold ${metric.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metric.value}
          </p>
          <p className={`text-[10px] ${metric.ok ? 'text-emerald-500/70' : 'text-amber-500/70'}`}>
            {metric.hint}
          </p>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const ProfessionalAudioEditor: React.FC<ProfessionalAudioEditorProps> = ({
  file,
  cunaId,
  cunaName,
  onSave,
  onClose,
  disabled = false
}) => {
  // Estados de reproducción
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [manualGain, setManualGain] = useState(0);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState<'edit' | 'analysis'>('edit');
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);
  
  // Hook de procesamiento
  const processor = useAudioProcessor();
  
  // Cargar archivo cuando cambia
  useEffect(() => {
    if (file) {
      processor.loadAudioFile(file);
      
      // Crear URL para reproducción
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      audioUrlRef.current = URL.createObjectURL(file);
    }
    
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);
  
  // Actualizar tiempo de reproducción
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);
  
  // Duración del audio
  const duration = processor.audioBuffer?.duration || 0;
  
  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };
  
  // Controles de transporte
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setSelection(null);
    }
  };
  
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  const handleSkipBack = () => {
    handleSeek(Math.max(0, currentTime - 5));
  };
  
  const handleSkipForward = () => {
    handleSeek(Math.min(duration, currentTime + 5));
  };
  
  // Herramientas de edición
  const handleAutoTrim = async () => {
    await processor.autoTrim();
  };
  
  const handleNormalize = async () => {
    await processor.normalizeAudio();
  };
  
  const handleFades = async () => {
    await processor.applyFades(0.2, 0.3);
  };
  
  const handleDenoise = async () => {
    await processor.applyDenoise(0.5);
  };
  
  const handleUndo = () => {
    processor.undo();
  };

  const handleManualGain = async () => {
    await processor.applyGain(manualGain);
    setManualGain(0);
  };

  const handleCut = async () => {
    if (selection) {
      await processor.cut(selection.start, selection.end);
      setSelection(null);
    }
  };

  const handleCrop = async () => {
    if (selection) {
      await processor.crop(selection.start, selection.end);
      setSelection(null);
      setCurrentTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  };
  
  // Exportación
  const handleExport = useCallback(async () => {
    const blob = await processor.exportToWav();
    if (blob) {
      // Usar exportador profesional (MP3 320kbps + Metadata)
      const result = await exportAudioProfessional(blob, cunaId, cunaName);
      
      // Descargar archivo final
      const exporter = new AudioExporter(); // Instancia para acceder a utilidades
      exporter.downloadFile(result);
      
      // En una implementación real, aquí se subiría a la nube:
      // const formData = exporter.prepareForCloud(result);
      // await uploadToCloud(formData);
    }
  }, [processor, cunaId, cunaName]);
  
  const handleSave = useCallback(async () => {
    const blob = await processor.exportToWav();
    if (blob && onSave) {
      const filename = `${cunaId}_${cunaName.replace(/[^a-zA-Z0-9]/g, '_')}.wav`;
      onSave(blob, filename);
    }
  }, [processor, cunaId, cunaName, onSave]);
  
  const isProcessing = processor.processing.isProcessing;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Editor Profesional DAW
            </h3>
            <p className="text-sm text-slate-400">
              {file?.name || 'Sin archivo cargado'}
            </p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Audio Element (oculto) */}
      {audioUrlRef.current && (
        <audio ref={audioRef} src={audioUrlRef.current} preload="auto" />
      )}
      
      {/* Panel Principal */}
      <NeuromorphicPanel>
        {/* Controles de Transporte */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TransportButton onClick={handleSkipBack} disabled={disabled || !file} ariaLabel="Retroceder 5 segundos">
              <SkipBack className="w-5 h-5" />
            </TransportButton>

            {isPlaying ? (
              <TransportButton onClick={handlePause} active disabled={disabled || !file} size="lg" ariaLabel="Pausar">
                <Pause className="w-6 h-6" />
              </TransportButton>
            ) : (
              <TransportButton onClick={handlePlay} disabled={disabled || !file} size="lg" ariaLabel="Reproducir">
                <Play className="w-6 h-6 ml-0.5" />
              </TransportButton>
            )}

            <TransportButton onClick={handleStop} disabled={disabled || !file} ariaLabel="Detener">
              <Square className="w-5 h-5" />
            </TransportButton>

            <TransportButton onClick={handleSkipForward} disabled={disabled || !file} ariaLabel="Avanzar 5 segundos">
              <SkipForward className="w-5 h-5" />
            </TransportButton>
          </div>
          
          {/* Timeline */}
          <div className="flex-1 mx-6 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
              <span className="font-mono text-lg text-emerald-400">
                {formatTime(currentTime)}
              </span>
              <span className="text-slate-500">/</span>
              <span className="font-mono text-lg text-slate-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          
          {/* Volumen */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? 'Activar volumen' : 'Silenciar'}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 w-32">
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volumen"
                className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
              <span className="text-sm text-slate-400 w-10 text-right">{volume}%</span>
            </div>
          </div>
        </div>
        
        {/* Waveform */}
        <WaveformDisplay
          waveformData={processor.waveformData}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onSelectionChange={(start, end) => setSelection(start !== null && end !== null ? { start, end } : null)}
          selection={selection}
          isPlaying={isPlaying}
        />
        
        {/* Información de procesamiento */}
        {isProcessing && (
          <div className="mt-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-300">{processor.processing.operation}</p>
              <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${processor.processing.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </NeuromorphicPanel>
      
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'edit'
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
          }`}
        >
          🎚️ Herramientas de Edición
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'analysis'
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg'
              : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
          }`}
        >
          📊 Análisis en Tiempo Real
        </button>
      </div>
      
      {/* Contenido de Tabs */}
      <NeuromorphicPanel className="bg-gradient-to-br from-slate-900 to-slate-950">
        {activeTab === 'edit' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Herramientas de procesamiento automático inteligente
            </p>
            
            <div className="flex flex-wrap gap-3">
              <ToolButton
                onClick={handleAutoTrim}
                disabled={disabled || !file}
                loading={isProcessing && processor.processing.operation.includes('silencio')}
                label="Auto-Trim"
              >
                <Scissors className="w-4 h-4" />
              </ToolButton>

              <ToolButton
                onClick={handleCut}
                disabled={disabled || !file || !selection}
                loading={isProcessing && processor.processing.operation.includes('Cortando')}
                label="Eliminar Región"
              >
                <ScissorsIcon className="w-4 h-4 text-red-400" />
              </ToolButton>

              <ToolButton
                onClick={handleCrop}
                disabled={disabled || !file || !selection}
                loading={isProcessing && processor.processing.operation.includes('Recortando')}
                label="Recortar a Sel."
              >
                <Crop className="w-4 h-4" />
              </ToolButton>
              
              <ToolButton
                onClick={handleNormalize}
                disabled={disabled || !file}
                loading={isProcessing && processor.processing.operation.includes('Normaliz')}
                label="Normalizar"
              >
                <Sliders className="w-4 h-4" />
              </ToolButton>
              
              <ToolButton
                onClick={handleFades}
                disabled={disabled || !file}
                loading={isProcessing && processor.processing.operation.includes('fade')}
                label="Fade In/Out"
              >
                <Music2 className="w-4 h-4" />
              </ToolButton>
              
              <ToolButton
                onClick={handleDenoise}
                disabled={disabled || !file}
                loading={isProcessing && processor.processing.operation.includes('ruido')}
                label="Denoise"
              >
                <VolumeIcon className="w-4 h-4" />
              </ToolButton>
            </div>

            {/* Ganancia Manual */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-4">
               <span className="text-sm font-medium text-slate-400 min-w-20">Ganancia: <span className={manualGain > 0 ? 'text-emerald-400' : manualGain < 0 ? 'text-amber-400' : 'text-slate-300'}>{manualGain > 0 ? '+' : ''}{manualGain} dB</span></span>
               <input
                 type="range"
                 min="-20"
                 max="20"
                 step="1"
                 value={manualGain}
                 onChange={(e) => setManualGain(Number(e.target.value))}
                 aria-label="Ganancia manual en dB"
                 className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-300"
               />
               <ToolButton
                 onClick={handleManualGain}
                 disabled={disabled || !file || manualGain === 0}
                 loading={isProcessing && processor.processing.operation.includes('ganancia')}
                 label="Aplicar dB"
               >
                 <Sliders className="w-4 h-4" />
               </ToolButton>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <ToolButton
                onClick={handleUndo}
                disabled={disabled || !processor.canUndo}
                label="Deshacer"
              >
                <RotateCcw className="w-4 h-4" />
              </ToolButton>
              
              <div className="flex gap-3">
                {onSave && (
                  <ToolButton
                    onClick={handleSave}
                    disabled={disabled || !file || isProcessing}
                    label="Aplicar y Guardar"
                    active
                  >
                    <Save className="w-4 h-4" />
                  </ToolButton>
                )}
                
                <ToolButton
                  onClick={handleExport}
                  disabled={disabled || !file || isProcessing}
                  label="Exportar Final"
                >
                  <Download className="w-4 h-4" />
                </ToolButton>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Análisis de compliance broadcast
              </p>
              
              {processor.analysis && (
                <span className={`
                  inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                  ${processor.analysis.compliance.overallPassed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }
                `}>
                  {processor.analysis.compliance.overallPassed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Broadcast Ready
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Requiere Ajustes
                    </>
                  )}
                </span>
              )}
            </div>
            
            <AnalysisPanel analysis={processor.analysis} />
            
            {/* Info adicional */}
            {processor.audioBuffer && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-700/50">
                <div className="text-center">
                  <p className="text-xs text-slate-500">Duración</p>
                  <p className="text-sm font-semibold text-slate-300">{formatTime(duration)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Sample Rate</p>
                  <p className="text-sm font-semibold text-slate-300">{(processor.audioBuffer.sampleRate / 1000).toFixed(1)} kHz</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Canales</p>
                  <p className="text-sm font-semibold text-slate-300">{processor.audioBuffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">LUFS</p>
                  <p className="text-sm font-semibold text-slate-300">{processor.analysis?.lufs.toFixed(1) || '--'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </NeuromorphicPanel>
      
      {/* Info de archivo */}
      {file && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span>📁 {file.name}</span>
          <span>💾 {formatFileSize(file.size)}</span>
        </div>
      )}
    </div>
  );
};

export default ProfessionalAudioEditor;
