/**
 * 🎬 SILEXAR PULSE - Modo Presentación TIER 0
 * 
 * Vista inmersiva para mostrar cuñas en
 * reuniones comerciales con clientes
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, X,
  Clock, Building, Calendar, Download, Share2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface CunaPresentation {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  anuncianteNombre: string;
  duracionSegundos: number;
  duracionFormateada: string;
  fechaCreacion: string;
  estado: string;
  audioUrl: string;
  waveformUrl?: string;
  textoMencion?: string;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const cunasMock: CunaPresentation[] = [
  {
    id: 'cuna-001',
    codigo: 'SPX000124',
    nombre: 'Spot Banco de Chile - Ofertas Enero',
    tipo: 'audio',
    anuncianteNombre: 'Banco de Chile',
    duracionSegundos: 30,
    duracionFormateada: '0:30',
    fechaCreacion: '2025-12-28',
    estado: 'en_aire',
    audioUrl: '/audio/demo.mp3'
  },
  {
    id: 'cuna-002',
    codigo: 'SPX000125',
    nombre: 'Mención Falabella Cyber',
    tipo: 'mencion',
    anuncianteNombre: 'Falabella',
    duracionSegundos: 20,
    duracionFormateada: '0:20',
    fechaCreacion: '2025-12-29',
    estado: 'aprobada',
    audioUrl: '/audio/demo2.mp3',
    textoMencion: 'Amigos oyentes, nuestros amigos de Falabella nos cuentan que están con el Cyber más grande del año. Hasta 70% de descuento en miles de productos. Ingresa a falabella.com y aprovecha.'
  },
  {
    id: 'cuna-003',
    codigo: 'SPX000130',
    nombre: 'Spot Coca-Cola Verano',
    tipo: 'audio',
    anuncianteNombre: 'Coca-Cola',
    duracionSegundos: 30,
    duracionFormateada: '0:30',
    fechaCreacion: '2025-12-15',
    estado: 'en_aire',
    audioUrl: '/audio/demo3.mp3'
  }
];

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function PresentacionPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [cunas] = useState<CunaPresentation[]>(cunasMock);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const currentCuna = cunas[currentIndex];

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setProgress(0);
    setIsPlaying(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(cunas.length - 1, prev + 1));
    setProgress(0);
    setIsPlaying(false);
  }, [cunas.length]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          if (isFullscreen) toggleFullscreen();
          else router.push('/cunas');
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, togglePlay, toggleFullscreen, isFullscreen, router]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
    }
  };

  const tipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      audio: '🎵 Spot',
      mencion: '🎤 Mención',
      presentacion: '📢 Presentación',
      cierre: '🔔 Cierre'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Audio element */}
      <audio 
        ref={audioRef}
        src={currentCuna.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Top bar */}
      <div className={`
        absolute top-0 left-0 right-0 p-4 flex items-center justify-between
        bg-gradient-to-b from-black/50 to-transparent
        transition-opacity duration-300 z-10
        ${showControls ? 'opacity-100' : 'opacity-0'}
      `}>
        <button 
          onClick={() => router.push('/cunas')}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">
            {currentIndex + 1} / {cunas.length}
          </span>
          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center">
          {/* Logo anunciante */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 mx-auto mb-8 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
            {currentCuna.anuncianteNombre.charAt(0)}
          </div>
          
          {/* Info */}
          <div className="mb-8">
            <span className="px-4 py-1.5 bg-white/10 text-white/70 rounded-full text-sm mb-4 inline-block">
              {tipoLabel(currentCuna.tipo)}
            </span>
            <h1 className="text-5xl font-bold text-white mb-4">{currentCuna.nombre}</h1>
            <div className="flex items-center justify-center gap-6 text-white/50">
              <span className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                {currentCuna.anuncianteNombre}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {currentCuna.duracionFormateada}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(currentCuna.fechaCreacion).toLocaleDateString('es-CL')}
              </span>
            </div>
          </div>
          
          {/* Texto de mención (si aplica) */}
          {currentCuna.textoMencion && (
            <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
              <p className="text-white/80 text-lg italic leading-relaxed">
                "{currentCuna.textoMencion}"
              </p>
            </div>
          )}
          
          {/* Visualización de audio */}
          <div className="mb-8">
            <div className="h-24 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
              {/* Simulación de waveform */}
              <div className="flex items-center gap-1 h-16">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      (i / 50) * 100 < progress ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Play button grande */}
          <button
            onClick={togglePlay}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform"
          >
            {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-6
        bg-gradient-to-t from-black/70 to-transparent
        transition-opacity duration-300 z-10
        ${showControls ? 'opacity-100' : 'opacity-0'}
      `}>
        {/* Progress bar */}
        <div 
          className="h-2 bg-white/20 rounded-full mb-6 cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors disabled:opacity-30"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentIndex === cunas.length - 1}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors disabled:opacity-30"
          >
            <SkipForward className="w-6 h-6" />
          </button>
          
          <div className="w-px h-8 bg-white/20 mx-4" />
          
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Thumbnails */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {cunas.map((cuna, idx) => (
            <button
              key={cuna.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                w-16 h-16 rounded-xl transition-all
                ${idx === currentIndex 
                  ? 'ring-2 ring-emerald-500 scale-110' 
                  : 'opacity-50 hover:opacity-100'
                }
              `}
            >
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                {cuna.anuncianteNombre.charAt(0)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
