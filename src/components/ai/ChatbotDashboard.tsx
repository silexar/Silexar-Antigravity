'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bot } from 'lucide-react';
export const ChatbotDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" />Chatbot Dashboard</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /><span>Gestión de chatbots empresariales</span></CardContent>
    </Card>
);
export default ChatbotDashboard;