/**
 * 🔊 SILEXAR PULSE - Reproductor de Audio Enterprise 2050
 * 
 * @description Reproductor de cuñas real con waveform, controles
 * completos, metadata y preview antes/después de asignar
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Repeat,
  Clock,
  User,
  Calendar,
  FileAudio,
  Headphones
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface CunaAudio {
  id: string;
  codigo: string;
  nombre: string;
  anunciante: string;
  duracionSegundos: number;
  formato: string;
  bitrate: number;
  sampleRate: number;
  urlAudio?: string;
  subidoPor: string;
  fechaSubida: string;
  vigenciaInicio?: string;
  vigenciaFin?: string;
  estado: 'aprobada' | 'pendiente' | 'rechazada';
}

interface ReproductorAudioProps {
  cuna: CunaAudio;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const ReproductorAudioCuna: React.FC<ReproductorAudioProps> = ({
  cuna,
  autoPlay = false,
  onEnded,
  onTimeUpdate,
  compact = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(cuna.duracionSegundos);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isLoaded, setIsLoaded] = useState(false);

  // Generar waveform mock (en producción vendría del backend)
  const waveformData = useRef<number[]>(
    Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
  );

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Skip hacia atrás
  const skipBack = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
  };

  // Skip hacia adelante
  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
  };

  // Cambiar posición
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = (value[0] / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Cambiar volumen
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Eventos del audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || cuna.duracionSegundos);
      setIsLoaded(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      } else {
        onEnded?.();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Auto play
    if (autoPlay && audio.src) {
      audio.play();
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay, isLooping, cuna.duracionSegundos, onEnded, onTimeUpdate]);

  // Calcular progreso
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Verificar vigencia
  const isVigente = () => {
    const now = new Date();
    if (cuna.vigenciaFin) {
      const fin = new Date(cuna.vigenciaFin);
      return now <= fin;
    }
    return true;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
        <audio ref={audioRef} src={cuna.urlAudio} preload="metadata" />
        
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium truncate">{cuna.codigo}</span>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
      <audio ref={audioRef} src={cuna.urlAudio} preload="metadata" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{cuna.codigo}</h4>
            <p className="text-sm text-gray-500">{cuna.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={
              cuna.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
              cuna.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }
          >
            {cuna.estado}
          </Badge>
          {!isVigente() && (
            <Badge className="bg-red-100 text-red-700">Vencida</Badge>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div className="h-16 bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
        <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-2">
          {waveformData.current.map((height, i) => {
            const isPlayed = i < (progress / 100) * waveformData.current.length;
            return (
              <div
                key={i}
                className={`w-1 rounded-t transition-all ${
                  isPlayed ? 'bg-purple-600' : 'bg-gray-300'
                }`}
                style={{ height: `${height * 100}%` }}
              />
            );
          })}
        </div>
        {/* Indicador de posición */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-purple-600"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="cursor-pointer"
        />
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={skipBack} className="h-10 w-10">
          <SkipBack className="w-5 h-5" />
        </Button>
        
        <button
          onClick={togglePlay}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isPlaying 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>
        
        <Button variant="ghost" size="icon" onClick={skipForward} className="h-10 w-10">
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Volumen y opciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button 
            variant={isLooping ? "default" : "ghost"} 
            size="icon" 
            onClick={() => setIsLooping(!isLooping)}
            className="h-8 w-8"
          >
            <Repeat className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          <FileAudio className="w-4 h-4" />
          <span>{cuna.formato.toUpperCase()} • {cuna.bitrate}kbps • {cuna.sampleRate}Hz</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{cuna.duracionSegundos}s exactos</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <User className="w-4 h-4" />
          <span>Subido por: {cuna.subidoPor}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            Vigencia: {cuna.vigenciaInicio || 'Indefinido'} - {cuna.vigenciaFin || 'Indefinido'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ReproductorAudioCuna;
