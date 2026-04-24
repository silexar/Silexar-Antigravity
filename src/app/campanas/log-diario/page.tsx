/**
 * 📅 SILEXAR PULSE - Vista Log/Parrilla Diaria 2050
 * 
 * @description Vista cronológica tipo timeline para ver TODA la programación
 * del día con drag & drop, indicadores de saturación y alertas en tiempo real.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Radio,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2
} from 'lucide-react';
import { NeoPageHeader, NeoCard, NeoButton, NeoSelect, NeoBadge, N } from '../_lib/neumorphic';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface SpotLog {
  id: string;
  campanaId: string;
  campanaNombre: string;
  anunciante: string;
  cunaId: string;
  cunaNombre: string;
  duracion: number; // segundos
  horaPrograma: string;
  estado: 'programado' | 'emitido' | 'confirmado' | 'no_emitido' | 'en_aire';
  bloqueId: string;
  orden: number;
}

interface BloqueLog {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  duracionMaxima: number; // segundos
  duracionOcupada: number;
  spots: SpotLog[];
  estado: 'pendiente' | 'en_aire' | 'completado';
}

interface EmisoraLog {
  id: string;
  nombre: string;
  bloques: BloqueLog[];
  spotsTotal: number;
  spotsEmitidos: number;
  spotsConfirmados: number;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const generarBloquesMock = (): BloqueLog[] => {
  const bloques: BloqueLog[] = [];
  const horas = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  
  const anunciantes = ['COCA-COLA', 'BANCO CHILE', 'FALABELLA', 'ENTEL', 'PARIS', 'CLARO', 'RIPLEY'];
  
  horas.forEach((hora, idx) => {
    const numSpots = Math.floor(Math.random() * 6) + 2;
    const spots: SpotLog[] = [];
    
    for (let i = 0; i < numSpots; i++) {
      const anunciante = anunciantes[Math.floor(Math.random() * anunciantes.length)];
      spots.push({
        id: `spot_${hora}_${i}`,
        campanaId: `camp_${Math.floor(Math.random() * 10)}`,
        campanaNombre: `Campaña ${anunciante} ${Math.floor(Math.random() * 100)}`,
        anunciante,
        cunaId: `cuna_${i}`,
        cunaNombre: `Cuña ${anunciante} 30s`,
        duracion: [20, 30, 45][Math.floor(Math.random() * 3)],
        horaPrograma: hora,
        estado: idx < 10 ? 'confirmado' : idx === 10 ? 'en_aire' : 'programado',
        bloqueId: `bloque_${hora}`,
        orden: i + 1
      });
    }
    
    const duracionOcupada = spots.reduce((acc, s) => acc + s.duracion, 0);
    
    bloques.push({
      id: `bloque_${hora}`,
      nombre: `Tanda ${hora}`,
      horaInicio: hora,
      horaFin: `${String(parseInt(hora.split(':')[0]) + 1).padStart(2, '0')}:00`,
      duracionMaxima: 180,
      duracionOcupada,
      spots,
      estado: idx < 10 ? 'completado' : idx === 10 ? 'en_aire' : 'pendiente'
    });
  });
  
  return bloques;
};

const EMISORAS_MOCK: EmisoraLog[] = [
  {
    id: 'em_001',
    nombre: 'Radio Pudahuel',
    bloques: generarBloquesMock(),
    spotsTotal: 85,
    spotsEmitidos: 52,
    spotsConfirmados: 48
  },
  {
    id: 'em_002',
    nombre: 'ADN Radio',
    bloques: generarBloquesMock(),
    spotsTotal: 72,
    spotsEmitidos: 45,
    spotsConfirmados: 42
  },
  {
    id: 'em_003',
    nombre: 'Radio Futuro',
    bloques: generarBloquesMock(),
    spotsTotal: 64,
    spotsEmitidos: 38,
    spotsConfirmados: 36
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ParrillaLogDiario() {
  const [fecha, setFecha] = useState(new Date());
  const [emisoraSeleccionada, setEmisoraSeleccionada] = useState<string>('em_001');
  const [vistaHoras, setVistaHoras] = useState<'todas' | 'prime' | 'manana' | 'tarde'>('todas');
  const [cargando, setCargando] = useState(false);
  const [bloqueExpandido, setBloqueExpandido] = useState<string | null>(null);

  // Obtener emisora actual
  const emisoraActual = useMemo(() => {
    return EMISORAS_MOCK.find(e => e.id === emisoraSeleccionada) || EMISORAS_MOCK[0];
  }, [emisoraSeleccionada]);

  // Filtrar bloques según vista
  const bloquesFiltrados = useMemo(() => {
    let bloques = emisoraActual.bloques;
    
    switch (vistaHoras) {
      case 'prime':
        bloques = bloques.filter(b => {
          const hora = parseInt(b.horaInicio.split(':')[0]);
          return (hora >= 6 && hora <= 9) || (hora >= 18 && hora <= 21);
        });
        break;
      case 'manana':
        bloques = bloques.filter(b => {
          const hora = parseInt(b.horaInicio.split(':')[0]);
          return hora >= 6 && hora <= 12;
        });
        break;
      case 'tarde':
        bloques = bloques.filter(b => {
          const hora = parseInt(b.horaInicio.split(':')[0]);
          return hora >= 12 && hora <= 21;
        });
        break;
    }
    
    return bloques;
  }, [emisoraActual, vistaHoras]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = emisoraActual.spotsTotal;
    const emitidos = emisoraActual.spotsEmitidos;
    const confirmados = emisoraActual.spotsConfirmados;
    const pendientes = total - emitidos;
    const cumplimiento = total > 0 ? (confirmados / total) * 100 : 0;
    
    return { total, emitidos, confirmados, pendientes, cumplimiento };
  }, [emisoraActual]);

  // Cambiar día
  const cambiarDia = (delta: number) => {
    const newDate = new Date(fecha);
    newDate.setDate(newDate.getDate() + delta);
    setFecha(newDate);
  };

  // Obtener color de saturación
  const getColorSaturacion = (ocupada: number, maxima: number) => {
    const porcentaje = (ocupada / maxima) * 100;
    if (porcentaje >= 100) return '#ef4444';
    if (porcentaje >= 85) return '#f59e0b';
    if (porcentaje >= 70) return '#eab308';
    return '#22c55e';
  };

  // Obtener estilo de estado del bloque
  const getEstadoBloque = (estado: string) => {
    switch (estado) {
      case 'completado': return { bg: '#22c55e10', border: '#22c55e40', text: '#15803d' };
      case 'en_aire': return { bg: `${N.accent}10`, border: `${N.accent}60`, text: N.accent };
      default: return { bg: `${N.dark}15`, border: `${N.dark}40`, text: N.text };
    }
  };

  // Obtener badge de estado del spot
  const getEstadoSpotBadge = (estado: string) => {
    const baseStyle: React.CSSProperties = { padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' };
    switch (estado) {
      case 'confirmado': return <span style={{ ...baseStyle, background: '#22c55e20', color: '#15803d' }}>✓ Confirmado</span>;
      case 'emitido': return <span style={{ ...baseStyle, background: `${N.accent}20`, color: N.accent }}>Emitido</span>;
      case 'en_aire': return <span style={{ ...baseStyle, background: '#a855f720', color: '#a855f7', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>🔴 EN AIRE</span>;
      case 'no_emitido': return <span style={{ ...baseStyle, background: '#ef444420', color: '#dc2626' }}>✗ No emitido</span>;
      default: return <span style={{ ...baseStyle, background: `${N.dark}20`, color: N.textSub }}>Programado</span>;
    }
  };

  // Refrescar
  const handleRefrescar = async () => {
    setCargando(true);
    await new Promise(r => setTimeout(r, 1000));
    setCargando(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: N.base, padding: '24px' }}>
      {/* HEADER */}
      <NeoPageHeader
        title="Parrilla Log Diario"
        subtitle="Vista cronológica completa"
        icon={Calendar}
        backHref="/campanas"
      />

      {/* Navegación de fecha y acciones */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NeoButton variant="secondary" size="icon" onClick={() => cambiarDia(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </NeoButton>
          <div 
            className="px-4 py-2 rounded-xl font-medium text-sm"
            style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`, color: N.text }}
          >
            {fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <NeoButton variant="secondary" size="icon" onClick={() => cambiarDia(1)}>
            <ChevronRight className="w-4 h-4" />
          </NeoButton>
          <NeoButton variant="secondary" size="sm" onClick={() => setFecha(new Date())}>
            Hoy
          </NeoButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NeoButton variant="secondary" size="sm" onClick={handleRefrescar} disabled={cargando}>
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </NeoButton>
          <NeoButton variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </NeoButton>
        </div>
      </div>

      {/* FILTROS Y STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {/* Selector de emisora */}
        <NeoCard padding="small">
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: N.textSub, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emisora</label>
          <NeoSelect 
            value={emisoraSeleccionada} 
            onChange={(e) => setEmisoraSeleccionada(e.target.value)}
          >
            {EMISORAS_MOCK.map(em => (
              <option key={em.id} value={em.id}>
                {em.nombre}
              </option>
            ))}
          </NeoSelect>
        </NeoCard>

        {/* Filtro de horario */}
        <NeoCard padding="small">
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: N.textSub, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horario</label>
          <NeoSelect 
            value={vistaHoras} 
            onChange={(e) => setVistaHoras(e.target.value as typeof vistaHoras)}
          >
            <option value="todas">Todas las horas</option>
            <option value="prime">Solo Prime</option>
            <option value="manana">Mañana (06-12)</option>
            <option value="tarde">Tarde (12-21)</option>
          </NeoSelect>
        </NeoCard>

        {/* Stats rápidos */}
        <NeoCard padding="small">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: N.accent, textTransform: 'uppercase' }}>Spots Hoy</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: N.accent }}>{stats.total}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: N.accent, textTransform: 'uppercase' }}>Emitidos</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: N.accent }}>{stats.emitidos}</p>
            </div>
          </div>
        </NeoCard>

        {/* Cumplimiento */}
        <NeoCard padding="small">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e', textTransform: 'uppercase' }}>Cumplimiento</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>{stats.cumplimiento.toFixed(1)}%</p>
          </div>
          <div 
            style={{ 
              height: '8px', 
              borderRadius: '9999px', 
              background: N.base, 
              boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`,
              overflow: 'hidden'
            }}
          >
            <div
              style={{ 
                height: '100%', 
                borderRadius: '9999px', 
                background: '#22c55e',
                boxShadow: `2px 0 4px ${N.dark}`,
                width: `${Math.min(stats.cumplimiento, 100)}%`,
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </NeoCard>
      </div>

      {/* TIMELINE DE BLOQUES */}
      <NeoCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock className="w-5 h-5" style={{ color: N.accent }} />
          <h2 style={{ fontWeight: 'bold', color: N.text }}>{emisoraActual.nombre} - {fecha.toLocaleDateString('es-CL')}</h2>
          <span style={{ marginLeft: 'auto' }}>
            <NeoBadge color="blue">{bloquesFiltrados.length} bloques</NeoBadge>
          </span>
        </div>

        {/* Grid de bloques */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
          {bloquesFiltrados.map(bloque => {
            const estiloEstado = getEstadoBloque(bloque.estado);
            const saturacion = (bloque.duracionOcupada / bloque.duracionMaxima) * 100;
            const expandido = bloqueExpandido === bloque.id;
            
            return (
              <div
                key={bloque.id}
                style={{
                  borderRadius: '16px',
                  border: `1px solid ${estiloEstado.border}`,
                  background: estiloEstado.bg,
                  transition: 'all 0.2s'
                }}
              >
                {/* Header del bloque */}
                <div
                  style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setBloqueExpandido(expandido ? null : bloque.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '18px', fontWeight: 'bold', color: N.text }}>{bloque.horaInicio}</p>
                      <p style={{ fontSize: '11px', color: N.textSub }}>{bloque.horaFin}</p>
                    </div>
                    
                    <div style={{ height: '40px', width: '1px', background: `${N.dark}60` }} />
                    
                    <div>
                      <p style={{ fontWeight: 600, color: N.text }}>{bloque.nombre}</p>
                      <p style={{ fontSize: '11px', color: N.textSub }}>
                        {bloque.spots.length} spots • {bloque.duracionOcupada}s / {bloque.duracionMaxima}s
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Indicador de saturación */}
                    <div style={{ width: '96px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: N.textSub }}>Saturación</span>
                        <span style={{ color: saturacion >= 100 ? '#ef4444' : N.text, fontWeight: 'bold' }}>
                          {saturacion.toFixed(0)}%
                        </span>
                      </div>
                      <div 
                        style={{ 
                          height: '8px', 
                          borderRadius: '9999px', 
                          background: N.base, 
                          boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: '9999px',
                            background: getColorSaturacion(bloque.duracionOcupada, bloque.duracionMaxima),
                            width: `${Math.min(saturacion, 100)}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    {bloque.estado === 'en_aire' && (
                      <span 
                        style={{ 
                          padding: '2px 8px', 
                          borderRadius: '9999px', 
                          fontSize: '10px', 
                          fontWeight: 'bold', 
                          background: '#a855f7', 
                          color: '#fff',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                      >
                        🔴 EN AIRE
                      </span>
                    )}
                    {bloque.estado === 'completado' && (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                    )}
                    
                    {/* Alerta de saturación */}
                    {saturacion >= 100 && (
                      <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    )}
                  </div>
                </div>

                {/* Lista de spots (expandida) */}
                {expandido && (
                  <div 
                    style={{ 
                      borderTop: `1px solid ${N.dark}30`, 
                      padding: '12px', 
                      background: N.base,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {bloque.spots.map((spot, idx) => (
                      <div
                        key={spot.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px',
                          borderRadius: '12px',
                          background: N.base,
                          boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ 
                              background: N.base, 
                              boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`,
                              color: N.textSub
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '14px', color: N.text }}>{spot.anunciante}</p>
                            <p style={{ fontSize: '12px', color: N.textSub }}>{spot.campanaNombre}</p>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: N.textSub }}>{spot.duracion}s</span>
                          {getEstadoSpotBadge(spot.estado)}
                          <button 
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: N.base,
                              boxShadow: `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}`,
                              border: 'none',
                              cursor: 'pointer',
                              color: N.textSub
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </NeoCard>
    </div>
  );
}
