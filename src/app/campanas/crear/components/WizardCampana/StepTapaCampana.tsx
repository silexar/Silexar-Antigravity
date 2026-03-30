/**
 * 📋 Step 2: Tapa de Campaña (Información General)
 * 
 * Captura la información comercial y administrativa básica de la campaña.
 * Si viene de contrato, estos datos se pre-cargan.
 */

import React, { useEffect } from 'react';
import { WizardStepProps } from './types/wizard.types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Building, User, FileText, Tag } from 'lucide-react';
import { PanelPropiedadesWizard } from './PanelPropiedadesWizard';

interface TapaData {
  nombre?: string;
  anunciante?: string;
  producto?: string;
  referenciaCliente?: string;
  ordenAgencia?: string;
  ordenCompra?: string;
  hes?: string;
  fechaInicio?: string;
  fechaFin?: string;
  agenciaCreativa?: string;
  agenciaMedios?: string;
  ejecutivo?: string;
  emisoraPrincipal?: string;
  // Propiedades Enterprise
  tipoPedido?: string;
  tipoPauta?: string;
  categoria?: string;
}

interface StepTapaProps extends WizardStepProps {
  data: TapaData;
  onUpdate: (data: Partial<TapaData>) => void;
  isFromContract?: boolean;
}

export const StepTapaCampana: React.FC<StepTapaProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isActive,
  onComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
  data,
  onUpdate,
  isFromContract = false
}) => {
  // Mock pre-fill if coming from contract and empty
  useEffect(() => {
    if (isFromContract && !data.nombre) {
      onUpdate({
        nombre: 'Promoción Navidad Premium 2025',
        anunciante: 'BANCO DE CHILE',
        producto: 'Tarjeta de Crédito Joven',
        referenciaCliente: 'DICIEMBRE 2025',
        fechaInicio: '2025-12-01',
        fechaFin: '2025-12-31',
        ejecutivo: 'Ana García',
        agenciaMedios: 'Carat Chile',
        agenciaCreativa: 'Universal McCann',
        emisoraPrincipal: 'T13 Radio'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFromContract]);

  // Validation effect
  useEffect(() => {
    const isValid = !!(
      data.nombre && 
      data.anunciante && 
      data.fechaInicio && 
      data.fechaFin &&
      data.emisoraPrincipal
    );
    if (isValid) {
      onComplete();
    }
  }, [data, onComplete]);

  const handleChange = (field: keyof TapaData, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Información General</h2>
          <p className="text-gray-500">Datos principales de la campaña y referencias comerciales</p>
        </div>
        {isFromContract && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"/>
            Datos sincronizados con Contrato TIER0
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Core Data */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Datos Principales
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombreCampana">Nombre de Campaña <span className="text-red-500">*</span></Label>
                <Input 
                  id="nombreCampana"
                  value={data.nombre || ''}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: Verano 2026 - Lanzamiento"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="referenciaCliente">Referencia Cliente</Label>
                <Input 
                  id="referenciaCliente"
                  value={data.referenciaCliente || ''}
                  onChange={(e) => handleChange('referenciaCliente', e.target.value)}
                  placeholder="Referencia interna del cliente"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ordenAgencia">Orden Agencia</Label>
                  <Input 
                    id="ordenAgencia"
                    value={data.ordenAgencia || ''}
                    onChange={(e) => handleChange('ordenAgencia', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ordenCompra">Orden Compra (801)</Label>
                  <Input 
                    id="ordenCompra"
                    value={data.ordenCompra || ''}
                    onChange={(e) => handleChange('ordenCompra', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hes">HES (802)</Label>
                <Input 
                  id="hes"
                  value={data.hes || ''}
                  onChange={(e) => handleChange('hes', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Vigencia
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaInicio">Fecha Inicio <span className="text-red-500">*</span></Label>
                <Input 
                  id="fechaInicio"
                  type="date"
                  value={data.fechaInicio || ''}
                  onChange={(e) => handleChange('fechaInicio', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fechaFin">Fecha Término <span className="text-red-500">*</span></Label>
                <Input 
                  id="fechaFin"
                  type="date"
                  value={data.fechaFin || ''}
                  onChange={(e) => handleChange('fechaFin', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Commercial & Agencies */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm bg-slate-50/50">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Datos Comerciales
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="anunciante">Anunciante <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="anunciante"
                    value={data.anunciante || ''}
                    onChange={(e) => handleChange('anunciante', e.target.value)}
                    className="pl-9 bg-white"
                    readOnly={isFromContract} // If from contract, usually readonly
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="producto">Producto <span className="text-red-500">*</span></Label>
                <div className="relative mt-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    id="producto"
                    value={data.producto || ''}
                    onChange={(e) => handleChange('producto', e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="emisora">Emisora Principal <span className="text-red-500">*</span></Label>
                <Select 
                  value={data.emisoraPrincipal} 
                  onValueChange={(val) => handleChange('emisoraPrincipal', val)}
                >
                  <SelectTrigger className="mt-1 bg-white">
                    <SelectValue placeholder="Seleccionar emisora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T13 Radio">T13 Radio</SelectItem>
                    <SelectItem value="Play FM">Play FM</SelectItem>
                    <SelectItem value="Sonar FM">Sonar FM</SelectItem>
                    <SelectItem value="Tele13 Radio">Tele13 Radio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ejecutivo">Ejecutivo Responsable</Label>
                <Input 
                  id="ejecutivo"
                  value={data.ejecutivo || ''}
                  onChange={(e) => handleChange('ejecutivo', e.target.value)}
                  className="mt-1 bg-white"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              Agencias
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="agenciaCreativa">Agencia Creativa</Label>
                <Input 
                  id="agenciaCreativa"
                  value={data.agenciaCreativa || ''}
                  onChange={(e) => handleChange('agenciaCreativa', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="agenciaMedios">Agencia de Medios</Label>
                <Input 
                  id="agenciaMedios"
                  value={data.agenciaMedios || ''}
                  onChange={(e) => handleChange('agenciaMedios', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            </Card>
        </div>

        {/* Third Column: Properties Panel */}
        <div className="hidden lg:block">
          <PanelPropiedadesWizard
            seleccionadas={{
              tipoPedido: data.tipoPedido,
              tipoPauta: data.tipoPauta,
              categoria: data.categoria
            }}
            onUpdate={(props) => {
              onUpdate({
                tipoPedido: props.tipoPedido,
                tipoPauta: props.tipoPauta,
                categoria: props.categoria
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
