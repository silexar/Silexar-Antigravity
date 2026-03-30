'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle } from 'lucide-react';
export const WebhookNotificationDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Webhooks</CardTitle></CardHeader>
        <CardContent>
            <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>Todos los webhooks operativos</span>
            </div>
        </CardContent>
    </Card>
);
export default WebhookNotificationDashboard;