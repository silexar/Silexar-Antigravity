/**
 * 🎛️ Panel de Propiedades - Configuración Lateral TIER0
 * 
 * Panel colapsable con propiedades y configuraciones de campaña:
 * - Tipo de Pedido (Paquete/Spot/Rotativo)
 * - Categorías de anunciante
 * - Propiedades por emisora
 * - Configuración avanzada
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, ChevronRight, ChevronLeft, Package, Zap, 
  RotateCcw, Tag, Radio, Shield, AlertTriangle, CheckCircle2
} from 'lucide-react';

// ==================== INTERFACES ====================

interface PropiedadesCampana {
  tipoPedido: 'paquete' | 'spot' | 'rotativo';
  tipoBloque: 'premium' | 'estandar' | 'economico';
  categoriaAnunciante: string;
  prioridadComercial: number; // 1-10
  aplicarExclusividad: boolean;
  permitirOverride: boolean;
  notificarConflictos: boolean;
  autoOptimizar: boolean;
}

interface PanelPropiedadesProps {
  propiedades: PropiedadesCampana;
  onUpdate: (props: Partial<PropiedadesCampana>) => void;
  emisora?: string;
}

// ==================== DATOS ====================

const CATEGORIAS = [
  'Banca y Finanzas',
  'Retail',
  'Telecomunicaciones',
  'Automotriz',
  'Alimentos y Bebidas',
  'Tecnología',
  'Servicios',
  'Gobierno',
  'Salud',
  'Educación',
  'Entretenimiento'
];

// ==================== COMPONENTE ====================

export function PanelPropiedades({
  propiedades,
  onUpdate,
  emisora = 'T13 Radio'
}: PanelPropiedadesProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getTipoPedidoIcon = (tipo: string) => {
    switch (tipo) {
      case 'paquete': return <Package className="w-5 h-5" />;
      case 'spot': return <Zap className="w-5 h-5" />;
      case 'rotativo': return <RotateCcw className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-l shadow-lg flex flex-col items-center py-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center gap-3">
          <Settings className="w-5 h-5 text-gray-400" />
          <Tag className="w-5 h-5 text-gray-400" />
          <Radio className="w-5 h-5 text-gray-400" />
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Propiedades</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Tipo de Pedido */}
        <div>
          <Label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">
            Tipo de Pedido
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['paquete', 'spot', 'rotativo'] as const).map(tipo => (
              <button
                key={tipo}
                onClick={() => onUpdate({ tipoPedido: tipo })}
                className={`
                  p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1
                  ${propiedades.tipoPedido === tipo 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-100 hover:border-blue-200 text-gray-500'
                  }
                `}
              >
                {getTipoPedidoIcon(tipo)}
                <span className="text-xs font-medium capitalize">{tipo}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de Bloque */}
        <div>
          <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
            Preferencia de Bloque
          </Label>
          <Select 
            value={propiedades.tipoBloque} 
            onValueChange={(v: 'premium' | 'estandar' | 'economico') => onUpdate({ tipoBloque: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500 text-white text-xs">Premium</Badge>
                  <span>Prime Time</span>
                </div>
              </SelectItem>
              <SelectItem value="estandar">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white text-xs">Estándar</Badge>
                  <span>Horario Regular</span>
                </div>
              </SelectItem>
              <SelectItem value="economico">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-500 text-white text-xs">Económico</Badge>
                  <span>Trasnoche/Rotativo</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoría */}
        <div>
          <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
            Categoría Anunciante
          </Label>
          <Select 
            value={propiedades.categoriaAnunciante} 
            onValueChange={(v) => onUpdate({ categoriaAnunciante: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridad Comercial */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-gray-500 uppercase tracking-wider">
              Prioridad Comercial
            </Label>
            <Badge 
              className={`
                ${propiedades.prioridadComercial >= 8 ? 'bg-purple-600' : 
                  propiedades.prioridadComercial >= 5 ? 'bg-blue-600' : 'bg-gray-500'}
                text-white
              `}
            >
              {propiedades.prioridadComercial}/10
            </Badge>
          </div>
          <Slider 
            value={[propiedades.prioridadComercial]}
            min={1}
            max={10}
            step={1}
            onValueChange={([v]) => onUpdate({ prioridadComercial: v })}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Baja</span>
            <span>Media</span>
            <span>Alta</span>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Configuración Avanzada */}
        <div>
          <Label className="text-xs text-gray-500 uppercase tracking-wider mb-3 block">
            Configuración Avanzada
          </Label>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">Exclusividad</span>
              </div>
              <Switch 
                checked={propiedades.aplicarExclusividad}
                onCheckedChange={(v) => onUpdate({ aplicarExclusividad: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-700">Permitir Override</span>
              </div>
              <Switch 
                checked={propiedades.permitirOverride}
                onCheckedChange={(v) => onUpdate({ permitirOverride: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">Notificar Conflictos</span>
              </div>
              <Switch 
                checked={propiedades.notificarConflictos}
                onCheckedChange={(v) => onUpdate({ notificarConflictos: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-gray-700">Auto-Optimizar</span>
              </div>
              <Switch 
                checked={propiedades.autoOptimizar}
                onCheckedChange={(v) => onUpdate({ autoOptimizar: v })}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Emisora Info */}
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <Radio className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{emisora}</p>
              <p className="text-xs text-gray-500">Emisora Principal</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded border">
              <p className="text-gray-500">Cap. Prime</p>
              <p className="font-bold text-gray-900">12 min/hr</p>
            </div>
            <div className="p-2 bg-white rounded border">
              <p className="text-gray-500">Saturación</p>
              <p className="font-bold text-emerald-600">68%</p>
            </div>
          </div>
        </Card>

        {/* Estado de Validación */}
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Configuración Válida</p>
            <p className="text-xs text-emerald-600">Sin conflictos detectados</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelPropiedades;
