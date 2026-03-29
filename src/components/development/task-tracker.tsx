'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';
export const TaskTracker: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="w-5 h-5" />Task Tracker</CardTitle></CardHeader>
        <CardContent><p className="text-gray-500">Seguimiento de tareas de desarrollo</p></CardContent>
    </Card>
);
export default TaskTracker;