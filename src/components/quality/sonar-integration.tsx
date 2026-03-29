'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle } from 'lucide-react';
export const SonarIntegration: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />SonarQube</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2 text-green-600"><CheckCircle className="w-5 h-5" /><span>Calidad A+</span></CardContent>
    </Card>
);
export default SonarIntegration;