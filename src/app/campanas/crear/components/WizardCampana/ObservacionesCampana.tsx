/**
 * 💬 ObservacionesCampana - Sistema Colaborativo TIER0
 * 
 * Panel de observaciones y notas colaborativas:
 * - Notas por paso del wizard
 * - Menciones a usuarios
 * - Alertas de bloqueo
 * - Historial de conversación
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, Send, AtSign, AlertCircle, Pin,
  Clock, CheckCheck, MoreVertical
} from 'lucide-react';

// ==================== INTERFACES ====================

interface Observacion {
  id: string;
  usuario: string;
  fecha: string;
  hora: string;
  mensaje: string;
  paso?: string;
  tipo: 'nota' | 'alerta' | 'pregunta' | 'resuelto';
  fijado: boolean;
  menciones: string[];
  leido: boolean;
}

interface ObservacionesCampanaProps {
  campanaNro: string;
  observaciones?: Observacion[];
  onAgregarObservacion?: (mensaje: string, tipo: string) => void;
}

// ==================== DATOS MOCK ====================

const MOCK_OBSERVACIONES: Observacion[] = [
  {
    id: 'obs_001',
    usuario: 'Carlos Mendoza',
    fecha: '2025-02-08',
    hora: '10:45',
    mensaje: 'Revisar el conflicto de competencia en bloque PRIME MATINAL antes de aprobar.',
    paso: 'Programación',
    tipo: 'alerta',
    fijado: true,
    menciones: ['Ana García'],
    leido: true
  },
  {
    id: 'obs_002',
    usuario: 'Ana García',
    fecha: '2025-02-08',
    hora: '11:20',
    mensaje: '@Carlos Mendoza Ya revisé y moví el spot conflictivo al bloque MAÑANA. Todo OK ahora.',
    paso: 'Programación',
    tipo: 'resuelto',
    fijado: false,
    menciones: ['Carlos Mendoza'],
    leido: true
  },
  {
    id: 'obs_003',
    usuario: 'María Torres',
    fecha: '2025-02-07',
    hora: '16:30',
    mensaje: '¿El cliente confirmó la orden de compra 801? Necesito el número para facturación.',
    paso: 'Facturación',
    tipo: 'pregunta',
    fijado: false,
    menciones: [],
    leido: false
  }
];

// ==================== COMPONENTE ====================

export function ObservacionesCampana({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  campanaNro: _campanaNro = 'CAM-2025-0015',
  observaciones = MOCK_OBSERVACIONES,
  onAgregarObservacion
}: ObservacionesCampanaProps) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [tipoNuevo, setTipoNuevo] = useState<'nota' | 'alerta' | 'pregunta'>('nota');

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'nota': return 'bg-blue-50 border-blue-200';
      case 'alerta': return 'bg-amber-50 border-amber-200';
      case 'pregunta': return 'bg-purple-50 border-purple-200';
      case 'resuelto': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'nota': return <Badge className="bg-blue-100 text-blue-700 text-xs">Nota</Badge>;
      case 'alerta': return <Badge className="bg-amber-100 text-amber-700 text-xs">Alerta</Badge>;
      case 'pregunta': return <Badge className="bg-purple-100 text-purple-700 text-xs">Pregunta</Badge>;
      case 'resuelto': return <Badge className="bg-emerald-100 text-emerald-700 text-xs">Resuelto</Badge>;
      default: return null;
    }
  };

  const handleEnviar = () => {
    if (!nuevoMensaje.trim()) return;
    onAgregarObservacion?.(nuevoMensaje, tipoNuevo);
    setNuevoMensaje('');
  };

  const observacionesFijadas = observaciones.filter(o => o.fijado);
  const observacionesNormales = observaciones.filter(o => !o.fijado);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Observaciones
          </CardTitle>
          <Badge variant="outline" className="text-gray-500">
            {observaciones.filter(o => !o.leido).length} sin leer
          </Badge>
        </div>
      </CardHeader>

      {/* Lista de observaciones */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        {/* Fijadas */}
        {observacionesFijadas.length > 0 && (
          <div className="bg-amber-50/50 border-b">
            {observacionesFijadas.map(obs => (
              <div 
                key={obs.id}
                className={`p-4 border-b last:border-b-0 ${getTipoColor(obs.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  <Pin className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{obs.usuario}</span>
                      {getTipoBadge(obs.tipo)}
                      {obs.paso && (
                        <Badge variant="outline" className="text-xs">{obs.paso}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{obs.mensaje}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {obs.fecha} {obs.hora}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Normales */}
        <div className="divide-y">
          {observacionesNormales.map(obs => (
            <div 
              key={obs.id}
              className={`p-4 ${!obs.leido ? 'bg-blue-50/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {obs.usuario.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{obs.usuario}</span>
                      {getTipoBadge(obs.tipo)}
                    </div>
                    <div className="flex items-center gap-1">
                      {obs.leido && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {obs.paso && (
                    <Badge variant="outline" className="text-xs mb-2">{obs.paso}</Badge>
                  )}
                  
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {obs.mensaje.split(/(@\w+)/g).map((part, i) =>
                      part.startsWith('@') ? (
                        <span key={`mention-${i}`} className="text-blue-600 font-medium">{part}</span>
                      ) : part
                    )}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {obs.fecha} {obs.hora}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {observaciones.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay observaciones aún</p>
          </div>
        )}
      </CardContent>

      {/* Input nuevo mensaje */}
      <div className="border-t p-4 shrink-0 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            size="sm" 
            variant={tipoNuevo === 'nota' ? 'default' : 'ghost'}
            onClick={() => setTipoNuevo('nota')}
            className="h-7 text-xs"
          >
            Nota
          </Button>
          <Button 
            size="sm" 
            variant={tipoNuevo === 'alerta' ? 'default' : 'ghost'}
            onClick={() => setTipoNuevo('alerta')}
            className="h-7 text-xs"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Alerta
          </Button>
          <Button 
            size="sm" 
            variant={tipoNuevo === 'pregunta' ? 'default' : 'ghost'}
            onClick={() => setTipoNuevo('pregunta')}
            className="h-7 text-xs"
          >
            Pregunta
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea 
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe una observación... Usa @ para mencionar"
              className="resize-none pr-10"
              rows={2}
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-1 bottom-1 h-8 w-8 text-gray-400 hover:text-blue-600"
            >
              <AtSign className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={handleEnviar}
            disabled={!nuevoMensaje.trim()}
            className="bg-blue-600 hover:bg-blue-700 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ObservacionesCampana;
