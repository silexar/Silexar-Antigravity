/**
 * SILEXAR PULSE - TIER0+ PESTAÑA TARIFAS
 * Componente de Gestión de Tarifas para Wizard de Campaña
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Calculator } from 'lucide-react';

export interface TarifaData {
    tipoTarifa: 'CUNA' | 'PAQUETE' | 'SPOT';
    valorBase: number;
    descuento: number;
    comision: number;
}

interface PestanaTarifasTier0Props {
    readonly data?: Partial<TarifaData>;
    readonly onChange?: (data: TarifaData) => void;
    readonly readonly?: boolean;
    readonly className?: string;
}

export const PestanaTarifasTier0: React.FC<PestanaTarifasTier0Props> = ({
    data = {},
    onChange,
    readonly = false,
    className = '',
}) => {
    const handleChange = (field: keyof TarifaData, value: unknown) => {
        onChange?.({
            tipoTarifa: data.tipoTarifa || 'CUNA',
            valorBase: data.valorBase || 0,
            descuento: data.descuento || 0,
            comision: data.comision || 0,
            [field]: value,
        });
    };

    const valorNeto = (data.valorBase || 0) * (1 - (data.descuento || 0) / 100);
    const valorConComision = valorNeto * (1 - (data.comision || 0) / 100);

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Configuración de Tarifas</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Tipo de Tarifa</Label>
                    <Select
                        value={data.tipoTarifa || 'CUNA'}
                        onValueChange={(v) => handleChange('tipoTarifa', v)}
                        disabled={readonly}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CUNA">Por Cuña</SelectItem>
                            <SelectItem value="PAQUETE">Paquete</SelectItem>
                            <SelectItem value="SPOT">Spot</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Valor Base</Label>
                    <Input
                        type="number"
                        value={data.valorBase || ''}
                        onChange={(e) => handleChange('valorBase', Number(e.target.value))}
                        disabled={readonly}
                        placeholder="0"
                    />
                </div>
                <div>
                    <Label>Descuento (%)</Label>
                    <Input
                        type="number"
                        value={data.descuento || ''}
                        onChange={(e) => handleChange('descuento', Number(e.target.value))}
                        disabled={readonly}
                        placeholder="0"
                        min={0}
                        max={100}
                    />
                </div>
                <div>
                    <Label>Comisión (%)</Label>
                    <Input
                        type="number"
                        value={data.comision || ''}
                        onChange={(e) => handleChange('comision', Number(e.target.value))}
                        disabled={readonly}
                        placeholder="0"
                        min={0}
                        max={100}
                    />
                </div>
            </div>

            <Card className="bg-gray-50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Resumen de Valores
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Valor Base</p>
                        <p className="font-bold">${(data.valorBase || 0).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Valor Neto</p>
                        <p className="font-bold text-green-600">${valorNeto.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Valor Final</p>
                        <p className="font-bold text-blue-600">${valorConComision.toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PestanaTarifasTier0;
