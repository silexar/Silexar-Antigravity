'use client';

import { useState } from 'react';
import {
  Users, Search, Plus, Shield, CheckCircle2, XCircle,
  Mail, Phone, Building2, Star, ArrowRight,
} from 'lucide-react';

const N = {
  base: '#dfeaff', dark: '#bec8de', light: '#ffffff',
  accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8',
};

const MOCK_USERS = [
  { id: '1', nombre: 'Jhonson Soto', email: 'jhonson.soto@rdfmedia.cl', rol: 'Admin', estado: 'activo', ultimoAcceso: 'Hoy, 09:30', dosFA: true },
  { id: '2', nombre: 'María González', email: 'maria.g@empresa.cl', rol: 'Ejecutivo Ventas', estado: 'activo', ultimoAcceso: 'Hoy, 08:15', dosFA: true },
  { id: '3', nombre: 'Carlos Díaz', email: 'carlos.d@empresa.cl', rol: 'Programador', estado: 'activo', ultimoAcceso: 'Ayer, 18:45', dosFA: false },
  { id: '4', nombre: 'Ana Martínez', email: 'ana.m@empresa.cl', rol: 'Solo Lectura', estado: 'inactivo', ultimoAcceso: 'Hace 5 días', dosFA: false },
  { id: '5', nombre: 'Pedro Rojas', email: 'pedro.r@empresa.cl', rol: 'Ejecutivo Ventas', estado: 'activo', ultimoAcceso: 'Hoy, 10:00', dosFA: true },
];

export function UsuariosPanel() {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = MOCK_USERS.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Usuarios', value: MOCK_USERS.length, icon: Users },
          { label: 'Activos', value: MOCK_USERS.filter(u => u.estado === 'activo').length, icon: CheckCircle2 },
          { label: 'Con 2FA', value: MOCK_USERS.filter(u => u.dosFA).length, icon: Shield },
          { label: 'Inactivos', value: MOCK_USERS.filter(u => u.estado === 'inactivo').length, icon: XCircle },
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
            type="text" placeholder="Buscar usuario..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full py-2.5 pl-9 pr-4 rounded-xl text-sm focus:outline-none"
            style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }}>
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtrados.map(u => (
          <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: N.accent, color: '#fff' }}>
              {u.nombre.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold truncate" style={{ color: N.text }}>{u.nombre}</span>
                {u.dosFA && <Shield className="w-3 h-3" style={{ color: N.accent }} />}
              </div>
              <div className="flex items-center gap-3 text-[10px]" style={{ color: N.textSub }}>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{u.rol}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.estado === 'activo' ? '' : ''}`} style={{ background: u.estado === 'activo' ? `${N.accent}15` : `${N.textSub}15`, color: u.estado === 'activo' ? N.accent : N.textSub }}>
              {u.estado}
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
