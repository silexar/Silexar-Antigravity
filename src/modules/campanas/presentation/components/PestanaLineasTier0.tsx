/**
 * SILEXAR PULSE - TIER0+ PESTAÑA LÍNEAS
 * Componente de Gestión de Líneas para Wizard de Campaña
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, List } from 'lucide-react';

export interface LineaCampana {
    id: string;
    descripcion: string;
    cantidad: number;
    valorUnitario: number;
}

interface PestanaLineasTier0Props {
    readonly lineas?: LineaCampana[];
    readonly onChange?: (lineas: LineaCampana[]) => void;
    readonly readonly?: boolean;
    readonly className?: string;
}

export const PestanaLineasTier0: React.FC<PestanaLineasTier0Props> = ({
    lineas = [],
    onChange,
    readonly = false,
    className = '',
}) => {
    const [nuevaLinea, setNuevaLinea] = useState<Partial<LineaCampana>>({});

    const agregarLinea = () => {
        if (!nuevaLinea.descripcion) return;
        const linea: LineaCampana = {
            id: `linea_${Date.now()}`,
            descripcion: nuevaLinea.descripcion,
            cantidad: nuevaLinea.cantidad || 1,
            valorUnitario: nuevaLinea.valorUnitario || 0,
        };
        onChange?.([...lineas, linea]);
        setNuevaLinea({});
    };

    const eliminarLinea = (id: string) => {
        onChange?.(lineas.filter(l => l.id !== id));
    };

    const totalValor = lineas.reduce((sum, l) => sum + (l.cantidad * l.valorUnitario), 0);

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Líneas de Campaña</h3>
                </div>
                <span className="text-sm text-gray-500">{lineas.length} líneas</span>
            </div>

            {!readonly && (
                <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <Label>Descripción</Label>
                                <Input
                                    value={nuevaLinea.descripcion || ''}
                                    onChange={(e) => setNuevaLinea({ ...nuevaLinea, descripcion: e.target.value })}
                                    placeholder="Descripción de la línea"
                                />
                            </div>
                            <div>
                                <Label>Cantidad</Label>
                                <Input
                                    type="number"
                                    value={nuevaLinea.cantidad || ''}
                                    onChange={(e) => setNuevaLinea({ ...nuevaLinea, cantidad: Number(e.target.value) })}
                                    min={1}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={agregarLinea} className="w-full">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Agregar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                {lineas.map((linea) => (
                    <Card key={linea.id}>
                        <CardContent className="flex items-center justify-between p-3">
                            <div className="flex-1">
                                <p className="font-medium">{linea.descripcion}</p>
                                <p className="text-sm text-gray-500">
                                    {linea.cantidad} x ${linea.valorUnitario.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold">
                                    ${(linea.cantidad * linea.valorUnitario).toLocaleString()}
                                </span>
                                {!readonly && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => eliminarLinea(linea.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {lineas.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="flex items-center justify-between p-4">
                        <span className="font-medium text-blue-700">Total</span>
                        <span className="text-xl font-bold text-blue-700">
                            ${totalValor.toLocaleString()}
                        </span>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PestanaLineasTier0;
