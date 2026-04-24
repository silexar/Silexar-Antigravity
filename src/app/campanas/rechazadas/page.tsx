/**
 * 🚫 Gestión de Cuñas Rechazadas — Neumórfico TIER 0
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, RefreshCw, MapPin, Clock, CheckCircle2, XCircle,
  Zap, ArrowRight, Filter, Download, Mail, Brain
} from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoInput, NeoBadge, NeoSelect, N } from '../_lib/neumorphic';

interface CunaRechazada {
  id: string;
  campana: { numero: string; nombre: string; anunciante: string };
  linea: { programa: string; horaOriginal: string; duracion: number };
  motivoRechazo: 'saturacion' | 'conflicto_competencia' | 'exclusividad' | 'horario_protegido' | 'material_no_disponible';
  fechaRechazo: string;
  intentosReubicacion: number;
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  sugerenciasIA: { bloqueAlternativo: string; horaAlternativa: string; probabilidadExito: number }[];
  estado: 'pendiente' | 'reubicada' | 'forzada' | 'cancelada';
}

const MOCK_RECHAZADAS: CunaRechazada[] = [
  {
    id: 'rech_001', campana: { numero: 'CAM-2025-0015', nombre: 'Campaña Verano Premium', anunciante: 'BANCO DE CHILE' },
    linea: { programa: 'PRIME MATINAL', horaOriginal: '08:15', duracion: 30 },
    motivoRechazo: 'saturacion', fechaRechazo: '2025-02-08', intentosReubicacion: 2, prioridad: 'alta',
    sugerenciasIA: [
      { bloqueAlternativo: 'MAÑANA', horaAlternativa: '10:30', probabilidadExito: 92 },
      { bloqueAlternativo: 'PRIME TARDE', horaAlternativa: '18:45', probabilidadExito: 85 }
    ], estado: 'pendiente'
  },
  {
    id: 'rech_002', campana: { numero: 'CAM-2025-0012', nombre: 'Lanzamiento App Q1', anunciante: 'ENTEL' },
    linea: { programa: 'PRIME TARDE', horaOriginal: '19:00', duracion: 45 },
    motivoRechazo: 'conflicto_competencia', fechaRechazo: '2025-02-07', intentosReubicacion: 1, prioridad: 'critica',
    sugerenciasIA: [{ bloqueAlternativo: 'TRASNOCHE', horaAlternativa: '23:30', probabilidadExito: 78 }],
    estado: 'pendiente'
  },
  {
    id: 'rech_003', campana: { numero: 'CAM-2025-0018', nombre: 'Promoción Puntos CMR', anunciante: 'FALABELLA' },
    linea: { programa: 'PRIME MATINAL', horaOriginal: '07:45', duracion: 30 },
    motivoRechazo: 'exclusividad', fechaRechazo: '2025-02-06', intentosReubicacion: 3, prioridad: 'media',
    sugerenciasIA: [
      { bloqueAlternativo: 'MAÑANA', horaAlternativa: '11:15', probabilidadExito: 95 },
      { bloqueAlternativo: 'TARDE', horaAlternativa: '15:00', probabilidadExito: 88 }
    ], estado: 'pendiente'
  }
];

const getMotivoLabel = (motivo: string) => {
  const labels: Record<string, string> = {
    saturacion: 'Saturación', conflicto_competencia: 'Conflicto Competencia',
    exclusividad: 'Exclusividad', horario_protegido: 'Horario Protegido', material_no_disponible: 'Material No Disponible'
  };
  return labels[motivo] || motivo;
};

const getMotivoColor = (motivo: string) => {
  const colors: Record<string, string> = {
    saturacion: '#f59e0b', conflicto_competencia: '#ef4444',
    exclusividad: '#a855f7', horario_protegido: '#3b82f6', material_no_disponible: '#9aa3b8'
  };
  return colors[motivo] || '#9aa3b8';
};

const getPrioridadColor = (prioridad: string) => {
  const colors: Record<string, string> = { critica: '#ef4444', alta: '#f97316', media: '#eab308', baja: '#22c55e' };
  return colors[prioridad] || '#9aa3b8';
};

export default function CunasRechazadasPage() {
  const router = useRouter();
  const [rechazadas, setRechazadas] = useState<CunaRechazada[]>(MOCK_RECHAZADAS);
  const [filtroMotivo, setFiltroMotivo] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuna, setSelectedCuna] = useState<CunaRechazada | null>(null);
  const [justificacionForzado, setJustificacionForzado] = useState('');

  const handleReubicar = (cunaId: string) => {
    setRechazadas(prev => prev.map(c => c.id === cunaId ? { ...c, estado: 'reubicada' as const } : c));
  };

  const handleForzar = () => {
    if (!selectedCuna || !justificacionForzado) return;
    setRechazadas(prev => prev.map(c => c.id === selectedCuna.id ? { ...c, estado: 'forzada' as const } : c));
    setSelectedCuna(null);
    setJustificacionForzado('');
  };

  const handleCancelar = (cunaId: string) => {
    setRechazadas(prev => prev.map(c => c.id === cunaId ? { ...c, estado: 'cancelada' as const } : c));
  };

  const filtered = rechazadas.filter(c => {
    const matchMotivo = filtroMotivo === 'todos' || c.motivoRechazo === filtroMotivo;
    const matchPrioridad = filtroPrioridad === 'todas' || c.prioridad === filtroPrioridad;
    const matchSearch = c.campana.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.campana.anunciante.toLowerCase().includes(searchTerm.toLowerCase());
    return matchMotivo && matchPrioridad && matchSearch && c.estado === 'pendiente';
  });

  const stats = {
    total: rechazadas.filter(c => c.estado === 'pendiente').length,
    criticas: rechazadas.filter(c => c.prioridad === 'critica' && c.estado === 'pendiente').length,
    reubicadas: rechazadas.filter(c => c.estado === 'reubicada').length,
    forzadas: rechazadas.filter(c => c.estado === 'forzada').length
  };

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-[1900px] mx-auto space-y-5">
        <NeoPageHeader
          title="Cuñas Rechazadas"
          subtitle="Centro de control para spots no programables con motor de reubicación IA"
          icon={AlertTriangle}
          backHref="/campanas"
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NeoCard padding="small">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Pendientes</p>
                <p className="text-2xl font-black" style={{ color: N.text }}>{stats.total}</p>
              </div>
              <XCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
            </div>
          </NeoCard>
          <NeoCard padding="small">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Críticas</p>
                <p className="text-2xl font-black" style={{ color: '#f97316' }}>{stats.criticas}</p>
              </div>
              <AlertTriangle className="w-8 h-8" style={{ color: '#f97316' }} />
            </div>
          </NeoCard>
          <NeoCard padding="small">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Reubicadas</p>
                <p className="text-2xl font-black" style={{ color: '#22c55e' }}>{stats.reubicadas}</p>
              </div>
              <RefreshCw className="w-8 h-8" style={{ color: '#22c55e' }} />
            </div>
          </NeoCard>
          <NeoCard padding="small">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: N.textSub }}>Forzadas</p>
                <p className="text-2xl font-black" style={{ color: '#a855f7' }}>{stats.forzadas}</p>
              </div>
              <Zap className="w-8 h-8" style={{ color: '#a855f7' }} />
            </div>
          </NeoCard>
        </div>

        {/* Tabla */}
        <NeoCard padding="none">
          <div className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: `${N.dark}40` }}>
            <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
              <Filter className="h-4 w-4" style={{ color: N.accent }} />
              Cola de Reubicación
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <NeoInput placeholder="Buscar campaña..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-48" />
              <NeoSelect value={filtroMotivo} onChange={e => setFiltroMotivo(e.target.value)} className="w-40">
                <option value="todos">Todos los motivos</option>
                <option value="saturacion">Saturación</option>
                <option value="conflicto_competencia">Conflicto</option>
                <option value="exclusividad">Exclusividad</option>
                <option value="horario_protegido">Horario</option>
              </NeoSelect>
              <NeoSelect value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} className="w-32">
                <option value="todas">Todas</option>
                <option value="critica">Crítica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
              </NeoSelect>
              <NeoButton variant="secondary" size="sm"><Download className="h-3.5 w-3.5" /> Exportar</NeoButton>
              <NeoButton variant="secondary" size="sm"><Mail className="h-3.5 w-3.5" /> Notificar</NeoButton>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `2px solid ${N.dark}40` }}>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}></th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Campaña</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Bloque Original</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Motivo</th>
                  <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Sugerencias IA</th>
                  <th className="px-3 py-3 text-right text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(cuna => (
                  <tr key={cuna.id} style={{ borderBottom: `1px solid ${N.dark}30` }}>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-black text-white"
                        style={{ background: getPrioridadColor(cuna.prioridad) }}>
                        {cuna.prioridad.charAt(0).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-sm" style={{ color: N.text }}>{cuna.campana.numero}</p>
                      <p className="text-xs" style={{ color: N.textSub }}>{cuna.campana.anunciante}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: N.textSub }} />
                        <div>
                          <p className="font-medium text-sm" style={{ color: N.text }}>{cuna.linea.programa}</p>
                          <p className="text-xs" style={{ color: N.textSub }}>{cuna.linea.horaOriginal} ({cuna.linea.duracion}s)</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: `${getMotivoColor(cuna.motivoRechazo)}15`, color: getMotivoColor(cuna.motivoRechazo) }}>
                        {getMotivoLabel(cuna.motivoRechazo)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {cuna.sugerenciasIA.slice(0, 2).map((sug, idx) => (
                          <button key={idx} onClick={() => handleReubicar(cuna.id)}
                            className="flex items-center gap-2 w-full p-2 rounded-xl text-left transition-all"
                            style={{ background: N.base, boxShadow: `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `inset 2px 2px 4px ${N.dark},inset -2px -2px 4px ${N.light}` }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `3px 3px 6px ${N.dark},-3px -3px 6px ${N.light}` }}>
                            <MapPin className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
                            <span className="text-xs font-medium" style={{ color: N.text }}>{sug.bloqueAlternativo} {sug.horaAlternativa}</span>
                            <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: '#22c55e' }}>{sug.probabilidadExito}%</span>
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NeoButton variant="secondary" size="sm" onClick={() => setSelectedCuna(selectedCuna?.id === cuna.id ? null : cuna)}>
                          <Zap className="w-3.5 h-3.5" style={{ color: '#a855f7' }} /> Forzar
                        </NeoButton>
                        <NeoButton variant="ghost" size="icon" onClick={() => handleCancelar(cuna.id)}>
                          <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </NeoButton>
                      </div>
                      {selectedCuna?.id === cuna.id && (
                        <div className="mt-2 p-3 rounded-xl text-left" style={{ background: `${N.accent}08`, border: `1px solid ${N.accent}30` }}>
                          <p className="text-xs font-bold mb-2" style={{ color: '#a855f7' }}>⚡ Planificación Forzada</p>
                          <p className="text-[10px] mb-2" style={{ color: N.textSub }}>Requiere justificación para auditoría</p>
                          <textarea
                            value={justificacionForzado}
                            onChange={e => setJustificacionForzado(e.target.value)}
                            placeholder="Justificación..."
                            rows={2}
                            className="w-full rounded-xl px-3 py-2 text-xs border-none focus:outline-none mb-2"
                            style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.text }}
                          />
                          <NeoButton variant="primary" size="sm" onClick={handleForzar} disabled={!justificacionForzado} className="w-full">
                            Confirmar Forzado
                          </NeoButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#22c55e' }} />
                    <p className="text-sm font-bold" style={{ color: N.text }}>¡Todo en orden!</p>
                    <p className="text-xs" style={{ color: N.textSub }}>No hay cuñas pendientes de reubicación</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </NeoCard>

        {/* Mapa de Reubicación IA */}
        <NeoCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black flex items-center gap-2" style={{ color: N.text }}>
              <Brain className="h-4 w-4" style={{ color: '#22c55e' }} />
              Mapa de Reubicación Inteligente
            </h3>
            <div className="flex gap-2">
              <NeoButton variant="primary" size="sm"><CheckCircle2 className="h-3.5 w-3.5" /> Aplicar Reubicación</NeoButton>
              <NeoButton variant="secondary" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Reset</NeoButton>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: N.textSub }}>Bloques Disponibles</h4>
              <div className="space-y-2">
                {[
                  { hora: '08:26:00 - Prime', uso: '267s/300s', libre: '33s libres', spots: 1, color: '#22c55e' },
                  { hora: '09:26:00 - Auspicio', uso: '180s/300s', libre: '120s libres', spots: 4, color: '#3b82f6' },
                  { hora: '10:26:00 - Repartido', uso: '150s/300s', libre: '150s libres', spots: 5, color: '#a855f7' },
                ].map(b => (
                  <div key={b.hora} className="p-3 rounded-xl cursor-pointer transition-all"
                    style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: b.color }} />
                        <span className="font-mono font-bold text-sm" style={{ color: N.text }}>{b.hora}</span>
                      </div>
                      <ArrowRight className="w-4 h-4" style={{ color: N.textSub }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: N.textSub }}>{b.uso} ({b.libre})</div>
                    <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: b.color }}>
                      Disponible para {b.spots} spot{b.spots > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: N.textSub }}>Cuñas a Reubicar</h4>
              <div className="space-y-2">
                {filtered.slice(0, 3).map(cuna => (
                  <div key={cuna.id} draggable
                    className="p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all"
                    style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs" style={{ color: N.textSub }}>{cuna.campana.numero}</span>
                        <span className="mx-2" style={{ color: N.textSub }}>•</span>
                        <span className="text-xs font-bold" style={{ color: N.text }}>{cuna.linea.duracion}s</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: getPrioridadColor(cuna.prioridad) }}>
                        {cuna.prioridad}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>{cuna.campana.anunciante}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl text-center text-xs" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark},inset -3px -3px 6px ${N.light}`, color: N.textSub }}>
                [Drag & Drop para asignar cuñas a bloques]
              </div>
            </div>
          </div>
        </NeoCard>

        {/* Acciones Masivas */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black" style={{ color: N.text }}>Acciones Disponibles</h4>
              <p className="text-xs" style={{ color: N.textSub }}>Opciones de procesamiento masivo</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <NeoButton variant="primary" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Planificar Forzado</NeoButton>
              <NeoButton variant="secondary" size="sm"><Brain className="h-3.5 w-3.5" /> Reubicar Inteligente</NeoButton>
              <NeoButton variant="secondary" size="sm"><Filter className="h-3.5 w-3.5" /> Análisis Conflictos</NeoButton>
            </div>
          </div>
        </NeoCard>
      </div>
    </div>
  );
}
