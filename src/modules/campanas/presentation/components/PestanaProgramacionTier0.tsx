/**
 * SILEXAR PULSE - TIER0+ PESTAÑA PROGRAMACIÓN
 * Componente de Gestión de Programación para Wizard de Campaña
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

export interface ProgramacionData {
    fechaInicio: string;
    fechaFin: string;
    horaInicio: string;
    horaFin: string;
    diasSemana: string[];
}

interface PestanaProgramacionTier0Props {
    readonly data?: Partial<ProgramacionData>;
    readonly onChange?: (data: ProgramacionData) => void;
    readonly readonly?: boolean;
    readonly className?: string;
}

export const PestanaProgramacionTier0: React.FC<PestanaProgramacionTier0Props> = ({
    data = {},
    onChange,
    readonly = false,
    className = '',
}) => {
    const handleChange = (field: keyof ProgramacionData, value: unknown) => {
        onChange?.({
            fechaInicio: data.fechaInicio || '',
            fechaFin: data.fechaFin || '',
            horaInicio: data.horaInicio || '06:00',
            horaFin: data.horaFin || '22:00',
            diasSemana: data.diasSemana || ['LUN', 'MAR', 'MIE', 'JUE', 'VIE'],
            [field]: value,
        });
    };

    const diasLabels = [
        { id: 'LUN', label: 'Lun' },
        { id: 'MAR', label: 'Mar' },
        { id: 'MIE', label: 'Mié' },
        { id: 'JUE', label: 'Jue' },
        { id: 'VIE', label: 'Vie' },
        { id: 'SAB', label: 'Sáb' },
        { id: 'DOM', label: 'Dom' },
    ];

    const toggleDia = (dia: string) => {
        const current = data.diasSemana || [];
        const updated = current.includes(dia)
            ? current.filter(d => d !== dia)
            : [...current, dia];
        handleChange('diasSemana', updated);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Programación</h3>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Período de Campaña</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Fecha Inicio</Label>
                        <Input
                            type="date"
                            value={data.fechaInicio || ''}
                            onChange={(e) => handleChange('fechaInicio', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                    <div>
                        <Label>Fecha Fin</Label>
                        <Input
                            type="date"
                            value={data.fechaFin || ''}
                            onChange={(e) => handleChange('fechaFin', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Horarios
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Hora Inicio</Label>
                        <Input
                            type="time"
                            value={data.horaInicio || '06:00'}
                            onChange={(e) => handleChange('horaInicio', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                    <div>
                        <Label>Hora Fin</Label>
                        <Input
                            type="time"
                            value={data.horaFin || '22:00'}
                            onChange={(e) => handleChange('horaFin', e.target.value)}
                            disabled={readonly}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Días de la Semana</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {diasLabels.map((dia) => (
                            <button
                                key={dia.id}
                                onClick={() => !readonly && toggleDia(dia.id)}
                                disabled={readonly}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    (data.diasSemana || []).includes(dia.id)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {dia.label}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PestanaProgramacionTier0;
