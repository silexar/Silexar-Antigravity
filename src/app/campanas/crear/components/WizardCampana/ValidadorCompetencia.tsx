/**
 * 📋 SILEXAR PULSE - Validador de Reglas Anti-Competencia 2050
 * 
 * @description Sistema para validar y asegurar separación entre
 * anunciantes competidores en la misma tanda comercial.
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
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  Clock,
  Plus,
  Trash2,
  Settings,
  Ban,
  Siren
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ReglaCompetencia {
  id: string;
  anuncianteA: string;
  anuncianteB: string;
  separacionMinima: number; // minutos
  mismaTanda: boolean; // true = prohibido en misma tanda
  prioridad: 'alta' | 'media' | 'baja';
  activa: boolean;
  categoria: string;
}

export interface ViolacionCompetencia {
  id: string;
  reglaId: string;
  descripcion: string;
  bloqueAfectado: string;
  horaAfectada: string;
  spotA: { codigo: string; anunciante: string };
  spotB: { codigo: string; anunciante: string };
  separacionActual: number;
  separacionRequerida: number;
  severidad: 'critica' | 'alta' | 'media';
}

interface ValidadorCompetenciaProps {
  reglas: ReglaCompetencia[];
  violaciones: ViolacionCompetencia[];
  onAgregarRegla: (regla: Omit<ReglaCompetencia, 'id'>) => void;
  onEliminarRegla: (reglaId: string) => void;
  onToggleRegla: (reglaId: string) => void;
  onResolverViolacion: (violacionId: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const REGLAS_MOCK: ReglaCompetencia[] = [
  { id: 'regla_001', anuncianteA: 'BANCO CHILE', anuncianteB: 'BANCO ESTADO', separacionMinima: 15, mismaTanda: true, prioridad: 'alta', activa: true, categoria: 'Banca' },
  { id: 'regla_002', anuncianteA: 'ENTEL', anuncianteB: 'MOVISTAR', separacionMinima: 10, mismaTanda: true, prioridad: 'alta', activa: true, categoria: 'Telecomunicaciones' },
  { id: 'regla_003', anuncianteA: 'ENTEL', anuncianteB: 'CLARO', separacionMinima: 10, mismaTanda: true, prioridad: 'alta', activa: true, categoria: 'Telecomunicaciones' },
  { id: 'regla_004', anuncianteA: 'FALABELLA', anuncianteB: 'PARIS', separacionMinima: 5, mismaTanda: false, prioridad: 'media', activa: true, categoria: 'Retail' },
  { id: 'regla_005', anuncianteA: 'COCA-COLA', anuncianteB: 'PEPSI', separacionMinima: 15, mismaTanda: true, prioridad: 'alta', activa: true, categoria: 'Bebidas' }
];

const VIOLACIONES_MOCK: ViolacionCompetencia[] = [
  {
    id: 'viol_001',
    reglaId: 'regla_002',
    descripcion: 'ENTEL y MOVISTAR en la misma tanda',
    bloqueAfectado: 'Tanda Prime Matinal 07:15',
    horaAfectada: '07:15',
    spotA: { codigo: 'ENT-001', anunciante: 'ENTEL' },
    spotB: { codigo: 'MOV-002', anunciante: 'MOVISTAR' },
    separacionActual: 2,
    separacionRequerida: 10,
    severidad: 'critica'
  }
];

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS COMUNES
// ═══════════════════════════════════════════════════════════════

const CATEGORIAS_COMPETENCIA = [
  'Banca',
  'Telecomunicaciones',
  'Retail',
  'Automotriz',
  'Bebidas',
  'Supermercados',
  'Aerolíneas',
  'Seguros',
  'Farmacias',
  'Fast Food'
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const ValidadorCompetencia: React.FC<ValidadorCompetenciaProps> = ({
  reglas = REGLAS_MOCK,
  violaciones = VIOLACIONES_MOCK,
  onAgregarRegla,
  onEliminarRegla,
  onToggleRegla,
  onResolverViolacion
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoAnuncianteA, setNuevoAnuncianteA] = useState('');
  const [nuevoAnuncianteB, setNuevoAnuncianteB] = useState('');
  const [nuevaSeparacion, setNuevaSeparacion] = useState(10);
  const [nuevaMismaTanda, setNuevaMismaTanda] = useState(true);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Estadísticas
  const estadisticas = useMemo(() => ({
    reglasActivas: reglas.filter(r => r.activa).length,
    violacionesCriticas: violaciones.filter(v => v.severidad === 'critica').length,
    violacionesAltas: violaciones.filter(v => v.severidad === 'alta').length,
    violacionesMedias: violaciones.filter(v => v.severidad === 'media').length
  }), [reglas, violaciones]);

  // Agregar nueva regla
  const handleAgregarRegla = () => {
    if (!nuevoAnuncianteA || !nuevoAnuncianteB) return;

    onAgregarRegla?.({
      anuncianteA: nuevoAnuncianteA,
      anuncianteB: nuevoAnuncianteB,
      separacionMinima: nuevaSeparacion,
      mismaTanda: nuevaMismaTanda,
      prioridad: nuevaMismaTanda ? 'alta' : 'media',
      activa: true,
      categoria: nuevaCategoria
    });

    // Reset
    setNuevoAnuncianteA('');
    setNuevoAnuncianteB('');
    setNuevaSeparacion(10);
    setNuevaMismaTanda(true);
    setMostrarFormulario(false);
  };

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-red-50 border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">🛡️ Validador Anti-Competencia</h3>
              <p className="text-sm text-gray-500">Separación entre anunciantes competidores</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setMostrarFormulario(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Nueva Regla
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">{estadisticas.reglasActivas}</p>
            <p className="text-xs text-gray-500">Reglas activas</p>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-700">{estadisticas.violacionesCriticas}</p>
            <p className="text-xs text-gray-500">Críticas</p>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">{estadisticas.violacionesAltas}</p>
            <p className="text-xs text-gray-500">Altas</p>
          </div>
          <div className="p-3 bg-white/80 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-700">{estadisticas.violacionesMedias}</p>
            <p className="text-xs text-gray-500">Medias</p>
          </div>
        </div>
      </Card>

      {/* Violaciones activas */}
      {violaciones.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Siren className="w-5 h-5 text-red-600 animate-pulse" />
            <h4 className="font-bold text-red-700">Violaciones Detectadas</h4>
            <Badge className="bg-red-600 text-white">{violaciones.length}</Badge>
          </div>

          <div className="space-y-2">
            {violaciones.map(violacion => (
              <Card key={violacion.id} className="p-3 bg-white border-l-4 border-l-red-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className={
                          violacion.severidad === 'critica' ? 'bg-red-600' :
                          violacion.severidad === 'alta' ? 'bg-amber-600' :
                          'bg-yellow-600'
                        }
                      >
                        {violacion.severidad.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{violacion.descripcion}</span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>📍 {violacion.bloqueAfectado}</p>
                      <p>
                        {violacion.spotA.codigo} ({violacion.spotA.anunciante}) ↔ 
                        {violacion.spotB.codigo} ({violacion.spotB.anunciante})
                      </p>
                      <p className="text-red-600">
                        Separación actual: {violacion.separacionActual} min | Requerida: {violacion.separacionRequerida} min
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onResolverViolacion?.(violacion.id)}
                  >
                    Resolver
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de reglas */}
      <Card className="p-4">
        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Reglas de Competencia
        </h4>

        <div className="space-y-2">
          {reglas.map(regla => (
            <Card 
              key={regla.id} 
              className={`p-3 ${regla.activa ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={regla.activa} 
                    onCheckedChange={() => onToggleRegla?.(regla.id)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{regla.anuncianteA}</span>
                      <Ban className="w-3 h-3 text-red-500" />
                      <span className="font-medium text-sm">{regla.anuncianteB}</span>
                      <Badge variant="outline" className="text-xs">{regla.categoria}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Separación: {regla.separacionMinima} min</span>
                      {regla.mismaTanda && (
                        <Badge className="bg-red-100 text-red-700 text-xs">Misma tanda prohibida</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      regla.prioridad === 'alta' ? 'bg-red-100 text-red-700' :
                      regla.prioridad === 'media' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }
                  >
                    {regla.prioridad}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500"
                    onClick={() => onEliminarRegla?.(regla.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Formulario nueva regla */}
      {mostrarFormulario && (
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <h4 className="font-bold text-blue-700 mb-4">Nueva Regla de Competencia</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Anunciante A</Label>
              <Input
                placeholder="Ej: BANCO CHILE"
                value={nuevoAnuncianteA}
                onChange={(e) => setNuevoAnuncianteA(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label>Anunciante B (Competidor)</Label>
              <Input
                placeholder="Ej: BANCO ESTADO"
                value={nuevoAnuncianteB}
                onChange={(e) => setNuevoAnuncianteB(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label>Separación mínima (minutos)</Label>
              <Input
                type="number"
                value={nuevaSeparacion}
                onChange={(e) => setNuevaSeparacion(parseInt(e.target.value) || 0)}
                min={1}
                max={60}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                placeholder="Ej: Banca"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                list="categorias"
              />
              <datalist id="categorias">
                {CATEGORIAS_COMPETENCIA.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch checked={nuevaMismaTanda} onCheckedChange={setNuevaMismaTanda} />
              <Label>Prohibir en misma tanda comercial</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMostrarFormulario(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAgregarRegla} disabled={!nuevoAnuncianteA || !nuevoAnuncianteB}>
                Crear Regla
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValidadorCompetencia;
