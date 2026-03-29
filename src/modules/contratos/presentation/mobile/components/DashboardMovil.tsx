/**
 * SILEXAR PULSE - TIER0+ DASHBOARD MÓVIL
 * Componente de Dashboard para Móvil
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, DollarSign, FileText, AlertTriangle } from 'lucide-react';

interface DashboardMovilProps {
    readonly className?: string;
}

const DashboardMovil: React.FC<DashboardMovilProps> = ({ className = '' }) => {
    const resumen = {
        campanasActivas: 12,
        contratosVigentes: 8,
        valorTotal: 1500000,
        alertasPendientes: 2,
    };

    return (
        <div className={`space-y-4 p-4 ${className}`}>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-xs text-blue-600">Campañas</p>
                                <p className="text-lg font-bold">{resumen.campanasActivas}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-xs text-green-600">Contratos</p>
                                <p className="text-lg font-bold">{resumen.contratosVigentes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-xs text-purple-600">Valor Total</p>
                                <p className="text-lg font-bold">$1.5M</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                                <p className="text-xs text-red-600">Alertas</p>
                                <p className="text-lg font-bold">{resumen.alertasPendientes}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardMovil;