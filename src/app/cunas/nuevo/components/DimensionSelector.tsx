'use client';

/**
 * 🌐 SILEXAR PULSE - DIMENSION SELECTOR
 * 
 * Selector futurista que permite elegir entre Modo FM (Broadcast)
 * y Modo Digital (Hyper-Media). Animación neuromorphic con transiciones fluidas.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState } from 'react';
import { Radio, Globe, Zap, Waves, Monitor, Smartphone, Tv, Speaker, Watch, Car } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type DimensionMode = 'FM_ONLY' | 'DIGITAL_ONLY' | 'HYBRID';

interface DimensionSelectorProps {
  value: DimensionMode;
  onChange: (mode: DimensionMode) => void;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const DimensionSelector: React.FC<DimensionSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [hoveredMode, setHoveredMode] = useState<DimensionMode | null>(null);

  const dimensions: Array<{
    mode: DimensionMode;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    gradient: string;
    glowColor: string;
    devices: React.ReactNode[];
  }> = [
    {
      mode: 'FM_ONLY',
      icon: <Radio className="w-8 h-8" />,
      title: 'Dimensión FM',
      subtitle: 'Broadcast Clásico',
      description: 'Para emisoras tradicionales AM/FM. Calidad de audio profesional con validación técnica estricta.',
      features: [
        'Validación LUFS/EBU R128',
        'Sincronización de automatización',
        'Detección de palabras prohibidas',
        'Fingerprinting de audio'
      ],
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      glowColor: 'shadow-amber-500/50',
      devices: [<Speaker key="sp" className="w-5 h-5" />]
    },
    {
      mode: 'DIGITAL_ONLY',
      icon: <Globe className="w-8 h-8" />,
      title: 'Dimensión Digital',
      subtitle: 'Hyper-Media',
      description: 'Para plataformas digitales. Video, banners interactivos, targeting avanzado y métricas en tiempo real.',
      features: [
        'Video 4K + Stories + Banners',
        'Targeting por Mood/Dispositivo/Geo',
        'Predicción de CTR con IA',
        'Cross-Device Journey'
      ],
      gradient: 'from-cyan-500 via-blue-500 to-violet-500',
      glowColor: 'shadow-cyan-500/50',
      devices: [
        <Smartphone key="ph" className="w-4 h-4" />,
        <Monitor key="mo" className="w-4 h-4" />,
        <Tv key="tv" className="w-4 h-4" />,
        <Watch key="wa" className="w-4 h-4" />,
        <Car key="ca" className="w-4 h-4" />
      ]
    },
    {
      mode: 'HYBRID',
      icon: <Zap className="w-8 h-8" />,
      title: 'Modo Híbrido',
      subtitle: 'Omnicanal Total',
      description: 'Máximo alcance. Combina la potencia del FM con la precisión digital. Un solo material, todos los canales.',
      features: [
        'Todo FM + Todo Digital',
        'Sincronización cross-media',
        'Atribución unificada',
        'Reporting consolidado'
      ],
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      glowColor: 'shadow-emerald-500/50',
      devices: [
        <Speaker key="sp2" className="w-4 h-4" />,
        <Smartphone key="ph2" className="w-4 h-4" />,
        <Monitor key="mo2" className="w-4 h-4" />,
        <Tv key="tv2" className="w-4 h-4" />
      ]
    }
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3">
          <Waves className="w-7 h-7 text-violet-600" />
          Selecciona la Dimensión
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          ¿Dónde vivirá tu cuña? Elige el universo de distribución para desbloquear 
          las herramientas específicas de cada canal.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dimensions.map((dim) => {
          const isSelected = value === dim.mode;
          const isHovered = hoveredMode === dim.mode;
          
          return (
            <button
              key={dim.mode}
              onClick={() => !disabled && onChange(dim.mode)}
              onMouseEnter={() => setHoveredMode(dim.mode)}
              onMouseLeave={() => setHoveredMode(null)}
              disabled={disabled}
              className={`
                relative group p-6 rounded-2xl border-2 transition-all duration-500 text-left
                ${isSelected 
                  ? `border-transparent bg-gradient-to-br ${dim.gradient} text-white shadow-2xl ${dim.glowColor} scale-[1.02]` 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isHovered && !isSelected ? 'transform -translate-y-1' : ''}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full" />
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                ${isSelected 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : `bg-gradient-to-br ${dim.gradient} text-white`
                }
              `}>
                {dim.icon}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {dim.title}
              </h3>
              <p className={`text-sm font-medium mb-3 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                {dim.subtitle}
              </p>

              {/* Description */}
              <p className={`text-sm mb-4 leading-relaxed ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                {dim.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {dim.features.map((feature, idx) => (
                  <li 
                    key={idx} 
                    className={`text-xs flex items-center gap-2 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-violet-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Devices */}
              <div className={`
                flex items-center gap-2 pt-4 border-t 
                ${isSelected ? 'border-white/20' : 'border-slate-100'}
              `}>
                <span className={`text-xs font-medium ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                  Dispositivos:
                </span>
                <div className={`flex items-center gap-1.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {dim.devices}
                </div>
              </div>

              {/* Hover effect overlay */}
              {!isSelected && (
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${dim.gradient} opacity-0 
                  group-hover:opacity-5 transition-opacity duration-300 pointer-events-none
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Mode Indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-full">
          <span className="text-sm text-slate-500">Modo activo:</span>
          <span className="font-bold text-slate-800 flex items-center gap-2">
            {value === 'FM_ONLY' && <><Radio className="w-4 h-4 text-amber-500" /> FM Broadcast</>}
            {value === 'DIGITAL_ONLY' && <><Globe className="w-4 h-4 text-cyan-500" /> Digital Hyper-Media</>}
            {value === 'HYBRID' && <><Zap className="w-4 h-4 text-emerald-500" /> Híbrido Omnicanal</>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DimensionSelector;
