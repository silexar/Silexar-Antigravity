/**
 * 📄 SILEXAR PULSE - Generador de Propuestas Comerciales 2050
 * 
 * @description Sistema para crear propuestas comerciales profesionales
 * con simulador ROI, preview PDF y envío a clientes.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Send,
  Eye,
  Building2,
  Calendar,
  Radio,
  Smartphone,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  Share2,
  Copy,
  X
} from 'lucide-react';

import { NeoPageHeader, NeoCard, NeoButton, NeoInput, NeoTextarea, NeoSelect, NeoBadge, NeoCheckbox, N } from '../_lib/neumorphic';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface DatosPropuesta {
  // Cliente
  clienteId: string;
  clienteNombre: string;
  contactoNombre: string;
  contactoEmail: string;
  
  // Campaña
  nombreCampana: string;
  objetivo: string;
  fechaInicio: string;
  fechaFin: string;
  
  // Mix de medios
  emisorasSeleccionadas: { id: string; nombre: string; spots: number; costo: number }[];
  incluirDigital: boolean;
  formatosDigitales: string[];
  
  // Presupuesto
  presupuestoTotal: number;
  
  // Proyecciones
  reachEstimado: number;
  frequencyEstimado: number;
  grpsEstimados: number;
  impresionesDigitales: number;
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const CLIENTES_MOCK = [
  { id: 'cli_001', nombre: 'COCA-COLA CHILE', contacto: 'María González', email: 'maria.gonzalez@coca-cola.com' },
  { id: 'cli_002', nombre: 'BANCO CHILE', contacto: 'Carlos Pérez', email: 'cperez@bancochile.cl' },
  { id: 'cli_003', nombre: 'FALABELLA', contacto: 'Ana Martínez', email: 'ana.martinez@falabella.cl' }
];

const EMISORAS_PROPUESTA = [
  { id: 'em_001', nombre: 'Radio Pudahuel', audiencia: 850000, tarifa: 18000, rating: 8.5 },
  { id: 'em_002', nombre: 'ADN Radio', audiencia: 720000, tarifa: 22000, rating: 7.2 },
  { id: 'em_003', nombre: 'Radio Futuro', audiencia: 450000, tarifa: 15000, rating: 4.5 },
  { id: 'em_004', nombre: 'Oasis FM', audiencia: 380000, tarifa: 12000, rating: 3.8 },
  { id: 'em_005', nombre: 'Radio Activa', audiencia: 520000, tarifa: 16000, rating: 5.2 }
];

const FORMATOS_DIGITALES = [
  { id: 'banner', nombre: 'Display Banner', cpm: 3500 },
  { id: 'audio_ad', nombre: 'Audio Ad Streaming', cpm: 8000 },
  { id: 'video_preroll', nombre: 'Video Pre-roll', cpm: 15000 },
  { id: 'native', nombre: 'Native Content', cpm: 5000 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function NeoProgress({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: N.accent }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function GeneradorPropuestas() {
  const [paso, setPaso] = useState(1);
  const [generando, setGenerando] = useState(false);
  const [propuestaGenerada, setPropuestaGenerada] = useState(false);
  const [tabActivo, setTabActivo] = useState<'fm' | 'digital'>('fm');
  const [panelPreview, setPanelPreview] = useState(false);
  
  const [data, setData] = useState<DatosPropuesta>({
    clienteId: '',
    clienteNombre: '',
    contactoNombre: '',
    contactoEmail: '',
    nombreCampana: '',
    objetivo: '',
    fechaInicio: '',
    fechaFin: '',
    emisorasSeleccionadas: [],
    incluirDigital: false,
    formatosDigitales: [],
    presupuestoTotal: 0,
    reachEstimado: 0,
    frequencyEstimado: 0,
    grpsEstimados: 0,
    impresionesDigitales: 0
  });

  // Calcular métricas
  const metricas = useMemo(() => {
    let audienciaTotal = 0;
    let costoFM = 0;
    let grps = 0;

    data.emisorasSeleccionadas.forEach(em => {
      const emisora = EMISORAS_PROPUESTA.find(e => e.id === em.id);
      if (emisora) {
        audienciaTotal += emisora.audiencia;
        costoFM += em.spots * emisora.tarifa;
        grps += (em.spots * emisora.rating) / 100;
      }
    });

    const reach = Math.min(95, audienciaTotal / 10000);
    const frequency = data.emisorasSeleccionadas.reduce((acc, em) => acc + em.spots, 0) / 30;

    return {
      audienciaTotal,
      costoFM,
      grps: grps.toFixed(1),
      reach: reach.toFixed(1),
      frequency: frequency.toFixed(1),
      costoTotal: costoFM
    };
  }, [data.emisorasSeleccionadas]);

  // Actualizar campo
  const updateField = <K extends keyof DatosPropuesta>(key: K, value: DatosPropuesta[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Seleccionar cliente
  const handleSelectCliente = (clienteId: string) => {
    const cliente = CLIENTES_MOCK.find(c => c.id === clienteId);
    if (cliente) {
      updateField('clienteId', clienteId);
      updateField('clienteNombre', cliente.nombre);
      updateField('contactoNombre', cliente.contacto);
      updateField('contactoEmail', cliente.email);
    }
  };

  // Toggle emisora
  const toggleEmisora = (emisoraId: string) => {
    setData(prev => {
      const existe = prev.emisorasSeleccionadas.find(e => e.id === emisoraId);
      if (existe) {
        return {
          ...prev,
          emisorasSeleccionadas: prev.emisorasSeleccionadas.filter(e => e.id !== emisoraId)
        };
      } else {
        const emisora = EMISORAS_PROPUESTA.find(e => e.id === emisoraId);
        if (emisora) {
          return {
            ...prev,
            emisorasSeleccionadas: [
              ...prev.emisorasSeleccionadas,
              { id: emisoraId, nombre: emisora.nombre, spots: 120, costo: 120 * emisora.tarifa }
            ]
          };
        }
      }
      return prev;
    });
  };

  // Actualizar spots de emisora
  const updateSpots = (emisoraId: string, spots: number) => {
    setData(prev => ({
      ...prev,
      emisorasSeleccionadas: prev.emisorasSeleccionadas.map(em => {
        if (em.id === emisoraId) {
          const emisora = EMISORAS_PROPUESTA.find(e => e.id === emisoraId);
          return { ...em, spots, costo: spots * (emisora?.tarifa || 0) };
        }
        return em;
      })
    }));
  };

  // Generar propuesta
  const handleGenerar = async () => {
    setGenerando(true);
    await new Promise(r => setTimeout(r, 2000));
    setGenerando(false);
    setPropuestaGenerada(true);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <NeoPageHeader
          title="Generador de Propuestas"
          subtitle="Crea propuestas comerciales profesionales"
          icon={FileText}
          backHref="/campanas"
        />

        {/* Progress Wizard */}
        <NeoCard padding="small">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all"
                  style={{
                    background: paso >= n ? N.accent : N.base,
                    color: paso >= n ? '#fff' : N.textSub,
                    boxShadow: paso >= n 
                      ? `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}`
                      : `2px 2px 4px ${N.dark}, -2px -2px 4px ${N.light}`
                  }}
                >
                  {paso > n ? <CheckCircle2 className="w-5 h-5" /> : n}
                </div>
                {n < 4 && (
                  <div 
                    className="w-12 h-1 rounded-full mx-1"
                    style={{
                      background: paso > n ? N.accent : N.base,
                      boxShadow: paso > n ? 'none' : `inset 1px 1px 2px ${N.dark}, inset -1px -1px 2px ${N.light}`
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </NeoCard>

        <div className="grid grid-cols-3 gap-6">
          {/* CONTENIDO PRINCIPAL */}
          <div className="col-span-2 space-y-4">
            {/* PASO 1: CLIENTE */}
            {paso === 1 && (
              <NeoCard>
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5" style={{ color: N.accent }} />
                  <h2 className="text-lg font-black" style={{ color: N.text }}>Paso 1: Seleccionar Cliente</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Cliente / Anunciante</label>
                    <NeoSelect value={data.clienteId} onChange={(e) => handleSelectCliente(e.target.value)}>
                      <option value="">Seleccionar cliente...</option>
                      {CLIENTES_MOCK.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </NeoSelect>
                  </div>

                  {data.clienteId && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Contacto</label>
                          <NeoInput
                            value={data.contactoNombre}
                            onChange={(e) => updateField('contactoNombre', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Email</label>
                          <NeoInput
                            type="email"
                            aria-label="Email"
                            value={data.contactoEmail}
                            onChange={(e) => updateField('contactoEmail', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Nombre de la Campaña</label>
                        <NeoInput
                          placeholder="Ej: Campaña Verano 2025"
                          value={data.nombreCampana}
                          onChange={(e) => updateField('nombreCampana', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Objetivo de la Campaña</label>
                        <NeoTextarea
                          placeholder="Describe el objetivo principal..."
                          value={data.objetivo}
                          onChange={(e) => updateField('objetivo', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: N.textSub }}>
                            <Calendar className="w-4 h-4" />
                            Fecha Inicio
                          </label>
                          <NeoInput
                            type="date"
                            aria-label="Fecha Inicio"
                            value={data.fechaInicio}
                            onChange={(e) => updateField('fechaInicio', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: N.textSub }}>
                            <Calendar className="w-4 h-4" />
                            Fecha Fin
                          </label>
                          <NeoInput
                            type="date"
                            aria-label="Fecha Fin"
                            value={data.fechaFin}
                            onChange={(e) => updateField('fechaFin', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </NeoCard>
            )}

            {/* PASO 2: MIX DE MEDIOS */}
            {paso === 2 && (
              <NeoCard>
                <div className="flex items-center gap-2 mb-6">
                  <Radio className="w-5 h-5" style={{ color: N.accent }} />
                  <h2 className="text-lg font-black" style={{ color: N.text }}>Paso 2: Mix de Medios</h2>
                </div>

                {/* Tabs nativos neumórficos */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setTabActivo('fm')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: tabActivo === 'fm' ? N.accent : N.base,
                      color: tabActivo === 'fm' ? '#fff' : N.text,
                      boxShadow: tabActivo === 'fm' 
                        ? `inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.3)`
                        : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`
                    }}
                  >
                    <Radio className="w-4 h-4" />
                    Radio FM
                  </button>
                  <button
                    onClick={() => setTabActivo('digital')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: tabActivo === 'digital' ? N.accent : N.base,
                      color: tabActivo === 'digital' ? '#fff' : N.text,
                      boxShadow: tabActivo === 'digital' 
                        ? `inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.3)`
                        : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`
                    }}
                  >
                    <Smartphone className="w-4 h-4" />
                    Digital
                  </button>
                </div>

                {tabActivo === 'fm' && (
                  <div className="space-y-4">
                    <p className="text-sm font-bold" style={{ color: N.textSub }}>
                      Selecciona las emisoras y define la cantidad de spots por emisora.
                    </p>

                    <div className="space-y-3">
                      {EMISORAS_PROPUESTA.map(emisora => {
                        const seleccionada = data.emisorasSeleccionadas.find(e => e.id === emisora.id);
                        return (
                          <div
                            key={emisora.id}
                            className="p-4 rounded-2xl transition-all"
                            style={{
                              background: N.base,
                              boxShadow: seleccionada 
                                ? `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}`
                                : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`,
                              border: seleccionada ? `2px solid ${N.accent}` : '2px solid transparent'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <NeoCheckbox
                                  checked={!!seleccionada}
                                  onCheckedChange={() => toggleEmisora(emisora.id)}
                                />
                                <div>
                                  <p className="font-bold" style={{ color: N.text }}>{emisora.nombre}</p>
                                  <div className="flex items-center gap-3 text-xs font-bold" style={{ color: N.textSub }}>
                                    <span>{emisora.audiencia.toLocaleString()} oyentes</span>
                                    <span>Rating: {emisora.rating}</span>
                                    <span>${emisora.tarifa.toLocaleString()}/spot</span>
                                  </div>
                                </div>
                              </div>

                              {seleccionada && (
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <NeoInput
                                      type="number"
                                      aria-label={`Spots para ${emisora.nombre}`}
                                      value={seleccionada.spots}
                                      onChange={(e) => updateSpots(emisora.id, parseInt(e.target.value) || 0)}
                                      className="w-20 h-8 text-center"
                                    />
                                    <span className="text-xs font-bold" style={{ color: N.textSub }}>spots</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black" style={{ color: N.accent }}>
                                      ${seleccionada.costo.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tabActivo === 'digital' && (
                  <div className="space-y-4">
                    <div 
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` }}
                    >
                      <NeoCheckbox
                        checked={data.incluirDigital}
                        onCheckedChange={(checked) => updateField('incluirDigital', !!checked)}
                      />
                      <span className="font-bold" style={{ color: N.text }}>Incluir componente digital en la propuesta</span>
                    </div>

                    {data.incluirDigital && (
                      <div className="grid grid-cols-2 gap-3">
                        {FORMATOS_DIGITALES.map(formato => (
                          <div
                            key={formato.id}
                            className="p-4 rounded-2xl cursor-pointer transition-all"
                            style={{
                              background: N.base,
                              boxShadow: data.formatosDigitales.includes(formato.id)
                                ? `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}`
                                : `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}`,
                              border: data.formatosDigitales.includes(formato.id) ? `2px solid ${N.accent}` : '2px solid transparent'
                            }}
                            onClick={() => {
                              setData(prev => ({
                                ...prev,
                                formatosDigitales: prev.formatosDigitales.includes(formato.id)
                                  ? prev.formatosDigitales.filter(f => f !== formato.id)
                                  : [...prev.formatosDigitales, formato.id]
                              }));
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <NeoCheckbox checked={data.formatosDigitales.includes(formato.id)} onCheckedChange={() => {}} />
                              <span className="font-bold" style={{ color: N.text }}>{formato.nombre}</span>
                            </div>
                            <p className="text-xs font-bold mt-1" style={{ color: N.textSub }}>
                              CPM: ${formato.cpm.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </NeoCard>
            )}

            {/* PASO 3: SIMULADOR ROI */}
            {paso === 3 && (
              <NeoCard>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5" style={{ color: N.accent }} />
                  <h2 className="text-lg font-black" style={{ color: N.text }}>Paso 3: Simulador de Resultados</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Métricas proyectadas */}
                  <div className="space-y-4">
                    <h3 className="font-bold" style={{ color: N.text }}>📊 Proyecciones de Campaña</h3>
                    
                    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Reach Estimado</span>
                        <span className="text-2xl font-black" style={{ color: N.accent }}>{metricas.reach}%</span>
                      </div>
                      <NeoProgress value={parseFloat(metricas.reach)} className="h-2" />
                    </div>

                    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Frequency</span>
                        <span className="text-2xl font-black" style={{ color: N.accent }}>{metricas.frequency}x</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: N.textSub }}>Promedio de exposiciones por persona</p>
                    </div>

                    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>GRPs Totales</span>
                        <span className="text-2xl font-black" style={{ color: '#22c55e' }}>{metricas.grps}</span>
                      </div>
                      <p className="text-xs font-bold" style={{ color: N.textSub }}>Gross Rating Points</p>
                    </div>
                  </div>

                  {/* Audiencia */}
                  <div className="space-y-4">
                    <h3 className="font-bold" style={{ color: N.text }}>👥 Audiencia Potencial</h3>

                    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="w-8 h-8" style={{ color: N.accent }} />
                        <div>
                          <p className="text-2xl font-black" style={{ color: N.text }}>
                            {metricas.audienciaTotal.toLocaleString()}
                          </p>
                          <p className="text-xs font-bold" style={{ color: N.textSub }}>Oyentes únicos potenciales</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                      <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: N.textSub }}>Distribución por Emisora</h4>
                      <div className="space-y-2">
                        {data.emisorasSeleccionadas.map(em => {
                          const emisora = EMISORAS_PROPUESTA.find(e => e.id === em.id);
                          const porcentaje = emisora 
                            ? (emisora.audiencia / metricas.audienciaTotal) * 100 
                            : 0;
                          return (
                            <div key={em.id}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-bold" style={{ color: N.text }}>{em.nombre}</span>
                                <span className="font-black" style={{ color: N.accent }}>{porcentaje.toFixed(1)}%</span>
                              </div>
                              <NeoProgress value={porcentaje} className="h-1.5" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </NeoCard>
            )}

            {/* PASO 4: PREVIEW Y GENERAR */}
            {paso === 4 && (
              <NeoCard>
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5" style={{ color: N.accent }} />
                  <h2 className="text-lg font-black" style={{ color: N.text }}>Paso 4: Preview y Generar</h2>
                </div>

                {!propuestaGenerada ? (
                  <div className="space-y-6">
                    {/* Resumen */}
                    <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                      <h3 className="font-black mb-3" style={{ color: N.text }}>📋 Resumen de la Propuesta</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span style={{ color: N.textSub }}>Cliente:</span>
                          <p className="font-bold" style={{ color: N.text }}>{data.clienteNombre}</p>
                        </div>
                        <div>
                          <span style={{ color: N.textSub }}>Campaña:</span>
                          <p className="font-bold" style={{ color: N.text }}>{data.nombreCampana}</p>
                        </div>
                        <div>
                          <span style={{ color: N.textSub }}>Período:</span>
                          <p className="font-bold" style={{ color: N.text }}>{data.fechaInicio} - {data.fechaFin}</p>
                        </div>
                        <div>
                          <span style={{ color: N.textSub }}>Emisoras:</span>
                          <p className="font-bold" style={{ color: N.text }}>{data.emisorasSeleccionadas.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Generar */}
                    <div className="flex justify-center">
                      <NeoButton
                        variant="primary"
                        onClick={handleGenerar}
                        disabled={generando}
                      >
                        {generando ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generando Propuesta...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Generar Propuesta PDF
                          </>
                        )}
                      </NeoButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div 
                      className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                      style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}
                    >
                      <CheckCircle2 className="w-10 h-10" style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black" style={{ color: N.text }}>¡Propuesta Generada!</h3>
                      <p className="text-sm font-bold" style={{ color: N.textSub }}>La propuesta está lista para descargar o enviar.</p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <NeoButton variant="secondary" onClick={() => setPanelPreview(true)}>
                        <Eye className="w-4 h-4" />
                        Ver Preview
                      </NeoButton>
                      <NeoButton variant="secondary">
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </NeoButton>
                      <NeoButton variant="primary">
                        <Send className="w-4 h-4" />
                        Enviar a Cliente
                      </NeoButton>
                    </div>

                    <div className="flex justify-center gap-2">
                      <NeoButton variant="ghost" size="sm">
                        <Copy className="w-3 h-3" />
                        Copiar Link
                      </NeoButton>
                      <NeoButton variant="ghost" size="sm">
                        <Share2 className="w-3 h-3" />
                        Compartir
                      </NeoButton>
                    </div>
                  </div>
                )}
              </NeoCard>
            )}

            {/* Navegación */}
            <div className="flex justify-between">
              <NeoButton
                variant="secondary"
                onClick={() => setPaso(p => Math.max(1, p - 1))}
                disabled={paso === 1}
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </NeoButton>
              <NeoButton
                variant="primary"
                onClick={() => setPaso(p => Math.min(4, p + 1))}
                disabled={paso === 4}
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </NeoButton>
            </div>
          </div>

          {/* SIDEBAR: RESUMEN EN VIVO */}
          <div className="space-y-4">
            <NeoCard padding="small">
              <h3 className="font-black mb-4 flex items-center gap-2" style={{ color: N.text }}>
                <DollarSign className="w-5 h-5" style={{ color: N.accent }} />
                💰 Inversión Total
              </h3>
              
              <div className="text-center mb-4">
                <p className="text-3xl font-black" style={{ color: N.accent }}>
                  ${metricas.costoTotal.toLocaleString('es-CL')}
                </p>
                <p className="text-xs font-bold" style={{ color: N.textSub }}>CLP + IVA</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded-xl" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                  <span className="font-bold" style={{ color: N.textSub }}>Radio FM</span>
                  <span className="font-black" style={{ color: N.text }}>${metricas.costoFM.toLocaleString()}</span>
                </div>
                {data.incluirDigital && (
                  <div className="flex justify-between p-2 rounded-xl" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                    <span className="font-bold" style={{ color: N.textSub }}>Digital</span>
                    <span className="font-black" style={{ color: N.text }}>Por cotizar</span>
                  </div>
                )}
              </div>
            </NeoCard>

            <NeoCard padding="small">
              <h3 className="font-black mb-3 flex items-center gap-2" style={{ color: N.text }}>
                <Target className="w-5 h-5" style={{ color: N.accent }} />
                📊 Métricas Clave
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: N.textSub }}>Reach</span>
                  <NeoBadge color="purple">
                    {metricas.reach}%
                  </NeoBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: N.textSub }}>Frequency</span>
                  <NeoBadge color="blue">
                    {metricas.frequency}x
                  </NeoBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: N.textSub }}>GRPs</span>
                  <NeoBadge color="green">
                    {metricas.grps}
                  </NeoBadge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: N.textSub }}>Audiencia</span>
                  <NeoBadge color="yellow">
                    {(metricas.audienciaTotal / 1000).toFixed(0)}K
                  </NeoBadge>
                </div>
              </div>
            </NeoCard>

            <NeoCard padding="small">
              <h3 className="font-black mb-3" style={{ color: N.text }}>✅ Checklist</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${data.clienteId ? '' : ''}`} style={{ color: data.clienteId ? '#22c55e' : N.textSub }} />
                  <span className="font-bold" style={{ color: data.clienteId ? N.text : N.textSub }}>Cliente seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: data.nombreCampana ? '#22c55e' : N.textSub }} />
                  <span className="font-bold" style={{ color: data.nombreCampana ? N.text : N.textSub }}>Nombre de campaña</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: data.emisorasSeleccionadas.length > 0 ? '#22c55e' : N.textSub }} />
                  <span className="font-bold" style={{ color: data.emisorasSeleccionadas.length > 0 ? N.text : N.textSub }}>Mix de medios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: data.fechaInicio && data.fechaFin ? '#22c55e' : N.textSub }} />
                  <span className="font-bold" style={{ color: data.fechaInicio && data.fechaFin ? N.text : N.textSub }}>Fechas definidas</span>
                </div>
              </div>
            </NeoCard>
          </div>
        </div>

        {/* Panel Preview inline (sin modal bloqueante) */}
        {panelPreview && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
            <div className="absolute inset-0" onClick={() => setPanelPreview(false)} />
            <NeoCard className="relative w-full max-w-3xl max-h-[85vh] overflow-auto" style={{ zIndex: 10 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg" style={{ color: N.text }}>Vista Previa de Propuesta</h3>
                <NeoButton variant="ghost" size="icon" onClick={() => setPanelPreview(false)}>
                  <X className="w-4 h-4" />
                </NeoButton>
              </div>
              <div className="p-6 rounded-2xl space-y-4" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                <div className="text-center border-b pb-4" style={{ borderColor: `${N.dark}40` }}>
                  <h2 className="text-2xl font-black" style={{ color: N.text }}>{data.nombreCampana || 'Propuesta Comercial'}</h2>
                  <p className="text-sm font-bold" style={{ color: N.textSub }}>{data.clienteNombre}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-bold" style={{ color: N.textSub }}>Contacto:</span>
                    <p style={{ color: N.text }}>{data.contactoNombre}</p>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: N.textSub }}>Email:</span>
                    <p style={{ color: N.text }}>{data.contactoEmail}</p>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: N.textSub }}>Período:</span>
                    <p style={{ color: N.text }}>{data.fechaInicio} - {data.fechaFin}</p>
                  </div>
                  <div>
                    <span className="font-bold" style={{ color: N.textSub }}>Inversión:</span>
                    <p className="font-black" style={{ color: N.accent }}>${metricas.costoTotal.toLocaleString('es-CL')}</p>
                  </div>
                </div>
                <div>
                  <span className="font-bold" style={{ color: N.textSub }}>Objetivo:</span>
                  <p style={{ color: N.text }}>{data.objetivo || 'No especificado'}</p>
                </div>
                <div>
                  <span className="font-bold" style={{ color: N.textSub }}>Emisoras seleccionadas:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.emisorasSeleccionadas.map(em => (
                      <NeoBadge key={em.id} color="blue">{em.nombre}</NeoBadge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                    <p className="font-black" style={{ color: N.accent }}>{metricas.reach}%</p>
                    <p className="text-xs font-bold" style={{ color: N.textSub }}>Reach</p>
                  </div>
                  <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                    <p className="font-black" style={{ color: N.accent }}>{metricas.frequency}x</p>
                    <p className="text-xs font-bold" style={{ color: N.textSub }}>Frequency</p>
                  </div>
                  <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: `inset 2px 2px 4px ${N.dark}, inset -2px -2px 4px ${N.light}` }}>
                    <p className="font-black" style={{ color: '#22c55e' }}>{metricas.grps}</p>
                    <p className="text-xs font-bold" style={{ color: N.textSub }}>GRPs</p>
                  </div>
                </div>
              </div>
            </NeoCard>
          </div>
        )}
      </div>
    </div>
  );
}
