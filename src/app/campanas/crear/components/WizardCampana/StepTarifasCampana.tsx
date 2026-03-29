/**
 * 💰 Step 3: Configuración de Tarifas
 * 
 * Define el modelo financiero de la campaña:
 * - Modalidad: Paquete vs Spot
 * - Descuentos comerciales
 * - Comisiones de agencia
 */

import React, { useEffect } from 'react';
import { WizardStepProps } from './types/wizard.types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Calculator, DollarSign, Percent, Briefcase, 
  TrendingDown, TrendingUp, CheckCircle2 
} from 'lucide-react';
import { TablaDescuentos } from './TablaDescuentos';

interface Descuento {
  id: string;
  nombre: string;
  porcentaje: number;
  activo: boolean;
  tipo: 'contractual' | 'volumen' | 'pronto_pago';
}

interface TarifasData {
  modalidad?: 'paquete' | 'spot';
  valorBruto?: number;
  descuentos?: Descuento[];
  comisionAgencia?: number;
  valorNeto?: number;
}

interface StepTarifasProps extends WizardStepProps {
  data: TarifasData;
  onUpdate: (data: Partial<TarifasData>) => void;
}

export const StepTarifasCampana: React.FC<StepTarifasProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActive, 
  onComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
  data,
  onUpdate
}) => {
  // Initialize defaults
  useEffect(() => {
    if (!data.modalidad) {
      onUpdate({
        modalidad: 'paquete',
        valorBruto: 0,
        comisionAgencia: 15, // Standard agency commission
        descuentos: [
          { id: '1', nombre: 'Descuento Agencia AAA', porcentaje: 5, activo: true, tipo: 'contractual' },
          { id: '2', nombre: 'Volumen Q4', porcentaje: 3, activo: false, tipo: 'volumen' },
          { id: '3', nombre: 'Pronto Pago', porcentaje: 2, activo: false, tipo: 'pronto_pago' }
        ]
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals and validate
  useEffect(() => {
    if (data.valorBruto !== undefined && data.comisionAgencia !== undefined && data.descuentos) {
      const activeDiscounts = data.descuentos.filter(d => d.activo).reduce((acc, curr) => acc + curr.porcentaje, 0);
      const discountAmount = (data.valorBruto * activeDiscounts) / 100;
      const subtotal = data.valorBruto - discountAmount;
      const commissionAmount = (subtotal * data.comisionAgencia) / 100;
      const finalNeto = subtotal - commissionAmount;

      // Update calculated net value if different
      if (data.valorNeto !== finalNeto) {
        onUpdate({ valorNeto: finalNeto });
      }

      // Validate step completion
      if (data.valorBruto > 0) {
        onComplete();
      }
    }
  }, [data, onUpdate, onComplete]);

  const toggleDescuento = (id: string, checked: boolean) => {
    const newDescuentos = data.descuentos?.map(d => 
      d.id === id ? { ...d, activo: checked } : d
    );
    onUpdate({ descuentos: newDescuentos });
  };

  const calculateTotals = () => {
    const bruto = data.valorBruto || 0;
    const activeDiscountsPct = data.descuentos?.filter(d => d.activo).reduce((acc, curr) => acc + curr.porcentaje, 0) || 0;
    const descuentoMonto = (bruto * activeDiscountsPct) / 100;
    const subtotal = bruto - descuentoMonto;
    const comisionMonto = (subtotal * (data.comisionAgencia || 0)) / 100;
    
    return { bruto, descuentoMonto, subtotal, comisionMonto, neto: subtotal - comisionMonto };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración Financiera</h2>
          <p className="text-gray-500">Define los valores, descuentos y comisiones aplicables</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Col: Setup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Modalidad */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Modalidad de Venta
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => onUpdate({ modalidad: 'paquete' })}
                className={`
                  cursor-pointer p-4 rounded-xl border-2 transition-all
                  ${data.modalidad === 'paquete' 
                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-200' 
                    : 'border-slate-100 hover:border-blue-200'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${data.modalidad === 'paquete' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900">Paquete Acordado</span>
                </div>
                <p className="text-xs text-slate-500">Valor fijo total por el conjunto de espacios publicitarios.</p>
              </div>

              <div 
                onClick={() => onUpdate({ modalidad: 'spot' })}
                className={`
                  cursor-pointer p-4 rounded-xl border-2 transition-all
                  ${data.modalidad === 'spot' 
                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-200' 
                    : 'border-slate-100 hover:border-blue-200'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${data.modalidad === 'spot' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'}`}>
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-900">Tarifa Unitarias</span>
                </div>
                <p className="text-xs text-slate-500">Valor individual calculado según la tarifa de cada spot.</p>
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-base">Valor Bruto de la Campaña</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  type="number"
                  value={data.valorBruto || ''}
                  onChange={(e) => onUpdate({ valorBruto: Number(e.target.value) })}
                  className="pl-12 py-6 text-xl font-bold text-slate-900 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          </Card>

          {/* Discounts */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              Descuentos Aplicables
            </h3>
            
            <div className="space-y-4">
            {data.descuentos?.map((desc) => (
                <div key={desc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={desc.activo}
                      onCheckedChange={(c) => toggleDescuento(desc.id, c)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{desc.nombre}</p>
                      <p className="text-xs text-emerald-600 font-medium">-{desc.porcentaje}%</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-500">
                    {desc.activo ? `-$${((data.valorBruto || 0) * (desc.porcentaje/100)).toLocaleString()}` : '$0'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tabla Descuentos Avanzada */}
          <TablaDescuentos 
            valorBruto={data.valorBruto || 0}
            descuentos={(data.descuentos || []).map(d => ({ ...d, aplicaA: 'global' as const, tipo: d.tipo as 'cliente' | 'volumen' | 'pronto_pago' | 'especial' }))}
            onUpdateDescuentos={(descuentosNuevos) => onUpdate({ 
              descuentos: descuentosNuevos.map(d => ({
                id: d.id,
                nombre: d.nombre,
                porcentaje: d.porcentaje,
                activo: true,
                tipo: d.tipo as 'contractual' | 'volumen' | 'pronto_pago'
              }))
            })}
          />
        </div>

        {/* Right Col: Summary & Agency */}
        <div className="space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-gray-200/50 text-gray-800">
             <h3 className="font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Resumen Financiero
            </h3>
            
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Valor Bruto</span>
                <span className="font-medium">${totals.bruto.toLocaleString()}</span>
               </div>
               
               <div className="flex justify-between items-center text-sm text-emerald-400">
                <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Descuentos</span>
                <span className="font-medium">-${totals.descuentoMonto.toLocaleString()}</span>
               </div>

               <div className="h-px bg-slate-800 my-2" />
               
               <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium">${totals.subtotal.toLocaleString()}</span>
               </div>

               <div className="flex justify-between items-center text-sm text-blue-400">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Comisión ({data.comisionAgencia}%)</span>
                <span className="font-medium">-${totals.comisionMonto.toLocaleString()}</span>
               </div>

               <div className="h-px bg-slate-800 my-4" />

               <div className="flex justify-between items-end">
                  <span className="text-slate-400 text-sm">Total Neto</span>
                  <span className="text-3xl font-bold text-white">${totals.neto.toLocaleString()}</span>
               </div>
            </div>
          </Card>

           <Card className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                Comisión Agencia
              </h3>
              <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                {data.comisionAgencia}%
              </span>
            </div>
            
            <Slider 
              value={[data.comisionAgencia || 0]} 
              max={30} 
              step={0.5}
              onValueChange={(vals) => onUpdate({ comisionAgencia: vals[0] })}
              className="py-4"
            />
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Dentro de parámetros estándar TIER0 (0-30%)
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
