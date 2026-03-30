/**
 * SILEXAR PULSE - TIER0+ PESTAÑA FACTURAS
 * Componente de Gestión de Facturas para Wizard de Campaña
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, CreditCard } from 'lucide-react';

export interface FacturacionData {
    tipoFacturacion: 'MENSUAL' | 'QUINCENAL' | 'UNICA';
    direccionEnvio: 'ANUNCIANTE' | 'AGENCIA';
    ordenCompra?: string;
    numeroHES?: string;
}

interface PestanaFacturasTier0Props {
    readonly data?: Partial<FacturacionData>;
    readonly onChange?: (data: FacturacionData) => void;
    readonly readonly?: boolean;
    readonly className?: string;
}

export const PestanaFacturasTier0: React.FC<PestanaFacturasTier0Props> = ({
    data = {},
    onChange,
    readonly = false,
    className = '',
}) => {
    const handleChange = (field: keyof FacturacionData, value: unknown) => {
        onChange?.({
            tipoFacturacion: data.tipoFacturacion || 'MENSUAL',
            direccionEnvio: data.direccionEnvio || 'ANUNCIANTE',
            ordenCompra: data.ordenCompra,
            numeroHES: data.numeroHES,
            [field]: value,
        });
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Facturación</h3>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Configuración de Facturación
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Tipo de Facturación</Label>
                        <Select
                            value={data.tipoFacturacion || 'MENSUAL'}
                            onValueChange={(v) => handleChange('tipoFacturacion', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MENSUAL">Mensual</SelectItem>
                                <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                                <SelectItem value="UNICA">Única</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Dirección de Envío</Label>
                        <Select
                            value={data.direccionEnvio || 'ANUNCIANTE'}
                            onValueChange={(v) => handleChange('direccionEnvio', v)}
                            disabled={readonly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ANUNCIANTE">Anunciante</SelectItem>
                                <SelectItem value="AGENCIA">Agencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Orden de Compra</Label>
                        <Input
                            value={data.ordenCompra || ''}
                            onChange={(e) => handleChange('ordenCompra', e.target.value)}
                            disabled={readonly}
                            placeholder="Número OC"
                        />
                    </div>
                    <div>
                        <Label>Número HES</Label>
                        <Input
                            value={data.numeroHES || ''}
                            onChange={(e) => handleChange('numeroHES', e.target.value)}
                            disabled={readonly}
                            placeholder="Número HES"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PestanaFacturasTier0;
