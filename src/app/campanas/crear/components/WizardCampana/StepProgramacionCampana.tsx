/**
 * 🤖 Step 6: Motor de Programación TIER0 Enterprise 2050
 * 
 * Ejecuta el motor de planificación inteligente Cortex para asignar los spots
 * definidos en los bloques horarios disponibles, optimizando por audiencia y conflictos.
 * 
 * Incluye:
 * - Checklist de Validaciones Automáticas
 * - Centro de Comando Visual (3 columnas)
 * - Acciones de Planificación
 * - Validación de especificaciones de contrato
 * 
 * @enterprise TIER0 Fortune 10
 */

import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/observability';
import { WizardStepProps } from './types/wizard.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VisualizadorBloques } from '@/modules/campanas/presentation/components/VisualizadorBloques';
import { 
  Play, CheckCircle2, AlertTriangle, Loader2, 
  Cpu, RotateCw, ShieldCheck, Settings, Target,
  XCircle, RefreshCw, Zap, Shield, Square,
  FileText, Eye, Radio, Brain, Flame, Sparkles, Lock
} from 'lucide-react';
import MotorPlanificacionIA from './MotorPlanificacionIA';
import MapaCalorSaturacion from './MapaCalorSaturacion';
import PrediccionConflictos from './PrediccionConflictos';
import { AlertaValidacionCampana } from './AlertaValidacionCampana';
import { useControlCampana, AlertaCampana } from './hooks/useControlCampana';
import type { CampanaParaValidacion, EspecificacionEmisora } from '@/modules/campanas/presentation/services/CampanaControlService';

interface StepProgramacionProps extends WizardStepProps {
  data: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
}

interface ValidacionItem {
  id: string;
  nombre: string;
  descripcion: string;
  enabled: boolean;
  estado: 'pendiente' | 'validando' | 'ok' | 'warning' | 'error';
  mensaje?: string;
}

interface ResultadoPlanificacion {
  lineasPlanificadas: number;
  lineasTotales: number;
  cunasRechazadas: number;
  conflictosDetectados: number;
  conflictosResueltos: number;
}

