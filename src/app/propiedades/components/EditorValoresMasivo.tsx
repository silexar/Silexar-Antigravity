import React, { useState } from 'react';
import { 
  Plus, Copy, Download, Upload, Save, RefreshCw, Settings, 
  Check, X, Edit2, Sparkles
} from 'lucide-react';
import { ConfiguracionAvanzadaValorModal } from './ConfiguracionAvanzadaValorModal';

export function EditorValoresMasivo({ tipoName = "TIPO CREATIVIDAD" }) {
  const [editingValor, setEditingValor] = useState<string | null>(null);

  const valores = [
    { id: '01', desc: 'SPOT RADIO', obl: true, cta: '4110001', st: 'active' },
    { id: '02', desc: 'JINGLE CORPORATIVO', obl: false, cta: '4110002', st: 'active' },
    { id: '03', desc: 'MENCION EN VIVO', obl: true, cta: '4110003', st: 'active' },
    { id: '04', desc: 'CUÑA PROMOCIONAL', obl: false, cta: '4110004', st: 'active' },
    { id: '05', desc: 'IDENTIFICACION PROGRAMA', obl: false, cta: '4110005', st: 'active' },
    { id: '06', desc: 'PODCAST BRANDED', obl: false, cta: '4110006', st: 'testing' },
    { id: '07', desc: 'AUDIO STREAMING', obl: false, cta: '4110007', st: 'testing' },
    { id: '08', desc: 'MICROESPACIO TEMPORAL', obl: false, cta: '4110008', st: 'inactive' },
  ];

  const renderStatus = (st: string) => {
    switch (st) {
      case 'active': return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>;
      case 'testing': return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>;
      case 'inactive': return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col w-full h-full max-h-full">
      {/* Header Herramientas */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Edit2 className="w-4 h-4 text-indigo-500" />
          Editor Masivo de Valores - {tipoName}
        </h3>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-sm"><Plus className="w-3.5 h-3.5"/> Agregar</button>
           <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-sm"><Copy className="w-3.5 h-3.5"/> Duplicar</button>
           <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-sm"><Download className="w-3.5 h-3.5"/> Export Config</button>
           <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 shadow-sm"><Upload className="w-3.5 h-3.5"/> Import Config</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-bold w-16 text-center">ID</th>
              <th className="px-4 py-3 font-bold min-w-[200px]">Descripción</th>
              <th className="px-4 py-3 font-bold text-center">Obligat.</th>
              <th className="px-4 py-3 font-bold">Cta Ingresos</th>
              <th className="px-4 py-3 font-bold text-center">Active</th>
              <th className="px-4 py-3 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {valores.map((item) => (
              <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-4 py-2 font-mono text-xs text-slate-400 text-center">{item.id}</td>
                <td className="px-4 py-2">
                  <div className="w-full max-w-[250px] bg-slate-50 border border-transparent group-hover:bg-white group-hover:border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-md text-sm transition-all truncate">
                    {item.desc}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">
                  <div className={`mx-auto w-6 h-6 rounded flex items-center justify-center cursor-pointer ${item.obl ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                    {item.obl ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <select className="bg-transparent border border-transparent group-hover:bg-white group-hover:border-slate-200 rounded-md px-2 py-1 text-sm font-mono text-slate-600 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer">
                    <option>{item.cta}</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center">
                    {renderStatus(item.st)}
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingValor(item.desc)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Configuración Avanzada">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button aria-label="Eliminar" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Nueva Entrada Auto */}
            <tr className="bg-slate-50/50 border-t-2 border-slate-100">
              <td className="px-4 py-3 font-mono text-xs text-indigo-400 text-center font-bold">++</td>
              <td className="px-4 py-3">
                <input type="text" placeholder="Nueva entrada..." aria-label="Nueva entrada" className="w-full max-w-[250px] bg-white border border-indigo-200 text-slate-700 px-2.5 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none placeholder:text-slate-400 shadow-sm" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="mx-auto w-6 h-6 rounded flex items-center justify-center cursor-pointer bg-slate-100 text-slate-300 hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </div>
              </td>
              <td className="px-4 py-3">
                 <select className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-sm font-mono text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm w-full max-w-[120px]">
                    <option>Auto (ID)</option>
                  </select>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button aria-label="Confirmar" className="p-1.5 text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50 border border-emerald-100 rounded-md transition-colors shadow-sm">
                    <Check className="w-4 h-4" />
                  </button>
                  <button aria-label="Eliminar" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer IA y Stats */}
      <div className="bg-slate-800 px-5 py-3 border-t border-slate-700 flex flex-col gap-3">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>Estadísticas:</span>
            <span className="text-white font-bold ml-1">8</span> valores • 
            <span className="text-emerald-400 font-bold ml-1">6</span> activos • 
            <span className="text-amber-400 font-bold ml-1">2</span> en prueba • 
            <span className="text-rose-400 font-bold ml-1">0</span> inactivos
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Save className="w-3.5 h-3.5"/> Guardar Cambios
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg flex items-center gap-1 transition-colors">
              <RefreshCw className="w-3.5 h-3.5"/> Recargar
            </button>
            <button aria-label="Configuración" className="p-1.5 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg flex items-center justify-center transition-colors px-3">
              <Settings className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>

        <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-lg p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold">IA Sugiere:</span>
            <span>"AUDIO INTERACTIVO" <span className="opacity-70">basado en tendencias del Q3.</span></span>
          </div>
          <button className="text-[10px] font-bold bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-md transition-colors">
            Agregar Valor
          </button>
        </div>

      </div>

      {/* MODAL AVANZADO */}
      {editingValor && (
        <ConfiguracionAvanzadaValorModal 
          valorDesc={editingValor} 
          onClose={() => setEditingValor(null)} 
        />
      )}
    </div>
  );
}
