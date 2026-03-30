/**
 * 🎯 Step 1: Selección de Origen TIER0 Enterprise 2050
 * 
 * Permite al usuario elegir cómo iniciar la campaña:
 * 1. Desde Contrato (Recomendado TIER0)
 * 2. Desde Orden de Agencia (OCR IA) 🆕
 * 3. Nueva desde Cero (Manual)
 * 4. Clonar Existente (Template)
 * 
 * @enterprise TIER0 Fortune 10
 */

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WizardStepProps } from './types/wizard.types';
import { FileText, PlusCircle, Copy, Search, Brain, Upload, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OCROrdenAgencia from './OCROrdenAgencia';
import UploadVisualCampana from './UploadVisualCampana';
import { BuscadorContratos } from './BuscadorContratos';

// Mock types for props
interface StepOrigenProps extends WizardStepProps {
  selectedType: 'contrato' | 'nueva' | 'clon' | 'orden';
  onSelectType: (type: 'contrato' | 'nueva' | 'clon' | 'orden') => void;
  onSelectContrato?: (id: string) => void;
  onDatosOrdenExtraidos?: (datos: unknown) => void;
}

export const StepOrigenCampana: React.FC<StepOrigenProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActive,
  onComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
  selectedType,
  onSelectType,
  onSelectContrato,
  onDatosOrdenExtraidos
}) => {
  // Validate step on mount/change to allow advance
  useEffect(() => {
    if (selectedType) {
      onComplete();
    }
  }, [selectedType, onComplete]);

  const originOptions = [
    {
      id: 'contrato',
      icon: FileText,
      title: 'Desde Contrato Existente',
      description: 'La forma TIER0 recomendada. Auto-completa todos los datos desde un contrato comercial vigente.',
      badge: '⭐ Recomendado IA',
      badgeColor: 'bg-blue-600',
      color: 'blue'
    },
    {
      id: 'orden',
      icon: Upload,
      title: 'Desde Orden de Agencia',
      description: '🤖 Sube un PDF/Excel con la orden y la IA extraerá automáticamente todos los datos.',
      badge: '🆕 OCR Inteligente',
      badgeColor: 'bg-purple-600',
      color: 'purple'
    },
    {
      id: 'nueva',
      icon: PlusCircle,
      title: 'Campaña Nueva (Manual)',
      description: 'Crear una campaña desde cero. Flexible pero requiere carga manual de datos.',
      badge: 'Básica',
      badgeColor: 'bg-slate-500',
      color: 'slate'
    },
    {
      id: 'clon',
      icon: Copy,
      title: 'Clonar Existente',
      description: 'Utilizar una campaña anterior como plantilla para acelerar la carga.',
      badge: 'Rápido',
      badgeColor: 'bg-green-600',
      color: 'green'
    }
  ] as const;

  const handleCrearDesdOrden = (datos: unknown) => {
    if (onDatosOrdenExtraidos) {
      onDatosOrdenExtraidos(datos);
    }
    onComplete();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">¿Cómo quieres crear la campaña?</h2>
        <p className="text-gray-500 mt-2">Selecciona el método de origen para configurar tu nueva campaña</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {originOptions.map((option) => {
          const isSelected = selectedType === option.id;
          const Icon = option.icon;
          
          return (
            <Card
              key={option.id}
              onClick={() => onSelectType(option.id as 'contrato' | 'nueva' | 'clon' | 'orden')}
              className={`
                relative p-5 cursor-pointer transition-all duration-300 border-2
                hover:shadow-xl hover:-translate-y-1 group
                ${isSelected 
                  ? `border-${option.color}-500 bg-${option.color}-50/50 shadow-lg ring-2 ring-${option.color}-200` 
                  : 'border-slate-100 hover:border-blue-300'
                }
                ${option.id === 'orden' ? 'bg-gradient-to-br from-purple-50/50 to-indigo-50/50' : ''}
              `}
            >
              {isSelected && (
                <div className={`absolute top-3 right-3 text-${option.color}-600 bg-white rounded-full p-1`}>
                  <div className={`w-3 h-3 rounded-full bg-${option.color}-600`} />
                </div>
              )}

              <div className={`
                w-11 h-11 rounded-xl flex items-center justify-center mb-3
                transition-colors duration-300
                ${isSelected ? `bg-${option.color}-100 text-${option.color}-600` : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
              `}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="mb-2">
                <h3 className={`font-bold text-base ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {option.title}
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                {option.description}
              </p>

              <Badge className={`${option.badgeColor} text-white text-xs`}>
                {option.badge}
              </Badge>
            </Card>
          );
        })}
      </div>

      {/* Contract Search Section */}
      {selectedType === 'contrato' && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Búsqueda Inteligente de Contratos
            </h3>
            <span className="text-xs text-purple-600 font-medium px-2 py-1 bg-purple-100 rounded-full">
              Cortex Search Active
            </span>
          </div>
          
          {/* Buscador Contratos Avanzado */}
          <BuscadorContratos 
            onSelect={(contrato) => {
              if (onSelectContrato) {
                onSelectContrato(contrato.id);
              }
              onComplete();
            }}
          />
        </div>
      )}

      {/* OCR Orden Section */}
      {selectedType === 'orden' && (
        <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              🤖 Extracción Automática con IA
            </h3>
            <Badge className="bg-purple-600 text-white">
              OCR Cortex-Vision
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Sube un PDF, Excel o imagen de la orden de agencia. La IA identificará automáticamente:
          </p>

          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-white/80 rounded-lg text-center">
              <p className="font-bold text-purple-600">Cliente</p>
              <p className="text-xs text-gray-500">Auto-detect</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg text-center">
              <p className="font-bold text-purple-600">Tipo</p>
              <p className="text-xs text-gray-500">Prime/Auspicio</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg text-center">
              <p className="font-bold text-purple-600">Fechas</p>
              <p className="text-xs text-gray-500">Período</p>
            </div>
            <div className="p-3 bg-white/80 rounded-lg text-center">
              <p className="font-bold text-purple-600">Líneas</p>
              <p className="text-xs text-gray-500">Programa/Horario</p>
            </div>
          </div>

          <div className="flex gap-3">
            <OCROrdenAgencia onCrearCampana={handleCrearDesdOrden} />
            <UploadVisualCampana />
          </div>
        </div>
      )}

      {/* Nueva Manual Section */}
      {selectedType === 'nueva' && (
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-slate-600" />
              Creación Manual
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Crearás la campaña paso a paso, ingresando manualmente:
          </p>

          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li>• Datos del anunciante y agencia</li>
            <li>• Período y tarifas</li>
            <li>• Líneas de programación</li>
            <li>• Materiales y planificación</li>
          </ul>

          <Button variant="outline" className="gap-2">
            Continuar con creación manual →
          </Button>
        </div>
      )}

      {/* Clone Section */}
      {selectedType === 'clon' && (
        <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Copy className="w-5 h-5 text-green-600" />
              Clonar Campaña Existente
            </h3>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="Buscar campaña a clonar..." 
              className="pl-12 py-4 bg-white border-green-200"
            />
          </div>

          <div className="space-y-2">
            {[
              { id: 'CAM-2024-156', client: 'BANCO CHILE', name: 'Campaña Navidad 2024' },
              { id: 'CAM-2024-134', client: 'ENTEL', name: 'Lanzamiento 5G' },
            ].map(camp => (
              <div key={camp.id} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-green-400 cursor-pointer">
                <div>
                  <p className="font-medium">{camp.client}</p>
                  <p className="text-sm text-gray-500">{camp.id} • {camp.name}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 text-green-600">
                  <Copy className="w-3 h-3" />
                  Clonar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
