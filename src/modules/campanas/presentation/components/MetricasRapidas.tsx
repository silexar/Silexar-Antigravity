'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Activity, DollarSign, Target } from 'lucide-react';

interface Metrica {
    id: string;
    nombre: string;
    valor: number;
    valorAnterior: number;
    unidad: string;
}

const calcularPorcentajeCambio = (actual: number, anterior: number): number => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
};

const getIconoPorNombre = (nombre: string) => {
    if (nombre.toLowerCase().includes('inversion') || nombre.toLowerCase().includes('costo')) return DollarSign;
    if (nombre.toLowerCase().includes('conversion') || nombre.toLowerCase().includes('objetivo')) return Target;
    return Activity;
};

export const MetricasRapidas: React.FC<{ campanaId?: string; className?: string }> = ({ campanaId, className = '' }) => {
    const [metricas, setMetricas] = useState<Metrica[]>([]);
    const [loading, setLoading] = useState(true);

    const cargarMetricas = useCallback(async () => {
        setLoading(true);
        // Simular carga de datos
        const data: Metrica[] = [
            { id: '1', nombre: 'Impresiones', valor: 125000, valorAnterior: 110000, unidad: '' },
            { id: '2', nombre: 'Clics', valor: 3500, valorAnterior: 3200, unidad: '' },
            { id: '3', nombre: 'Conversiones', valor: 280, valorAnterior: 250, unidad: '' },
            { id: '4', nombre: 'Inversión', valor: 15000, valorAnterior: 14000, unidad: '$' }
        ];
        ;
        setMetricas(data);
        setLoading(false);
    }, [campanaId]);

    useEffect(() => {
        cargarMetricas();
    }, [cargarMetricas]);

    const renderTrend = (metrica: Metrica) => {
        const cambio = calcularPorcentajeCambio(metrica.valor, metrica.valorAnterior);
        if (cambio > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (cambio < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-500" />;
    };

    if (loading) return <div className="animate-pulse">Cargando métricas...</div>;

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
            {metricas.map(metrica => {
                const IconoMetrica = getIconoPorNombre(metrica.nombre);
                const cambio = calcularPorcentajeCambio(metrica.valor, metrica.valorAnterior);
                return (
                    <Card key={metrica.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <IconoMetrica className="w-4 h-4" />
                                {metrica.nombre}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">
                                    {metrica.unidad}{metrica.valor.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-1">
                                    {renderTrend(metrica)}
                                    <span className={`text-sm ${cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {cambio >= 0 ? '+' : ''}{cambio.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default MetricasRapidas;