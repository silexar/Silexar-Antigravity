'use client';

import React, { useState } from 'react';
import { ShieldAlert, Clock, CheckCircle2, Ban } from 'lucide-react';
import { AlertaOperativa } from '../../_lib/types';

export const MobileAlertasPanel: React.FC = () => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  
  // Fake data for the mobile view matching exact types
  const [alertas, setAlertas] = useState<AlertaOperativa[]>([
    {
      id: "a1",
      tipo: "validacion",
      prioridad: "critica",
      mensaje: "Fallo de validación de audio en Dalet-A.",
      cunaCodigo: "SPX-099",
      accion: "Revisar",
    },
    {
      id: "a2",
      tipo: "distribucion",
      prioridad: "alta",
      mensaje: "Contenido pendiente de revisión normativa.",
      cunaCodigo: "SPX-102",
      accion: "Renovar",
    },
    {
      id: "a3",
      tipo: "vencimientos",
      prioridad: "media",
      mensaje: "Derechos musicales expiran en 48 hrs.",
      cunaCodigo: "SPX-045",
      accion: "Avisar"
    }
  ]);

  const handleResolve = (id: string) => {
    setResolvingId(id);
    setTimeout(() => {
      setAlertas(alertas.filter(a => a.id !== id));
      setResolvingId(null);
    }, 800);
  };

  const getAlertStyle = (prioridad: string, tipo: string) => {
    if (prioridad === 'critica' || tipo === 'validacion') 
      return { bg: 'bg-rose-50 border-rose-100', icon: ShieldAlert, iconColor: 'text-rose-500', iconBg: 'bg-rose-100' };
    if (prioridad === 'alta' || tipo === 'distribucion') 
      return { bg: 'bg-amber-50 border-amber-100', icon: Ban, iconColor: 'text-amber-600', iconBg: 'bg-amber-200' };
    return { bg: 'bg-blue-50 border-blue-100', icon: Clock, iconColor: 'text-blue-500', iconBg: 'bg-blue-100' };
  };

  if (alertas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Todo en Orden</h3>
        <p className="text-gray-500 mt-2 text-sm text-center px-8">No hay alertas operativas activas en este momento en la grilla Dalet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-500 px-1 pt-2">
      <div className="mb-6 px-1">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Centro de Alertas</h2>
        <p className="text-gray-500 text-sm font-medium">Revisión operativa de Cuñas en tiempo real.</p>
      </div>

      <div className="space-y-3">
        {alertas.map(alerta => {
          const style = getAlertStyle(alerta.prioridad, alerta.tipo);
          const IconComponent = style.icon;
          const isResolving = resolvingId === alerta.id;

          return (
            <div 
              key={alerta.id}
              className={`p-4 rounded-3xl border transition-all ${style.bg} ${isResolving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
                  <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      {alerta.tipo.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">Hace instantes</span>
                  </div>
                  
                  <p className="font-bold text-gray-800 text-sm leading-snug mb-1">{alerta.mensaje}</p>
                  <p className="text-xs font-semibold text-indigo-600 truncate">{alerta.cunaCodigo || "N/A"}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-black/5 flex justify-end">
                <button 
                  onClick={() => handleResolve(alerta.id)}
                  disabled={isResolving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  {isResolving ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Marcar Resuelta</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
