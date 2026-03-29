'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface MLAlert {
    id: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    prediction: number;
    timestamp: string;
}

export const MLAlertDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [alerts, setAlerts] = useState<MLAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            setLoading(true);
            setAlerts([
                { id: '1', severity: 'HIGH', message: 'CPU spike predicted', prediction: 0.89, timestamp: new Date().toISOString() }
            ]);
            setLoading(false);
        };
        loadAlerts();
    }, []);

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': case 'HIGH': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'MEDIUM': return <Activity className="w-4 h-4 text-yellow-500" />;
            default: return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
    };

    return (
        <Card className={className}>
            <CardHeader><CardTitle>ML Alert Dashboard</CardTitle></CardHeader>
            <CardContent>
                {loading ? <p>Cargando...</p> : alerts.map(alert => (
                    <div key={alert.id} className="flex items-center gap-2 p-2 border-b">
                        {getSeverityIcon(alert.severity)}
                        <span>{alert.message}</span>
                        <span className="ml-auto text-sm text-gray-500">{Math.round(alert.prediction * 100)}%</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default MLAlertDashboard;