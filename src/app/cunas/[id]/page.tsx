/**
 * 🎵 SILEXAR PULSE - Detalle Cuña TIER 0
 * 
 * Vista de detalle completa con reproductor, historial, métricas
 * y acciones de gestión del ciclo de vida
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Music, ArrowLeft, Play, Pause, Volume2, Clock, Calendar, Edit3,
  CheckCircle, XCircle, AlertCircle, Send, Copy, RefreshCw,
  FileAudio, Mic, Radio, Target, Sparkles, History, BarChart2,
  Download, Shield, TrendingUp,
  Building2, Tag, Waves
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface CunaDetalle {
  id: string;
  spxCodigo: string;
  nombre: string;
  tipo: string;
  anuncianteId: string;
  anuncianteNombre: string;
  producto: string | null;
  descripcion: string | null;
  duracionSegundos: number;
  duracionFormateada: string;
  estado: string;
  urgencia: string;
  diasRestantes: number;
  scoreTecnico: number;
  scoreBrandSafety: number;
  totalEmisiones: number;
  fechaCreacion: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  esCritica: boolean;
  audioUrl?: string;
  notas?: string;
  tags?: string[];
  historial?: { accion: string; timestamp: string; usuario: string }[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const NeuromorphicButton = ({ 
  children, onClick, variant = 'secondary', disabled = false, className = '', size = 'md'
}: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean; className?: string; size?: 'sm' | 'md' | 'lg';
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[4px_4px_12px_rgba(16,185,129,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[4px_4px_12px_rgba(239,68,68,0.4)]',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${sizes[size]} rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { bg: string; icon: React.ElementType; label: string }> = {
    en_aire: { bg: 'from-emerald-400 to-emerald-500', icon: Volume2, label: 'En Aire' },
    aprobada: { bg: 'from-blue-400 to-blue-500', icon: CheckCircle, label: 'Aprobada' },
    pendiente_validacion: { bg: 'from-amber-400 to-amber-500', icon: AlertCircle, label: 'Pendiente Validación' },
    borrador: { bg: 'from-slate-400 to-slate-500', icon: FileAudio, label: 'Borrador' },
    pausada: { bg: 'from-orange-400 to-orange-500', icon: Pause, label: 'Pausada' },
    vencida: { bg: 'from-red-400 to-red-500', icon: Clock, label: 'Vencida' },
    finalizada: { bg: 'from-gray-400 to-gray-500', icon: XCircle, label: 'Finalizada' }
  };
  
  const { bg, icon: Icon, label } = config[estado] || config.borrador;
  
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white bg-gradient-to-r ${bg} shadow-lg`}>
      <Icon className="w-5 h-5" />
      {label}
    </span>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const config: Record<string, { color: string; icon: React.ElementType }> = {
    audio: { color: 'bg-blue-100 text-blue-700', icon: FileAudio },
    mencion: { color: 'bg-purple-100 text-purple-700', icon: Mic },
    presentacion: { color: 'bg-amber-100 text-amber-700', icon: Radio },
    cierre: { color: 'bg-pink-100 text-pink-700', icon: Target },
    promo_ida: { color: 'bg-cyan-100 text-cyan-700', icon: Sparkles },
    jingle: { color: 'bg-green-100 text-green-700', icon: Music }
  };
  
  const { color, icon: Icon } = config[tipo] || config.audio;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" />
      {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// REPRODUCTOR DE AUDIO
// ═══════════════════════════════════════════════════════════════

const AudioPlayer = ({ audioUrl, duracion }: { audioUrl?: string; duracion: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData] = useState(() => Array.from({ length: 60 }, () => 0.3 + Math.random() * 0.7));
  
  return (
    <NeuromorphicCard className="bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="flex items-center gap-6">
        {/* Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
            ${isPlaying 
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
              : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-emerald-400 hover:to-emerald-500'
            }
          `}
        >
          {isPlaying ? (
            <Pause className="w-10 h-10 text-white" />
          ) : (
            <Play className="w-10 h-10 text-white ml-1" />
          )}
        </button>
        
        {/* Waveform */}
        <div className="flex-1">
          <div className="flex items-end gap-0.5 h-16">
            {waveformData.map((height, index) => (
              <div
                key={`wave-${index}`}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  index / waveformData.length < currentTime / 100
                    ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                    : 'bg-slate-600'
                }`}
                style={{ height: `${height * 100}%` }}
              />
            ))}
          </div>
          
          {/* Time */}
          <div className="flex justify-between mt-2 text-sm text-slate-400">
            <span>0:00</span>
            <span>{duracion}</span>
          </div>
        </div>
        
        {/* Volume */}
        <div className="flex flex-col items-center gap-2">
          <Volume2 className="w-5 h-5 text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="80"
            aria-label="Volumen"
            className="w-20 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer"
            style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' }}
          />
        </div>
      </div>
      
      {!audioUrl && (
        <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-amber-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            No hay audio adjunto aún
          </p>
        </div>
      )}
    </NeuromorphicCard>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCORE CARD
// ═══════════════════════════════════════════════════════════════

const ScoreCard = ({ label, score, icon: Icon, color }: { label: string; score: number; icon: React.ElementType; color: string }) => (
  <div className="text-center p-4 rounded-xl bg-white shadow-sm">
    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-3`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className={`text-3xl font-bold ${
      score >= 80 ? 'text-emerald-600' :
      score >= 60 ? 'text-amber-600' : 'text-red-600'
    }`}>
      {score > 0 ? `${score}%` : 'N/A'}
    </div>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// HISTORIAL TIMELINE
// ═══════════════════════════════════════════════════════════════

const HistorialTimeline = ({ historial }: { historial?: { accion: string; timestamp: string; usuario: string }[] }) => {
  if (!historial || historial.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Sin historial disponible</p>
      </div>
    );
  }
  
  const iconMap: Record<string, React.ElementType> = {
    CREAR_CUNA: FileAudio,
    SUBIR_AUDIO: Music,
    APROBAR: CheckCircle,
    RECHAZAR: XCircle,
    PONER_EN_AIRE: Volume2,
    PAUSAR: Pause,
    DISTRIBUIR: Send,
    EDITAR: Edit3
  };
  
  return (
    <div className="space-y-4">
      {historial.map((item, index) => {
        const Icon = iconMap[item.accion] || History;
        return (
          <div key={`${item.accion}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              {index < historial.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2" />}
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-slate-800">{item.accion.replace(/_/g, ' ')}</p>
              <p className="text-sm text-slate-500">{item.usuario}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(item.timestamp).toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalleCunaPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [cuna, setCuna] = useState<CunaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'emision'>('info');

  const fetchCuna = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data por ahora
      setCuna({
        id,
        spxCodigo: 'SPX000001',
        nombre: 'Spot Verano Banco Chile 30s',
        tipo: 'audio',
        anuncianteId: 'anc-001',
        anuncianteNombre: 'Banco de Chile',
        producto: 'Cuenta Corriente',
        descripcion: 'Spot de 30 segundos para campaña de verano de Banco Chile, promocionando cuenta corriente con tarjeta de débito gratuita.',
        duracionSegundos: 30,
        duracionFormateada: '0:30',
        estado: 'en_aire',
        urgencia: 'programada',
        diasRestantes: 15,
        scoreTecnico: 92,
        scoreBrandSafety: 88,
        totalEmisiones: 156,
        fechaCreacion: '2025-01-25T14:30:00Z',
        fechaInicioVigencia: '2025-02-01',
        fechaFinVigencia: '2025-02-28',
        esCritica: false,
        audioUrl: '/audio/banco-chile-verano.mp3',
        notas: 'Aprobado por cliente el 25/01. Versión final después de 2 correcciones.',
        tags: ['verano', 'banco', 'comercial', 'cuenta-corriente'],
        historial: [
          { accion: 'CREAR_CUNA', timestamp: '2025-01-25T14:30:00Z', usuario: 'María García' },
          { accion: 'SUBIR_AUDIO', timestamp: '2025-01-25T15:00:00Z', usuario: 'María García' },
          { accion: 'APROBAR', timestamp: '2025-01-26T10:00:00Z', usuario: 'Carlos López' },
          { accion: 'PONER_EN_AIRE', timestamp: '2025-02-01T08:00:00Z', usuario: 'Sistema' }
        ]
      });
    } catch (error) {
      /* */;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCuna(); }, [fetchCuna]);

  const handleAction = async (accion: string) => {
    try {
      const response = await fetch(`/api/cunas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion })
      });
      const data = await response.json();
      if (data.success) {
        setCuna(data.data);
      }
    } catch (error) {
      /* */;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!cuna) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Cuña no encontrada</h2>
          <NeuromorphicButton className="mt-4" onClick={() => router.push('/cunas')}>
            Volver a Cuñas
          </NeuromorphicButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <button 
              onClick={() => router.push('/cunas')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Centro de Operaciones
            </button>
            
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-mono text-2xl font-bold text-emerald-600">{cuna.spxCodigo}</span>
              <TipoBadge tipo={cuna.tipo} />
              <EstadoBadge estado={cuna.estado} />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mt-2">{cuna.nombre}</h1>
            
            <div className="flex items-center gap-4 mt-3 text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {cuna.anuncianteNombre}
              </span>
              {cuna.producto && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {cuna.producto}
                </span>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <NeuromorphicButton variant="secondary" size="sm" onClick={() => router.push(`/cunas/${id}/editar`)}>
              <Edit3 className="w-4 h-4" /> Editar
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" size="sm">
              <Copy className="w-4 h-4" /> Copiar
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" size="sm">
              <Send className="w-4 h-4" /> Distribuir
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" size="sm">
              <Download className="w-4 h-4" /> Descargar
            </NeuromorphicButton>
            
            {cuna.estado === 'aprobada' && (
              <NeuromorphicButton variant="primary" size="sm" onClick={() => handleAction('poner_en_aire')}>
                <Volume2 className="w-4 h-4" /> Poner en Aire
              </NeuromorphicButton>
            )}
            {cuna.estado === 'en_aire' && (
              <NeuromorphicButton variant="danger" size="sm" onClick={() => handleAction('pausar')}>
                <Pause className="w-4 h-4" /> Pausar
              </NeuromorphicButton>
            )}
          </div>
        </div>

        {/* Audio Player */}
        <AudioPlayer audioUrl={cuna.audioUrl} duracion={cuna.duracionFormateada} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs */}
            <NeuromorphicCard className="p-2">
              <div className="flex gap-2">
                {[
                  { id: 'info', label: 'Información', icon: FileAudio },
                  { id: 'historial', label: 'Historial', icon: History },
                  { id: 'emision', label: 'Emisiones', icon: BarChart2 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </NeuromorphicCard>

            {/* Tab Content */}
            <NeuromorphicCard>
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {cuna.descripcion && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Descripción</h3>
                      <p className="text-slate-600">{cuna.descripcion}</p>
                    </div>
                  )}
                  
                  {cuna.notas && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Notas Internas</h3>
                      <p className="text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100">{cuna.notas}</p>
                    </div>
                  )}
                  
                  {cuna.tags && cuna.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {cuna.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50">
                      <p className="text-sm text-slate-500">Duración</p>
                      <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        {cuna.duracionFormateada} ({cuna.duracionSegundos}s)
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50">
                      <p className="text-sm text-slate-500">Vigencia</p>
                      <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        {cuna.diasRestantes} días restantes
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'historial' && (
                <HistorialTimeline historial={cuna.historial} />
              )}
              
              {activeTab === 'emision' && (
                <div className="text-center py-12">
                  <BarChart2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600">Estadísticas de Emisión</h3>
                  <p className="text-slate-400 mt-2">{cuna.totalEmisiones} emisiones registradas</p>
                </div>
              )}
            </NeuromorphicCard>
          </div>

          {/* Right Column - Metrics */}
          <div className="space-y-6">
            
            {/* Scores */}
            <NeuromorphicCard>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Puntuaciones de Calidad
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <ScoreCard label="Técnico" score={cuna.scoreTecnico} icon={Waves} color="from-blue-400 to-blue-500" />
                <ScoreCard label="Brand Safety" score={cuna.scoreBrandSafety} icon={Shield} color="from-purple-400 to-purple-500" />
              </div>
            </NeuromorphicCard>

            {/* Vigencia */}
            <NeuromorphicCard>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Vigencia
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inicio</span>
                  <span className="font-medium">{cuna.fechaInicioVigencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fin</span>
                  <span className="font-medium">{cuna.fechaFinVigencia}</span>
                </div>
                <div className={`p-4 rounded-xl ${
                  cuna.diasRestantes <= 3 ? 'bg-red-50 border border-red-200' :
                  cuna.diasRestantes <= 7 ? 'bg-amber-50 border border-amber-200' :
                  'bg-emerald-50 border border-emerald-200'
                }`}>
                  <p className={`text-center font-bold text-lg ${
                    cuna.diasRestantes <= 3 ? 'text-red-600' :
                    cuna.diasRestantes <= 7 ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    {cuna.diasRestantes > 0 ? `${cuna.diasRestantes} días restantes` : 'Vencida'}
                  </p>
                </div>
              </div>
            </NeuromorphicCard>

            {/* Emisiones */}
            <NeuromorphicCard>
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Emisiones
              </h3>
              <div className="text-center">
                <p className="text-5xl font-bold text-slate-800">{cuna.totalEmisiones}</p>
                <p className="text-slate-500 mt-2">emisiones totales</p>
              </div>
            </NeuromorphicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
