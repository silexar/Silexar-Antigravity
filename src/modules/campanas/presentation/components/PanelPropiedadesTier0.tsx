'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export interface PanelPropiedadesTier0Props { propiedades?: Record<string, unknown>; className?: string; }
export const PanelPropiedadesTier0: React.FC<PanelPropiedadesTier0Props> = ({ propiedades = {}, className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle>Propiedades</CardTitle></CardHeader>
        <CardContent>
            {Object.keys(propiedades).length === 0 ? (
                <p className="text-sm text-gray-500">Sin propiedades configuradas</p>
            ) : (
                <ul className="space-y-2">
                    {Object.entries(propiedades).map(([key, value]) => (
                        <li key={key} className="flex justify-between text-sm">
                            <span className="font-medium">{key}</span>
                            <span className="text-gray-500">{String(value)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </CardContent>
    </Card>
);
export default PanelPropiedadesTier0;
