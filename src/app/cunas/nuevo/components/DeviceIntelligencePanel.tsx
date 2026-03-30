'use client';

/**
 * 🔋 SILEXAR PULSE - DEVICE INTELLIGENCE PANEL
 * 
 * Panel de configuración de "Deep Device Intelligence" que permite
 * definir reglas basadas en estado del dispositivo: batería, red,
 * movimiento, orientación y modo de pantalla.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState } from 'react';
import { 
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging,
  Wifi, Signal, Gauge, Activity, RotateCcw, Moon,
  Car, PersonStanding, Bike, Train, Plane,
  Volume2, VolumeX, Smartphone, Monitor, AlertTriangle,
  Sparkles, Info
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface DeviceIntelligenceConfig {
  // Battery rules
  batteryRules: {
    enabled: boolean;
    minBattery: number;
    lowBatteryAction: 'SKIP' | 'REDUCE_QUALITY' | 'STATIC_FALLBACK';
    chargingBoost: boolean;
  };
  
  // Connection rules
  connectionRules: {
    enabled: boolean;
    allowedConnections: string[];
    minSpeedMbps: number;
    slowConnectionAction: 'SKIP' | 'COMPRESS' | 'AUDIO_ONLY';
  };
  
  // Movement rules
  movementRules: {
    enabled: boolean;
    allowedStates: string[];
    drivingMode: boolean; // Extra-safe mode
    maxSpeedKmh: number;
  };
  
  // Screen rules
  screenRules: {
    enabled: boolean;
    orientations: ('PORTRAIT' | 'LANDSCAPE' | 'ANY')[];
    darkModeOptimized: boolean;
    oledOptimized: boolean;
  };
  
  // Audio rules
  audioRules: {
    enabled: boolean;
    mutedAction: 'SHOW_SUBTITLES' | 'SKIP' | 'VISUAL_ONLY';
  };
}

interface DeviceIntelligencePanelProps {
  value: DeviceIntelligenceConfig;
  onChange: (config: DeviceIntelligenceConfig) => void;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const DeviceIntelligencePanel: React.FC<DeviceIntelligencePanelProps> = ({
  value,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<'battery' | 'connection' | 'movement' | 'screen' | 'audio'>('battery');

  // ─── HANDLERS ─────────────────────────────────────────────────

  const updateBatteryRules = (updates: Partial<DeviceIntelligenceConfig['batteryRules']>) => {
    onChange({
      ...value,
      batteryRules: { ...value.batteryRules, ...updates }
    });
  };

  const updateConnectionRules = (updates: Partial<DeviceIntelligenceConfig['connectionRules']>) => {
    onChange({
      ...value,
      connectionRules: { ...value.connectionRules, ...updates }
    });
  };

  const updateMovementRules = (updates: Partial<DeviceIntelligenceConfig['movementRules']>) => {
    onChange({
      ...value,
      movementRules: { ...value.movementRules, ...updates }
    });
  };

  const updateScreenRules = (updates: Partial<DeviceIntelligenceConfig['screenRules']>) => {
    onChange({
      ...value,
      screenRules: { ...value.screenRules, ...updates }
    });
  };

  const updateAudioRules = (updates: Partial<DeviceIntelligenceConfig['audioRules']>) => {
    onChange({
      ...value,
      audioRules: { ...value.audioRules, ...updates }
    });
  };

  const toggleConnection = (conn: string) => {
    const current = value.connectionRules.allowedConnections;
    const updated = current.includes(conn)
      ? current.filter(c => c !== conn)
      : [...current, conn];
    updateConnectionRules({ allowedConnections: updated });
  };

  const toggleMovementState = (state: string) => {
    const current = value.movementRules.allowedStates;
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    updateMovementRules({ allowedStates: updated });
  };

  // ─── TABS ─────────────────────────────────────────────────────

  const tabs = [
    { id: 'battery', icon: Battery, label: 'Batería', enabled: value.batteryRules.enabled },
    { id: 'connection', icon: Wifi, label: 'Conexión', enabled: value.connectionRules.enabled },
    { id: 'movement', icon: Activity, label: 'Movimiento', enabled: value.movementRules.enabled },
    { id: 'screen', icon: Monitor, label: 'Pantalla', enabled: value.screenRules.enabled },
    { id: 'audio', icon: Volume2, label: 'Audio', enabled: value.audioRules.enabled }
  ];

  // ─── RENDER ─────────────────────────────────────────────────

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Deep Device Intelligence</h2>
            <p className="text-white/80 text-sm">Reglas de adaptación basadas en el estado del dispositivo</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex-1 min-w-[120px] px-4 py-3 flex items-center justify-center gap-2 transition-all
                ${isActive 
                  ? 'border-b-2 border-teal-500 bg-teal-50 text-teal-700' 
                  : 'text-slate-500 hover:bg-slate-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.enabled && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Battery Tab */}
        {activeTab === 'battery' && (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <BatteryMedium className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="font-medium text-slate-800">Reglas de Batería</div>
                  <div className="text-xs text-slate-500">Adaptar contenido según nivel de batería</div>
                </div>
              </div>
              <button
                onClick={() => updateBatteryRules({ enabled: !value.batteryRules.enabled })}
                aria-label={value.batteryRules.enabled ? 'Desactivar reglas de batería' : 'Activar reglas de batería'}
                className={`w-12 h-6 rounded-full transition-colors ${
                  value.batteryRules.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  value.batteryRules.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {value.batteryRules.enabled && (
              <>
                {/* Min Battery Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Batería mínima requerida: {value.batteryRules.minBattery}%
                  </label>
                  <div className="flex items-center gap-4">
                    <BatteryLow className="w-5 h-5 text-red-500" />
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={value.batteryRules.minBattery}
                      onChange={(e) => updateBatteryRules({ minBattery: parseInt(e.target.value) })}
                      aria-label="Batería mínima requerida"
                      className="flex-1 h-2 bg-gradient-to-r from-red-300 via-amber-300 to-emerald-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <BatteryFull className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Low Battery Action */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Acción si batería baja:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'SKIP', label: 'No mostrar', icon: AlertTriangle, description: 'Saltar el anuncio' },
                      { id: 'REDUCE_QUALITY', label: 'Reducir calidad', icon: Gauge, description: 'Video SD en vez de HD' },
                      { id: 'STATIC_FALLBACK', label: 'Imagen estática', icon: Monitor, description: 'Banner en vez de video' }
                    ].map(action => (
                      <button
                        key={action.id}
                        onClick={() => updateBatteryRules({ lowBatteryAction: action.id as typeof value.batteryRules.lowBatteryAction })}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all
                          ${value.batteryRules.lowBatteryAction === action.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <action.icon className={`w-5 h-5 mb-2 ${
                          value.batteryRules.lowBatteryAction === action.id ? 'text-teal-600' : 'text-slate-500'
                        }`} />
                        <div className={`text-sm font-medium ${
                          value.batteryRules.lowBatteryAction === action.id ? 'text-teal-700' : 'text-slate-700'
                        }`}>
                          {action.label}
                        </div>
                        <div className="text-xs text-slate-500">{action.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Charging Boost */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <BatteryCharging className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-medium text-emerald-800">Boost cuando está cargando</div>
                      <div className="text-xs text-emerald-600">Mostrar contenido de mayor calidad</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateBatteryRules({ chargingBoost: !value.batteryRules.chargingBoost })}
                    aria-label={value.batteryRules.chargingBoost ? 'Desactivar boost al cargar' : 'Activar boost al cargar'}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value.batteryRules.chargingBoost ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      value.batteryRules.chargingBoost ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Connection Tab */}
        {activeTab === 'connection' && (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Signal className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-slate-800">Reglas de Conexión</div>
                  <div className="text-xs text-slate-500">Adaptar según calidad de red</div>
                </div>
              </div>
              <button
                onClick={() => updateConnectionRules({ enabled: !value.connectionRules.enabled })}
                aria-label={value.connectionRules.enabled ? 'Desactivar reglas de conexión' : 'Activar reglas de conexión'}
                className={`w-12 h-6 rounded-full transition-colors ${
                  value.connectionRules.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  value.connectionRules.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {value.connectionRules.enabled && (
              <>
                {/* Connection Types */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Tipos de conexión permitidos:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['WIFI_6', 'WIFI_5', '5G', '4G_LTE', '4G', '3G', 'ETHERNET'].map(conn => (
                      <button
                        key={conn}
                        onClick={() => toggleConnection(conn)}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-medium transition-all
                          ${value.connectionRules.allowedConnections.includes(conn)
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }
                        `}
                      >
                        {conn.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min Speed */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Velocidad mínima: {value.connectionRules.minSpeedMbps} Mbps
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={value.connectionRules.minSpeedMbps}
                    onChange={(e) => updateConnectionRules({ minSpeedMbps: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Slow Connection Action */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Acción si conexión lenta:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'SKIP', label: 'No mostrar' },
                      { id: 'COMPRESS', label: 'Comprimir' },
                      { id: 'AUDIO_ONLY', label: 'Solo Audio' }
                    ].map(action => (
                      <button
                        key={action.id}
                        onClick={() => updateConnectionRules({ slowConnectionAction: action.id as typeof value.connectionRules.slowConnectionAction })}
                        className={`
                          p-3 rounded-xl border-2 text-sm font-medium transition-all
                          ${value.connectionRules.slowConnectionAction === action.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }
                        `}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Movement Tab */}
        {activeTab === 'movement' && (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-violet-500" />
                <div>
                  <div className="font-medium text-slate-800">Reglas de Movimiento</div>
                  <div className="text-xs text-slate-500">Adaptar según actividad física</div>
                </div>
              </div>
              <button
                onClick={() => updateMovementRules({ enabled: !value.movementRules.enabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  value.movementRules.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  value.movementRules.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {value.movementRules.enabled && (
              <>
                {/* Movement States */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Estados permitidos:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'STATIONARY', icon: PersonStanding, label: 'Quieto' },
                      { id: 'WALKING', icon: PersonStanding, label: 'Caminando' },
                      { id: 'CYCLING', icon: Bike, label: 'Bicicleta' },
                      { id: 'DRIVING', icon: Car, label: 'Conduciendo' },
                      { id: 'PUBLIC_TRANSPORT', icon: Train, label: 'Transporte' },
                      { id: 'FLYING', icon: Plane, label: 'Volando' }
                    ].map(state => {
                      const Icon = state.icon;
                      const isSelected = value.movementRules.allowedStates.includes(state.id);
                      return (
                        <button
                          key={state.id}
                          onClick={() => toggleMovementState(state.id)}
                          className={`
                            p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all
                            ${isSelected
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-slate-200 hover:border-slate-300'
                            }
                          `}
                        >
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-600' : 'text-slate-500'}`} />
                          <span className={`text-xs font-medium ${isSelected ? 'text-violet-700' : 'text-slate-600'}`}>
                            {state.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Driving Mode */}
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-medium text-amber-800">Modo Conducción Segura</div>
                      <div className="text-xs text-amber-600">Botones grandes, voz, sin distracciones</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateMovementRules({ drivingMode: !value.movementRules.drivingMode })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value.movementRules.drivingMode ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      value.movementRules.drivingMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Screen Tab */}
        {activeTab === 'screen' && (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-pink-500" />
                <div>
                  <div className="font-medium text-slate-800">Reglas de Pantalla</div>
                  <div className="text-xs text-slate-500">Orientación y modo de visualización</div>
                </div>
              </div>
              <button
                onClick={() => updateScreenRules({ enabled: !value.screenRules.enabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  value.screenRules.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  value.screenRules.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {value.screenRules.enabled && (
              <>
                {/* Dark Mode Optimized */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-slate-300" />
                    <div>
                      <div className="font-medium text-white">Optimizado para Modo Oscuro</div>
                      <div className="text-xs text-slate-400">Colores adaptados, menos brillo</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateScreenRules({ darkModeOptimized: !value.screenRules.darkModeOptimized })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value.screenRules.darkModeOptimized ? 'bg-violet-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      value.screenRules.darkModeOptimized ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* OLED Optimized */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-white">Optimizado para OLED</div>
                      <div className="text-xs text-slate-400">Fondos negros puros, ahorro energía</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateScreenRules({ oledOptimized: !value.screenRules.oledOptimized })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      value.screenRules.oledOptimized ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      value.screenRules.oledOptimized ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Audio Tab */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-medium text-slate-800">Reglas de Audio</div>
                  <div className="text-xs text-slate-500">Comportamiento cuando está silenciado</div>
                </div>
              </div>
              <button
                onClick={() => updateAudioRules({ enabled: !value.audioRules.enabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  value.audioRules.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  value.audioRules.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {value.audioRules.enabled && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Acción si el audio está silenciado:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'SHOW_SUBTITLES', icon: VolumeX, label: 'Mostrar subtítulos', description: 'Agregar texto al video' },
                    { id: 'SKIP', icon: AlertTriangle, label: 'No mostrar', description: 'Saltar el anuncio' },
                    { id: 'VISUAL_ONLY', icon: Monitor, label: 'Solo visual', description: 'Versión sin audio' }
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => updateAudioRules({ mutedAction: action.id as typeof value.audioRules.mutedAction })}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all
                          ${value.audioRules.mutedAction === action.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${
                          value.audioRules.mutedAction === action.id ? 'text-indigo-600' : 'text-slate-500'
                        }`} />
                        <div className={`text-sm font-medium ${
                          value.audioRules.mutedAction === action.id ? 'text-indigo-700' : 'text-slate-700'
                        }`}>
                          {action.label}
                        </div>
                        <div className="text-xs text-slate-500">{action.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Info className="w-4 h-4" />
          <span>
            {[
              value.batteryRules.enabled && 'Batería',
              value.connectionRules.enabled && 'Conexión',
              value.movementRules.enabled && 'Movimiento',
              value.screenRules.enabled && 'Pantalla',
              value.audioRules.enabled && 'Audio'
            ].filter(Boolean).join(', ') || 'Ninguna regla activa'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceIntelligencePanel;
