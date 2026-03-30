/**
 * 🎯 SILEXAR PULSE - Wizard Crear Activo Digital TIER 0
 * 
 * Wizard completo para creación de activos publicitarios digitales
 * con segmentación avanzada (demográfica, geográfica, conductual, etc.)
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Music, Image, Video, Target, Sparkles, ArrowLeft, ArrowRight,
  Check, Upload, Save, Loader2,
  MapPin, Smartphone, Users, Heart, Zap, Link2,
  BarChart2, ChevronDown, X, Layers
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoActivo = 'audio' | 'banner' | 'video' | 'native' | 'interactive';

interface ActivoFormData {
  // Paso 1: Tipo y básicos
  tipoCategoria: TipoActivo;
  tipoEspecifico: string;
  nombre: string;
  anuncianteId: string;
  campanaId?: string;
  descripcion?: string;
  
  // Paso 2: Creatividad
  archivos: File[];
  formatos: string[];
  titulo?: string;
  ctaTexto?: string;
  textoLegal?: string;
  
  // Paso 3: Segmentación Demográfica
  segDemografica: {
    edadRangos: string[];
    generos: string[];
    nivelSocioeconomico: string[];
    ocupaciones: string[];
    idiomas: string[];
  };
  
  // Paso 4: Segmentación Geográfica
  segGeografica: {
    paises: string[];
    regiones: string[];
    ciudades: string[];
    geopoints: { lat: number; lng: number; radioMetros: number; nombre: string }[];
    tiposPOI: string[];
  };
  
  // Paso 5: Segmentación por Dispositivo
  segDispositivo: {
    tipos: string[];
    sistemasOperativos: string[];
    navegadores: string[];
    tiposConexion: string[];
    carriers: string[];
  };
  
  // Paso 6: Segmentación Conductual
  segConductual: {
    intereses: string[];
    intencionCompra: string[];
    eventosVida: string[];
    relacionMarca: string;
    incluirRetargeting: boolean;
  };
  
  // Paso 7: Segmentación Contextual y Geofencing
  segContextual: {
    horasDelDia: number[];
    diasSemana: number[];
    condicionesClima: string[];
    actividadDetectada: string[];
    ubicacionTipo: string[];
    brandSafetyLevel: string;
  };
  
  // Paso 8: Tracking
  tracking: {
    urlDestino: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    pixelFacebook?: string;
    pixelGoogle?: string;
    shortLinkActivo: boolean;
  };
  
  // Paso 9: Presupuesto y Programación
  presupuesto: {
    tipo: 'diario' | 'total' | 'ilimitado';
    monto: number;
    moneda: string;
  };
  estrategiaPuja: string;
  fechaInicio: string;
  fechaFin: string;
  plataformas: string[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, onClick, variant = 'secondary', disabled = false, className = '' 
}: { 
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary';
  disabled?: boolean; className?: string;
}) => {
  const variants = {
    primary: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[4px_4px_12px_rgba(16,185,129,0.4)]',
    secondary: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 shadow-[4px_4px_12px_rgba(0,0,0,0.1)]'
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text', required = false }: { 
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl py-3 px-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none outline-none focus:ring-2 focus:ring-emerald-400/50 text-slate-700"
    />
  </div>
);

const Select = ({ label, value, onChange, options, required = false }: { 
  label: string; value: string; onChange: (v: string) => void; 
  options: { value: string; label: string }[]; required?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl py-3 px-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] border-none outline-none focus:ring-2 focus:ring-emerald-400/50 text-slate-700"
    >
      <option value="">Seleccionar...</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// Multi-select con chips
const MultiSelect = ({ 
  label, selected, options, onChange, placeholder = 'Seleccionar...'
}: { 
  label: string; selected: string[]; options: { value: string; label: string }[]; 
  onChange: (values: string[]) => void; placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      
      {/* Selected chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(val => {
          const opt = options.find(o => o.value === val);
          return (
            <span key={val} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
              {opt?.label || val}
              <button onClick={() => toggle(val)} className="hover:text-emerald-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>
      
      {/* Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-xl py-3 px-4 bg-slate-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)] text-left flex items-center justify-between"
        >
          <span className="text-slate-500">{placeholder}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-60 overflow-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between ${
                  selected.includes(opt.value) ? 'bg-emerald-50 text-emerald-700' : ''
                }`}
              >
                {opt.label}
                {selected.includes(opt.value) && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function CrearActivoDigitalPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  
  const [form, setForm] = useState<ActivoFormData>({
    tipoCategoria: 'banner',
    tipoEspecifico: 'banner_display',
    nombre: '',
    anuncianteId: '',
    archivos: [],
    formatos: [],
    segDemografica: {
      edadRangos: [],
      generos: [],
      nivelSocioeconomico: [],
      ocupaciones: [],
      idiomas: []
    },
    segGeografica: {
      paises: ['Chile'],
      regiones: [],
      ciudades: [],
      geopoints: [],
      tiposPOI: []
    },
    segDispositivo: {
      tipos: [],
      sistemasOperativos: [],
      navegadores: [],
      tiposConexion: [],
      carriers: []
    },
    segConductual: {
      intereses: [],
      intencionCompra: [],
      eventosVida: [],
      relacionMarca: 'todos',
      incluirRetargeting: false
    },
    segContextual: {
      horasDelDia: [],
      diasSemana: [0, 1, 2, 3, 4, 5, 6],
      condicionesClima: [],
      actividadDetectada: [],
      ubicacionTipo: [],
      brandSafetyLevel: 'standard'
    },
    tracking: {
      urlDestino: '',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      shortLinkActivo: true
    },
    presupuesto: {
      tipo: 'diario',
      monto: 50000,
      moneda: 'CLP'
    },
    estrategiaPuja: 'auto',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    plataformas: []
  });

  // Opciones
  const opcionesEdad = [
    { value: '13-17', label: '13-17 años' },
    { value: '18-24', label: '18-24 años' },
    { value: '25-34', label: '25-34 años' },
    { value: '35-44', label: '35-44 años' },
    { value: '45-54', label: '45-54 años' },
    { value: '55-64', label: '55-64 años' },
    { value: '65+', label: '65+ años' }
  ];
  
  const opcionesGenero = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'no_binario', label: 'No binario' }
  ];
  
  const opcionesNSE = [
    { value: 'ABC1', label: 'ABC1 - Alto' },
    { value: 'C2', label: 'C2 - Medio Alto' },
    { value: 'C3', label: 'C3 - Medio' },
    { value: 'D', label: 'D - Medio Bajo' },
    { value: 'E', label: 'E - Bajo' }
  ];
  
  const opcionesRegiones = [
    { value: 'RM', label: 'Región Metropolitana' },
    { value: 'V', label: 'Valparaíso' },
    { value: 'VIII', label: 'Biobío' },
    { value: 'X', label: 'Los Lagos' },
    { value: 'II', label: 'Antofagasta' },
    { value: 'IV', label: 'Coquimbo' },
    { value: 'VI', label: "O'Higgins" },
    { value: 'VII', label: 'Maule' },
    { value: 'IX', label: 'Araucanía' }
  ];
  
  const opcionesCiudades = [
    { value: 'santiago', label: 'Santiago' },
    { value: 'valparaiso', label: 'Valparaíso' },
    { value: 'concepcion', label: 'Concepción' },
    { value: 'vina_del_mar', label: 'Viña del Mar' },
    { value: 'antofagasta', label: 'Antofagasta' },
    { value: 'temuco', label: 'Temuco' },
    { value: 'puerto_montt', label: 'Puerto Montt' },
    { value: 'la_serena', label: 'La Serena' },
    { value: 'rancagua', label: 'Rancagua' }
  ];
  
  const opcionesDispositivos = [
    { value: 'mobile', label: '📱 Móvil' },
    { value: 'desktop', label: '💻 Desktop' },
    { value: 'tablet', label: '📲 Tablet' },
    { value: 'smart_tv', label: '📺 Smart TV' },
    { value: 'console', label: '🎮 Consola' }
  ];
  
  const opcionesOS = [
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' }
  ];
  
  const opcionesConexion = [
    { value: 'wifi', label: '📶 WiFi' },
    { value: '5g', label: '5G' },
    { value: '4g', label: '4G/LTE' },
    { value: '3g', label: '3G' }
  ];
  
  const opcionesCarriers = [
    { value: 'movistar', label: 'Movistar' },
    { value: 'entel', label: 'Entel' },
    { value: 'claro', label: 'Claro' },
    { value: 'wom', label: 'WOM' },
    { value: 'vtr', label: 'VTR' }
  ];
  
  const opcionesIntereses = [
    { value: 'deportes', label: '⚽ Deportes' },
    { value: 'tecnologia', label: '💻 Tecnología' },
    { value: 'moda', label: '👗 Moda' },
    { value: 'viajes', label: '✈️ Viajes' },
    { value: 'gastronomia', label: '🍽️ Gastronomía' },
    { value: 'musica', label: '🎵 Música' },
    { value: 'gaming', label: '🎮 Gaming' },
    { value: 'fitness', label: '💪 Fitness' },
    { value: 'negocios', label: '💼 Negocios' },
    { value: 'mascotas', label: '🐕 Mascotas' },
    { value: 'hogar', label: '🏠 Hogar y Decoración' },
    { value: 'automoviles', label: '🚗 Automóviles' }
  ];
  
  const opcionesEventosVida = [
    { value: 'mudanza', label: '📦 Mudanza reciente' },
    { value: 'recien_casados', label: '💍 Recién casados' },
    { value: 'nuevo_empleo', label: '💼 Nuevo empleo' },
    { value: 'nuevo_bebe', label: '👶 Nuevo bebé' },
    { value: 'graduacion', label: '🎓 Graduación' },
    { value: 'jubilacion', label: '🌴 Jubilación' },
    { value: 'cumpleanos', label: '🎂 Cumpleaños próximo' }
  ];
  
  const opcionesActividad = [
    { value: 'en_movimiento', label: '🚶 En movimiento' },
    { value: 'estacionario', label: '🧍 Estacionario' },
    { value: 'viajando', label: '✈️ Viajando' },
    { value: 'comprando', label: '🛒 Comprando' },
    { value: 'trabajando', label: '💼 Trabajando' },
    { value: 'en_casa', label: '🏠 En casa' },
    { value: 'ejercitando', label: '🏃 Ejercitando' }
  ];
  
  const opcionesUbicacion = [
    { value: 'centro_comercial', label: '🏬 Centro comercial' },
    { value: 'supermercado', label: '🛒 Supermercado' },
    { value: 'universidad', label: '🎓 Universidad' },
    { value: 'hospital', label: '🏥 Hospital' },
    { value: 'aeropuerto', label: '✈️ Aeropuerto' },
    { value: 'metro', label: '🚇 Estación de metro' },
    { value: 'restaurante', label: '🍽️ Restaurante' },
    { value: 'gimnasio', label: '💪 Gimnasio' },
    { value: 'estadio', label: '🏟️ Estadio' }
  ];
  
  const opcionesPlataformas = [
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'google_dv360', label: 'Google DV360' },
    { value: 'meta_ads', label: 'Meta Ads (FB/IG)' },
    { value: 'tiktok_ads', label: 'TikTok Ads' },
    { value: 'linkedin_ads', label: 'LinkedIn Ads' },
    { value: 'twitter_ads', label: 'Twitter/X Ads' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'the_trade_desk', label: 'The Trade Desk' }
  ];

  const pasos = [
    { id: 1, titulo: 'Tipo y Básicos', icon: Layers },
    { id: 2, titulo: 'Creatividad', icon: Image },
    { id: 3, titulo: 'Demográfica', icon: Users },
    { id: 4, titulo: 'Geográfica', icon: MapPin },
    { id: 5, titulo: 'Dispositivo', icon: Smartphone },
    { id: 6, titulo: 'Conductual', icon: Heart },
    { id: 7, titulo: 'Contextual', icon: Zap },
    { id: 8, titulo: 'Tracking', icon: Link2 },
    { id: 9, titulo: 'Presupuesto', icon: BarChart2 },
    { id: 10, titulo: 'Confirmar', icon: Check }
  ];

  const updateForm = (field: string, value: unknown) => {
    setForm(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      const [parent, child] = keys;
      const parentObj = prev[parent as keyof ActivoFormData];
      return {
        ...prev,
        [parent]: {
          ...(typeof parentObj === 'object' && parentObj !== null ? parentObj : {}),
          [child]: value
        }
      };
    });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
    setGuardando(false);
    router.push('/cunas');
  };

  // Alcance estimado
  const alcanceEstimado = useMemo(() => {
    let base = 5000000; // 5M base Chile
    
    // Reducir por segmentación
    if (form.segDemografica.edadRangos.length > 0) {
      base *= (form.segDemografica.edadRangos.length / 7);
    }
    if (form.segDemografica.generos.length > 0 && form.segDemografica.generos.length < 3) {
      base *= (form.segDemografica.generos.length / 2);
    }
    if (form.segGeografica.regiones.length > 0) {
      base *= (form.segGeografica.regiones.length / 16);
    }
    if (form.segConductual.intereses.length > 0) {
      base *= 0.3;
    }
    
    if (base >= 1000000) return `${(base / 1000000).toFixed(1)}M`;
    if (base >= 1000) return `${(base / 1000).toFixed(0)}K`;
    return Math.round(base).toLocaleString();
  }, [form]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/30 to-slate-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              Nuevo Activo Digital
            </h1>
          </div>
          
          {/* Alcance estimado */}
          <Card className="p-4">
            <p className="text-sm text-slate-500">Alcance Estimado</p>
            <p className="text-3xl font-bold text-emerald-600">{alcanceEstimado}</p>
            <p className="text-xs text-slate-400">personas</p>
          </Card>
        </div>

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {pasos.map((p, index) => (
              <div key={p.id} className="flex items-center">
                <button
                  onClick={() => p.id <= paso && setPaso(p.id)}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all min-w-[60px]
                    ${p.id === paso ? 'bg-emerald-100' : ''}
                    ${p.id < paso ? 'cursor-pointer hover:bg-slate-100' : ''}
                    ${p.id > paso ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
                    ${p.id === paso ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : ''}
                    ${p.id < paso ? 'bg-emerald-100 text-emerald-600' : ''}
                    ${p.id > paso ? 'bg-slate-100 text-slate-400' : ''}
                  `}>
                    {p.id < paso ? <Check className="w-4 h-4" /> : <p.icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 hidden lg:block">{p.titulo}</span>
                </button>
                {index < pasos.length - 1 && (
                  <div className={`w-4 lg:w-8 h-0.5 mx-0.5 ${p.id < paso ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Contenido */}
        <Card>
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            {(() => {
              const PasoIcon = pasos[paso - 1].icon;
              return PasoIcon ? <span className="p-2 rounded-lg bg-emerald-100"><PasoIcon className="w-5 h-5 text-emerald-600" /></span> : null;
            })()}
            {pasos[paso - 1].titulo}
          </h2>

          {/* Paso 1: Tipo */}
          {paso === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { value: 'banner', label: 'Banner', icon: Image, color: 'from-blue-400 to-blue-500' },
                  { value: 'video', label: 'Video', icon: Video, color: 'from-red-400 to-red-500' },
                  { value: 'audio', label: 'Audio', icon: Music, color: 'from-purple-400 to-purple-500' },
                  { value: 'native', label: 'Native', icon: Layers, color: 'from-amber-400 to-amber-500' },
                  { value: 'interactive', label: 'Interactivo', icon: Sparkles, color: 'from-cyan-400 to-cyan-500' }
                ].map(tipo => (
                  <button
                    key={tipo.value}
                    onClick={() => updateForm('tipoCategoria', tipo.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      form.tipoCategoria === tipo.value 
                        ? 'border-emerald-400 bg-emerald-50 scale-[1.02]' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tipo.color} flex items-center justify-center mb-2 mx-auto`}>
                      <tipo.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium text-slate-800">{tipo.label}</p>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Input label="Nombre del Activo" value={form.nombre} onChange={v => updateForm('nombre', v)} placeholder="Ej: Banner Verano 300x250" required />
                <Select label="Anunciante" value={form.anuncianteId} onChange={v => updateForm('anuncianteId', v)} required options={[
                  { value: 'anc-001', label: 'Banco de Chile' },
                  { value: 'anc-002', label: 'Coca-Cola Chile' },
                  { value: 'anc-003', label: 'LATAM Airlines' }
                ]} />
              </div>
            </div>
          )}

          {/* Paso 3: Demográfica */}
          {paso === 3 && (
            <div className="space-y-6">
              <MultiSelect 
                label="Rangos de Edad" 
                selected={form.segDemografica.edadRangos}
                options={opcionesEdad}
                onChange={v => updateForm('segDemografica.edadRangos', v)}
                placeholder="Todas las edades"
              />
              <MultiSelect 
                label="Género" 
                selected={form.segDemografica.generos}
                options={opcionesGenero}
                onChange={v => updateForm('segDemografica.generos', v)}
                placeholder="Todos los géneros"
              />
              <MultiSelect 
                label="Nivel Socioeconómico" 
                selected={form.segDemografica.nivelSocioeconomico}
                options={opcionesNSE}
                onChange={v => updateForm('segDemografica.nivelSocioeconomico', v)}
                placeholder="Todos los niveles"
              />
            </div>
          )}

          {/* Paso 4: Geográfica */}
          {paso === 4 && (
            <div className="space-y-6">
              <MultiSelect 
                label="Regiones" 
                selected={form.segGeografica.regiones}
                options={opcionesRegiones}
                onChange={v => updateForm('segGeografica.regiones', v)}
                placeholder="Todo Chile"
              />
              <MultiSelect 
                label="Ciudades" 
                selected={form.segGeografica.ciudades}
                options={opcionesCiudades}
                onChange={v => updateForm('segGeografica.ciudades', v)}
                placeholder="Todas las ciudades"
              />
              <MultiSelect 
                label="Tipos de Ubicación (POI)" 
                selected={form.segGeografica.tiposPOI}
                options={opcionesUbicacion}
                onChange={v => updateForm('segGeografica.tiposPOI', v)}
                placeholder="Sin restricción de ubicación"
              />
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Próximamente: Dibujar zonas personalizadas en mapa
                </p>
              </div>
            </div>
          )}

          {/* Paso 5: Dispositivo */}
          {paso === 5 && (
            <div className="space-y-6">
              <MultiSelect 
                label="Tipos de Dispositivo" 
                selected={form.segDispositivo.tipos}
                options={opcionesDispositivos}
                onChange={v => updateForm('segDispositivo.tipos', v)}
                placeholder="Todos los dispositivos"
              />
              <MultiSelect 
                label="Sistemas Operativos" 
                selected={form.segDispositivo.sistemasOperativos}
                options={opcionesOS}
                onChange={v => updateForm('segDispositivo.sistemasOperativos', v)}
                placeholder="Todos los sistemas"
              />
              <MultiSelect 
                label="Tipo de Conexión" 
                selected={form.segDispositivo.tiposConexion}
                options={opcionesConexion}
                onChange={v => updateForm('segDispositivo.tiposConexion', v)}
                placeholder="Cualquier conexión"
              />
              <MultiSelect 
                label="Operadores Móviles" 
                selected={form.segDispositivo.carriers}
                options={opcionesCarriers}
                onChange={v => updateForm('segDispositivo.carriers', v)}
                placeholder="Todos los operadores"
              />
            </div>
          )}

          {/* Paso 6: Conductual */}
          {paso === 6 && (
            <div className="space-y-6">
              <MultiSelect 
                label="Intereses y Afinidades" 
                selected={form.segConductual.intereses}
                options={opcionesIntereses}
                onChange={v => updateForm('segConductual.intereses', v)}
                placeholder="Sin segmentación por intereses"
              />
              <MultiSelect 
                label="Eventos de Vida" 
                selected={form.segConductual.eventosVida}
                options={opcionesEventosVida}
                onChange={v => updateForm('segConductual.eventosVida', v)}
                placeholder="Sin eventos específicos"
              />
              <Select 
                label="Relación con la Marca" 
                value={form.segConductual.relacionMarca}
                onChange={v => updateForm('segConductual.relacionMarca', v)}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'desconocidos', label: 'Solo desconocidos (prospecting)' },
                  { value: 'clientes', label: 'Solo clientes actuales' },
                  { value: 'churned', label: 'Clientes perdidos (win-back)' }
                ]}
              />
            </div>
          )}

          {/* Paso 7: Contextual */}
          {paso === 7 && (
            <div className="space-y-6">
              <MultiSelect 
                label="Actividad Detectada" 
                selected={form.segContextual.actividadDetectada}
                options={opcionesActividad}
                onChange={v => updateForm('segContextual.actividadDetectada', v)}
                placeholder="Cualquier actividad"
              />
              <MultiSelect 
                label="Tipo de Ubicación Actual" 
                selected={form.segContextual.ubicacionTipo}
                options={opcionesUbicacion}
                onChange={v => updateForm('segContextual.ubicacionTipo', v)}
                placeholder="Cualquier ubicación"
              />
              <Select 
                label="Nivel de Brand Safety" 
                value={form.segContextual.brandSafetyLevel}
                onChange={v => updateForm('segContextual.brandSafetyLevel', v)}
                options={[
                  { value: 'floor', label: 'Mínimo - Mayor alcance' },
                  { value: 'standard', label: 'Estándar - Balance' },
                  { value: 'strict', label: 'Estricto - Máxima seguridad' }
                ]}
              />
            </div>
          )}

          {/* Paso 8: Tracking */}
          {paso === 8 && (
            <div className="space-y-6">
              <Input label="URL de Destino" value={form.tracking.urlDestino} onChange={v => updateForm('tracking.urlDestino', v)} placeholder="https://tuempresa.cl/landing" required />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Input label="UTM Source" value={form.tracking.utmSource} onChange={v => updateForm('tracking.utmSource', v)} placeholder="silexar" />
                <Input label="UTM Medium" value={form.tracking.utmMedium} onChange={v => updateForm('tracking.utmMedium', v)} placeholder="display" />
                <Input label="UTM Campaign" value={form.tracking.utmCampaign} onChange={v => updateForm('tracking.utmCampaign', v)} placeholder="verano_2025" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input label="Pixel Facebook" value={form.tracking.pixelFacebook || ''} onChange={v => updateForm('tracking.pixelFacebook', v)} placeholder="ID del pixel" />
                <Input label="Pixel Google" value={form.tracking.pixelGoogle || ''} onChange={v => updateForm('tracking.pixelGoogle', v)} placeholder="ID de conversión" />
              </div>
            </div>
          )}

          {/* Paso 9: Presupuesto */}
          {paso === 9 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Select label="Tipo de Presupuesto" value={form.presupuesto.tipo} onChange={v => updateForm('presupuesto.tipo', v)} options={[
                  { value: 'diario', label: 'Presupuesto Diario' },
                  { value: 'total', label: 'Presupuesto Total' },
                  { value: 'ilimitado', label: 'Sin Límite' }
                ]} />
                <Input label="Monto (CLP)" type="number" value={form.presupuesto.monto.toString()} onChange={v => updateForm('presupuesto.monto', parseInt(v) || 0)} />
                <Select label="Estrategia de Puja" value={form.estrategiaPuja} onChange={v => updateForm('estrategiaPuja', v)} options={[
                  { value: 'auto', label: 'Automática (recomendado)' },
                  { value: 'cpm', label: 'CPM Manual' },
                  { value: 'cpc', label: 'CPC Manual' },
                  { value: 'target_roas', label: 'ROAS Objetivo' }
                ]} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input label="Fecha Inicio" type="date" value={form.fechaInicio} onChange={v => updateForm('fechaInicio', v)} required />
                <Input label="Fecha Fin" type="date" value={form.fechaFin} onChange={v => updateForm('fechaFin', v)} required />
              </div>
              <MultiSelect 
                label="Plataformas de Distribución" 
                selected={form.plataformas}
                options={opcionesPlataformas}
                onChange={v => updateForm('plataformas', v)}
                placeholder="Seleccionar plataformas"
              />
            </div>
          )}

          {/* Paso 10: Confirmar */}
          {paso === 10 && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-slate-50">
                <h3 className="font-semibold text-slate-800 mb-4">Resumen del Activo Digital</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-slate-500">Tipo:</span> <span className="font-medium">{form.tipoCategoria}</span></div>
                  <div><span className="text-slate-500">Nombre:</span> <span className="font-medium">{form.nombre}</span></div>
                  <div><span className="text-slate-500">Alcance:</span> <span className="font-medium text-emerald-600">{alcanceEstimado}</span></div>
                  <div><span className="text-slate-500">Presupuesto:</span> <span className="font-medium">${form.presupuesto.monto.toLocaleString()} CLP/{form.presupuesto.tipo}</span></div>
                  <div><span className="text-slate-500">Plataformas:</span> <span className="font-medium">{form.plataformas.length || 'Por definir'}</span></div>
                  <div><span className="text-slate-500">Vigencia:</span> <span className="font-medium">{form.fechaInicio} - {form.fechaFin}</span></div>
                </div>
                
                {/* Segmentación aplicada */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-slate-700 mb-3">Segmentación Aplicada</h4>
                  <div className="flex flex-wrap gap-2">
                    {form.segDemografica.edadRangos.length > 0 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Edad: {form.segDemografica.edadRangos.join(', ')}
                      </span>
                    )}
                    {form.segGeografica.regiones.length > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Regiones: {form.segGeografica.regiones.length}
                      </span>
                    )}
                    {form.segDispositivo.tipos.length > 0 && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        Dispositivos: {form.segDispositivo.tipos.join(', ')}
                      </span>
                    )}
                    {form.segConductual.intereses.length > 0 && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                        Intereses: {form.segConductual.intereses.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Otros pasos placeholder */}
          {paso === 2 && (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600">Subir Creatividades</h3>
              <p className="text-slate-400 mt-2">Arrastra tus archivos aquí o haz clic para seleccionar</p>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setPaso(p => Math.max(1, p - 1))} disabled={paso === 1}>
            <ArrowLeft className="w-5 h-5" /> Anterior
          </Button>
          
          <div className="flex gap-3">
            {paso < 10 && (
              <Button variant="primary" onClick={() => setPaso(p => Math.min(10, p + 1))}>
                Siguiente <ArrowRight className="w-5 h-5" />
              </Button>
            )}
            {paso === 10 && (
              <Button variant="primary" onClick={handleGuardar} disabled={guardando}>
                {guardando ? <><Loader2 className="w-5 h-5 animate-spin" /> Creando...</> : <><Save className="w-5 h-5" /> Crear Activo</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
