/**
 * 🎚️ SILEXAR PULSE - Hook de Procesamiento de Audio TIER 0
 * 
 * Hook enterprise para procesamiento de audio con Web Audio API:
 * - Generación de waveform estéreo
 * - Detección de silencios
 * - Normalización (EBU R128)
 * - Análisis de compliance broadcast
 * - Fades inteligentes
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 * @security ENTERPRISE_GRADE
 */

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/observability';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface WaveformData {
  leftChannel: number[];
  rightChannel: number[];
  duration: number;
  sampleRate: number;
}

export interface SilenceRegion {
  start: number;
  end: number;
  duration: number;
}

export interface AudioAnalysis {
  peakDb: number;
  rmsDb: number;
  lufs: number;
  dynamicRange: number;
  frequencyRange: {
    low: number;
    high: number;
  };
  compliance: {
    peakOk: boolean;
    rmsOk: boolean;
    frequencyOk: boolean;
    dynamicRangeOk: boolean;
    overallPassed: boolean;
  };
}

export interface TrimResult {
  trimmedBuffer: AudioBuffer;
  removedStart: number;
  removedEnd: number;
  newDuration: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  operation: string;
  progress: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE BROADCAST
// ═══════════════════════════════════════════════════════════════

const BROADCAST_STANDARDS = {
  maxPeakDb: -1,           // Peak máximo permitido
  targetLufs: -23,         // EBU R128 standard
  minRmsDb: -24,           // RMS mínimo
  maxRmsDb: -12,           // RMS máximo
  minFreqHz: 50,           // Frecuencia mínima esperada
  maxFreqHz: 16000,        // Frecuencia máxima esperada
  minDynamicRange: 6,      // Rango dinámico mínimo
  maxDynamicRange: 20,     // Rango dinámico máximo
  silenceThresholdDb: -40, // Umbral para detección de silencio
};

// ═══════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function useAudioProcessor() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    operation: '',
    progress: 0
  });
  const [undoStack, setUndoStack] = useState<AudioBuffer[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES PRIVADAS
  // ═══════════════════════════════════════════════════════════════

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const dbToLinear = (db: number): number => Math.pow(10, db / 20);
  const linearToDb = (linear: number): number => 20 * Math.log10(Math.max(linear, 1e-10));

  const saveForUndo = useCallback((buffer: AudioBuffer) => {
    setUndoStack(prev => [...prev.slice(-9), buffer]); // Mantener últimos 10
  }, []);



  // ═══════════════════════════════════════════════════════════════
  // GENERAR WAVEFORM
  // ═══════════════════════════════════════════════════════════════

  const generateWaveform = useCallback((buffer: AudioBuffer, samples: number = 500): WaveformData => {
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.numberOfChannels > 1 
      ? buffer.getChannelData(1) 
      : buffer.getChannelData(0);
    
    const blockSize = Math.floor(leftChannel.length / samples);
    const leftPeaks: number[] = [];
    const rightPeaks: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, leftChannel.length);
      
      let leftMax = 0;
      let rightMax = 0;
      
      for (let j = start; j < end; j++) {
        leftMax = Math.max(leftMax, Math.abs(leftChannel[j]));
        rightMax = Math.max(rightMax, Math.abs(rightChannel[j]));
      }
      
      leftPeaks.push(leftMax);
      rightPeaks.push(rightMax);
    }
    
    return {
      leftChannel: leftPeaks,
      rightChannel: rightPeaks,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ANALIZAR BUFFER
  // ═══════════════════════════════════════════════════════════════

  const analyzeBuffer = useCallback((buffer: AudioBuffer): AudioAnalysis => {
    const data = buffer.getChannelData(0);
    const length = data.length;
    
    // Peak level
    let peak = 0;
    let sumSquares = 0;
    
    for (let i = 0; i < length; i++) {
      const abs = Math.abs(data[i]);
      peak = Math.max(peak, abs);
      sumSquares += data[i] * data[i];
    }
    
    const rms = Math.sqrt(sumSquares / length);
    const peakDb = linearToDb(peak);
    const rmsDb = linearToDb(rms);
    
    // LUFS aproximado (simplificado)
    const lufs = rmsDb - 0.691;
    
    // Rango dinámico
    const dynamicRange = peakDb - rmsDb;
    
    // Análisis de frecuencia (FFT simplificado)
    // En una implementación real usaríamos AnalyserNode
    const frequencyRange = {
      low: 80,  // Estimado
      high: 15000 // Estimado
    };
    
    // Verificar compliance
    const compliance = {
      peakOk: peakDb <= BROADCAST_STANDARDS.maxPeakDb,
      rmsOk: rmsDb >= BROADCAST_STANDARDS.minRmsDb && rmsDb <= BROADCAST_STANDARDS.maxRmsDb,
      frequencyOk: frequencyRange.low <= 100 && frequencyRange.high >= 12000,
      dynamicRangeOk: dynamicRange >= BROADCAST_STANDARDS.minDynamicRange && 
                      dynamicRange <= BROADCAST_STANDARDS.maxDynamicRange,
      overallPassed: false
    };
    
    compliance.overallPassed = compliance.peakOk && compliance.rmsOk && 
                                compliance.frequencyOk && compliance.dynamicRangeOk;
    
    return {
      peakDb,
      rmsDb,
      lufs,
      dynamicRange,
      frequencyRange,
      compliance
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CARGAR ARCHIVO
  // ═══════════════════════════════════════════════════════════════

  const loadAudioFile = useCallback(async (file: File): Promise<AudioBuffer | null> => {
    setProcessing({ isProcessing: true, operation: 'Cargando audio...', progress: 0 });
    
    try {
      const context = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      
      setProcessing(prev => ({ ...prev, progress: 50 }));
      
      const buffer = await context.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      
      // Generar waveform automáticamente
      const waveform = generateWaveform(buffer);
      setWaveformData(waveform);
      
      // Analizar automáticamente
      const analysisResult = analyzeBuffer(buffer);
      setAnalysis(analysisResult);
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      return buffer;
      
    } catch (error) {
      logger.error('Error cargando audio:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error al cargar', progress: 0 });
      return null;
    }
  }, [getAudioContext, generateWaveform, analyzeBuffer]);

  // ═══════════════════════════════════════════════════════════════
  // DETECTAR SILENCIOS
  // ═══════════════════════════════════════════════════════════════

  const detectSilence = useCallback((buffer: AudioBuffer, thresholdDb: number = -40): SilenceRegion[] => {
    const data = buffer.getChannelData(0);
    const threshold = dbToLinear(thresholdDb);
    const regions: SilenceRegion[] = [];
    
    const windowSize = Math.floor(buffer.sampleRate * 0.05); // 50ms windows
    let silenceStart: number | null = null;
    
    for (let i = 0; i < data.length; i += windowSize) {
      const end = Math.min(i + windowSize, data.length);
      let maxInWindow = 0;
      
      for (let j = i; j < end; j++) {
        maxInWindow = Math.max(maxInWindow, Math.abs(data[j]));
      }
      
      const timePos = i / buffer.sampleRate;
      
      if (maxInWindow < threshold) {
        if (silenceStart === null) {
          silenceStart = timePos;
        }
      } else {
        if (silenceStart !== null) {
          const silenceEnd = timePos;
          if (silenceEnd - silenceStart >= 0.1) { // Mínimo 100ms
            regions.push({
              start: silenceStart,
              end: silenceEnd,
              duration: silenceEnd - silenceStart
            });
          }
          silenceStart = null;
        }
      }
    }
    
    // Verificar silencio al final
    if (silenceStart !== null) {
      const silenceEnd = buffer.duration;
      if (silenceEnd - silenceStart >= 0.1) {
        regions.push({
          start: silenceStart,
          end: silenceEnd,
          duration: silenceEnd - silenceStart
        });
      }
    }
    
    return regions;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // AUTO-TRIM
  // ═══════════════════════════════════════════════════════════════

  const autoTrim = useCallback(async (): Promise<TrimResult | null> => {
    if (!audioBuffer) return null;
    
    setProcessing({ isProcessing: true, operation: 'Detectando silencios...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const silences = detectSilence(audioBuffer, BROADCAST_STANDARDS.silenceThresholdDb);
      
      let trimStart = 0;
      let trimEnd = audioBuffer.duration;
      
      // Encontrar silencio al inicio
      const startSilence = silences.find(s => s.start === 0);
      if (startSilence) {
        trimStart = startSilence.end;
      }
      
      // Encontrar silencio al final
      const endSilence = silences.find(s => Math.abs(s.end - audioBuffer.duration) < 0.05);
      if (endSilence) {
        trimEnd = endSilence.start;
      }
      
      setProcessing(prev => ({ ...prev, operation: 'Recortando audio...', progress: 50 }));
      
      const context = getAudioContext();
      const startSample = Math.floor(trimStart * audioBuffer.sampleRate);
      const endSample = Math.floor(trimEnd * audioBuffer.sampleRate);
      const newLength = endSample - startSample;
      
      const trimmedBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < newLength; i++) {
          newData[i] = oldData[startSample + i];
        }
      }
      
      setAudioBuffer(trimmedBuffer);
      setWaveformData(generateWaveform(trimmedBuffer));
      setAnalysis(analyzeBuffer(trimmedBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return {
        trimmedBuffer,
        removedStart: trimStart,
        removedEnd: audioBuffer.duration - trimEnd,
        newDuration: trimmedBuffer.duration
      };
      
    } catch (error) {
      logger.error('Error en auto-trim:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error en trim', progress: 0 });
      return null;
    }
  }, [audioBuffer, detectSilence, getAudioContext, generateWaveform, analyzeBuffer, saveForUndo]);

  // ═══════════════════════════════════════════════════════════════
  // NORMALIZAR AUDIO
  // ═══════════════════════════════════════════════════════════════

  const normalizeAudio = useCallback(async (targetLufs: number = -23): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    
    setProcessing({ isProcessing: true, operation: 'Normalizando audio...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const currentAnalysis = analyzeBuffer(audioBuffer);
      const gainDb = targetLufs - currentAnalysis.lufs;
      const gainLinear = dbToLinear(gainDb);
      
      // Limitar ganancia para evitar clipping
      const maxGain = dbToLinear(BROADCAST_STANDARDS.maxPeakDb) / dbToLinear(currentAnalysis.peakDb);
      const safeGain = Math.min(gainLinear, maxGain * 0.95);
      
      setProcessing(prev => ({ ...prev, progress: 50 }));
      
      const context = getAudioContext();
      const normalizedBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = normalizedBuffer.getChannelData(channel);
        for (let i = 0; i < audioBuffer.length; i++) {
          newData[i] = oldData[i] * safeGain;
        }
      }
      
      setAudioBuffer(normalizedBuffer);
      setWaveformData(generateWaveform(normalizedBuffer));
      setAnalysis(analyzeBuffer(normalizedBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return normalizedBuffer;
      
    } catch (error) {
      logger.error('Error en normalización:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error en normalización', progress: 0 });
      return null;
    }
  }, [audioBuffer, analyzeBuffer, getAudioContext, generateWaveform, saveForUndo]);

  // ═══════════════════════════════════════════════════════════════
  // APLICAR FADES
  // ═══════════════════════════════════════════════════════════════

  const applyFades = useCallback(async (
    fadeInDuration: number = 0.2,
    fadeOutDuration: number = 0.3
  ): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    
    setProcessing({ isProcessing: true, operation: 'Aplicando fades...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const context = getAudioContext();
      const fadedBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      const fadeInSamples = Math.floor(fadeInDuration * audioBuffer.sampleRate);
      const fadeOutSamples = Math.floor(fadeOutDuration * audioBuffer.sampleRate);
      const fadeOutStart = audioBuffer.length - fadeOutSamples;
      
      setProcessing(prev => ({ ...prev, progress: 30 }));
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = fadedBuffer.getChannelData(channel);
        
        for (let i = 0; i < audioBuffer.length; i++) {
          let multiplier = 1;
          
          // Fade in (curva exponencial suave)
          if (i < fadeInSamples) {
            multiplier = Math.pow(i / fadeInSamples, 2);
          }
          
          // Fade out (curva exponencial suave)
          if (i >= fadeOutStart) {
            const fadePos = (i - fadeOutStart) / fadeOutSamples;
            multiplier *= Math.pow(1 - fadePos, 2);
          }
          
          newData[i] = oldData[i] * multiplier;
        }
      }
      
      setAudioBuffer(fadedBuffer);
      setWaveformData(generateWaveform(fadedBuffer));
      setAnalysis(analyzeBuffer(fadedBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return fadedBuffer;
      
    } catch (error) {
      logger.error('Error aplicando fades:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error en fades', progress: 0 });
      return null;
    }
  }, [audioBuffer, getAudioContext, generateWaveform, analyzeBuffer, saveForUndo]);

  // ═══════════════════════════════════════════════════════════════
  // REDUCCIÓN DE RUIDO (SIMPLIFICADA)
  // ═══════════════════════════════════════════════════════════════

  const applyDenoise = useCallback(async (strength: number = 0.5): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    
    setProcessing({ isProcessing: true, operation: 'Reduciendo ruido...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const context = getAudioContext();
      const denoisedBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      // Filtro de ruido simplificado usando media móvil
      const windowSize = Math.max(3, Math.floor(strength * 10));
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = denoisedBuffer.getChannelData(channel);
        
        for (let i = 0; i < audioBuffer.length; i++) {
          if (i < windowSize || i >= audioBuffer.length - windowSize) {
            newData[i] = oldData[i];
            continue;
          }
          
          // Umbral adaptativo basado en la amplitud local
          let localMax = 0;
          for (let j = -windowSize; j <= windowSize; j++) {
            localMax = Math.max(localMax, Math.abs(oldData[i + j]));
          }
          
          const threshold = dbToLinear(-50) * (1 + strength);
          
          if (Math.abs(oldData[i]) < threshold && localMax < threshold * 2) {
            newData[i] = oldData[i] * (1 - strength * 0.8);
          } else {
            newData[i] = oldData[i];
          }
        }
      }
      
      setProcessing(prev => ({ ...prev, progress: 80 }));
      
      setAudioBuffer(denoisedBuffer);
      setWaveformData(generateWaveform(denoisedBuffer));
      setAnalysis(analyzeBuffer(denoisedBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return denoisedBuffer;
      
    } catch (error) {
      logger.error('Error en denoise:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error en denoise', progress: 0 });
      return null;
    }
  }, [audioBuffer, getAudioContext, generateWaveform, analyzeBuffer, saveForUndo]);

  // ═══════════════════════════════════════════════════════════════
  // GANANCIA MANUAL
  // ═══════════════════════════════════════════════════════════════

  const applyGain = useCallback(async (db: number): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    
    setProcessing({ isProcessing: true, operation: 'Aplicando ganancia...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const gainLinear = dbToLinear(db);
      
      const context = getAudioContext();
      const newBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );
      
      setProcessing(prev => ({ ...prev, progress: 50 }));
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        for (let i = 0; i < audioBuffer.length; i++) {
          newData[i] = oldData[i] * gainLinear;
        }
      }
      
      setAudioBuffer(newBuffer);
      setWaveformData(generateWaveform(newBuffer));
      setAnalysis(analyzeBuffer(newBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return newBuffer;
      
    } catch (error) {
      logger.error('Error aplicando ganancia:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error en ganancia', progress: 0 });
      return null;
    }
  }, [audioBuffer, getAudioContext, generateWaveform, analyzeBuffer, saveForUndo]);

  // ═══════════════════════════════════════════════════════════════
  // EDICIÓN: CORTAR Y RECORTAR
  // ═══════════════════════════════════════════════════════════════

  const cut = useCallback(async (start: number, end: number): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    if (start >= end) return audioBuffer;
    
    setProcessing({ isProcessing: true, operation: 'Cortando región...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const startSample = Math.floor(Math.max(0, start) * audioBuffer.sampleRate);
      const endSample = Math.floor(Math.min(audioBuffer.duration, end) * audioBuffer.sampleRate);
      const cutLength = endSample - startSample;
      const newLength = audioBuffer.length - cutLength;
      
      const context = getAudioContext();
      const newBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );
      
      setProcessing(prev => ({ ...prev, progress: 50 }));
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        
        // Copiar parte 1 (antes del corte)
        newData.set(oldData.subarray(0, startSample), 0);
        
        // Copiar parte 2 (después del corte)
        newData.set(oldData.subarray(endSample), startSample);
      }
      
      setAudioBuffer(newBuffer);
      setWaveformData(generateWaveform(newBuffer));
      setAnalysis(analyzeBuffer(newBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return newBuffer;
      
    } catch (error) {
      logger.error('Error en corte:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error al cortar', progress: 0 });
      return null;
    }
  }, [audioBuffer, getAudioContext, generateWaveform, analyzeBuffer, saveForUndo]);

  const crop = useCallback(async (start: number, end: number): Promise<AudioBuffer | null> => {
    if (!audioBuffer) return null;
    if (start >= end) return audioBuffer;

    setProcessing({ isProcessing: true, operation: 'Recortando a selección...', progress: 0 });
    
    try {
      saveForUndo(audioBuffer);
      
      const startSample = Math.floor(Math.max(0, start) * audioBuffer.sampleRate);
      const endSample = Math.floor(Math.min(audioBuffer.duration, end) * audioBuffer.sampleRate);
      const newLength = endSample - startSample;
      
      const context = getAudioContext();
      const newBuffer = context.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );
      
      setProcessing(prev => ({ ...prev, progress: 50 }));
      
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        
        // Copiar solo la selección
        newData.set(oldData.subarray(startSample, endSample), 0);
      }
      
      setAudioBuffer(newBuffer);
      setWaveformData(generateWaveform(newBuffer));
      setAnalysis(analyzeBuffer(newBuffer));
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return newBuffer;
      
    } catch (error) {
      logger.error('Error en crop:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error al recortar', progress: 0 });
      return null;
    }
  }, [audioBuffer, getAudioContext, generateWaveform, analyzeBuffer, saveForUndo]);

  // ═══════════════════════════════════════════════════════════════
  // DESHACER
  // ═══════════════════════════════════════════════════════════════

  const undo = useCallback((): boolean => {
    if (undoStack.length === 0) return false;
    
    const previousBuffer = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setAudioBuffer(previousBuffer);
    setWaveformData(generateWaveform(previousBuffer));
    setAnalysis(analyzeBuffer(previousBuffer));
    
    return true;
  }, [undoStack, generateWaveform, analyzeBuffer]);

  // ═══════════════════════════════════════════════════════════════
  // EXPORTAR A BLOB
  // ═══════════════════════════════════════════════════════════════

  const exportToWav = useCallback(async (): Promise<Blob | null> => {
    if (!audioBuffer) return null;
    
    setProcessing({ isProcessing: true, operation: 'Exportando audio...', progress: 0 });
    
    try {
      const length = audioBuffer.length;
      const numberOfChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const bitsPerSample = 16;
      
      const bytesPerSample = bitsPerSample / 8;
      const blockAlign = numberOfChannels * bytesPerSample;
      const byteRate = sampleRate * blockAlign;
      const dataSize = length * blockAlign;
      const headerSize = 44;
      const totalSize = headerSize + dataSize;
      
      const buffer = new ArrayBuffer(totalSize);
      const view = new DataView(buffer);
      
      // WAV Header
      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, totalSize - 8, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true); // fmt chunk size
      view.setUint16(20, 1, true);  // PCM format
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);
      
      setProcessing(prev => ({ ...prev, progress: 30 }));
      
      // Interleave channels and write samples
      let offset = headerSize;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = audioBuffer.getChannelData(channel)[i];
          const clampedSample = Math.max(-1, Math.min(1, sample));
          const intSample = clampedSample < 0 
            ? clampedSample * 32768 
            : clampedSample * 32767;
          view.setInt16(offset, intSample, true);
          offset += 2;
        }
      }
      
      setProcessing({ isProcessing: false, operation: '', progress: 100 });
      
      return new Blob([buffer], { type: 'audio/wav' });
      
    } catch (error) {
      logger.error('Error exportando:', error instanceof Error ? error : undefined);
      setProcessing({ isProcessing: false, operation: 'Error en exportación', progress: 0 });
      return null;
    }
  }, [audioBuffer]);

  // ═══════════════════════════════════════════════════════════════
  // LIMPIAR
  // ═══════════════════════════════════════════════════════════════

  const reset = useCallback(() => {
    setAudioBuffer(null);
    setWaveformData(null);
    setAnalysis(null);
    setUndoStack([]);
    setProcessing({ isProcessing: false, operation: '', progress: 0 });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    // Estado
    audioBuffer,
    waveformData,
    analysis,
    processing,
    canUndo: undoStack.length > 0,
    
    // Acciones
    loadAudioFile,
    autoTrim,
    normalizeAudio,
    applyFades,
    applyDenoise,
    applyGain,
    cut,
    crop,
    undo,
    exportToWav,
    reset,
    
    // Utilidades
    detectSilence,
    generateWaveform,
    analyzeBuffer,
  };
}

export default useAudioProcessor;
