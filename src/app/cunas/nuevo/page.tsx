/**
 * 🎵 SILEXAR PULSE - Wizard Crear Cuña TIER 0
 * 
 * Wizard de creación rápida de cuñas con 6 pestañas
 * Diseño neuromórfico enterprise
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Music, FileAudio, Mic, Radio, Target, Sparkles, ArrowLeft, ArrowRight,
  Check, Calendar, Save, Send,
  Info, Settings, CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import useCreationContext from './hooks/useCreationContext';
import IdDisplayPanel from './components/IdDisplayPanel';
import DurationField from './components/DurationField';
import AdvertiserSearchSelect from './components/AdvertiserSearchSelect';
import VigenciaPanel from './components/VigenciaPanel';
import ProfessionalAudioUpload from './components/ProfessionalAudioUpload';
import { type AudioMetadata } from './components/ProfessionalAudioUpload';
import ProfessionalAudioEditor from './components/ProfessionalAudioEditor';
import { SmartScriptEditor } from './components/SmartScriptEditor';
import { DistributionPanel } from './components/DistributionPanel';
import { TemplateSelector } from './components/TemplateSelector';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoCuna = 'audio' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida' | 'jingle';
type UrgenciaCuna = 'critica' | 'urgente' | 'programada' | 'standby';

interface CunaFormData {
  // Paso 1: Información Básica
  tipo: TipoCuna;
  nombre: string;
  anuncianteId: string;
  anuncianteNombre: string;
  productoId?: string;
  productoNombre?: string;
  descripcion?: string;
  duracionSegundos?: number;
  spxCodigo?: string;
  
  // Paso 2: Contenido
  audioFile?: File;
  textoMencion?: string;
  textosPorDia?: Record<number, string>;
  plantillaPromo?: string;
  variables?: Record<string, string>;
  
  // Paso 3: Vigencia
  fechaInicioVigencia: string;
  horaInicioVigencia: string;
  fechaFinVigencia: string;
  horaFinVigencia: string;
  urgencia: UrgenciaCuna;
  alertConfig: {
    diasAntes7: boolean;
    diasAntes1: boolean;
    alertarEjecutivo: boolean;
    alertarOperador: boolean;
    alertarComercial: boolean;
  };
  
  // Metadata de audio (para análisis técnico)
  audioMetadata?: AudioMetadata;
  
  // Paso 4: Distribución
  gruposDistribucionIds: string[];
  enviarAlCrear: boolean;
  notasDistribucion?: string;
  
  // Paso 5: Notas
  notas?: string;
  tags: string[];

  // Index signature for dynamic template compatibility
  [key: string]: unknown;
}

interface Paso {
  id: number;
  titulo: string;
  descripcion: string;
  icon: React.ElementType;
  completado: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUROMÓRFICOS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-[#EAF0F6] shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] border border-white/40 ${className}`}>
    {children}
  </div>
);

const NeuromorphicInput = ({ 
  label, value, onChange, placeholder, type = 'text', required = false, disabled = false, error 
}: { 
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; 
  type?: string; required?: boolean; disabled?: boolean; error?: string;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      disabled={disabled}
      className={`
        w-full rounded-xl py-3 px-4 bg-[#EAF0F6] 
        shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] 
        border-2 ${error ? 'border-red-300' : 'border-transparent'}
        outline-none focus:ring-2 focus:ring-emerald-400/50 
        text-slate-700 font-bold disabled:opacity-50
      `}
    />
    {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
  </div>
);

const NeuromorphicTextarea = ({ 
  label, value, onChange, placeholder, rows = 4, required = false 
}: { 
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; 
  rows?: number; required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl py-3 px-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] border-transparent outline-none focus:ring-2 focus:ring-emerald-400/50 text-slate-700 font-bold resize-none"
    />
  </div>
);

const NeuromorphicSelect = ({ 
  label, value, onChange, options, required = false 
}: { 
  label: string; value: string; onChange: (v: string) => void; 
  options: { value: string; label: string }[]; required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl py-3 px-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] border-transparent outline-none focus:ring-2 focus:ring-emerald-400/50 text-slate-700 font-bold cursor-pointer"
    >
      <option value="">Seleccionar...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const NeuromorphicButton = ({ 
  children, onClick, variant = 'secondary', disabled = false, className = '' 
}: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean; className?: string;
}) => {
  const variants = {
    primary: 'bg-[#EAF0F6] text-emerald-600 shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#c8d0d8,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff]',
    secondary: 'bg-[#EAF0F6] text-indigo-600 shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#c8d0d8,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff]',
    danger: 'bg-[#EAF0F6] text-red-600 shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#c8d0d8,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff]'
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// SELECTOR DE TIPO
// ═══════════════════════════════════════════════════════════════

const TipoSelector = ({ tipo, onChange }: { tipo: TipoCuna; onChange: (t: TipoCuna) => void }) => {
  const tipos: { 
    value: TipoCuna; 
    label: string; 
    icon: React.ElementType; 
    color: string; 
    desc: string;
    badge?: string;
    badgeColor?: string;
    badgeIcon?: string;
  }[] = [
    { 
      value: 'audio', 
      label: 'Audio Pregrabado (Cuña)', 
      icon: FileAudio, 
      color: 'from-blue-400 to-blue-500', 
      desc: 'Archivo MP3/WAV del cliente',
      badge: '⚡ Más común - Carga rápida',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    { 
      value: 'mencion', 
      label: 'Texto para Mención', 
      icon: Mic, 
      color: 'from-purple-400 to-purple-500', 
      desc: 'Guión para locutor en vivo',
      badge: '🤖 Con generación IA disponible',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    { 
      value: 'presentacion', 
      label: 'Presentación de Auspicio', 
      icon: Radio, 
      color: 'from-amber-400 to-amber-500', 
      desc: 'Entrada a programa patrocinado',
      badge: '🔍 Valida contra vencimientos',
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    { 
      value: 'cierre', 
      label: 'Cierre de Auspicio', 
      icon: Target, 
      color: 'from-pink-400 to-pink-500', 
      desc: 'Salida de programa patrocinado',
      badge: '🎯 Auto-asocia con presentación',
      badgeColor: 'bg-pink-100 text-pink-700'
    },
    { 
      value: 'promo_ida', 
      label: 'Promo/IDA Variable', 
      icon: Sparkles, 
      color: 'from-cyan-400 to-cyan-500', 
      desc: 'Contenido con datos que cambian',
      badge: '📝 Con plantillas personalizables',
      badgeColor: 'bg-cyan-100 text-cyan-700'
    },
    { 
      value: 'jingle', 
      label: 'Jingle', 
      icon: Music, 
      color: 'from-green-400 to-green-500', 
      desc: 'Música identificatoria de marca',
      badge: '🎵 Audio exclusivo de marca',
      badgeColor: 'bg-green-100 text-green-700'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎯</span>
        <span className="font-semibold text-slate-800">¿Qué material vas a cargar?</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tipos.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-300 text-left relative
              ${tipo === t.value 
                ? 'border-emerald-400 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff] scale-[1.01]' 
                : 'border-transparent bg-[#EAF0F6] shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#c8d0d8,-4px_-4px_8px_#ffffff]'
              }
            `}
          >
            {/* Checkmark when selected */}
            {tipo === t.value && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <t.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800">{t.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                {t.badge && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// AudioUploadZone removed - replaced by ProfessionalAudioUpload component

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

function CrearCunaPageContent() {
  const router = useRouter();
  const contexto = useCreationContext();
  const [pasoActual, setPasoActual] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contextoAplicado, setContextoAplicado] = useState(false);
  const [showAudioEditor, setShowAudioEditor] = useState(false);
  
  const [formData, setFormData] = useState<CunaFormData>({
    tipo: 'audio',
    nombre: '',
    anuncianteId: '',
    anuncianteNombre: '',
    fechaInicioVigencia: new Date().toISOString().split('T')[0],
    horaInicioVigencia: new Date().toTimeString().slice(0, 5),
    fechaFinVigencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    horaFinVigencia: '23:59',
    urgencia: 'programada',
    alertConfig: {
      diasAntes7: true,
      diasAntes1: true,
      alertarEjecutivo: true,
      alertarOperador: false,
      alertarComercial: false
    },
    gruposDistribucionIds: [],
    enviarAlCrear: false,
    tags: []
  });

  // Aplicar contexto al montar
  useEffect(() => {
    if (contextoAplicado) return;
    
    const { tipoSugerido, datosPreLlenados } = contexto;
    
    setFormData(prev => ({
      ...prev,
      tipo: tipoSugerido,
      anuncianteId: datosPreLlenados.anuncianteId || prev.anuncianteId,
      anuncianteNombre: datosPreLlenados.anuncianteNombre || prev.anuncianteNombre,
      productoId: datosPreLlenados.productoId || prev.productoId,
      productoNombre: datosPreLlenados.productoNombre || prev.productoNombre,
      nombre: datosPreLlenados.nombre || prev.nombre,
      fechaInicioVigencia: datosPreLlenados.fechaInicioVigencia || prev.fechaInicioVigencia,
      fechaFinVigencia: datosPreLlenados.fechaFinVigencia || prev.fechaFinVigencia
    }));
    
    setContextoAplicado(true);
  }, [contexto, contextoAplicado]);

  const pasos: Paso[] = [
    { id: 1, titulo: 'Información Básica', descripcion: 'Tipo, nombre y anunciante', icon: Info, completado: !!formData.nombre && !!formData.anuncianteId },
    { id: 2, titulo: 'Contenido', descripcion: 'Audio, texto o plantilla', icon: FileAudio, completado: !!formData.audioFile || !!formData.textoMencion },
    { id: 3, titulo: 'Vigencia', descripcion: 'Fechas y urgencia', icon: Calendar, completado: true },
    { id: 4, titulo: 'Distribución', descripcion: 'Grupos y envío', icon: Send, completado: true },
    { id: 5, titulo: 'Notas y Tags', descripcion: 'Información adicional', icon: Settings, completado: true },
    { id: 6, titulo: 'Confirmar', descripcion: 'Revisar y crear', icon: CheckCircle, completado: false }
  ];

  const updateForm = useCallback((field: keyof CunaFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const validatePaso = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (pasoActual === 1) {
      if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
      if (!formData.anuncianteId) newErrors.anuncianteId = 'El anunciante es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [pasoActual, formData]);

  const handleNext = useCallback(() => {
    if (validatePaso() && pasoActual < 6) {
      setPasoActual(pasoActual + 1);
    }
  }, [pasoActual, validatePaso]);

  const handleBack = useCallback(() => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  }, [pasoActual]);

  const handleGuardar = useCallback(async () => {
    if (!validatePaso()) return;
    
    setGuardando(true);
    try {
      const response = await fetch('/api/cunas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Confirmar el ID reservado
        if (formData.spxCodigo) {
          await fetch('/api/cunas/reserve-id', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spxCodigo: formData.spxCodigo, action: 'confirm' })
          });
        }
        router.push(`/cunas/${data.data.id}`);
      } else {
        setErrors({ general: data.error || 'Error al crear la cuña' });
      }
    } catch {
      setErrors({ general: 'Error de conexión' });
    } finally {
      setGuardando(false);
    }
  }, [formData, validatePaso, router]);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F0EDE8] text-slate-700 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              Nueva Cuña
            </h1>
          </div>
        </div>

        {/* Context Banner - Shows when coming from contract, vencimiento, inbox, etc. */}
        {contexto.origen !== 'scratch' && (
          <div className="space-y-2">
            {/* Main context message */}
            <div className={`
              p-4 rounded-xl border flex items-center gap-3
              ${contexto.origen === 'contrato' ? 'bg-blue-50 border-blue-200' : ''}
              ${contexto.origen === 'vencimiento' ? 'bg-amber-50 border-amber-200' : ''}
              ${contexto.origen === 'inbox' ? 'bg-purple-50 border-purple-200' : ''}
              ${contexto.origen === 'campana' ? 'bg-cyan-50 border-cyan-200' : ''}
            `}>
              <div className={`
                p-2 rounded-lg
                ${contexto.origen === 'contrato' ? 'bg-blue-100' : ''}
                ${contexto.origen === 'vencimiento' ? 'bg-amber-100' : ''}
                ${contexto.origen === 'inbox' ? 'bg-purple-100' : ''}
                ${contexto.origen === 'campana' ? 'bg-cyan-100' : ''}
              `}>
                {contexto.origen === 'contrato' && <FileAudio className="w-5 h-5 text-blue-600" />}
                {contexto.origen === 'vencimiento' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                {contexto.origen === 'inbox' && <Music className="w-5 h-5 text-purple-600" />}
                {contexto.origen === 'campana' && <Target className="w-5 h-5 text-cyan-600" />}
              </div>
              <div className="flex-1">
                <p className={`
                  font-medium
                  ${contexto.origen === 'contrato' ? 'text-blue-800' : ''}
                  ${contexto.origen === 'vencimiento' ? 'text-amber-800' : ''}
                  ${contexto.origen === 'inbox' ? 'text-purple-800' : ''}
                  ${contexto.origen === 'campana' ? 'text-cyan-800' : ''}
                `}>
                  {contexto.mensajeContexto}
                </p>
                {contexto.datosPreLlenados.anuncianteNombre && (
                  <p className="text-sm text-slate-600 mt-0.5">
                    ✓ Anunciante pre-seleccionado: <strong>{contexto.datosPreLlenados.anuncianteNombre}</strong>
                  </p>
                )}
              </div>
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${contexto.origen === 'contrato' ? 'bg-blue-200 text-blue-700' : ''}
                ${contexto.origen === 'vencimiento' ? 'bg-amber-200 text-amber-700' : ''}
                ${contexto.origen === 'inbox' ? 'bg-purple-200 text-purple-700' : ''}
                ${contexto.origen === 'campana' ? 'bg-cyan-200 text-cyan-700' : ''}
              `}>
                Datos pre-llenados
              </span>
            </div>
            
            {/* Alert context (e.g., vencimiento warning) */}
            {contexto.alertaContexto && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">{contexto.alertaContexto}</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Steps */}
        <NeuromorphicCard className="p-4">
          <div className="flex items-center justify-between">
            {pasos.map((paso, index) => (
              <div key={paso.id} className="flex items-center">
                <button
                  onClick={() => paso.id <= pasoActual && setPasoActual(paso.id)}
                  className={`
                    flex flex-col items-center p-2 rounded-xl transition-all
                    ${paso.id === pasoActual ? 'bg-emerald-100' : ''}
                    ${paso.id < pasoActual ? 'cursor-pointer hover:bg-slate-100' : ''}
                    ${paso.id > pasoActual ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-1 font-bold shadow-[8px_8px_16px_#c8d0d8,-8px_-8px_16px_#ffffff]
                    ${paso.id === pasoActual ? 'bg-[#EAF0F6] text-emerald-500 shadow-[inset_4px_4px_8px_#c8d0d8,inset_-4px_-4px_8px_#ffffff]' : ''}
                    ${paso.id < pasoActual ? 'bg-[#EAF0F6] text-emerald-600' : ''}
                    ${paso.id > pasoActual ? 'bg-[#EAF0F6] text-slate-400' : ''}
                  `}>
                    {paso.id < pasoActual ? <Check className="w-5 h-5" /> : <paso.icon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium text-slate-600 hidden lg:block">{paso.titulo}</span>
                </button>
                {index < pasos.length - 1 && (
                  <div className={`w-8 lg:w-16 h-0.5 mx-1 ${paso.id < pasoActual ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Contenido del Paso */}
        <NeuromorphicCard>
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {pasos[pasoActual - 1].titulo}
          </h2>

          {/* Paso 1: Información Básica */}
          {pasoActual === 1 && (
            <div className="space-y-6">
              {/* ID Display Panel - Muestra el ID reservado */}
              <IdDisplayPanel
                context={
                  contexto.origen === 'scratch' ? 'manual' : 
                  contexto.origen === 'contrato' ? 'contract' : 
                  contexto.origen === 'vencimiento' ? 'vencimientos' :
                  contexto.origen
                }
                tipoCuna={formData.tipo}
                onIdReserved={(data) => updateForm('spxCodigo', data.spxCodigo)}
              />

              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Tipo de Material</label>
                <TipoSelector tipo={formData.tipo} onChange={(t) => updateForm('tipo', t)} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NeuromorphicInput
                  label="Nombre de la Cuña"
                  value={formData.nombre}
                  onChange={(v) => updateForm('nombre', v)}
                  placeholder="Ej: Spot Verano Banco Chile 30s"
                  required
                  error={errors.nombre}
                />
                
                <AdvertiserSearchSelect
                  value={formData.anuncianteId}
                  valueName={formData.anuncianteNombre}
                  onChange={(anunciante) => {
                    if (anunciante) {
                      updateForm('anuncianteId', anunciante.id);
                      updateForm('anuncianteNombre', anunciante.nombre);
                    } else {
                      updateForm('anuncianteId', '');
                      updateForm('anuncianteNombre', '');
                    }
                  }}
                  required
                  error={errors.anuncianteId}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NeuromorphicInput
                  label="Producto/Servicio"
                  value={formData.productoNombre || ''}
                  onChange={(v) => updateForm('productoNombre', v)}
                  placeholder="Ej: Cuenta Corriente"
                />
                
                <DurationField
                  tipo={formData.tipo}
                  value={formData.duracionSegundos}
                  onChange={(d) => updateForm('duracionSegundos', d)}
                  textoLocucion={formData.textoMencion}
                  audioFile={formData.audioFile}
                />
              </div>

              <NeuromorphicInput
                label="Descripción"
                value={formData.descripcion || ''}
                onChange={(v) => updateForm('descripcion', v)}
                placeholder="Descripción breve del material..."
              />
            </div>
          )}

          {/* Paso 2: Contenido */}
          {pasoActual === 2 && (
            <div className="space-y-6">
              
              <TemplateSelector 
                currentData={formData}
                onApplyTemplate={(newData) => {
                   setFormData(prev => ({ ...prev, ...newData }));
                }}
              />

              {(formData.tipo === 'audio' || formData.tipo === 'jingle') && (
                <>
                  {/* Upload Component */}
                  <ProfessionalAudioUpload
                    file={formData.audioFile || null}
                    audioMetadata={formData.audioMetadata || null}
                    onFileChange={(f) => updateForm('audioFile', f || undefined)}
                    onMetadataChange={(metadata) => updateForm('audioMetadata', metadata || undefined)}
                    onDurationDetected={(seconds) => updateForm('duracionSegundos', seconds)}
                  />
                  
                  {/* Botón para abrir Editor DAW */}
                  {formData.audioFile && !showAudioEditor && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowAudioEditor(true)}
                        className="flex items-center gap-3 px-6 py-3 rounded-xl
                          bg-gradient-to-br from-violet-500 to-purple-600 text-white
                          shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all
                          font-medium"
                      >
                        <Settings className="w-5 h-5" />
                        🎛️ Abrir Editor Profesional DAW
                      </button>
                    </div>
                  )}
                  
                  {/* Editor DAW Profesional */}
                  {showAudioEditor && formData.audioFile && (
                    <div className="mt-4 rounded-2xl overflow-hidden border-2 border-slate-700/50 
                      shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                      <ProfessionalAudioEditor
                        file={formData.audioFile}
                        cunaId={formData.spxCodigo || 'NEW'}
                        cunaName={formData.nombre || 'Nueva Cuña'}
                        onClose={() => setShowAudioEditor(false)}
                        onSave={(blob, filename) => {
                          // Crear nuevo File desde el blob editado
                          const editedFile = new File([blob], filename, { type: 'audio/wav' });
                          updateForm('audioFile', editedFile);
                          setShowAudioEditor(false);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
              
              {(formData.tipo === 'mencion' || formData.tipo === 'presentacion' || formData.tipo === 'cierre') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Guión de Locución
                    </label>
                    <span className="text-xs text-violet-600 font-medium px-2 py-1 bg-violet-50 rounded-full border border-violet-100">
                      ✨ Inteligencia Artificial Activada
                    </span>
                  </div>
                  
                  <SmartScriptEditor
                    initialValue={formData.textoMencion || ''}
                    onChange={(v) => updateForm('textoMencion', v)}
                    onGenerateAudio={async (text, config) => {
                      try {
                        const { CortexVoice } = await import('@/lib/cortex/cortex-voice');
                        
                        // Generar audio con IA y configuración avanzada
                        const result = await CortexVoice.synthesizeAdvanced(
                          text,
                          config || {}
                        );
                        
                        // Convertir Blob a File
                        const filename = `cortex_tts_${config?.voiceId || 'pro'}_${Date.now()}.wav`;
                        const file = new File([result.audioBlob], filename, { type: 'audio/wav' });
                        
                        // Actualizar formulario y abrir editor
                        updateForm('audioFile', file);
                        updateForm('duracionSegundos', result.duration);
                        setShowAudioEditor(true);
                        
                      } catch (error) {
                        /* */;
                        // Aquí idealmente mostraríamos un toast de error
                      }
                    }}
                    brandName={formData.anuncianteNombre}
                  />
                </div>
              )}
              
              {formData.tipo === 'promo_ida' && (
                <NeuromorphicTextarea
                  label="Plantilla con Variables"
                  value={formData.plantillaPromo || ''}
                  onChange={(v) => updateForm('plantillaPromo', v)}
                  placeholder="Use {VARIABLE} para elementos dinámicos. Ej: Quedan {DIAS} días para {EVENTO}"
                  rows={6}
                />
              )}
            </div>
          )}

          {/* Paso 3: Vigencia - Panel Enterprise */}
          {pasoActual === 3 && (
            <div className="space-y-6">
              <VigenciaPanel
                fechaInicio={formData.fechaInicioVigencia}
                horaInicio={formData.horaInicioVigencia}
                fechaFin={formData.fechaFinVigencia}
                horaFin={formData.horaFinVigencia}
                tipoCuna={formData.tipo}
                alertConfig={formData.alertConfig}
                onChange={(field, value) => {
                  if (field === 'alertConfig' && typeof value === 'object') {
                    updateForm('alertConfig', value);
                  } else {
                    updateForm(field as keyof CunaFormData, value as string);
                  }
                }}
              />
              
              <NeuromorphicSelect
                label="Urgencia Operativa"
                value={formData.urgencia}
                onChange={(v) => updateForm('urgencia', v as UrgenciaCuna)}
                options={[
                  { value: 'critica', label: '🔴 Crítica - Emite en menos de 2 horas' },
                  { value: 'urgente', label: '🟠 Urgente - Emite hoy' },
                  { value: 'programada', label: '🔵 Programada - Emite esta semana' },
                  { value: 'standby', label: '⚪ Standby - Material de reserva' }
                ]}
                required
              />
            </div>
          )}

          {/* Paso 4: Distribución */}
          {pasoActual === 4 && (
            <div className="space-y-6">
              <DistributionPanel 
                metadata={{
                   spxId: formData.spxCodigo,
                   nombre: formData.nombre,
                   anunciante: formData.anuncianteNombre
                }}
                onSend={(recipients) => {
                   alert(`Envío inmediato simulado a: ${recipients.length} destinatarios.`);
                }}
                onChange={(ids) => updateForm('gruposDistribucionIds', ids)}
              />

              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                <input
                  type="checkbox"
                  id="enviarAlCrear"
                  checked={formData.enviarAlCrear}
                  onChange={(e) => updateForm('enviarAlCrear', e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500"
                />
                <label htmlFor="enviarAlCrear" className="text-slate-700 font-medium">
                  Confirmar envío automático al finalizar wizard
                </label>
              </div>
              
              <NeuromorphicTextarea
                label="Notas para la Distribución"
                value={formData.notasDistribucion || ''}
                onChange={(v) => updateForm('notasDistribucion', v)}
                placeholder="Instrucciones especiales para los operadores..."
                rows={3}
              />
            </div>
          )}

          {/* Paso 5: Notas */}
          {pasoActual === 5 && (
            <div className="space-y-6">
              <NeuromorphicTextarea
                label="Notas Internas"
                value={formData.notas || ''}
                onChange={(v) => updateForm('notas', v)}
                placeholder="Notas internas sobre esta cuña..."
                rows={6}
              />
              
              <NeuromorphicInput
                label="Etiquetas (separadas por coma)"
                value={formData.tags.join(', ')}
                onChange={(v) => updateForm('tags', v.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="verano, promoción, radio"
              />
            </div>
          )}

          {/* Paso 6: Confirmar */}
          {pasoActual === 6 && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-slate-50">
                <h3 className="font-semibold text-slate-800 mb-4">Resumen de la Cuña</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Tipo:</span> <span className="font-medium">{formData.tipo}</span></div>
                  <div><span className="text-slate-500">Nombre:</span> <span className="font-medium">{formData.nombre}</span></div>
                  <div><span className="text-slate-500">Anunciante:</span> <span className="font-medium">{formData.anuncianteNombre || 'No seleccionado'}</span></div>
                  <div><span className="text-slate-500">Urgencia:</span> <span className="font-medium">{formData.urgencia}</span></div>
                  <div><span className="text-slate-500">Vigencia:</span> <span className="font-medium">{formData.fechaInicioVigencia} - {formData.fechaFinVigencia}</span></div>
                  {formData.audioFile && <div><span className="text-slate-500">Audio:</span> <span className="font-medium">{formData.audioFile.name}</span></div>}
                </div>
              </div>
              
              {errors.general && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}
            </div>
          )}
        </NeuromorphicCard>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <NeuromorphicButton variant="secondary" onClick={handleBack} disabled={pasoActual === 1}>
            <ArrowLeft className="w-5 h-5" /> Anterior
          </NeuromorphicButton>
          
          <div className="flex gap-3">
            {pasoActual < 6 && (
              <NeuromorphicButton variant="primary" onClick={handleNext}>
                Siguiente <ArrowRight className="w-5 h-5" />
              </NeuromorphicButton>
            )}
            {pasoActual === 6 && (
              <NeuromorphicButton variant="primary" onClick={handleGuardar} disabled={guardando}>
                {guardando ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creando...</>
                ) : (
                  <><Save className="w-5 h-5" /> Crear Cuña</>
                )}
              </NeuromorphicButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT CON SUSPENSE
// ═══════════════════════════════════════════════════════════════

export default function CrearCunaPage() {
  return <CrearCunaPageContent />;
}
