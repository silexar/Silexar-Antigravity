'use client';

/**
 * 🎨 SILEXAR PULSE - Agencias Creativas Móvil
 * 
 * @description Interface móvil para gestión de agencias creativas
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Briefcase
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface AgenciaCreativa {
  id: string;
  codigo: string;
  razonSocial: string;
  nombreFantasia: string | null;
  tipoAgencia: string;
  porcentajeComision: number;
  emailGeneral: string | null;
  telefonoGeneral: string | null;
  estado: string;
  activa: boolean;
  campañasActivas?: number;
  facturacionMensual?: number;
  scoreRendimiento?: number;
}

// ═══════════════════════════════════════════════════════════════
// DISEÑO MÓVIL - NEUROMÓRFICO
// ═══════════════════════════════════════════════════════════════

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8',
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_AGENCIAS: AgenciaCreativa[] = [
  { id: 'agc-001', codigo: 'AGC-001', razonSocial: 'Creativos Asociados Ltda', nombreFantasia: 'BlueWave Creative', tipoAgencia: 'digital', porcentajeComision: 15, emailGeneral: 'contacto@bluewave.cl', telefonoGeneral: '+56 2 2345 6789', estado: 'activa', activa: true, campañasActivas: 12, facturacionMensual: 45000000, scoreRendimiento: 92 },
  { id: 'agc-002', codigo: 'AGC-002', razonSocial: 'MediaPlan SpA', nombreFantasia: 'MediaPlan', tipoAgencia: 'medios', porcentajeComision: 12, emailGeneral: 'info@mediaplan.cl', telefonoGeneral: '+56 2 3456 7890', estado: 'activa', activa: true, campañasActivas: 8, facturacionMensual: 32000000, scoreRendimiento: 78 },
  { id: 'agc-003', codigo: 'AGC-003', razonSocial: 'Impacto BTL Ltda', nombreFantasia: 'Impacto', tipoAgencia: 'btl', porcentajeComision: 18, emailGeneral: 'ventas@impacto.cl', telefonoGeneral: '+56 2 4567 8901', estado: 'activa', activa: true, campañasActivas: 5, facturacionMensual: 18500000, scoreRendimiento: 65 },
]

// ═══════════════════════════════════════════════════════════════
// PÁGINA MÓVIL
// ═══════════════════════════════════════════════════════════════

export default function AgenciasCreativasMovilPage() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<AgenciaCreativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/agencias-creativas?limit=100');
        const data = await response.json();
        if (data.success && data.data) {
          setAgencias(data.data);
        } else {
          setAgencias(MOCK_AGENCIAS);
        }
      } catch {
        setAgencias(MOCK_AGENCIAS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAgencias = agencias.filter(a =>
    a.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.nombreFantasia?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: agencias.length,
    activas: agencias.filter(a => a.activa).length,
    proyectosActivos: agencias.reduce((sum, a) => sum + (a.campañasActivas || 0), 0),
    calidadPromedio: agencias.length > 0
      ? (agencias.reduce((sum, a) => sum + (a.scoreRendimiento || 0), 0) / agencias.length).toFixed(1)
      : '0'
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'digital': return '#06b6d4';
      case 'medios': return '#10b981';
      case 'btl': return '#f59e0b';
      case 'publicidad': return '#8b5cf6';
      case 'integral': return '#ec4899';
      default: return '#64748b';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${N.base} 0%, #e8f0ff 100%)` }}>
      {/* Header */}
      <div className="p-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl"
            style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px_-3px 6px ${N.light}` }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black" style={{ color: N.text }}>
              Agencias Creativas
            </h1>
            <p className="text-xs" style={{ color: N.textSub }}>
              Gestión móvil
            </p>
          </div>
          <button
            onClick={() => router.push('/agencias-creativas/nuevo')}
            className="p-3 rounded-xl"
            style={{ background: N.accent, boxShadow: `3px 3px 6px ${N.dark}` }}
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-2xl text-center"
            style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}
          >
            <div className="text-2xl font-black" style={{ color: N.accent }}>{stats.total}</div>
            <div className="text-xs" style={{ color: N.textSub }}>Agencias</div>
          </div>
          <div
            className="p-3 rounded-2xl text-center"
            style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}
          >
            <div className="text-2xl font-black" style={{ color: '#10b981' }}>{stats.proyectosActivos}</div>
            <div className="text-xs" style={{ color: N.textSub }}>Proyectos</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
          <input
            type="text"
            placeholder="Buscar agencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium outline-none"
            style={{
              background: N.light,
              color: N.text,
              boxShadow: `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}`,
              border: 'none'
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
        <button
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1"
          style={{ background: N.accent, color: 'white' }}
        >
          <Plus className="w-3 h-3" /> Nueva
        </button>
        <button
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
          style={{ background: N.base, color: N.text, boxShadow: `2px 2px 4px ${N.dark},-2px_-2px 4px ${N.light}` }}
        >
          <Briefcase className="w-3 h-3 inline mr-1" /> Ver Todos
        </button>
        <button
          className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
          style={{ background: N.base, color: N.text, boxShadow: `2px 2px 4px ${N.dark},-2px_-2px 4px ${N.light}` }}
        >
          <Sparkles className="w-3 h-3 inline mr-1" /> Top Rated
        </button>
      </div>

      {/* Lista */}
      <div className="px-4 pb-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: N.accent }} />
          </div>
        ) : filteredAgencias.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto mb-3" style={{ color: N.textSub }} />
            <p style={{ color: N.textSub }}>Sin resultados</p>
          </div>
        ) : (
          filteredAgencias.map((agencia) => (
            <div
              key={agencia.id}
              onClick={() => router.push(`/agencias-creativas/${agencia.id}`)}
              className="p-4 rounded-2xl cursor-pointer"
              style={{
                background: N.base,
                boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}`
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${N.accent} 0%, #8b5cf6 100%)` }}
                >
                  {(agencia.nombreFantasia || agencia.razonSocial).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm truncate" style={{ color: N.text }}>
                      {agencia.nombreFantasia || agencia.razonSocial}
                    </p>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold text-white"
                      style={{ background: getTipoColor(agencia.tipoAgencia) }}
                    >
                      {agencia.tipoAgencia}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: N.textSub }}>
                    {agencia.razonSocial}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" style={{ color: '#10b981' }} />
                    <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                      {agencia.scoreRendimiento || 0}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 mt-1" style={{ color: N.textSub }} />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: N.dark }}>
                <div className="flex items-center gap-1 text-xs" style={{ color: N.textSub }}>
                  <Briefcase className="w-3 h-3" />
                  {agencia.campañasActivas || 0} proyectos
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: N.textSub }}>
                  <span>{agencia.porcentajeComision}%</span>
                </div>
                {agencia.emailGeneral && (
                  <a
                    href={`mailto:${agencia.emailGeneral}`}
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto"
                  >
                    <Mail className="w-4 h-4" style={{ color: N.accent }} />
                  </a>
                )}
                {agencia.telefonoGeneral && (
                  <a
                    href={`tel:${agencia.telefonoGeneral}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-4 h-4" style={{ color: '#10b981' }} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav Placeholder */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 flex justify-around"
        style={{ background: N.base, boxShadow: `0 -4px 8px ${N.dark}` }}
      >
        <button className="flex flex-col items-center" onClick={() => router.push('/dashboard')}>
          <Building2 className="w-5 h-5" style={{ color: N.textSub }} />
          <span className="text-xs mt-1" style={{ color: N.textSub }}>Inicio</span>
        </button>
        <button className="flex flex-col items-center">
          <Briefcase className="w-5 h-5" style={{ color: N.accent }} />
          <span className="text-xs mt-1" style={{ color: N.accent }}>Agencias</span>
        </button>
        <button className="flex flex-col items-center">
          <Sparkles className="w-5 h-5" style={{ color: N.textSub }} />
          <span className="text-xs mt-1" style={{ color: N.textSub }}>IA</span>
        </button>
      </div>
    </div>
  );
}
