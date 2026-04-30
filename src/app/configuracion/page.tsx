/**
 * ⚙️ SILEXAR PULSE - Módulo de Configuración
 * Dashboard de gestión de configuraciones del sistema
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @design Neumorphism Design System TIER 0
 */

'use client';

import { useState, useCallback } from 'react';
import {
  Settings,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Shield,
  Eye,
  Edit3,
  Trash2,
  Users,
  Radio,
  LayoutGrid,
  BarChart3,
  History,
} from 'lucide-react';
import {
  NeuromorphicCard,
  NeuromorphicButton,
  NeuromorphicInput,
  NeuromorphicSelect,
  ConfigCard,
  StatsCard,
  CategoryTabs,
  ConfigFormModal,
  type ConfiguracionItem,
} from './_components';
import { NavigationConfigPanel } from './_components/NavigationConfigPanel';
import { NavigationConfigWindow } from './_components/NavigationConfigWindow';
import { UsuariosPanel } from './_components/UsuariosPanel';
import { EmisorasPanel } from './_components/EmisorasPanel';
import { ModuleNavMenu } from '@/components/module-nav-menu';

interface ConfiguracionDashboardProps {
  tenantId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEUMORPHISM DESIGN TOKENS - Silexar Pulse
// ═══════════════════════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIGURACIONES_MOCK: ConfiguracionItem[] = [
  { id: '1', clave: 'NOMBRE_EMPRESA', valor: 'MegaMedia SpA', tipo: 'string', categoria: 'general', descripcion: 'Nombre legal de la empresa', editable: true, visible: true, nivelSeguridad: 'publico', grupo: 'informacion', orden: 1, creadaPor: 'admin', actualizadaPor: 'admin', creadaEn: new Date('2024-01-15'), actualizadaEn: new Date('2024-11-20') },
  { id: '2', clave: 'PAIS_DEFAULT', valor: 'CL', tipo: 'string', categoria: 'general', descripcion: 'Código de país por defecto', editable: true, visible: true, nivelSeguridad: 'publico', grupo: 'regional', orden: 2, creadaPor: 'admin', creadaEn: new Date('2024-01-15') },
  { id: '3', clave: 'MONEDA_PRINCIPAL', valor: 'CLP', tipo: 'string', categoria: 'facturacion', descripcion: 'Moneda principal para transacciones', editable: true, visible: true, nivelSeguridad: 'interno', grupo: 'regional', orden: 1, creadaPor: 'admin', actualizadaPor: 'admin', creadaEn: new Date('2024-01-15'), actualizadaEn: new Date('2024-10-05') },
  { id: '4', clave: 'HABILITAR_CORTEX_VOICE', valor: true, tipo: 'boolean', categoria: 'ai', descripcion: 'Habilitar asistente de voz Cortex', editable: true, visible: true, nivelSeguridad: 'confidencial', orden: 1, creadaPor: 'admin', actualizadaPor: 'ceo', creadaEn: new Date('2024-03-10'), actualizadaEn: new Date('2024-11-01') },
  { id: '5', clave: 'API_KEY_OPENAI', valor: 'sk-••••••••••••••••', tipo: 'password', categoria: 'ai', descripcion: 'Clave de API para OpenAI', editable: true, visible: true, nivelSeguridad: 'confidencial', orden: 2, creadaPor: 'admin', actualizadaPor: 'admin', creadaEn: new Date('2024-06-01'), actualizadaEn: new Date('2024-10-20') },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function ConfiguracionDashboard({ tenantId }: ConfiguracionDashboardProps) {
  // Estados
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionItem[]>(CONFIGURACIONES_MOCK);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [configEditando, setConfigEditando] = useState<ConfiguracionItem | undefined>();
  const [mostrarAuditoria, setMostrarAuditoria] = useState<string | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<'dashboard' | 'usuarios' | 'emisoras' | 'configuraciones' | 'navegacion'>('dashboard');
  const [navWindowOpen, setNavWindowOpen] = useState(false);

  // Estadísticas
  const estadisticas = {
    total: configuraciones.length,
    porCategoria: configuraciones.reduce((acc, c) => {
      acc[c.categoria] = (acc[c.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    editables: configuraciones.filter(c => c.editable).length,
    visibles: configuraciones.filter(c => c.visible).length,
  };

  // Categorías únicas
  const categorias = Object.entries(estadisticas.porCategoria).map(([nombre, cantidad]) => ({
    nombre,
    cantidad,
    color: N.accent,
  }));

  // Filtrar configuraciones
  const configuracionesFiltradas = configuraciones.filter(config => {
    const matchBusqueda = !busqueda ||
      config.clave.toLowerCase().includes(busqueda.toLowerCase()) ||
      config.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    const matchCategoria = categoriaActiva === 'todas' || config.categoria === categoriaActiva;

    const matchTipo = tipoSeleccionado === 'todos' || config.tipo === tipoSeleccionado;

    return matchBusqueda && matchCategoria && matchTipo;
  });

  // Mostrar notificación
  const mostrarNotificacion = useCallback((tipo: 'success' | 'error', mensaje: string) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => setNotificacion(null), 3000);
  }, []);

  // Handlers
  const handleCrear = () => {
    setConfigEditando(undefined);
    setModalOpen(true);
  };

  const handleEditar = (config: ConfiguracionItem) => {
    setConfigEditando(config);
    setModalOpen(true);
  };

  const handleEliminar = async (ids: string[]) => {
    if (!confirm(`¿Eliminar ${ids.length} configuración(es)?`)) return;

    setConfiguraciones(prev => prev.filter(c => !ids.includes(c.id)));
    setSeleccionadas([]);
    mostrarNotificacion('success', `${ids.length} configuración(es) eliminada(s)`);
  };

  const handleSubmit = async (data: Partial<ConfiguracionItem>) => {
    if (configEditando) {
      setConfiguraciones(prev => prev.map(c =>
        c.id === configEditando.id
          ? { ...c, ...data, actualizadaEn: new Date(), actualizadaPor: 'currentUser' }
          : c
      ));
      mostrarNotificacion('success', 'Configuración actualizada correctamente');
    } else {
      const nueva: ConfiguracionItem = {
        id: crypto.randomUUID(),
        clave: data.clave || '',
        valor: data.valor || '',
        tipo: data.tipo || 'string',
        categoria: data.categoria || 'general',
        descripcion: data.descripcion,
        editable: data.editable ?? true,
        visible: data.visible ?? true,
        nivelSeguridad: data.nivelSeguridad || 'publico',
        grupo: data.grupo,
        orden: configuraciones.length + 1,
        creadaPor: 'currentUser',
        creadaEn: new Date(),
      };
      setConfiguraciones(prev => [...prev, nueva]);
      mostrarNotificacion('success', 'Configuración creada correctamente');
    }
    setModalOpen(false);
  };

  const handleToggleVisibilidad = (id: string) => {
    setConfiguraciones(prev => prev.map(c =>
      c.id === id ? { ...c, visible: !c.visible } : c
    ));
  };

  const handleExportar = () => {
    const data = JSON.stringify(configuracionesFiltradas, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `configuraciones_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    mostrarNotificacion('success', 'Configuraciones exportadas correctamente');
  };

  const handleImportar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setConfiguraciones(prev => [...prev, ...data]);
          mostrarNotificacion('success', `${data.length} configuración(es) importada(s)`);
        }
      } catch {
        mostrarNotificacion('error', 'Archivo JSON inválido');
      }
    };
    input.click();
  };

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    mostrarNotificacion('success', 'Configuraciones actualizadas');
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const seleccionarTodas = () => {
    if (seleccionadas.length === configuracionesFiltradas.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(configuracionesFiltradas.map(c => c.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#dfeaff] text-[#69738c] p-6 lg:p-8">
      {/* Notificación Toast */}
      {notificacion && (
        <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] flex items-center gap-3 animate-[slideIn_0.3s_ease-out] bg-[#6888ff] text-white">
          {notificacion.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {notificacion.mensaje}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          <div className="flex items-center gap-3">
            <ModuleNavMenu />
            <div>
              <h1 className="text-4xl font-black text-[#69738c] flex items-center gap-4 tracking-tight">
                <div className="p-3 bg-[#dfeaff] rounded-2xl shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff] border border-white/40">
                  <Settings className="w-8 h-8 text-[#6888ff]" />
                </div>
                Centro de Configuración
              </h1>
              <p className="text-[#9aa3b8] mt-2 font-medium">
                Gestiona todas las configuraciones del sistema Silexar Pulse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <NeuromorphicButton variant="secondary" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" onClick={handleImportar}>
              <Upload className="w-4 h-4" />
              Importar
            </NeuromorphicButton>
            <NeuromorphicButton variant="secondary" onClick={handleExportar}>
              <Download className="w-4 h-4" />
              Exportar
            </NeuromorphicButton>
            <NeuromorphicButton variant="primary" onClick={handleCrear}>
              <Plus className="w-4 h-4" />
              Nueva Configuración
            </NeuromorphicButton>
          </div>
        </div>

        {/* Tabs Principales */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'usuarios', label: 'Usuarios', icon: Users },
            { id: 'emisoras', label: 'Emisoras', icon: Radio },
            { id: 'configuraciones', label: 'Configuraciones', icon: Settings },
            { id: 'navegacion', label: 'Navegación', icon: LayoutGrid },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSeccionActiva(tab.id as typeof seccionActiva)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={seccionActiva === tab.id
                ? { background: N.accent, color: '#fff', boxShadow: `4px 4px 8px ${N.dark},-2px -2px 6px ${N.light}` }
                : { background: N.base, color: N.text, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }
              }
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {seccionActiva === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Usuarios Activos', value: '47', sub: 'de 50 licencias', icon: Users },
                { label: 'Emisoras', value: '3', sub: 'FM configuradas', icon: Radio },
                { label: 'Módulos Activos', value: '30', sub: 'de 30 disponibles', icon: LayoutGrid },
                { label: '2FA Habilitado', value: '60%', sub: 'de los usuarios', icon: Shield },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5" style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`, border: '1px solid rgba(255,255,255,0.4)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: N.textSub }}>{s.label}</p>
                      <p className="text-3xl font-black" style={{ color: N.text }}>{s.value}</p>
                      <p className="text-[10px] font-semibold mt-1" style={{ color: N.textSub }}>{s.sub}</p>
                    </div>
                    <div className="p-2.5 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                      <s.icon className="w-5 h-5" style={{ color: N.accent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Usuarios y Roles', desc: 'Gestiona tu equipo y permisos', icon: Users, action: () => setSeccionActiva('usuarios') },
                { label: 'Emisoras y Propiedades', desc: 'Configura tus señales radiales', icon: Radio, action: () => setSeccionActiva('emisoras') },
                { label: 'Navegación de Módulos', desc: 'Personaliza el menú del sistema', icon: LayoutGrid, action: () => setNavWindowOpen(true) },
                { label: 'Configuraciones Generales', desc: 'Variables y parámetros del sistema', icon: Settings, action: () => setSeccionActiva('configuraciones') },
                { label: 'Seguridad y 2FA', desc: 'Políticas de acceso y autenticación', icon: Shield, action: () => {} },
                { label: 'Auditoría y Logs', desc: 'Historial de cambios y eventos', icon: History, action: () => {} },
              ].map(card => (
                <button
                  key={card.label}
                  onClick={card.action}
                  className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all hover:scale-[1.02]"
                  style={{ background: N.base, boxShadow: `6px 6px 12px ${N.dark},-6px -6px 12px ${N.light}`, border: '1px solid rgba(255,255,255,0.4)' }}
                >
                  <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                    <card.icon className="w-6 h-6" style={{ color: N.accent }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: N.text }}>{card.label}</p>
                    <p className="text-[10px] font-medium" style={{ color: N.textSub }}>{card.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Usuarios */}
        {seccionActiva === 'usuarios' && <UsuariosPanel />}

        {/* Emisoras */}
        {seccionActiva === 'emisoras' && <EmisorasPanel />}

        {/* Navegación */}
        {seccionActiva === 'navegacion' && <NavigationConfigPanel onOpenWindow={() => setNavWindowOpen(true)} />}

        {/* Configuraciones */}
        {seccionActiva === 'configuraciones' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#dfeaff] rounded-2xl p-6 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-1">Total Configuraciones</p>
                    <p className="text-3xl font-black text-[#69738c]">{estadisticas.total}</p>
                  </div>
                  <div className="p-3 bg-[#dfeaff] rounded-xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
                    <Settings className="w-6 h-6 text-[#6888ff]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#dfeaff] rounded-2xl p-6 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-1">Editables</p>
                    <p className="text-3xl font-black text-[#69738c]">{estadisticas.editables}</p>
                  </div>
                  <div className="p-3 bg-[#dfeaff] rounded-xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
                    <Edit3 className="w-6 h-6 text-[#6888ff]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#dfeaff] rounded-2xl p-6 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-1">Visibles</p>
                    <p className="text-3xl font-black text-[#69738c]">{estadisticas.visibles}</p>
                  </div>
                  <div className="p-3 bg-[#dfeaff] rounded-xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
                    <Eye className="w-6 h-6 text-[#6888ff]" />
                  </div>
                </div>
              </div>

              <div className="bg-[#dfeaff] rounded-2xl p-6 shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-1">Nivel Crítico</p>
                    <p className="text-3xl font-black text-[#69738c]">{configuraciones.filter(c => c.nivelSeguridad === 'critico').length}</p>
                  </div>
                  <div className="p-3 bg-[#dfeaff] rounded-xl shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]">
                    <Shield className="w-6 h-6 text-[#6888ff]" />
                  </div>
                </div>
              </div>
            </div>

            {/* CategoryTabs */}
            <div className="bg-[#dfeaff] rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40 p-4">
              <CategoryTabs
                categorias={categorias}
                categoriaActiva={categoriaActiva}
                onCategoriaSelect={setCategoriaActiva}
              />
            </div>

            {/* Barra de búsqueda + filtro por tipo */}
            <div className="bg-[#dfeaff] rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por clave o descripción..."
                      className="w-full p-3 pl-10 pr-4 bg-[#dfeaff] rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 text-[#69738c] placeholder:text-[#9aa3b8] transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={tipoSeleccionado}
                      onChange={(e) => setTipoSeleccionado(e.target.value)}
                      className="w-full p-3 pl-4 pr-10 bg-[#dfeaff] rounded-xl shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30 text-[#69738c] appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2369738c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="string">Texto</option>
                      <option value="number">Número</option>
                      <option value="boolean">Booleano</option>
                      <option value="json">JSON</option>
                      <option value="password">Contraseña</option>
                      <option value="email">Email</option>
                      <option value="url">URL</option>
                    </select>
                  </div>
                  <button className="px-4 py-3 rounded-xl bg-[#dfeaff] text-[#69738c] shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Más Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones de selección */}
            {seleccionadas.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-[#dfeaff] rounded-xl shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff] border border-white/40">
                <span className="text-sm font-bold text-[#6888ff]">
                  {seleccionadas.length} seleccionada(s)
                </span>
                <button
                  onClick={seleccionarTodas}
                  className="text-sm text-[#6888ff] hover:text-[#5572ee] underline"
                >
                  {seleccionadas.length === configuracionesFiltradas.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => handleEliminar(seleccionadas)}
                  className="px-4 py-2 rounded-xl bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff] hover:bg-[#5572ee] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}

            {/* Grid de Configuraciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {configuracionesFiltradas.map(config => (
                <ConfigCard
                  key={config.id}
                  config={config}
                  onEditar={() => handleEditar(config)}
                  onEliminar={() => handleEliminar([config.id])}
                  onToggleVisibilidad={() => handleToggleVisibilidad(config.id)}
                  onVerAuditoria={() => setMostrarAuditoria(config.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {configuracionesFiltradas.length === 0 && (
              <div className="bg-[#dfeaff] rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] border border-white/40 text-center py-12">
                <Settings className="w-16 h-16 text-[#bec8de] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#69738c] mb-2">
                  No se encontraron configuraciones
                </h3>
                <p className="text-[#9aa3b8] mb-6">
                  {busqueda || categoriaActiva !== 'todas' || tipoSeleccionado !== 'todos'
                    ? 'Intenta con otros filtros de búsqueda'
                    : 'Comienza agregando tu primera configuración'}
                </p>
                {!busqueda && categoriaActiva === 'todas' && tipoSeleccionado === 'todos' && (
                  <button
                    onClick={handleCrear}
                    className="px-6 py-3 rounded-xl bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff] hover:bg-[#5572ee] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)] transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Configuración
                  </button>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="text-center py-8">
              <div className="inline-block px-4 py-2 bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] rounded-full font-mono text-[10px] font-black text-[#9aa3b8] uppercase tracking-widest">
                ⚙️ Sistema de Configuración Centralizado • Silexar Pulse TIER 0
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ventana flotante de Configuración de Navegación */}
      <NavigationConfigWindow
        isOpen={navWindowOpen}
        onClose={() => setNavWindowOpen(false)}
      />

      {/* Modal de Formulario */}
      <ConfigFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        config={configEditando}
        onSubmit={handleSubmit}
      />

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
