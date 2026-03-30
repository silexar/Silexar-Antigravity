/**
 * 📋 SILEXAR PULSE - Reporte Material Pendiente TIER 0
 * 
 * Vista gerencial de material pendiente por cliente
 * con alertas, recordatorios y tracking
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, AlertTriangle, CheckCircle,
  Mail, RefreshCw, ChevronDown, ChevronRight,
  Send, Phone, ArrowLeft, Plus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface MaterialPendiente {
  id: string;
  anuncianteId: string;
  anuncianteNombre: string;
  contratoNumero: string | null;
  vencimientoNombre: string | null;
  tipoMaterial: string;
  descripcion: string;
  duracionEsperada: number | null;
  fechaLimiteEntrega: string;
  estado: 'pendiente' | 'recibido' | 'en_revision' | 'aprobado' | 'rechazado' | 'vencido';
  diasRestantes: number;
  esUrgente: boolean;
  recordatoriosEnviados: number;
  contactoNombre: string | null;
  contactoEmail: string | null;
  contactoTelefono: string | null;
  cunaAsignadaCodigo: string | null;
}

interface ReportePorAnunciante {
  anuncianteId: string;
  anuncianteNombre: string;
  totalPendiente: number;
  totalRecibido: number;
  totalVencido: number;
  tasaCumplimiento: number;
  materialesDetalle: MaterialPendiente[];
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const EstadoBadge = ({ estado }: { estado: string }) => {
  const config: Record<string, { color: string; label: string }> = {
    pendiente: { color: 'bg-amber-100 text-amber-700', label: 'Pendiente' },
    recibido: { color: 'bg-blue-100 text-blue-700', label: 'Recibido' },
    en_revision: { color: 'bg-purple-100 text-purple-700', label: 'Revisión' },
    aprobado: { color: 'bg-emerald-100 text-emerald-700', label: 'Aprobado' },
    rechazado: { color: 'bg-red-100 text-red-700', label: 'Rechazado' },
    vencido: { color: 'bg-red-200 text-red-800', label: 'Vencido' }
  };
  
  const { color, label } = config[estado] || config.pendiente;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
};

const UrgenciaBadge = ({ diasRestantes }: { diasRestantes: number }) => {
  if (diasRestantes < 0) {
    return (
      <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium animate-pulse">
        ¡VENCIDO!
      </span>
    );
  }
  if (diasRestantes <= 3) {
    return (
      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
        {diasRestantes === 0 ? 'Hoy' : `${diasRestantes} días`}
      </span>
    );
  }
  if (diasRestantes <= 7) {
    return (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
        {diasRestantes} días
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
      {diasRestantes} días
    </span>
  );
};

const AnuncianteCard = ({ 
  reporte, 
  expanded, 
  onToggle,
  onEnviarRecordatorio 
}: { 
  reporte: ReportePorAnunciante;
  expanded: boolean;
  onToggle: () => void;
  onEnviarRecordatorio: (materialId: string) => void;
}) => {
  const pendientesUrgentes = reporte.materialesDetalle.filter(m => m.esUrgente && m.estado === 'pendiente');
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {reporte.anuncianteNombre.charAt(0)}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-slate-800">{reporte.anuncianteNombre}</h3>
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
            <span>{reporte.materialesDetalle.length} materiales</span>
            {pendientesUrgentes.length > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {pendientesUrgentes.length} urgentes
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {/* Métricas */}
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{reporte.totalPendiente}</p>
            <p className="text-xs text-slate-400">Pendiente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{reporte.totalRecibido}</p>
            <p className="text-xs text-slate-400">Recibido</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{reporte.totalVencido}</p>
            <p className="text-xs text-slate-400">Vencido</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${reporte.tasaCumplimiento >= 80 ? 'text-emerald-600' : reporte.tasaCumplimiento >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {reporte.tasaCumplimiento}%
            </p>
            <p className="text-xs text-slate-400">Cumplimiento</p>
          </div>
          {expanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      
      {/* Detalle */}
      {expanded && (
        <div className="border-t p-4 bg-slate-50">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="pb-2">Material</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Vencimiento</th>
                <th className="pb-2">Estado</th>
                <th className="pb-2">Plazo</th>
                <th className="pb-2">Contacto</th>
                <th className="pb-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reporte.materialesDetalle.map(mat => (
                <tr key={mat.id} className="border-t border-slate-200">
                  <td className="py-3">
                    <p className="font-medium text-slate-800">{mat.descripcion}</p>
                    {mat.vencimientoNombre && (
                      <p className="text-xs text-purple-600">{mat.vencimientoNombre}</p>
                    )}
                  </td>
                  <td className="py-3 text-sm text-slate-600 capitalize">{mat.tipoMaterial}</td>
                  <td className="py-3 text-sm text-slate-600">
                    {new Date(mat.fechaLimiteEntrega).toLocaleDateString('es-CL')}
                  </td>
                  <td className="py-3"><EstadoBadge estado={mat.estado} /></td>
                  <td className="py-3"><UrgenciaBadge diasRestantes={mat.diasRestantes} /></td>
                  <td className="py-3">
                    {mat.contactoNombre && (
                      <div className="text-sm">
                        <p className="text-slate-700">{mat.contactoNombre}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {mat.contactoEmail && <Mail className="w-3 h-3" />}
                          {mat.contactoTelefono && <Phone className="w-3 h-3" />}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3">
                    {mat.estado === 'pendiente' && (
                      <button
                        onClick={() => onEnviarRecordatorio(mat.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Recordar
                        {mat.recordatoriosEnviados > 0 && (
                          <span className="text-xs opacity-70">({mat.recordatoriosEnviados})</span>
                        )}
                      </button>
                    )}
                    {mat.cunaAsignadaCodigo && (
                      <span className="text-xs text-emerald-600 font-mono">{mat.cunaAsignadaCodigo}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function MaterialPendientePage() {
  const router = useRouter();
  const [reportes, setReportes] = useState<ReportePorAnunciante[]>([]);
  const [materiales, setMateriales] = useState<MaterialPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<'anunciantes' | 'lista'>('anunciantes');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [meta, setMeta] = useState({ total: 0, pendientes: 0, vencidos: 0, urgentes: 0 });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (vista === 'anunciantes') params.set('vista', 'por_anunciante');
      if (filtroEstado) params.set('estado', filtroEstado);
      
      const res = await fetch(`/api/cunas/material-pendiente?${params}`);
      const data = await res.json();
      
      if (data.success) {
        if (vista === 'anunciantes') {
          setReportes(data.data);
        } else {
          setMateriales(data.data);
        }
        setMeta(data.meta);
      }
    } catch (error) {
      /* console.error('Error cargando datos:', error) */;
    }
    setLoading(false);
  }, [vista, filtroEstado]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEnviarRecordatorio = async (materialId: string) => {
    try {
      await fetch('/api/cunas/material-pendiente', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, accion: 'enviar_recordatorio' })
      });
      alert('✅ Recordatorio enviado');
      cargarDatos();
    } catch (error) {
      /* console.error('Error enviando recordatorio:', error) */;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/cunas')}
            className="p-2 hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-amber-500" />
              Material Pendiente
            </h1>
            <p className="text-slate-500 mt-1">Tracking de entregas por cliente</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={cargarDatos}
            className="p-3 bg-white rounded-xl shadow hover:shadow-md transition-shadow"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => {/* Abrir modal crear solicitud */}}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Solicitud
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-slate-500 text-sm">Total Materiales</p>
          <p className="text-3xl font-bold text-slate-800">{meta.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-slate-500 text-sm">Pendientes</p>
          <p className="text-3xl font-bold text-amber-600">{meta.pendientes}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-slate-500 text-sm">Vencidos</p>
          <p className="text-3xl font-bold text-red-600">{meta.vencidos}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-slate-500 text-sm">Urgentes</p>
          <p className="text-3xl font-bold text-red-500">{meta.urgentes}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-2xl p-4 shadow mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVista('anunciantes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              vista === 'anunciantes' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Por Anunciante
          </button>
          <button
            onClick={() => setVista('lista')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              vista === 'lista' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lista Completa
          </button>
        </div>
        
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="vencido">Vencido</option>
          <option value="recibido">Recibido</option>
        </select>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : vista === 'anunciantes' ? (
        <div className="space-y-4">
          {reportes.map(reporte => (
            <AnuncianteCard
              key={reporte.anuncianteId}
              reporte={reporte}
              expanded={expandedIds.has(reporte.anuncianteId)}
              onToggle={() => toggleExpand(reporte.anuncianteId)}
              onEnviarRecordatorio={handleEnviarRecordatorio}
            />
          ))}
          
          {reportes.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay materiales pendientes</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="p-4">Anunciante</th>
                <th className="p-4">Material</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Fecha Límite</th>
                <th className="p-4">Plazo</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map(mat => (
                <tr key={mat.id} className="border-t hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{mat.anuncianteNombre}</td>
                  <td className="p-4">{mat.descripcion}</td>
                  <td className="p-4 capitalize">{mat.tipoMaterial}</td>
                  <td className="p-4"><EstadoBadge estado={mat.estado} /></td>
                  <td className="p-4 text-sm">{new Date(mat.fechaLimiteEntrega).toLocaleDateString('es-CL')}</td>
                  <td className="p-4"><UrgenciaBadge diasRestantes={mat.diasRestantes} /></td>
                  <td className="p-4">
                    {mat.estado === 'pendiente' && (
                      <button
                        onClick={() => handleEnviarRecordatorio(mat.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
