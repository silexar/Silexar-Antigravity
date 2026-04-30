'use client';

import { useState } from 'react';
import {
  Radio, Search, Plus, Monitor, MapPin, Phone,
  Clock, CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react';

const N = {
  base: '#dfeaff', dark: '#bec8de', light: '#ffffff',
  accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8',
};

const MOCK_EMISORAS = [
  { id: '1', nombre: 'Radio Corazón FM', ciudad: 'Santiago', frecuencia: '88.5 FM', estado: 'activa', senal: '100%', tipo: 'FM' },
  { id: '2', nombre: 'FM Dos', ciudad: 'Valparaíso', frecuencia: '91.3 FM', estado: 'activa', senal: '98%', tipo: 'FM' },
  { id: '3', nombre: 'Digital Radio', ciudad: 'Concepción', frecuencia: 'Web', estado: 'mantenimiento', senal: '0%', tipo: 'Digital' },
];

export function EmisorasPanel() {
  const [busqueda, setBusqueda] = useState('');

  const filtradas = MOCK_EMISORAS.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.ciudad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Emisoras', value: MOCK_EMISORAS.length, icon: Radio },
          { label: 'Activas', value: MOCK_EMISORAS.filter(e => e.estado === 'activa').length, icon: CheckCircle2 },
          { label: 'FM', value: MOCK_EMISORAS.filter(e => e.tipo === 'FM').length, icon: Monitor },
          { label: 'En Mantenimiento', value: MOCK_EMISORAS.filter(e => e.estado === 'mantenimiento').length, icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: N.textSub }}>{s.label}</span>
              <s.icon className="w-4 h-4" style={{ color: N.accent }} />
            </div>
            <p className="text-xl font-black mt-1" style={{ color: N.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
          <input
            type="text" placeholder="Buscar emisora..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 rounded-xl text-sm focus:outline-none"
            style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }}>
          <Plus className="w-4 h-4" /> Nueva
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtradas.map(e => (
          <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
            <div className="p-2 rounded-lg shrink-0" style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}>
              <Radio className="w-5 h-5" style={{ color: e.estado === 'activa' ? N.accent : N.textSub }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold truncate block" style={{ color: N.text }}>{e.nombre}</span>
              <div className="flex items-center gap-3 text-[10px]" style={{ color: N.textSub }}>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.ciudad}</span>
                <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{e.frecuencia}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.senal}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: e.estado === 'activa' ? `${N.accent}15` : `${N.textSub}15`, color: e.estado === 'activa' ? N.accent : N.textSub }}>
              {e.estado}
            </span>
            <button className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ background: N.base, boxShadow: `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`, color: N.textSub }}>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
