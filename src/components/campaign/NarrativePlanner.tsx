'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
export const NarrativePlanner: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Narrative Planner</CardTitle></CardHeader>
        <CardContent><p className="text-gray-500">Planificador de narrativas de campaña</p></CardContent>
    </Card>
);
export default NarrativePlanner;
