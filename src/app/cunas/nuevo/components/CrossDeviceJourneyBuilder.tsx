'use client';

/**
 * 🔗 SILEXAR PULSE - CROSS DEVICE JOURNEY BUILDER
 * 
 * Constructor visual de secuencias cross-device que permite
 * diseñar el "viaje" del usuario a través de múltiples dispositivos
 * y canales (Audio -> Video -> Display).
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState } from 'react';
import { 
  Link2, Plus, Trash2, GripVertical, ArrowRight, Clock,
  Speaker, Video, Image, Smartphone, Monitor, Tv, Watch, Car,
  ChevronDown, Settings, Play, Pause, Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface JourneyStep {
  id: string;
  orden: number;
  nombre: string;
  canal: 'AUDIO' | 'VIDEO' | 'DISPLAY' | 'SOCIAL' | 'PUSH';
  dispositivos: string[];
  assetId?: string;
  assetNombre?: string;
  delayMinutos: number;
  condicionActivacion?: {
    tipo: string;
    valor: string;
  };
}

export interface CrossDeviceJourney {
  id: string;
  nombre: string;
  descripcion: string;
  pasos: JourneyStep[];
  frecuencia: {
    maxImpresionesUsuario: number;
    periodoHoras: number;
  };
  activo: boolean;
}

interface CrossDeviceJourneyBuilderProps {
  value: CrossDeviceJourney;
  onChange: (journey: CrossDeviceJourney) => void;
  availableAssets?: Array<{ id: string; nombre: string; tipo: string }>;
}

// ═══════════════════════════════════════════════════════════════
// DATOS DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const CHANNELS = [
  { id: 'AUDIO', icon: Speaker, label: 'Audio', color: 'bg-amber-500', description: 'Podcast, Radio, Streaming' },
  { id: 'VIDEO', icon: Video, label: 'Video', color: 'bg-blue-500', description: 'Pre-roll, Mid-roll, Stories' },
  { id: 'DISPLAY', icon: Image, label: 'Display', color: 'bg-emerald-500', description: 'Banners, Native Ads' },
  { id: 'SOCIAL', icon: Smartphone, label: 'Social', color: 'bg-pink-500', description: 'Feed, Stories, Reels' },
  { id: 'PUSH', icon: Smartphone, label: 'Push', color: 'bg-violet-500', description: 'Notificaciones' }
];

const DEVICES = [
  { id: 'MOBILE', icon: Smartphone, label: 'Móvil' },
  { id: 'DESKTOP', icon: Monitor, label: 'Desktop' },
  { id: 'SMART_TV', icon: Tv, label: 'Smart TV' },
  { id: 'SMART_SPEAKER', icon: Speaker, label: 'Altavoz' },
  { id: 'SMART_WATCH', icon: Watch, label: 'Reloj' },
  { id: 'CAR', icon: Car, label: 'Coche' }
];

const DELAY_OPTIONS = [
  { value: 0, label: 'Inmediato' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 360, label: '6 horas' },
  { value: 720, label: '12 horas' },
  { value: 1440, label: '24 horas' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const CrossDeviceJourneyBuilder: React.FC<CrossDeviceJourneyBuilderProps> = ({
  value,
  onChange,
  availableAssets = []
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ─── HANDLERS ─────────────────────────────────────────────────

  const addStep = () => {
    const newStep: JourneyStep = {
      id: `step-${Date.now()}`,
      orden: value.pasos.length + 1,
      nombre: `Paso ${value.pasos.length + 1}`,
      canal: 'AUDIO',
      dispositivos: ['MOBILE'],
      delayMinutos: value.pasos.length === 0 ? 0 : 120
    };
    
    onChange({
      ...value,
      pasos: [...value.pasos, newStep]
    });
  };

  const removeStep = (stepId: string) => {
    const updated = value.pasos
      .filter(s => s.id !== stepId)
      .map((s, idx) => ({ ...s, orden: idx + 1 }));
    
    onChange({ ...value, pasos: updated });
  };

  const updateStep = (stepId: string, updates: Partial<JourneyStep>) => {
    const updated = value.pasos.map(s => 
      s.id === stepId ? { ...s, ...updates } : s
    );
    onChange({ ...value, pasos: updated });
  };

  const toggleDevice = (stepId: string, deviceId: string) => {
    const step = value.pasos.find(s => s.id === stepId);
    if (!step) return;
    
    const current = step.dispositivos;
    const updated = current.includes(deviceId)
      ? current.filter(d => d !== deviceId)
      : [...current, deviceId];
    
    updateStep(stepId, { dispositivos: updated });
  };

  const getChannelInfo = (channelId: string) => {
    return CHANNELS.find(c => c.id === channelId) || CHANNELS[0];
  };

  // ─── RENDER ─────────────────────────────────────────────────

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cross-Device Journey</h2>
              <p className="text-white/80 text-sm">Diseña el viaje del usuario entre dispositivos</p>
            </div>
          </div>
          
          {/* Play/Preview button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pausar vista previa' : 'Reproducir vista previa'}
            className={`p-3 rounded-xl transition-all ${
              isPlaying ? 'bg-white text-violet-600' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>

        {/* Journey Name */}
        <div className="mt-4">
          <input
            type="text"
            value={value.nombre}
            onChange={(e) => onChange({ ...value, nombre: e.target.value })}
            placeholder="Nombre del Journey"
            aria-label="Nombre del Journey"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* Steps Timeline */}
      <div className="p-6">
        {value.pasos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Link2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">Sin pasos configurados</h3>
            <p className="text-sm text-slate-500 mb-6">
              Agrega pasos para crear la secuencia cross-device
            </p>
            <button
              onClick={addStep}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar primer paso
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {value.pasos.map((step, idx) => {
              const channel = getChannelInfo(step.canal);
              const Icon = channel.icon;
              const isExpanded = expandedStep === step.id;
              
              return (
                <div key={step.id}>
                  {/* Connector line */}
                  {idx > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-4 bg-slate-200" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {DELAY_OPTIONS.find(d => d.value === step.delayMinutos)?.label || `${step.delayMinutos} min`}
                        </div>
                        <div className="w-0.5 h-4 bg-slate-200" />
                        <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                      </div>
                    </div>
                  )}
                  
                  {/* Step Card */}
                  <div className={`border-2 rounded-xl transition-all ${
                    isExpanded ? 'border-violet-500 shadow-lg' : 'border-slate-200'
                  }`}>
                    {/* Step Header */}
                    <div 
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50"
                      onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    >
                      {/* Drag Handle */}
                      <div className="text-slate-300 hover:text-slate-400 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Step Number */}
                      <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {step.orden}
                      </div>

                      {/* Channel Icon */}
                      <div className={`w-10 h-10 ${channel.color} text-white rounded-xl flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Step Info */}
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{step.nombre}</div>
                        <div className="text-xs text-slate-500">
                          {channel.label} • {step.dispositivos.length} dispositivo(s)
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeStep(step.id); }}
                        aria-label="Eliminar paso"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Step Details (Expanded) */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4">
                        {/* Step Name */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del paso</label>
                          <input
                            type="text"
                            value={step.nombre}
                            onChange={(e) => updateStep(step.id, { nombre: e.target.value })}
                            aria-label="Nombre del paso"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400"
                          />
                        </div>

                        {/* Channel Selection */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Canal</label>
                          <div className="grid grid-cols-5 gap-2">
                            {CHANNELS.map(ch => {
                              const ChIcon = ch.icon;
                              const isSelected = step.canal === ch.id;
                              return (
                                <button
                                  key={ch.id}
                                  onClick={() => updateStep(step.id, { canal: ch.id as JourneyStep['canal'] })}
                                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                                    isSelected 
                                      ? 'border-violet-500 bg-violet-50' 
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className={`w-8 h-8 ${ch.color} text-white rounded-lg flex items-center justify-center`}>
                                    <ChIcon className="w-4 h-4" />
                                  </div>
                                  <span className={`text-xs font-medium ${isSelected ? 'text-violet-700' : 'text-slate-600'}`}>
                                    {ch.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Device Selection */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Dispositivos</label>
                          <div className="flex flex-wrap gap-2">
                            {DEVICES.map(device => {
                              const DevIcon = device.icon;
                              const isSelected = step.dispositivos.includes(device.id);
                              return (
                                <button
                                  key={device.id}
                                  onClick={() => toggleDevice(step.id, device.id)}
                                  className={`px-3 py-2 rounded-xl border-2 flex items-center gap-2 transition-all ${
                                    isSelected 
                                      ? 'border-violet-500 bg-violet-50 text-violet-700' 
                                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                  }`}
                                >
                                  <DevIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">{device.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Delay */}
                        {idx > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Delay desde paso anterior
                            </label>
                            <select
                              value={step.delayMinutos}
                              onChange={(e) => updateStep(step.id, { delayMinutos: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400"
                            >
                              {DELAY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Asset Selection */}
                        {availableAssets.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Asset asociado</label>
                            <select
                              value={step.assetId || ''}
                              onChange={(e) => {
                                const asset = availableAssets.find(a => a.id === e.target.value);
                                updateStep(step.id, { 
                                  assetId: e.target.value,
                                  assetNombre: asset?.nombre
                                });
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400"
                            >
                              <option value="">Seleccionar asset...</option>
                              {availableAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.nombre}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Step Button */}
            <button
              onClick={addStep}
              className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar paso
            </button>
          </div>
        )}
      </div>

      {/* Frequency Settings */}
      {value.pasos.length > 0 && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-slate-500" />
              <span className="font-medium text-slate-800">Frecuencia de Impacto</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Máx. impresiones por usuario</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={value.frecuencia.maxImpresionesUsuario}
                  onChange={(e) => onChange({
                    ...value,
                    frecuencia: { ...value.frecuencia, maxImpresionesUsuario: parseInt(e.target.value) }
                  })}
                  aria-label="Máx. impresiones por usuario"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Periodo (horas)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={value.frecuencia.periodoHoras}
                  onChange={(e) => onChange({
                    ...value,
                    frecuencia: { ...value.frecuencia, periodoHoras: parseInt(e.target.value) }
                  })}
                  aria-label="Periodo en horas"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {value.pasos.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-t border-violet-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-violet-700">
              Journey de {value.pasos.length} pasos • 
              Duración total: {value.pasos.reduce((acc, s) => acc + s.delayMinutos, 0)} minutos
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossDeviceJourneyBuilder;
