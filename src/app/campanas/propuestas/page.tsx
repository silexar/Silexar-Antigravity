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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// Slider removed - not used
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
  Copy
} from 'lucide-react';

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
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function GeneradorPropuestas() {
  const [paso, setPaso] = useState(1);
  const [generando, setGenerando] = useState(false);
  const [propuestaGenerada, setPropuestaGenerada] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📄 Generador de Propuestas</h1>
            <p className="text-gray-500">Crea propuestas comerciales profesionales</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                paso >= n ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {paso > n ? <CheckCircle2 className="w-5 h-5" /> : n}
              </div>
              {n < 4 && (
                <div className={`w-12 h-1 ${paso > n ? 'bg-purple-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* CONTENIDO PRINCIPAL */}
        <div className="col-span-2">
          {/* PASO 1: CLIENTE */}
          {paso === 1 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold">Paso 1: Seleccionar Cliente</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente / Anunciante</Label>
                  <Select value={data.clienteId} onValueChange={handleSelectCliente}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CLIENTES_MOCK.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {data.clienteId && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contacto</Label>
                        <Input
                          value={data.contactoNombre}
                          onChange={(e) => updateField('contactoNombre', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={data.contactoEmail}
                          onChange={(e) => updateField('contactoEmail', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Nombre de la Campaña</Label>
                      <Input
                        placeholder="Ej: Campaña Verano 2025"
                        value={data.nombreCampana}
                        onChange={(e) => updateField('nombreCampana', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Objetivo de la Campaña</Label>
                      <Textarea
                        placeholder="Describe el objetivo principal..."
                        value={data.objetivo}
                        onChange={(e) => updateField('objetivo', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fecha Inicio
                        </Label>
                        <Input
                          type="date"
                          value={data.fechaInicio}
                          onChange={(e) => updateField('fechaInicio', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fecha Fin
                        </Label>
                        <Input
                          type="date"
                          value={data.fechaFin}
                          onChange={(e) => updateField('fechaFin', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* PASO 2: MIX DE MEDIOS */}
          {paso === 2 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold">Paso 2: Mix de Medios</h2>
              </div>

              <Tabs defaultValue="fm">
                <TabsList className="mb-4">
                  <TabsTrigger value="fm" className="gap-2">
                    <Radio className="w-4 h-4" />
                    Radio FM
                  </TabsTrigger>
                  <TabsTrigger value="digital" className="gap-2">
                    <Smartphone className="w-4 h-4" />
                    Digital
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="fm">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Selecciona las emisoras y define la cantidad de spots por emisora.
                    </p>

                    <div className="space-y-3">
                      {EMISORAS_PROPUESTA.map(emisora => {
                        const seleccionada = data.emisorasSeleccionadas.find(e => e.id === emisora.id);
                        return (
                          <div
                            key={emisora.id}
                            className={`p-4 border rounded-lg transition-all ${
                              seleccionada ? 'border-purple-300 bg-purple-50' : 'hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={!!seleccionada}
                                  onCheckedChange={() => toggleEmisora(emisora.id)}
                                />
                                <div>
                                  <p className="font-medium">{emisora.nombre}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{emisora.audiencia.toLocaleString()} oyentes</span>
                                    <span>Rating: {emisora.rating}</span>
                                    <span>${emisora.tarifa.toLocaleString()}/spot</span>
                                  </div>
                                </div>
                              </div>

                              {seleccionada && (
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <Input
                                      type="number"
                                      value={seleccionada.spots}
                                      onChange={(e) => updateSpots(emisora.id, parseInt(e.target.value) || 0)}
                                      className="w-20 h-8 text-center"
                                    />
                                    <span className="text-xs text-gray-500">spots</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-purple-600">
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
                </TabsContent>

                <TabsContent value="digital">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Checkbox
                        checked={data.incluirDigital}
                        onCheckedChange={(checked) => updateField('incluirDigital', !!checked)}
                      />
                      <span className="font-medium">Incluir componente digital en la propuesta</span>
                    </div>

                    {data.incluirDigital && (
                      <div className="grid grid-cols-2 gap-3">
                        {FORMATOS_DIGITALES.map(formato => (
                          <div
                            key={formato.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              data.formatosDigitales.includes(formato.id)
                                ? 'border-blue-300 bg-blue-50'
                                : 'hover:border-gray-300'
                            }`}
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
                              <Checkbox checked={data.formatosDigitales.includes(formato.id)} />
                              <span className="font-medium">{formato.nombre}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              CPM: ${formato.cpm.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}

          {/* PASO 3: SIMULADOR ROI */}
          {paso === 3 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold">Paso 3: Simulador de Resultados</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Métricas proyectadas */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">📊 Proyecciones de Campaña</h3>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-700">Reach Estimado</span>
                      <span className="text-2xl font-bold text-purple-900">{metricas.reach}%</span>
                    </div>
                    <Progress value={parseFloat(metricas.reach)} className="h-2" />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-700">Frequency</span>
                      <span className="text-2xl font-bold text-blue-900">{metricas.frequency}x</span>
                    </div>
                    <p className="text-xs text-blue-600">Promedio de exposiciones por persona</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700">GRPs Totales</span>
                      <span className="text-2xl font-bold text-green-900">{metricas.grps}</span>
                    </div>
                    <p className="text-xs text-green-600">Gross Rating Points</p>
                  </div>
                </div>

                {/* Audiencia */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">👥 Audiencia Potencial</h3>

                  <div className="p-4 bg-white border rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">
                          {metricas.audienciaTotal.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Oyentes únicos potenciales</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border rounded-xl">
                    <h4 className="text-sm font-medium mb-3">Distribución por Emisora</h4>
                    <div className="space-y-2">
                      {data.emisorasSeleccionadas.map(em => {
                        const emisora = EMISORAS_PROPUESTA.find(e => e.id === em.id);
                        const porcentaje = emisora 
                          ? (emisora.audiencia / metricas.audienciaTotal) * 100 
                          : 0;
                        return (
                          <div key={em.id}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{em.nombre}</span>
                              <span>{porcentaje.toFixed(1)}%</span>
                            </div>
                            <Progress value={porcentaje} className="h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* PASO 4: PREVIEW Y GENERAR */}
          {paso === 4 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold">Paso 4: Preview y Generar</h2>
              </div>

              {!propuestaGenerada ? (
                <div className="space-y-6">
                  {/* Resumen */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold mb-3">📋 Resumen de la Propuesta</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cliente:</span>
                        <p className="font-medium">{data.clienteNombre}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Campaña:</span>
                        <p className="font-medium">{data.nombreCampana}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Período:</span>
                        <p className="font-medium">{data.fechaInicio} - {data.fechaFin}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Emisoras:</span>
                        <p className="font-medium">{data.emisorasSeleccionadas.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Generar */}
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
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
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">¡Propuesta Generada!</h3>
                    <p className="text-gray-500">La propuesta está lista para descargar o enviar.</p>
                  </div>

                  <div className="flex justify-center gap-3">
                    <Button variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Ver Preview
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                      <Send className="w-4 h-4" />
                      Enviar a Cliente
                    </Button>
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Copy className="w-3 h-3" />
                      Copiar Link
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 className="w-3 h-3" />
                      Compartir
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Navegación */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => setPaso(p => Math.max(1, p - 1))}
              disabled={paso === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>
            <Button
              onClick={() => setPaso(p => Math.min(4, p + 1))}
              disabled={paso === 4}
              className="gap-2"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* SIDEBAR: RESUMEN EN VIVO */}
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              💰 Inversión Total
            </h3>
            
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-purple-700">
                ${metricas.costoTotal.toLocaleString('es-CL')}
              </p>
              <p className="text-sm text-purple-600">CLP + IVA</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-white rounded">
                <span className="text-gray-600">Radio FM</span>
                <span className="font-medium">${metricas.costoFM.toLocaleString()}</span>
              </div>
              {data.incluirDigital && (
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-gray-600">Digital</span>
                  <span className="font-medium">Por cotizar</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              📊 Métricas Clave
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reach</span>
                <Badge variant="outline" className="bg-purple-50">
                  {metricas.reach}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frequency</span>
                <Badge variant="outline" className="bg-blue-50">
                  {metricas.frequency}x
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GRPs</span>
                <Badge variant="outline" className="bg-green-50">
                  {metricas.grps}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Audiencia</span>
                <Badge variant="outline" className="bg-amber-50">
                  {(metricas.audienciaTotal / 1000).toFixed(0)}K
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">✅ Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${data.clienteId ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={data.clienteId ? '' : 'text-gray-400'}>Cliente seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${data.nombreCampana ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={data.nombreCampana ? '' : 'text-gray-400'}>Nombre de campaña</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${data.emisorasSeleccionadas.length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={data.emisorasSeleccionadas.length > 0 ? '' : 'text-gray-400'}>Mix de medios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${data.fechaInicio && data.fechaFin ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={data.fechaInicio && data.fechaFin ? '' : 'text-gray-400'}>Fechas definidas</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