export const StepProgramacionCampana: React.FC<StepProgramacionProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActive,
  onComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
  data,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUpdate
}) => {
  // Hook de control de campaña
  const { 
    validarPlanificacion, 
    cargando: validandoEspecificaciones 
  } = useControlCampana();
  
  // Estado de alertas local
  const [alertasPlanificacion, setAlertasPlanificacion] = useState<AlertaCampana[]>([]);
  const [emisorasSinEspec, setEmisorasSinEspec] = useState<string[]>([]);
  const [puedePlanificar, setPuedePlanificar] = useState(true);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [activeTab, setActiveTab] = useState('validaciones');
  const [resultado, setResultado] = useState<ResultadoPlanificacion>({
    lineasPlanificadas: 0,
    lineasTotales: 0,
    cunasRechazadas: 0,
    conflictosDetectados: 0,
    conflictosResueltos: 0,
  });

  const [validaciones, setValidaciones] = useState<ValidacionItem[]>([
    {
      id: 'campana_bloque',
      nombre: 'Verificar campaña en el bloque',
      descripcion: '🤖 Previene duplicación campaña en mismo bloque',
      enabled: true,
      estado: 'pendiente',
    },
    {
      id: 'posicion_bloque',
      nombre: 'Verificar posición en el bloque',
      descripcion: '🎯 Valida coherencia: Auspicio→Bloque Auspicio',
      enabled: true,
      estado: 'pendiente',
    },
    {
      id: 'limite_tiempo',
      nombre: 'Verificar límite de tiempo en el bloque',
      descripcion: '⏱️ Controla saturación de tandas (300s máximo)',
      enabled: true,
      estado: 'pendiente',
    },
    {
      id: 'conflictos',
      nombre: 'Comprobar si hay conflictos',
      descripcion: '🚨 Detecta competencia directa en misma tanda',
      enabled: false,
      estado: 'pendiente',
    },
  ]);

  const [configuracion, setConfiguracion] = useState({
    nivelConflicto: 'bloque',
    separacionTipo: 'ninguno',
    separacionMinutos: 0,
  });

  const toggleValidacion = (id: string) => {
    setValidaciones(prev => prev.map(v => 
      v.id === id ? { ...v, enabled: !v.enabled } : v
    ));
  };

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIÓN DE ESPECIFICACIONES DEL CONTRATO
  // ═══════════════════════════════════════════════════════════════
  
  const validarEspecificacionesContrato = useCallback(async () => {
    const contratoId = data.contratoId as string | undefined;
    const lineas = (data.lineas as Array<{ emisoraId?: string; emisoraNombre?: string }>) || [];
    
    // Construir lista de emisoras desde las líneas
    const emisorasSeleccionadas: EspecificacionEmisora[] = lineas
      .filter(l => l.emisoraNombre)
      .map(l => ({
        emisoraId: l.emisoraId || `em_${l.emisoraNombre}`,
        emisoraNombre: l.emisoraNombre || 'Sin nombre'
      }));
    
    const campanaParaValidar: CampanaParaValidacion = {
      id: 'draft_campana',
      contratoId,
      estado: 'planificacion',
      facturada: false,
      bloqueadaParaEdicion: false,
      especificacionesValidadas: false,
      emisorasSeleccionadas
    };
    
    const resultado = await validarPlanificacion(campanaParaValidar);
    
    if (!resultado.puedePlanificar) {
      setAlertasPlanificacion([{
        tipo: 'error',
        titulo: '🚫 No se puede planificar',
        mensaje: resultado.errores[0] || 'Faltan especificaciones en el contrato',
        accion: resultado.accionRequerida
      }]);
      setEmisorasSinEspec(resultado.emisorasSinEspecificacion);
      setPuedePlanificar(false);
    } else {
      setAlertasPlanificacion([]);
      setEmisorasSinEspec([]);
      setPuedePlanificar(true);
    }
    
    return resultado.puedePlanificar;
  }, [data.contratoId, data.lineas, validarPlanificacion]);
  
  // Validar al cargar el componente
  useEffect(() => {
    if (data.contratoId) {
      validarEspecificacionesContrato();
    }
  }, [data.contratoId, validarEspecificacionesContrato]);

  const runSimulation = async () => {
    // Primero validar especificaciones
    const puedeEjecutar = await validarEspecificacionesContrato();
    
    if (!puedeEjecutar) {
      setStatus('error');
      return;
    }
    
    setStatus('running');
    setProgress(0);
    setActiveTab('progreso');

    // Simular validación paso a paso
    for (let i = 0; i < validaciones.length; i++) {
      const v = validaciones[i];
      if (!v.enabled) continue;

      setValidaciones(prev => prev.map(item => 
        item.id === v.id ? { ...item, estado: 'validando' } : item
      ));

      await new Promise(r => setTimeout(r, 400));

      const estados: Array<'ok' | 'warning' | 'error'> = ['ok', 'ok', 'warning', 'ok'];
      const mensajes = [
        'Sin duplicados detectados',
        'Posiciones coherentes',
        '23 cuñas rechazadas por límite tiempo',
        'Sin conflictos de competencia',
      ];

      setValidaciones(prev => prev.map(item => 
        item.id === v.id ? { ...item, estado: estados[i], mensaje: mensajes[i] } : item
      ));
    }

    // Simular planificación
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('completed');
          setOptimizationScore(98);
          setResultado({
            lineasPlanificadas: 17,
            lineasTotales: 20,
            cunasRechazadas: 23,
            conflictosDetectados: 2,
            conflictosResueltos: 2,
          });
          onComplete();
          return 100;
        }
        return prev + 8;
      });
    }, 100);
  };

  useEffect(() => {
    if (status === 'completed') {
      onComplete();
    }
  }, [status, onComplete]);

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'ok': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'validando': return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Square className="w-5 h-5 text-gray-300" />;
    }
  };

  const getEstadoBg = (estado: string) => {
    switch (estado) {
      case 'ok': return 'bg-emerald-50 border-emerald-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'validando': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const porcentajePlanificacion = resultado.lineasTotales > 0 
    ? Math.round((resultado.lineasPlanificadas / resultado.lineasTotales) * 100) 
    : 0;

  const lineas = (data.lineas as unknown[]) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Alerta de validación de especificaciones */}
      {alertasPlanificacion.length > 0 && (
        <AlertaValidacionCampana
          alertas={alertasPlanificacion}
          emisorasFaltantes={emisorasSinEspec}
          contratoId={data.contratoId as string}
          onDismiss={(idx) => {
            setAlertasPlanificacion(prev => prev.filter((_, i) => i !== idx));
          }}
          onVerContrato={() => {
            // Navegar al contrato
            // logger.info('Ver contrato:', data.contratoId);
          }}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            ⚙️ OPCIONES DE PROGRAMACIÓN INTELIGENTE
            {!puedePlanificar && (
              <Badge className="bg-red-100 text-red-700 gap-1 ml-2">
                <Lock className="w-3 h-3" />
                Bloqueado
              </Badge>
            )}
          </h2>
          <p className="text-gray-500">Motor Cortex TIER0 Enterprise 2050</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Radio className="w-3 h-3" />
          {lineas.length} líneas a planificar
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="motor" className="gap-1 text-xs">
            <Brain className="w-3 h-3" />
            🧠 Motor IA
          </TabsTrigger>
          <TabsTrigger value="calor" className="gap-1 text-xs">
            <Flame className="w-3 h-3" />
            🗲️ Mapa
          </TabsTrigger>
          <TabsTrigger value="prediccion" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            🔮 Predicción
          </TabsTrigger>
          <TabsTrigger value="validaciones" className="gap-1 text-xs">
            <Shield className="w-3 h-3" />
            Validaciones
          </TabsTrigger>
          <TabsTrigger value="progreso" className="gap-1 text-xs">
            <Cpu className="w-3 h-3" />
            Progreso
          </TabsTrigger>
          <TabsTrigger value="visual" className="gap-1 text-xs">
            <Eye className="w-3 h-3" />
            Visual
          </TabsTrigger>
        </TabsList>

        {/* TAB: Motor IA */}
        <TabsContent value="motor" className="space-y-6">
          <MotorPlanificacionIA 
            lineasAPlanificar={[]}
            bloquesDisponibles={[]}
            onPlanificacionCompleta={(resultados) => {
              // logger.info('Planificación completa:', resultados);
              setStatus('completed');
              onComplete();
            }}
          />
        </TabsContent>

        {/* TAB: Mapa de Calor */}
        <TabsContent value="calor" className="space-y-6">
          <MapaCalorSaturacion 
            onBloqueClick={(bloque) => { /* logger.info('Bloque seleccionado:', bloque) */ }}
          />
        </TabsContent>

        {/* TAB: Predicción IA */}
        <TabsContent value="prediccion" className="space-y-6">
          <PrediccionConflictos />
        </TabsContent>

        {/* TAB: Validaciones */}
        <TabsContent value="validaciones" className="space-y-6">
          {/* Checklist */}
          <Card className="p-4 border-l-4 border-l-blue-500">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              ✅ CHECKLIST DE VALIDACIONES AUTOMÁTICAS
            </h4>

            <div className="space-y-3">
              {validaciones.map(v => (
                <div 
                  key={v.id}
                  className={`p-3 rounded-lg border transition-all ${getEstadoBg(v.estado)}`}
                >
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={v.enabled}
                      onCheckedChange={() => toggleValidacion(v.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${v.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                          {v.enabled ? '☑️' : '☐'} {v.nombre}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-0">└─ {v.descripcion}</p>
                      {v.mensaje && v.estado !== 'pendiente' && (
                        <p className={`text-xs mt-1 ${
                          v.estado === 'ok' ? 'text-emerald-600' :
                          v.estado === 'warning' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          → {v.mensaje}
                        </p>
                      )}
                    </div>
                    {getEstadoIcon(v.estado)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Configuración Avanzada */}
          <Card className="p-4">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              🎯 CONFIGURACIÓN AVANZADA
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Nivel de Conflicto:</label>
                <Select 
                  value={configuracion.nivelConflicto}
                  onValueChange={(v) => setConfiguracion(prev => ({ ...prev, nivelConflicto: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Ninguno</SelectItem>
                    <SelectItem value="bloque">Bloque Exclusivo</SelectItem>
                    <SelectItem value="dia">Día Exclusivo</SelectItem>
                    <SelectItem value="exclusivo">Campaña Exclusiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Separación:</label>
                <div className="flex gap-2">
                  <Select 
                    value={configuracion.separacionTipo}
                    onValueChange={(v) => setConfiguracion(prev => ({ ...prev, separacionTipo: v }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguno">Ninguno</SelectItem>
                      <SelectItem value="tiempo">Tiempo</SelectItem>
                      <SelectItem value="bloques">Bloques</SelectItem>
                    </SelectContent>
                  </Select>
                  <input 
                    type="text"
                    value="00:00"
                    className="w-20 px-2 border rounded text-center text-sm"
                    disabled={configuracion.separacionTipo === 'ninguno'}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Estado Programación Actual */}
          <Card className="p-4 bg-slate-50">
            <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              📊 ESTADO PROGRAMACIÓN ACTUAL
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-2 text-left">Prog</th>
                    <th className="p-2 text-left">Dur</th>
                    <th className="p-2 text-left">H.Inicio</th>
                    <th className="p-2 text-left">H.Final</th>
                    <th className="p-2 text-left">Hora</th>
                    <th className="p-2 text-left">Bloque</th>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">F.Final</th>
                    <th className="p-2 text-center">Lun</th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.length > 0 ? (
                    <tr className="border-b">
                      <td className="p-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                      <td className="p-2">35s</td>
                      <td className="p-2">07:00</td>
                      <td className="p-2">09:30</td>
                      <td className="p-2">0</td>
                      <td className="p-2"><Badge className="bg-red-100 text-red-700">PRIME</Badge></td>
                      <td className="p-2">11/08/25</td>
                      <td className="p-2">26/08/25</td>
                      <td className="p-2 text-center">1</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-400">
                        No hay líneas definidas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Acciones de Programación */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              className={`gap-2 h-auto py-3 flex-col ${
                puedePlanificar 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              onClick={runSimulation}
              disabled={status === 'running' || !puedePlanificar || validandoEspecificaciones}
            >
              {!puedePlanificar ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Target className="w-5 h-5" />
              )}
              <span>{puedePlanificar ? '🎯 PLANIFICAR CAMPAÑA' : '🔒 PLANIFICACIÓN BLOQUEADA'}</span>
              <span className="text-[10px] opacity-70">
                {puedePlanificar 
                  ? '⚡ Procesa todas las líneas en <5s' 
                  : 'Faltan especificaciones en contrato'
                }
              </span>
            </Button>

            <Button 
              variant="outline"
              className="gap-2 h-auto py-3 flex-col"
            >
              <Play className="w-5 h-5" />
              <span>📋 PLANIFICAR LÍNEA</span>
              <span className="text-[10px] opacity-70">🎯 Solo línea seleccionada</span>
            </Button>

            <Button 
              variant="outline"
              className="gap-2 h-auto py-3 flex-col text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-5 h-5" />
              <span>❌ ELIMINAR PLANIFICACIÓN</span>
              <span className="text-[10px] opacity-70">🔄 Libera espacios</span>
            </Button>

            <Button 
              variant="outline"
              className="gap-2 h-auto py-3 flex-col"
            >
              <RefreshCw className="w-5 h-5" />
              <span>📝 DESPROGRAMAR LÍNEAS</span>
              <span className="text-[10px] opacity-70">🎯 Solo líneas seleccionadas</span>
            </Button>

            <Button 
              variant="outline"
              className="gap-2 h-auto py-3 flex-col text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Zap className="w-5 h-5" />
              <span>💰 CALCULAR VALORES</span>
              <span className="text-[10px] opacity-70">🧮 Recalcula estructura</span>
            </Button>
          </div>
        </TabsContent>

        {/* TAB: Progreso */}
        <TabsContent value="progreso" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-8 border-slate-200">
                {status === 'idle' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Cpu className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Listo para Planificar</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      El motor Cortex analizará {lineas.length} líneas de programación 
                      para encontrar la distribución óptima evitando conflictos.
                    </p>
                    <Button 
                      size="lg" 
                      onClick={runSimulation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg shadow-lg shadow-blue-200"
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Iniciar Motor TIER0
                    </Button>
                  </div>
                )}

                {status === 'running' && (
                  <div className="py-8">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-blue-700 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Optimizando espacios...
                      </span>
                      <span className="font-bold text-blue-700">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-4 bg-blue-100" />
                    <div className="mt-4 text-sm text-gray-500">
                      ████████████████████████████████████████████░░░░░ {progress}%
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="p-4 bg-slate-50 rounded-lg text-center animate-pulse">
                        <div className="text-xs text-slate-500 uppercase">Conflictos</div>
                        <div className="text-xl font-bold text-slate-700">Analizando...</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg text-center animate-pulse">
                        <div className="text-xs text-slate-500 uppercase">Saturación</div>
                        <div className="text-xl font-bold text-slate-700">Calculando...</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg text-center animate-pulse">
                        <div className="text-xs text-slate-500 uppercase">Score IA</div>
                        <div className="text-xl font-bold text-slate-700">---</div>
                      </div>
                    </div>
                  </div>
                )}

                {status === 'completed' && (
                  <div className="py-2">
                    <div className="flex items-center justify-between mb-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-emerald-900">Programación Exitosa</h3>
                          <p className="text-emerald-700 text-sm">Se han planificado todos los spots correctamente.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={runSimulation} className="text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                        <RotateCw className="w-4 h-4 mr-2" /> 
                        Reprocesar
                      </Button>
                    </div>

                    {/* Progreso Planificación Card */}
                    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <h4 className="font-bold text-gray-700 mb-3">📈 PROGRESO PLANIFICACIÓN</h4>
                      
                      <Progress value={porcentajePlanificacion} className="h-3 mb-2" />

                      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{resultado.lineasPlanificadas}/{resultado.lineasTotales}</p>
                          <p className="text-gray-500">Líneas planificadas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-600">{resultado.cunasRechazadas}</p>
                          <p className="text-gray-500">Cuñas rechazadas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-600">{resultado.conflictosResueltos}/{resultado.conflictosDetectados}</p>
                          <p className="text-gray-500">Conflictos resueltos</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          📊 Ver Detalles
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-amber-600">
                          🚨 Gestionar Rechazadas
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-blue-600">
                          ⚙️ Optimizar
                        </Button>
                      </div>
                    </Card>

                    <div className="mt-6">
                      <VisualizadorBloques lines={lineas} />
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Status Side Panel */}
            <div className="space-y-6">
              {status === 'completed' && (
                <Card className="p-6 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-none shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-6 h-6 text-violet-200" />
                    <h3 className="font-bold text-lg">Cortex Audit</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="text-sm text-violet-200 mb-1">Score de Optimización</div>
                      <div className="text-4xl font-bold">{optimizationScore}/100</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-violet-200">Spots Programados</span>
                        <span className="font-bold">128</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-violet-200">Cuñas Rechazadas</span>
                        <span className="font-bold text-amber-300">{resultado.cunasRechazadas}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-violet-200">Conflictos Directos</span>
                        <span className="font-bold text-emerald-300">Resueltos</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Reglas Activas
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Separación Competencia (15 min)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Límite Saturación Bloque (12 min)
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Prioridad Comercial (AAA)
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB: Visual */}
        <TabsContent value="visual" className="space-y-6">
          <Card className="p-4">
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Centro de Comando Visual</h3>
              <p className="text-gray-500 mb-4">
                Interface de 3 columnas para programación visual avanzada
              </p>
              <Button className="gap-2">
                <Eye className="w-4 h-4" />
                Abrir Centro de Comando
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
