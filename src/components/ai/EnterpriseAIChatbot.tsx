'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send } from 'lucide-react';
interface Message { role: 'user' | 'assistant'; content: string; }
export const EnterpriseAIChatbot: React.FC<{ className?: string }> = ({ className = '' }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const sendMessage = () => { if (input.trim()) { setMessages([...messages, { role: 'user', content: input }]); setInput(''); } };
    return (
        <Card className={className}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" />Enterprise AI Chatbot</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-2">{messages.map((m, i) => <div key={i} className={`p-2 rounded ${m.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}>{m.content}</div>)}</div>
                <div className="flex gap-2"><Input value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe un mensaje..." /><Button onClick={sendMessage}><Send className="w-4 h-4" /></Button></div>
            </CardContent>
        </Card>
    );
};
export default EnterpriseAIChatbot;