'use client';

/**
 * 🎯 SILEXAR PULSE - TARGETING MATRIX PANEL
 * 
 * Panel futurista de segmentación "Quantum Context" que permite
 * configurar targeting por Mood, Dispositivo, Geo y Demographics.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState } from 'react';
import { 
  Target, Smartphone, Monitor, Tv, Watch, Car, Speaker,
  MapPin, Cloud, Sun, CloudRain, Snowflake, Wind,
  Zap, Coffee, Music, Moon, Heart, Brain, Dumbbell,
  Users, Clock, Sliders, ChevronDown, ChevronUp,
  Check, X, Plus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface TargetingConfig {
  // Demographics
  edadMinima: number;
  edadMaxima: number;
  generos: ('M' | 'F' | 'X')[];
  
  // Devices
  dispositivos: string[];
  sistemasOperativos: string[];
  
  // Mood
  estadosAnimo: string[];
  
  // Tiempo
  horasActivas: { inicio: string; fin: string }[];
  diasSemana: number[];
  
  // Geo
  geoFences: Array<{
    id: string;
    nombre: string;
    lat: number;
    lng: number;
    radioKm: number;
    tipo: 'INCLUDE' | 'EXCLUDE';
  }>;
  
  // Weather
  condicionesClima: string[];
  temperaturaMinima?: number;
  temperaturaMaxima?: number;
}

interface TargetingMatrixPanelProps {
  value: TargetingConfig;
  onChange: (config: TargetingConfig) => void;
}

// ═══════════════════════════════════════════════════════════════
// DATOS DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const DEVICES = [
  { id: 'MOBILE_IOS', icon: Smartphone, label: 'iPhone', color: 'text-slate-700' },
  { id: 'MOBILE_ANDROID', icon: Smartphone, label: 'Android', color: 'text-emerald-600' },
  { id: 'TABLET_IOS', icon: Monitor, label: 'iPad', color: 'text-slate-700' },
  { id: 'TABLET_ANDROID', icon: Monitor, label: 'Tablet Android', color: 'text-emerald-600' },
  { id: 'DESKTOP_WINDOWS', icon: Monitor, label: 'Windows PC', color: 'text-blue-600' },
  { id: 'DESKTOP_MAC', icon: Monitor, label: 'Mac', color: 'text-slate-700' },
  { id: 'SMART_TV', icon: Tv, label: 'Smart TV', color: 'text-violet-600' },
  { id: 'CAR_PLAY', icon: Car, label: 'CarPlay', color: 'text-blue-600' },
  { id: 'ANDROID_AUTO', icon: Car, label: 'Android Auto', color: 'text-emerald-600' },
  { id: 'SMART_SPEAKER', icon: Speaker, label: 'Alexa/Google', color: 'text-amber-600' },
  { id: 'SMART_WATCH', icon: Watch, label: 'Smartwatch', color: 'text-pink-600' }
];

const MOODS = [
  { id: 'HIGH_ENERGY', icon: Zap, label: 'Alta Energía', color: 'bg-orange-500', description: 'Usuarios activos, música intensa' },
  { id: 'FOCUS', icon: Brain, label: 'Concentración', color: 'bg-blue-500', description: 'Trabajo, estudio, productividad' },
  { id: 'PARTY', icon: Music, label: 'Fiesta', color: 'bg-pink-500', description: 'Celebración, social, diversión' },
  { id: 'CHILL', icon: Coffee, label: 'Relax', color: 'bg-teal-500', description: 'Calma, descanso, hogar' },
  { id: 'WORKOUT', icon: Dumbbell, label: 'Ejercicio', color: 'bg-red-500', description: 'Gimnasio, running, deporte' },
  { id: 'ROMANTIC', icon: Heart, label: 'Romántico', color: 'bg-rose-500', description: 'Citas, parejas, intimidad' },
  { id: 'SLEEPING', icon: Moon, label: 'Descanso', color: 'bg-indigo-500', description: 'Noche, tranquilidad, sueño' }
];

const WEATHER_CONDITIONS = [
  { id: 'SUNNY', icon: Sun, label: 'Soleado', color: 'text-amber-500' },
  { id: 'CLOUDY', icon: Cloud, label: 'Nublado', color: 'text-slate-500' },
  { id: 'RAIN', icon: CloudRain, label: 'Lluvia', color: 'text-blue-500' },
  { id: 'SNOW', icon: Snowflake, label: 'Nieve', color: 'text-cyan-500' },
  { id: 'WINDY', icon: Wind, label: 'Viento', color: 'text-teal-500' }
];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const TargetingMatrixPanel: React.FC<TargetingMatrixPanelProps> = ({
  value,
  onChange
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    devices: true,
    mood: true,
    demographics: false,
    time: false,
    weather: false,
    geo: false
  });

  // ─── HANDLERS ─────────────────────────────────────────────────

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleDevice = (deviceId: string) => {
    const current = value.dispositivos;
    const updated = current.includes(deviceId)
      ? current.filter(d => d !== deviceId)
      : [...current, deviceId];
    onChange({ ...value, dispositivos: updated });
  };

  const toggleMood = (moodId: string) => {
    const current = value.estadosAnimo;
    const updated = current.includes(moodId)
      ? current.filter(m => m !== moodId)
      : [...current, moodId];
    onChange({ ...value, estadosAnimo: updated });
  };

  const toggleGender = (gender: 'M' | 'F' | 'X') => {
    const current = value.generos;
    const updated = current.includes(gender)
      ? current.filter(g => g !== gender)
      : [...current, gender];
    onChange({ ...value, generos: updated });
  };

  const toggleDay = (day: number) => {
    const current = value.diasSemana;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    onChange({ ...value, diasSemana: updated });
  };

  const toggleWeather = (weatherId: string) => {
    const current = value.condicionesClima;
    const updated = current.includes(weatherId)
      ? current.filter(w => w !== weatherId)
      : [...current, weatherId];
    onChange({ ...value, condicionesClima: updated });
  };

  // ─── SECTION COMPONENT ─────────────────────────────────────────

  const Section: React.FC<{
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    badge?: string;
    children: React.ReactNode;
  }> = ({ id, title, icon, description, badge, children }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
          {expandedSections[id] ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      
      {expandedSections[id] && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );

  // ─── RENDER ─────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-500 to-pink-500 text-white flex items-center justify-center">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Targeting Matrix</h2>
          <p className="text-sm text-slate-500">Configura la segmentación cuántica de tu campaña</p>
        </div>
      </div>

      {/* Devices Section */}
      <Section
        id="devices"
        title="Dispositivos"
        icon={<Smartphone className="w-5 h-5" />}
        description="Selecciona en qué dispositivos aparecerá la cuña"
        badge={`${value.dispositivos.length} seleccionados`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DEVICES.map(device => {
            const isSelected = value.dispositivos.includes(device.id);
            const Icon = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => toggleDevice(device.id)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2
                  ${isSelected 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-violet-600' : device.color}`} />
                <span className={`text-xs font-medium ${isSelected ? 'text-violet-700' : 'text-slate-600'}`}>
                  {device.label}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Mood Section */}
      <Section
        id="mood"
        title="Estado de Ánimo"
        icon={<Brain className="w-5 h-5" />}
        description="Targeting contextual basado en el mood del usuario"
        badge={value.estadosAnimo.length > 0 ? `${value.estadosAnimo.length} moods` : undefined}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOODS.map(mood => {
            const isSelected = value.estadosAnimo.includes(mood.id);
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => toggleMood(mood.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-left
                  ${isSelected 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }
                `}
              >
                <div className={`w-10 h-10 ${mood.color} rounded-xl flex items-center justify-center text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isSelected ? 'text-violet-700' : 'text-slate-700'}`}>
                    {mood.label}
                  </div>
                  <div className="text-xs text-slate-500">{mood.description}</div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-violet-500" />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Demographics Section */}
      <Section
        id="demographics"
        title="Demografía"
        icon={<Users className="w-5 h-5" />}
        description="Edad y género del público objetivo"
      >
        <div className="space-y-6">
          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Rango de Edad: {value.edadMinima} - {value.edadMaxima} años
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="13"
                max="65"
                value={value.edadMinima}
                onChange={(e) => onChange({ ...value, edadMinima: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <span className="text-sm text-slate-500 w-8">{value.edadMinima}</span>
              <span className="text-slate-400">-</span>
              <span className="text-sm text-slate-500 w-8">{value.edadMaxima}</span>
              <input
                type="range"
                min="18"
                max="100"
                value={value.edadMaxima}
                onChange={(e) => onChange({ ...value, edadMaxima: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Género</label>
            <div className="flex gap-3">
              {[
                { id: 'M' as const, label: 'Masculino' },
                { id: 'F' as const, label: 'Femenino' },
                { id: 'X' as const, label: 'No binario' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGender(g.id)}
                  className={`
                    px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                    ${value.generos.includes(g.id)
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }
                  `}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Time Section */}
      <Section
        id="time"
        title="Tiempo"
        icon={<Clock className="w-5 h-5" />}
        description="Días y horarios de activación"
      >
        <div className="space-y-4">
          {/* Days */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Días de la semana</label>
            <div className="flex gap-2">
              {DAYS.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`
                    w-12 h-12 rounded-xl font-medium text-sm transition-all
                    ${value.diasSemana.includes(idx)
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Horarios activos</label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={value.horasActivas[0]?.inicio || '06:00'}
                onChange={(e) => onChange({ 
                  ...value, 
                  horasActivas: [{ ...value.horasActivas[0], inicio: e.target.value }] 
                })}
                className="px-3 py-2 border border-slate-200 rounded-xl"
              />
              <span className="text-slate-500">hasta</span>
              <input
                type="time"
                value={value.horasActivas[0]?.fin || '23:00'}
                onChange={(e) => onChange({ 
                  ...value, 
                  horasActivas: [{ ...value.horasActivas[0], fin: e.target.value }] 
                })}
                className="px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Weather Section */}
      <Section
        id="weather"
        title="Clima"
        icon={<Cloud className="w-5 h-5" />}
        description="Activar según condiciones climáticas"
      >
        <div className="flex flex-wrap gap-3">
          {WEATHER_CONDITIONS.map(weather => {
            const isSelected = value.condicionesClima.includes(weather.id);
            const Icon = weather.icon;
            return (
              <button
                key={weather.id}
                onClick={() => toggleWeather(weather.id)}
                className={`
                  px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2
                  ${isSelected 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${weather.color}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-violet-700' : 'text-slate-600'}`}>
                  {weather.label}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Geo Section */}
      <Section
        id="geo"
        title="Geo-Fencing"
        icon={<MapPin className="w-5 h-5" />}
        description="Ubicaciones geográficas específicas"
      >
        <div className="space-y-4">
          {/* Geo fences list */}
          {value.geoFences.length > 0 ? (
            <div className="space-y-2">
              {value.geoFences.map(fence => (
                <div key={fence.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${fence.tipo === 'INCLUDE' ? 'text-emerald-500' : 'text-red-500'}`} />
                    <div>
                      <div className="font-medium text-slate-700">{fence.nombre}</div>
                      <div className="text-xs text-slate-500">Radio: {fence.radioKm} km</div>
                    </div>
                  </div>
                  <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No hay zonas configuradas</p>
            </div>
          )}
          
          <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-violet-400 hover:text-violet-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar zona geográfica
          </button>
        </div>
      </Section>

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
        <div className="flex items-center gap-2 text-violet-700 font-medium mb-2">
          <Sliders className="w-4 h-4" />
          Resumen de Targeting
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {value.dispositivos.length > 0 && (
            <span className="px-2 py-1 bg-white rounded-full text-slate-600">
              {value.dispositivos.length} dispositivos
            </span>
          )}
          {value.estadosAnimo.length > 0 && (
            <span className="px-2 py-1 bg-white rounded-full text-slate-600">
              {value.estadosAnimo.length} moods
            </span>
          )}
          <span className="px-2 py-1 bg-white rounded-full text-slate-600">
            {value.edadMinima}-{value.edadMaxima} años
          </span>
          {value.diasSemana.length < 7 && (
            <span className="px-2 py-1 bg-white rounded-full text-slate-600">
              {value.diasSemana.length} días
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetingMatrixPanel;
