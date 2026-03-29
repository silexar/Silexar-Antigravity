'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity } from 'lucide-react';
export const EnterpriseAuditDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Audit Dashboard</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2 text-green-600"><Activity className="w-5 h-5" /><span>Sistema auditado</span></CardContent>
    </Card>
);
export default EnterpriseAuditDashboard;