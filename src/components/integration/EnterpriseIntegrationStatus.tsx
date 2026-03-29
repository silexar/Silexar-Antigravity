/**
 * SILEXAR PULSE - TIER0+ ENTERPRISE INTEGRATION STATUS
 * Componente de Estado de Integración Enterprise
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IntegrationStatus {
    readonly name: string;
    readonly status: 'CONNECTED' | 'DISCONNECTED' | 'WARNING';
    readonly lastSync?: Date;
}

interface EnterpriseIntegrationStatusProps {
    readonly integrations?: IntegrationStatus[];
    readonly onRefresh?: () => void;
    readonly className?: string;
}

const defaultIntegrations: IntegrationStatus[] = [
    { name: 'ERP', status: 'CONNECTED', lastSync: new Date() },
    { name: 'CRM', status: 'CONNECTED', lastSync: new Date() },
    { name: 'Analytics', status: 'CONNECTED', lastSync: new Date() },
];

export const EnterpriseIntegrationStatus: React.FC<EnterpriseIntegrationStatusProps> = ({
    integrations = defaultIntegrations,
    onRefresh,
    className = '',
}) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONNECTED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'DISCONNECTED': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            default: return null;
        }
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Integraciones</CardTitle>
                {onRefresh && (
                    <Button variant="ghost" size="sm" onClick={onRefresh}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {integrations.map((integration) => (
                        <div key={integration.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(integration.status)}
                                <span className="font-medium">{integration.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {integration.lastSync?.toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default EnterpriseIntegrationStatus;