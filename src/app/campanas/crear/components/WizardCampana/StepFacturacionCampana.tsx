/**
 * 🧾 Step 4: Configuración de Facturación
 * 
 * Define las preferencias administrativas y fiscales para la facturación
 * automática de la campaña.
 */

import React, { useEffect, useState } from 'react';
import { WizardStepProps } from './types/wizard.types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  FileText, Calendar, CreditCard, Building, MapPin, 
  ShieldCheck
} from 'lucide-react';
import { TablaFacturas } from './TablaFacturas';

interface FacturacionData {
  estiloFacturacion?: 'posterior' | 'inmediata' | 'intercambio';
  facturacionPor?: 'mensual' | 'global' | 'por_linea';
  diasPago?: number;
  direccionFacturacion?: 'anunciante' | 'agencia' | 'otra';
  ordenFacturacion?: string;
  facturas?: Array<{
    id: string;
    numero?: string;
    credito: boolean;
    fechaEmision: string;
    fechaInicio: string;
    fechaFinal: string;
    valorBruto: number;
    valorNeto: number;
    estado: 'pendiente' | 'emitida' | 'enviada' | 'pagada' | 'anulada';
  }>;
  valorCampana?: number;
}

interface StepFacturacionProps extends WizardStepProps {
  data: FacturacionData;
  onUpdate: (data: Partial<FacturacionData>) => void;
}

export const StepFacturacionCampana: React.FC<StepFacturacionProps> = ({
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
    if (!data.estiloFacturacion) {
      onUpdate({
        estiloFacturacion: 'posterior',
        facturacionPor: 'mensual',
        diasPago: 30,
        direccionFacturacion: 'anunciante'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation
  useEffect(() => {
    if (data.estiloFacturacion && data.facturacionPor && data.diasPago) {
      onComplete();
    }
  }, [data, onComplete]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Datos de Facturación</h2>
          <p className="text-gray-500">Configura cómo y cuándo se generarán los documentos tributarios</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Col: Billing Method */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Estilo de Facturación
            </h3>
            
            <RadioGroup 
              value={data.estiloFacturacion} 
              onValueChange={(val) => onUpdate({ estiloFacturacion: val as any })}
              className="space-y-4"
            >
              <div className={`
                flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${data.estiloFacturacion === 'posterior' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}
              `}>
                <RadioGroupItem value="posterior" id="posterior" className="mt-1" />
                <Label htmlFor="posterior" className="cursor-pointer">
                  <span className="font-bold text-gray-900 block mb-1">Factura a Posteriori (Mensual)</span>
                  <span className="text-slate-500 text-xs leading-relaxed block">
                    Se emite al final del mes o período, consolidando lo efectivamente emitido. Estándar para grandes clientes.
                  </span>
                </Label>
              </div>

              <div className={`
                flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${data.estiloFacturacion === 'inmediata' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}
              `}>
                <RadioGroupItem value="inmediata" id="inmediata" className="mt-1" />
                <Label htmlFor="inmediata" className="cursor-pointer">
                  <span className="font-bold text-gray-900 block mb-1">Factura Inmediata (Anticipada)</span>
                  <span className="text-slate-500 text-xs leading-relaxed block">
                    Se emite al confirmar la campaña. Requiere pago o gestión antes de la emisión.
                  </span>
                </Label>
              </div>

              <div className={`
                flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${data.estiloFacturacion === 'intercambio' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}
              `}>
                <RadioGroupItem value="intercambio" id="intercambio" className="mt-1" />
                <Label htmlFor="intercambio" className="cursor-pointer">
                  <span className="font-bold text-gray-900 block mb-1">Intercambio / Canje</span>
                  <span className="text-slate-500 text-xs leading-relaxed block">
                    Sin movimiento de flujo de caja. Se emite factura por servicios intercambiados.
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          <Card className="p-6">
             <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Frecuencia de Emisión
            </h3>
            <Select 
              value={data.facturacionPor} 
              onValueChange={(val) => onUpdate({ facturacionPor: val as any })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccione frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Una factura por mes calendario</SelectItem>
                <SelectItem value="global">Una factura por toda la campaña</SelectItem>
                <SelectItem value="por_linea">Facturar por línea de producto</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* Right Col: Details */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Condiciones de Pago
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Días de Pago</Label>
                <Select 
                  value={data.diasPago?.toString()} 
                  onValueChange={(val) => onUpdate({ diasPago: parseInt(val) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccione plazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Días</SelectItem>
                    <SelectItem value="45">45 Días</SelectItem>
                    <SelectItem value="60">60 Días</SelectItem>
                    <SelectItem value="90">90 Días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div>
                <Label>Orden de Facturación (Opcional)</Label>
                <Input 
                  value={data.ordenFacturacion || ''}
                  onChange={(e) => onUpdate({ ordenFacturacion: e.target.value })}
                  placeholder="Ej: OF-2025-001"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

           <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Dirección Tributaria
            </h3>
            
             <RadioGroup 
              value={data.direccionFacturacion} 
              onValueChange={(val) => onUpdate({ direccionFacturacion: val as any })}
              className="space-y-3"
            >
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="anunciante" id="dir_anunciante" />
                <Label htmlFor="dir_anunciante" className="flex items-center gap-2">
                   <Building className="w-4 h-4 text-slate-400" />
                   Dirección del Anunciante
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="agencia" id="dir_agencia" />
                <Label htmlFor="dir_agencia" className="flex items-center gap-2">
                   <Building className="w-4 h-4 text-slate-400" />
                   Dirección de la Agencia
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="otra" id="dir_otra" />
                <Label htmlFor="dir_otra">Otra Dirección</Label>
              </div>
            </RadioGroup>
          </Card>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
             <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
             <div>
                <h4 className="font-bold text-emerald-900 text-sm">Validación SII Activa</h4>
                <p className="text-emerald-700 text-xs mt-1">
                  El sistema validará automáticamente los datos tributarios con el SII antes de la emisión.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="mt-6">
        <TablaFacturas
          facturas={data.facturas || []}
          onUpdateFacturas={(facturas) => onUpdate({ facturas })}
          valorCampana={data.valorCampana || 2500000}
        />
      </div>
    </div>
  );
};
