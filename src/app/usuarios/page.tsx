/**
 * 👥 SILEXAR PULSE - Página de Gestión de Usuarios
 * 
 * @description Centro de administración de usuarios y roles RBAC
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Key,
  Edit,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Search
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Permiso {
  recurso: string;
  acciones: string[];
}

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  rolDescripcion: string;
  tenantId: string;
  activo: boolean;
  permisos: Permiso[];
  modulosAccesibles: string[];
}

interface RolInfo {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Stats {
  total: number;
  activos: number;
  inactivos: number;
  porRol: { rol: string; cantidad: number }[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] ${className}`}>
    {children}
  </div>
);

const RolBadge = ({ rol }: { rol: string }) => {
  const colores: Record<string, string> = {
    super_admin: 'from-red-500 to-red-600',
    admin_tenant: 'from-purple-500 to-purple-600',
    gerente_ventas: 'from-blue-500 to-blue-600',
    ejecutivo_ventas: 'from-cyan-500 to-cyan-600',
    operador_pauta: 'from-emerald-500 to-emerald-600',
    operador_trafico: 'from-teal-500 to-teal-600',
    contador: 'from-amber-500 to-amber-600',
    auditor: 'from-slate-500 to-slate-600',
    cliente_externo: 'from-gray-500 to-gray-600'
  };
  const nombreRol = rol.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${colores[rol] || 'from-slate-400 to-slate-500'}`}>
      {nombreRol}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<RolInfo[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activos: 0, inactivos: 0, porRol: [] });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroRol) params.set('rol', filtroRol);
      if (filtroEstado) params.set('estado', filtroEstado);
      
      const response = await fetch(`/api/usuarios?${params}`);
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
        setRoles(data.roles);
        setStats(data.stats);
      }
    } catch (error) {
      /* console.error('Error:', error) */;
    } finally {
      setLoading(false);
    }
  }, [filtroRol, filtroEstado]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleActivo = async (usuario: Usuario) => {
    try {
      await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuario.id, activo: !usuario.activo })
      });
      fetchData();
    } catch (error) {
      /* console.error('Error:', error) */;
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Users className="w-10 h-10 text-blue-500" />
              Gestión de Usuarios
            </h1>
            <p className="text-slate-500 mt-2">Administración de usuarios y permisos RBAC</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-3 bg-white rounded-xl shadow-md hover:bg-blue-50 text-blue-500">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
            >
              <UserPlus className="w-4 h-4" /> Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Usuarios', value: stats.total, icon: Users, color: 'from-slate-400 to-slate-500' },
            { label: 'Activos', value: stats.activos, icon: CheckCircle, color: 'from-emerald-400 to-emerald-500' },
            { label: 'Inactivos', value: stats.inactivos, icon: XCircle, color: 'from-red-400 to-red-500' },
            { label: 'Roles', value: roles.length, icon: Shield, color: 'from-blue-400 to-blue-500' }
          ].map((stat, i) => (
            <NeuromorphicCard key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </NeuromorphicCard>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              aria-label="Buscar usuarios"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          
          <div className="relative">
            <select 
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="appearance-none bg-white rounded-xl px-4 py-2 pr-10 shadow-md font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Todos los roles</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="appearance-none bg-white rounded-xl px-4 py-2 pr-10 shadow-md font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Lista de usuarios */}
        <NeuromorphicCard>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Usuarios del Sistema
          </h2>
          
          {loading ? (
            <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-12"><Users className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-600">Sin usuarios</p></div>
          ) : (
            <div className="space-y-3">
              {usuariosFiltrados.map((usuario) => (
                <div 
                  key={usuario.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    usuario.activo ? 'border-slate-100 bg-white' : 'border-red-100 bg-red-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        usuario.activo ? 'bg-gradient-to-br from-blue-400 to-blue-500' : 'bg-slate-400'
                      }`}>
                        {usuario.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{usuario.nombre}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="w-3 h-3" />
                          {usuario.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <RolBadge rol={usuario.rol} />
                      
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Key className="w-3 h-3" />
                        {usuario.modulosAccesibles.length} módulos
                      </div>
                      
                      <button
                        onClick={() => toggleActivo(usuario)}
                        className={`p-2 rounded-lg transition-colors ${
                          usuario.activo ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {usuario.activo ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      
                      <button
                        onClick={() => setSelectedUser(usuario)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Descripción del rol */}
                  <p className="mt-2 text-xs text-slate-400 pl-16">{usuario.rolDescripcion}</p>
                </div>
              ))}
            </div>
          )}
        </NeuromorphicCard>

        {/* Matriz de roles */}
        <NeuromorphicCard>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Roles Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(rol => {
              const cantidad = stats.porRol.find(r => r.rol === rol.nombre)?.cantidad || 0;
              return (
                <div key={rol.id} className="p-4 bg-white rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <RolBadge rol={rol.id} />
                    <span className="text-sm font-bold text-slate-700">{cantidad} usuarios</span>
                  </div>
                  <p className="text-xs text-slate-500">{rol.descripcion}</p>
                </div>
              );
            })}
          </div>
        </NeuromorphicCard>

        <div className="text-center text-slate-400 text-sm">
          <p>👥 Gestión de Usuarios RBAC - SILEXAR PULSE TIER 0</p>
        </div>
      </div>
    </div>
  );
}
