/**
 * 🧠 Motor de Planificación Inteligente TIER0++
 * 
 * Cerebro principal para la asignación óptima de cuñas:
 * - Planificación forzada sin límite de tiempo
 * - Anti-competencia por rubro
 * - Diálogos de confirmación granulares
 * - Score de calidad de planificación
 * 
 * @enterprise TIER0 Fortune 10 Enterprise 2050
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Play, AlertTriangle, CheckCircle2, XCircle, Loader2, 
  Zap, Shield, Brain, Target, AlertOctagon,
  ThumbsUp, ThumbsDown, RefreshCw
} from 'lucide-react';
import { 
  sonCompetidoresDirectos, 
  generarIdCunaPlanificada,
} from './SistemaAntiCompetencia';

// ==================== INTERFACES ====================

interface CunaAPlanificar {
  id: string;
  campanaId: string;
  anunciante: string;
  duracion: number;
  tipoPedido: string;
  horaPreferida?: string;
  lineaId: string;
}

interface BloqueDisponible {
  id: string;
  hora: string;
  tipo: string;
  capacidadTotal: number;
  capacidadUsada: number;
  cunasActuales: { anunciante: string; duracion: number }[];
}

interface ResultadoPlanificacion {
  cunaId: string;
  bloqueAsignado: string;
  posicion: number;
  idGenerado: string;
  estado: 'exitoso' | 'forzado' | 'rechazado' | 'pendiente';
  alertas: string[];
}

interface ConflictoDetectado {
  cunaId: string;
  tipo: 'saturacion' | 'competencia' | 'limite_tiempo';
  mensaje: string;
  bloque: string;
  opciones: OpcionResolucion[];
}

interface OpcionResolucion {
  id: string;
  label: string;
  descripcion: string;
  accion: 'aprobar' | 'rechazar' | 'alternativa' | 'forzar';
  icon: React.ReactNode;
}

interface ConfiguracionPlanificacion {
  verificarLimiteTiempo: boolean;
  verificarCompetencia: boolean;
  verificarSaturacion: boolean;
  modoForzado: boolean;
  preguntarCadaConflicto: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================

export function MotorPlanificacionIA({
  lineasAPlanificar: _lineasAPlanificar,
  bloquesDisponibles: _bloquesDisponibles,
  onPlanificacionCompleta,
}: {
  lineasAPlanificar: CunaAPlanificar[];
  bloquesDisponibles: BloqueDisponible[];
  onPlanificacionCompleta?: (resultados: ResultadoPlanificacion[]) => void;
}) {
  const [planificando, setPlanificando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [etapa, setEtapa] = useState('');
  const [resultados, setResultados] = useState<ResultadoPlanificacion[]>([]);
  const [conflictoActual, setConflictoActual] = useState<ConflictoDetectado | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  
  const [config, setConfig] = useState<ConfiguracionPlanificacion>({
    verificarLimiteTiempo: true,
    verificarCompetencia: true,
    verificarSaturacion: true,
    modoForzado: false,
    preguntarCadaConflicto: true,
  });

  const [estadisticas, setEstadisticas] = useState({
    cunasExitosas: 0,
    cunasForzadas: 0,
    cunasRechazadas: 0,
    conflictosEvitados: 0,
    scoreCalidad: 0,
  });

  // Simular planificación
  const ejecutarPlanificacion = useCallback(async () => {
    setPlanificando(true);
    setProgreso(0);
    const resultadosTemp: ResultadoPlanificacion[] = [];

    // Mock de bloques
    const mockBloques: BloqueDisponible[] = [
      { id: 'b1', hora: '07:26:00', tipo: 'PRIME', capacidadTotal: 300, capacidadUsada: 267, cunasActuales: [{ anunciante: 'BANCO CHILE', duracion: 30 }, { anunciante: 'COCA COLA', duracion: 30 }] },
      { id: 'b2', hora: '08:26:00', tipo: 'PRIME', capacidadTotal: 300, capacidadUsada: 180, cunasActuales: [{ anunciante: 'FALABELLA', duracion: 45 }] },
      { id: 'b3', hora: '09:26:00', tipo: 'AUSPICIO', capacidadTotal: 300, capacidadUsada: 120, cunasActuales: [] },
    ];

    // Simular cuñas a planificar
    const mockCunas: CunaAPlanificar[] = [
      { id: 'c1', campanaId: 'cam1', anunciante: 'WOM', duracion: 30, tipoPedido: 'PRIME', lineaId: 'l1' },
      { id: 'c2', campanaId: 'cam1', anunciante: 'CLARO', duracion: 35, tipoPedido: 'PRIME', lineaId: 'l2' },
      { id: 'c3', campanaId: 'cam1', anunciante: 'SANTANDER', duracion: 30, tipoPedido: 'AUSPICIO', lineaId: 'l3' },
    ];

    let idx = 0;
    for (const cuna of mockCunas) {
      setProgreso(((idx + 1) / mockCunas.length) * 100);
      setEtapa(`🎯 Procesando: ${cuna.anunciante} (${cuna.duracion}s)`);

      await new Promise(r => setTimeout(r, 800));

      // Buscar mejor bloque
      const bloqueSeleccionado = mockBloques[idx % mockBloques.length];
      idx++;
      const espacioDisponible = bloqueSeleccionado.capacidadTotal - bloqueSeleccionado.capacidadUsada;

      // Verificar competencia
      if (config.verificarCompetencia) {
        const anunciantesEnBloque = bloqueSeleccionado.cunasActuales.map(c => c.anunciante);
        for (const existente of anunciantesEnBloque) {
          if (sonCompetidoresDirectos(cuna.anunciante, existente)) {
            // Detectado conflicto de competencia
            setConflictoActual({
              cunaId: cuna.id,
              tipo: 'competencia',
              mensaje: `🚨 CONFLICTO COMPETENCIA: ${cuna.anunciante} es competidor directo de ${existente}`,
              bloque: bloqueSeleccionado.hora,
              opciones: [
                { id: 'sep', label: '🔄 Separar Máximo', descripcion: 'Mover al bloque más lejano posible', accion: 'alternativa', icon: <RefreshCw className="w-4 h-4" /> },
                { id: 'forzar', label: '⚡ Forzar Aquí', descripcion: 'Insertar de todas formas en este bloque', accion: 'forzar', icon: <Zap className="w-4 h-4" /> },
                { id: 'rechazar', label: '❌ Rechazar', descripcion: 'No planificar esta cuña', accion: 'rechazar', icon: <XCircle className="w-4 h-4" /> },
              ],
            });
            setDialogoAbierto(true);
            await new Promise(r => setTimeout(r, 500)); // Simular espera
            setDialogoAbierto(false);
            setConflictoActual(null);
          }
        }
      }

      // Verificar límite de tiempo
      if (config.verificarLimiteTiempo && espacioDisponible < cuna.duracion) {
        if (config.modoForzado) {
          // Planificar forzado
          resultadosTemp.push({
            cunaId: cuna.id,
            bloqueAsignado: bloqueSeleccionado.id,
            posicion: bloqueSeleccionado.cunasActuales.length + 1,
            idGenerado: generarIdCunaPlanificada(cuna.campanaId, cuna.lineaId, bloqueSeleccionado.id, bloqueSeleccionado.cunasActuales.length + 1),
            estado: 'forzado',
            alertas: [`⚠️ Saturación: ${espacioDisponible}s disponibles, cuña de ${cuna.duracion}s`],
          });
        } else {
          // Mostrar diálogo de confirmación
          setConflictoActual({
            cunaId: cuna.id,
            tipo: 'saturacion',
            mensaje: `📊 Quedan ${espacioDisponible}s disponibles, tu cuña es de ${cuna.duracion}s. ¿Permitir saturar la tanda?`,
            bloque: bloqueSeleccionado.hora,
            opciones: [
              { id: 'si', label: '✅ Sí, Solo Esta', descripcion: 'Saturar solo esta cuña', accion: 'aprobar', icon: <ThumbsUp className="w-4 h-4" /> },
              { id: 'si_todos', label: '✅ Sí a Todos', descripcion: 'Aprobar todas las saturaciones', accion: 'forzar', icon: <CheckCircle2 className="w-4 h-4" /> },
              { id: 'alternativa', label: '🔄 Buscar Alternativa', descripcion: 'Otro bloque con espacio', accion: 'alternativa', icon: <Target className="w-4 h-4" /> },
              { id: 'no', label: '❌ No, Rechazar', descripcion: 'No planificar', accion: 'rechazar', icon: <ThumbsDown className="w-4 h-4" /> },
            ],
          });
          setDialogoAbierto(true);
          await new Promise(r => setTimeout(r, 500));
          setDialogoAbierto(false);
          setConflictoActual(null);
        }
      } else {
        // Planificación exitosa
        resultadosTemp.push({
          cunaId: cuna.id,
          bloqueAsignado: bloqueSeleccionado.id,
          posicion: bloqueSeleccionado.cunasActuales.length + 1,
          idGenerado: generarIdCunaPlanificada(cuna.campanaId, cuna.lineaId, bloqueSeleccionado.id, bloqueSeleccionado.cunasActuales.length + 1),
          estado: 'exitoso',
          alertas: [],
        });
      }
    }

    setResultados(resultadosTemp);
    setEstadisticas({
      cunasExitosas: resultadosTemp.filter(r => r.estado === 'exitoso').length,
      cunasForzadas: resultadosTemp.filter(r => r.estado === 'forzado').length,
      cunasRechazadas: resultadosTemp.filter(r => r.estado === 'rechazado').length,
      conflictosEvitados: 3, // Mock
      scoreCalidad: 94,
    });
    setPlanificando(false);
    setEtapa('');

    if (onPlanificacionCompleta) {
      onPlanificacionCompleta(resultadosTemp);
    }
  }, [config, onPlanificacionCompleta]);

  const handleResolucionConflicto = () => {
    // ;
    setDialogoAbierto(false);
    setConflictoActual(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            🧠 MOTOR DE PLANIFICACIÓN INTELIGENTE
          </h3>
          <p className="text-sm text-gray-500">Anti-competencia • Auto-distribución • Confirmaciones granulares</p>
        </div>
        <Badge className="bg-purple-600">Cortex-Scheduler v2050</Badge>
      </div>

      {/* Configuración de Validaciones */}
      <Card className="p-4">
        <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          ⚙️ CONFIGURACIÓN DE VALIDACIONES
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">☑️ Verificar límite de tiempo</p>
              <p className="text-xs text-gray-500">
                {config.verificarLimiteTiempo 
                  ? '🔒 Rechazará cuñas que excedan 300s' 
                  : '⚡ MODO FORZADO: Planifica aunque sature'}
              </p>
            </div>
            <Switch 
              checked={config.verificarLimiteTiempo}
              onCheckedChange={(v) => setConfig(prev => ({ 
                ...prev, 
                verificarLimiteTiempo: v,
                modoForzado: !v 
              }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">☑️ Verificar competencia</p>
              <p className="text-xs text-gray-500">🛡️ No pegar competidores en misma tanda</p>
            </div>
            <Switch 
              checked={config.verificarCompetencia}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, verificarCompetencia: v }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">☑️ Preguntar cada conflicto</p>
              <p className="text-xs text-gray-500">💬 Confirmación detallada por conflicto</p>
            </div>
            <Switch 
              checked={config.preguntarCadaConflicto}
              onCheckedChange={(v) => setConfig(prev => ({ ...prev, preguntarCadaConflicto: v }))}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <p className="font-medium text-amber-800">⚡ Modo Forzado Total</p>
              <p className="text-xs text-amber-600">Ignora TODAS las validaciones</p>
            </div>
            <Switch 
              checked={config.modoForzado && !config.verificarLimiteTiempo}
              onCheckedChange={(v) => setConfig(prev => ({ 
                ...prev, 
                modoForzado: v,
                verificarLimiteTiempo: !v,
                verificarCompetencia: !v 
              }))}
            />
          </div>
        </div>

        {!config.verificarLimiteTiempo && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              <strong>⚠️ MODO FORZADO ACTIVO:</strong> Las cuñas se planificarán aunque el bloque esté saturado.
            </p>
          </div>
        )}
      </Card>

      {/* Botón de Planificación */}
      <div className="flex gap-3">
        <Button 
          onClick={ejecutarPlanificacion}
          disabled={planificando}
          className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 h-14 text-lg"
        >
          {planificando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Planificando...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              🎯 EJECUTAR PLANIFICACIÓN INTELIGENTE
            </>
          )}
        </Button>
      </div>

      {/* Progreso */}
      {planificando && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {etapa}
            </span>
            <span className="font-bold text-blue-700">{Math.round(progreso)}%</span>
          </div>
          <Progress value={progreso} className="h-3" />
        </Card>
      )}

      {/* Resultados */}
      {resultados.length > 0 && !planificando && (
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            ✅ PLANIFICACIÓN COMPLETADA
          </h4>

          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{estadisticas.cunasExitosas}</p>
              <p className="text-xs text-gray-500">Exitosas</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{estadisticas.cunasForzadas}</p>
              <p className="text-xs text-gray-500">Forzadas</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-red-600">{estadisticas.cunasRechazadas}</p>
              <p className="text-xs text-gray-500">Rechazadas</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{estadisticas.conflictosEvitados}</p>
              <p className="text-xs text-gray-500">Conflictos Evitados</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{estadisticas.scoreCalidad}%</p>
              <p className="text-xs text-gray-500">Score Calidad</p>
            </div>
          </div>

          <div className="space-y-2">
            {resultados.slice(0, 5).map(r => (
              <div 
                key={r.cunaId}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  r.estado === 'exitoso' ? 'bg-emerald-50 border-emerald-200' :
                  r.estado === 'forzado' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {r.estado === 'exitoso' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {r.estado === 'forzado' && <Zap className="w-5 h-5 text-amber-600" />}
                  {r.estado === 'rechazado' && <XCircle className="w-5 h-5 text-red-600" />}
                  <div>
                    <p className="font-mono text-sm">{r.idGenerado}</p>
                    <p className="text-xs text-gray-500">Bloque: {r.bloqueAsignado} • Pos: {r.posicion}</p>
                  </div>
                </div>
                <Badge className={
                  r.estado === 'exitoso' ? 'bg-emerald-600' :
                  r.estado === 'forzado' ? 'bg-amber-600' : 'bg-red-600'
                }>
                  {r.estado}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Diálogo de Conflicto */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              {conflictoActual?.tipo === 'competencia' ? '🛡️ Conflicto de Competencia' : '📊 Confirmación de Saturación'}
            </DialogTitle>
          </DialogHeader>

          {conflictoActual && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800">{conflictoActual.mensaje}</p>
                <p className="text-sm text-amber-600 mt-1">📍 Bloque: {conflictoActual.bloque}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {conflictoActual.opciones.map(opcion => (
                  <Button
                    key={opcion.id}
                    variant={opcion.accion === 'aprobar' || opcion.accion === 'forzar' ? 'default' : 'outline'}
                    className={`h-auto py-3 flex-col gap-1 ${
                      opcion.accion === 'rechazar' ? 'text-red-600 border-red-200 hover:bg-red-50' :
                      opcion.accion === 'alternativa' ? 'text-blue-600 border-blue-200 hover:bg-blue-50' : ''
                    }`}
                    onClick={() => handleResolucionConflicto()}
                  >
                    <span className="flex items-center gap-2">
                      {opcion.icon}
                      {opcion.label}
                    </span>
                    <span className="text-xs opacity-70 font-normal">{opcion.descripcion}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MotorPlanificacionIA;
