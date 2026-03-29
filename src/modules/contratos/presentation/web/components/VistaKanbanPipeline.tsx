/**
 * SILEXAR PULSE - TIER0+ VISTA KANBAN PIPELINE
 * Componente de Vista Kanban para Pipeline de Contratos
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign } from 'lucide-react';

interface ContratoKanban {
    readonly id: string;
    readonly numero: string;
    readonly anunciante: string;
    readonly valor: number;
    readonly etapa: string;
}

interface VistaKanbanPipelineProps {
    readonly contratos?: ContratoKanban[];
    readonly className?: string;
}

const etapas = [
    { id: 'prospecto', name: 'Prospecto', color: 'bg-gray-100' },
    { id: 'negociacion', name: 'Negociación', color: 'bg-blue-100' },
    { id: 'aprobacion', name: 'Aprobación', color: 'bg-yellow-100' },
    { id: 'firmado', name: 'Firmado', color: 'bg-green-100' },
];

export const VistaKanbanPipeline: React.FC<VistaKanbanPipelineProps> = ({
    contratos = [],
    className = '',
}) => {
    const getContratosByEtapa = (etapaId: string) => 
        contratos.filter(c => c.etapa === etapaId);

    return (
        <div className={`grid grid-cols-4 gap-4 ${className}`}>
            {etapas.map((etapa) => (
                <div key={etapa.id} className={`p-3 rounded-lg ${etapa.color}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{etapa.name}</h3>
                        <Badge variant="secondary">
                            {getContratosByEtapa(etapa.id).length}
                        </Badge>
                    </div>
                    <div className="space-y-2">
                        {getContratosByEtapa(etapa.id).map((contrato) => (
                            <Card key={contrato.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-sm">{contrato.numero}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{contrato.anunciante}</p>
                                    <div className="flex items-center gap-1 text-green-600">
                                        <DollarSign className="w-3 h-3" />
                                        <span className="text-sm font-medium">
                                            {contrato.valor.toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VistaKanbanPipeline;