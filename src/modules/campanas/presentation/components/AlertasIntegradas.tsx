import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/observability';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X, 
  Bell, 
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { AlertingIntelligenceService } from '../services/AlertingIntelligenceService';

export type TipoAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA' | 'INFO';
export type CategoriaAlerta = 'CONFLICTO' | 'CUMPLIMIENTO' | 'FINANCIERO' | 'OPERACIONAL' | 'SISTEMA';

interface Alerta {
  id: string;
  tipo: TipoAlerta;
  categoria: CategoriaAlerta;
  titulo: string;
  descripcion: string;
  campanaId?: string;
  nombreCampana?: string;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  leida: boolean;
  accionRequerida: boolean;
  metadata: {
    impacto?: string;
    solucionSugerida?: string;
    urlAccion?: string;
    datosAdicionales?: Record<string, unknown>;
  };
}

interface AlertasIntegradasProps {
  campanaId?: string;
  filtros?: {
    tipos?: TipoAlerta[];
    categorias?: CategoriaAlerta[];
    soloNoLeidas?: boolean;
  };
  maxAlertas?: number;
  mostrarAcciones?: boolean;
  actualizacionAutomatica?: boolean;
  className?: string;
}

export const AlertasIntegradas: React.FC<AlertasIntegradasProps> = ({
  campanaId,
  filtros = {},
  maxAlertas = 10,
  mostrarAcciones = true,
  actualizacionAutomatica = true,
  className = ""
}) => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [alertasOcultas, setAlertasOcultas] = useState<Set<string>>(new Set());

  const alertingService = new AlertingIntelligenceService();

  useEffect(() => {
    cargarAlertas();
    
    if (actualizacionAutomatica) {
      const intervalo = setInterval(cargarAlertas, 30000); // 30 segundos
      return () => clearInterval(intervalo);
    }
  }, [campanaId, filtros, actualizacionAutomatica]);

  const cargarAlertas = async () => {
    try {
      setCargando(true);
      const alertasData = await alertingService.obtenerAlertasActivas({
        campanaId,
        ...filtros,
        limite: maxAlertas
      });
      
      setAlertas(alertasData);
    } catch (error) {
      logger.error('Error cargando alertas', error instanceof Error ? error : undefined);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoLeida = async (alertaId: string) => {
    try {
      await alertingService.marcarAlertaComoLeida(alertaId);
      setAlertas(prev => prev.map(alerta => 
        alerta.id === alertaId ? { ...alerta, leida: true } : alerta
      ));
    } catch (error) {
      logger.error('Error marcando alerta como leída', error instanceof Error ? error : undefined);
    }
  };

  const ocultarAlerta = (alertaId: string) => {
    setAlertasOcultas(prev => new Set([...prev, alertaId]));
  };

  const ejecutarAccion = async (alerta: Alerta) => {
    if (alerta.metadata.urlAccion) {
      window.open(alerta.metadata.urlAccion, '_blank');
    }
    await marcarComoLeida(alerta.id);
  };

  const getIconoTipo = (tipo: TipoAlerta) => {
    switch (tipo) {
      case 'CRITICA':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'ALTA':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'MEDIA':
        return <Info className="w-5 h-5 text-yellow-500" />;
      case 'BAJA':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'INFO':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIconoCategoria = (categoria: CategoriaAlerta) => {
    switch (categoria) {
      case 'CONFLICTO':
        return <AlertTriangle className="w-4 h-4" />;
      case 'CUMPLIMIENTO':
        return <CheckCircle className="w-4 h-4" />;
      case 'FINANCIERO':
        return <DollarSign className="w-4 h-4" />;
      case 'OPERACIONAL':
        return <Users className="w-4 h-4" />;
      case 'SISTEMA':
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColorClasses = (tipo: TipoAlerta, leida: boolean) => {
    const baseClasses = leida ? 'opacity-75' : '';
    
    switch (tipo) {
      case 'CRITICA':
        return `border-l-red-500 bg-red-50 ${baseClasses}`;
      case 'ALTA':
        return `border-l-orange-500 bg-orange-50 ${baseClasses}`;
      case 'MEDIA':
        return `border-l-yellow-500 bg-yellow-50 ${baseClasses}`;
      case 'BAJA':
        return `border-l-blue-500 bg-blue-50 ${baseClasses}`;
      case 'INFO':
        return `border-l-green-500 bg-green-50 ${baseClasses}`;
      default:
        return `border-l-gray-500 bg-gray-50 ${baseClasses}`;
    }
  };

  const formatearTiempoRelativo = (fecha: Date) => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    return `${dias}d`;
  };

  const alertasVisibles = alertas.filter(alerta => !alertasOcultas.has(alerta.id));
  const alertasCriticas = alertasVisibles.filter(a => a.tipo === 'CRITICA').length;
  const alertasNoLeidas = alertasVisibles.filter(a => !a.leida).length;

  if (cargando) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border-l-4 border-l-gray-300 bg-gray-50 p-4 animate-pulse">
            <div className="flex items-start">
              <div className="w-5 h-5 bg-gray-300 rounded mr-3"></div>
              <div className="flex-1">
                <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alertasVisibles.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-gray-500">No hay alertas activas</p>
        <p className="text-sm text-gray-400">Todo está funcionando correctamente</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header con estadísticas */}
      {alertasVisibles.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Alertas Activas ({alertasVisibles.length})
            </h3>
            {alertasCriticas > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {alertasCriticas} críticas
              </span>
            )}
            {alertasNoLeidas > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Bell className="w-3 h-3 mr-1" />
                {alertasNoLeidas} no leídas
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lista de alertas */}
      <div className="space-y-2">
        {alertasVisibles.map((alerta) => (
          <div
            key={alerta.id}
            className={`border-l-4 p-4 rounded-r-lg ${getColorClasses(alerta.tipo, alerta.leida)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <div className="flex-shrink-0 mr-3">
                  {getIconoTipo(alerta.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${alerta.leida ? 'text-gray-600' : 'text-gray-900'}`}>
                      {alerta.titulo}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {getIconoCategoria(alerta.categoria)}
                      <span className="ml-1">{alerta.categoria}</span>
                    </span>
                    {!alerta.leida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <p className={`text-sm ${alerta.leida ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                    {alerta.descripcion}
                  </p>

                  {alerta.nombreCampana && (
                    <p className="text-xs text-gray-500 mb-2">
                      Campaña: {alerta.nombreCampana}
                    </p>
                  )}

                  {alerta.metadata.solucionSugerida && (
                    <div className="bg-white bg-opacity-50 rounded p-2 mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Solución sugerida:</p>
                      <p className="text-xs text-gray-600">{alerta.metadata.solucionSugerida}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatearTiempoRelativo(alerta.fechaCreacion)}
                      </span>
                      {alerta.fechaVencimiento && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Vence: {alerta.fechaVencimiento.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {mostrarAcciones && (
                      <div className="flex items-center gap-2">
                        {alerta.accionRequerida && alerta.metadata.urlAccion && (
                          <button
                            onClick={() => ejecutarAccion(alerta)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                          >
                            Resolver
                          </button>
                        )}
                        {!alerta.leida && (
                          <button
                            onClick={() => marcarComoLeida(alerta.id)}
                            className="text-xs font-medium text-gray-600 hover:text-gray-800"
                          >
                            Marcar leída
                          </button>
                        )}
                        <button
                          onClick={() => ocultarAlerta(alerta.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertasIntegradas;
