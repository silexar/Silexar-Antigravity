/**
 * ⚙️ MOBILE: Configuración View
 * 
 * Configuración del módulo contratos.
 * Paridad con desktop: contratos/configuracion/page.tsx
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  Settings, Bell, Shield, Users, Mail, Webhook,
  Clock, Eye, ChevronRight, CheckCircle2, ToggleLeft, ToggleRight
} from 'lucide-react';

interface ConfigOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  tipo: 'toggle' | 'link';
  valor?: boolean;
}

export function MobileConfigView() {
  const [configs, setConfigs] = useState<ConfigOption[]>([
    { id: 'notif-vencimiento', label: 'Alertas de vencimiento', desc: 'Notificar 7 días antes del vencimiento', icon: <Bell className="w-5 h-5" />, color: 'bg-red-100 text-red-600', tipo: 'toggle', valor: true },
    { id: 'notif-aprobacion', label: 'Alertas de aprobación', desc: 'Notificar cuando un contrato sea aprobado', icon: <CheckCircle2 className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', tipo: 'toggle', valor: true },
    { id: 'notif-firma', label: 'Alertas de firma digital', desc: 'Notificar cuando se firme un contrato', icon: <Shield className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', tipo: 'toggle', valor: false },
    { id: 'auto-renovacion', label: 'Auto-renovación', desc: 'Generar borrador de renovación automático', icon: <Clock className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', tipo: 'toggle', valor: true },
    { id: 'visibilidad', label: 'Visibilidad contratos', desc: 'Solo mis contratos vs todos del equipo', icon: <Eye className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600', tipo: 'toggle', valor: false },
  ]);

  const links: { label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { label: 'Permisos y roles', desc: 'Administrar acceso del equipo', icon: <Users className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Plantillas de email', desc: 'Configurar emails automáticos', icon: <Mail className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600' },
    { label: 'Webhooks', desc: 'Integraciones externas', icon: <Webhook className="w-5 h-5" />, color: 'bg-slate-100 text-slate-600' },
  ];

  const toggleConfig = (id: string) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, valor: !c.valor } : c));
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-300" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Configuración</p>
        </div>
        <p className="text-sm text-slate-400 mt-2">Personaliza el comportamiento del módulo de contratos.</p>
      </div>

      {/* TOGGLES */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Notificaciones y Automatración</p>
        <div className="space-y-2">
          {configs.map(config => (
            <div key={config.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{config.label}</p>
                <p className="text-[10px] text-slate-400">{config.desc}</p>
              </div>
              <button onClick={() => toggleConfig(config.id)} className="shrink-0">
                {config.valor ? (
                  <ToggleRight className="w-8 h-8 text-indigo-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LINKS */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Administración</p>
        <div className="space-y-2">
          {links.map(link => (
            <button key={link.label} className="w-full bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 active:scale-[0.98]">
              <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center`}>{link.icon}</div>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-800 text-sm">{link.label}</p>
                <p className="text-[10px] text-slate-400">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
