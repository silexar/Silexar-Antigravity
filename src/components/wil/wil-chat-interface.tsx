'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send } from 'lucide-react';

export const WilChatInterface: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [input, setInput] = useState('');
    return (
        <Card className={className}>
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" />WIL Chat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="h-48 bg-gray-50 rounded p-4"><p className="text-gray-500 text-sm">Inicio de conversación WIL...</p></div>
                <div className="flex gap-2"><Input value={input} onChange={e => setInput(e.target.value)} placeholder="Mensaje..." /><Button><Send className="w-4 h-4" /></Button></div>
            </CardContent>
        </Card>
    );
};
export default WilChatInterface;