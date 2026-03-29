/**
 * ⚙️ SILEXAR PULSE - Página de Configuración
 * 
 * @description Centro de configuración del sistema incluyendo i18n y preferencias
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState } from 'react';
import { 
  Settings, 
  Globe,
  Palette,
  Bell,
  Shield,
  Save,
  CheckCircle,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════════════════

const IDIOMAS = [
  { codigo: 'es-CL', nombre: 'Español (Chile)', bandera: '🇨🇱' },
  { codigo: 'en-US', nombre: 'English (US)', bandera: '🇺🇸' },
  { codigo: 'pt-BR', nombre: 'Português (Brasil)', bandera: '🇧🇷' }
];

const TEMAS = [
  { id: 'light', nombre: 'Claro', icon: Sun },
  { id: 'dark', nombre: 'Oscuro', icon: Moon },
  { id: 'system', nombre: 'Sistema', icon: Monitor }
];

const ZONAS_HORARIAS = [
  { id: 'America/Santiago', nombre: 'Chile (Santiago)' },
  { id: 'America/New_York', nombre: 'Estados Unidos (Nueva York)' },
  { id: 'America/Sao_Paulo', nombre: 'Brasil (São Paulo)' },
  { id: 'Europe/Madrid', nombre: 'España (Madrid)' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) => (
  <button
    onClick={onChange}
    aria-label={label}
    aria-pressed={checked}
    className={`w-12 h-6 rounded-full transition-colors border border-slate-200 shadow-inner ${checked ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-6 shadow-emerald-200' : 'translate-x-0.5 shadow-slate-300'}`} />
  </button>
);

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ConfiguracionPage() {
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  
  // Configuración
  const [config, setConfig] = useState({
    idioma: 'es-CL',
    tema: 'light',
    zonaHoraria: 'America/Santiago',
    notificacionesEmail: true,
    notificacionesPush: true,
    notificacionesEmision: true,
    notificacionesFacturacion: true,
    autoLogout: 30,
    formatoFecha: 'DD/MM/YYYY',
    monedaDefault: 'CLP'
  });

  const handleChange = (campo: string, valor: string | boolean | number) => {
    setConfig(prev => ({ ...prev, [campo]: valor }));
  };

  const guardar = async () => {
    setGuardando(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 p-6 lg:p-8 relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
          <div>
            <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-slate-200/50 backdrop-blur-md">
                 <Settings className="w-8 h-8 text-indigo-600" />
              </div>
              Configuración Sistema
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Preferencias, automatización y personalización de Silexar Pulse</p>
          </div>
          
          <button
            onClick={guardar}
            disabled={guardando}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm focus:ring-4 focus:ring-emerald-500/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {guardado ? <CheckCircle className="w-5 h-5" /> : guardando ? <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {guardado ? 'CONFIGURACIÓN APLICADA' : 'GUARDAR CAMBIOS'}
          </button>
        </div>

        {/* Idioma y Regional */}
        <NeuromorphicCard>
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-slate-200 pb-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Idioma y Regional
          </h2>
          
          <div className="space-y-6">
            {/* Selector de idioma */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Idioma del sistema</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {IDIOMAS.map(idioma => (
                  <button
                    key={idioma.codigo}
                    onClick={() => handleChange('idioma', idioma.codigo)}
                    className={`p-4 rounded-xl text-center transition-all shadow-sm ${
                      config.idioma === idioma.codigo 
                        ? 'bg-indigo-50 border border-indigo-200 ring-2 ring-indigo-500/20 scale-[1.02]' 
                        : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl mb-2 block drop-shadow-sm">{idioma.bandera}</span>
                    <span className="text-sm font-bold text-slate-700">{idioma.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zona horaria */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Zona horaria</label>
              <select
                value={config.zonaHoraria}
                onChange={(e) => handleChange('zonaHoraria', e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 font-medium text-slate-700 shadow-sm transition-all"
              >
                {ZONAS_HORARIAS.map(z => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Formato de fecha</label>
                <select
                  value={config.formatoFecha}
                  onChange={(e) => handleChange('formatoFecha', e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 font-mono text-slate-700 font-medium shadow-sm transition-all"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Moneda predeterminada</label>
                <select
                  value={config.monedaDefault}
                  onChange={(e) => handleChange('monedaDefault', e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 font-medium text-slate-700 shadow-sm transition-all"
                >
                  <option value="CLP">CLP - Peso Chileno</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>
        </NeuromorphicCard>

        {/* Apariencia */}
        <NeuromorphicCard>
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-slate-200 pb-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Apariencia Visual
          </h2>
          
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Tema de la interfaz SILEXAR PULSE</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEMAS.map(tema => (
                <button
                  key={tema.id}
                  onClick={() => handleChange('tema', tema.id)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-3 transition-all shadow-sm ${
                    config.tema === tema.id 
                      ? 'bg-indigo-50 border border-indigo-200 ring-2 ring-indigo-500/20 scale-[1.02]' 
                      : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-3 rounded-full ${config.tema === tema.id ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                     <tema.icon className={`w-6 h-6 ${config.tema === tema.id ? 'text-indigo-600' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-sm font-bold ${config.tema === tema.id ? 'text-indigo-800' : 'text-slate-700'}`}>{tema.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </NeuromorphicCard>

        {/* Notificaciones */}
        <NeuromorphicCard>
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-slate-200 pb-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Preferencias de Notificación
          </h2>
          
          <div className="space-y-3">
            {[
              { id: 'notificacionesEmail', label: 'Notificaciones por email', desc: 'Recibir alertas importantes e informes TIER 0 por correo electrónico' },
              { id: 'notificacionesPush', label: 'Notificaciones push', desc: 'Alertas en tiempo real en la central de notificaciones del navegador' },
              { id: 'notificacionesEmision', label: 'Alertas de emisión (Module Conciliación)', desc: 'Avisos inmediatos sobre spots no emitidos, huecos o discrepancias críticas' },
              { id: 'notificacionesFacturacion', label: 'Alertas de facturación (Module Vencimientos)', desc: 'Recordatorios de cuotas próximas a vencer y cambios de estatus contractual' }
            ].map(item => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{item.desc}</p>
                </div>
                <div className="shrink-0 flex items-center">
                  <Toggle
                    checked={config[item.id as keyof typeof config] as boolean}
                    onChange={() => handleChange(item.id, !config[item.id as keyof typeof config])}
                    label={item.label}
                  />
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Seguridad */}
        <NeuromorphicCard>
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest border-b border-slate-200 pb-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Seguridad & Autenticación
          </h2>
          
          <div className="bg-white/80 p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-800 mb-1">Cierre Automático de Sesión</label>
                   <p className="text-xs font-medium text-slate-500">Tiempo de inactividad antes de requerir re-autenticación (MIN: 5, MAX: 120).</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.autoLogout}
                    onChange={(e) => handleChange('autoLogout', parseInt(e.target.value))}
                    min={5}
                    max={120}
                    aria-label="Minutos de inactividad para cierre automático de sesión"
                    className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 font-mono font-bold text-slate-800 text-center shadow-inner transition-all"
                  />
                  <span className="text-xs font-black text-slate-400">MINUTOS</span>
                </div>
            </div>
          </div>
        </NeuromorphicCard>

        <div className="text-center pb-8 opacity-60">
           <div className="inline-block px-4 py-2 bg-white/50 border border-slate-200/50 rounded-full font-mono text-[10px] font-black text-slate-500 uppercase tracking-widest">
                ⚙️ Cortex Config System • Silexar Pulse TIER 0
           </div>
        </div>
      </div>
    </div>
  );
}
