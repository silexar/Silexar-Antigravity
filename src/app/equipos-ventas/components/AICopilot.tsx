/**
 * COMPONENT: AI COPILOT — Asistente de Ventas IA
 * 
 * @description Asistente de IA conversacional para vendedores,
 * capaz de responder preguntas, generar contenido y proporcionar
 * insights en tiempo real. Todo en español.
 * 
 * DESIGN: Neumorphic con base #dfeaff, sombras #bec8de y #ffffff
 * Sistema correcto: bg-light-surface + shadow-neumorphic-outset/inset
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send, Sparkles, Brain, MessageSquare, Phone, Mail, Calendar,
    FileText, DollarSign, Users, TrendingUp, Lightbulb, Copy,
    ThumbsUp, ThumbsDown, RefreshCw, Loader2, X, ChevronDown,
    Zap, Target, BookOpen, AlertCircle
} from 'lucide-react';

/* ─── COLORES NEUMÓRFICOS ───────────────────────────────────────────────── */

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8'
};

const gradientBase = 'linear-gradient(145deg, #e6e6e6, #ffffff)';

const shadowOut = (s: number) => `${s}px ${s}px ${s * 2}px ${N.dark}, -${s}px -${s}px ${s * 2}px ${N.light}`;
const shadowIn = (s: number) => `inset ${s}px ${s}px ${s * 2}px ${N.dark}, inset -${s}px -${s}px ${s * 2}px ${N.light}`;

/* ─── TYPES ───────────────────────────────────────────────── */

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
    actions?: QuickAction[];
    type?: 'text' | 'insight' | 'action' | 'summary';
}

interface QuickAction {
    icon: React.ElementType;
    label: string;
    prompt: string;
}

interface SuggestedPrompt {
    icon: React.ElementType;
    prompt: string;
    category: string;
}

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const QUICK_ACTIONS: QuickAction[] = [
    { icon: Mail, label: 'Escribir Email', prompt: 'Escribe un email de seguimiento para un lead cálido que se disconnected' },
    { icon: Phone, label: 'Script de Llamada', prompt: 'Genera un script de llamada de descubrimiento para un prospecto enterprise' },
    { icon: FileText, label: 'Propuesta', prompt: 'Crea una propuesta de precio para un contrato anual de $100K' },
    { icon: Users, label: 'Hablar con Champion', prompt: 'Cómo construyo un champion dentro de una empresa grande?' },
];

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    { icon: DollarSign, prompt: 'En qué deals debería enfocarme para cumplir mi cuota Q1?', category: 'Cuota' },
    { icon: TrendingUp, prompt: 'Analiza mi pipeline e identifica riesgos', category: 'Análisis' },
    { icon: Mail, prompt: 'Escribe una secuencia de emails fríos para leads SaaS', category: 'Outreach' },
    { icon: Phone, prompt: 'Cómo manejo "vamos con la competencia"?', category: 'Objeciones' },
    { icon: Users, prompt: 'Qué preguntas debería hacer en una llamada de descubrimiento?', category: 'Descubrimiento' },
    { icon: Target, prompt: 'Dame un plan 30-60-90 días para un AE nuevo', category: 'Ramp' },
    { icon: Lightbulb, prompt: 'Cuáles son los 3 errores más comunes de los vendedores?', category: 'Coaching' },
    { icon: BookOpen, prompt: 'Resume las mejores prácticas para cerrar deals enterprise', category: 'Best Practices' },
];

const SAMPLE_RESPONSES: Record<string, string> = {
    'quota': `Basado en tu pipeline actual de $2.4M y cuota de $600K:

**Buenas noticias:** ¡Vas por buen camino! Necesitas $180K más para cumplir.

**Top recomendaciones:**
1. **Enfócate en Acme Corp ($250K)** - Está en Negociación. Una llamada de 15 min con el CFO podría cerrarla esta semana.
2. **Acelera TechStart ($180K)** - Ha estado en Propuesta por 18 días. Un seguimiento rápido podría cerrarla a fin de mes.
3. **Califica Global Industries ($95K)** - Nuevo lead con señales de intención fuertes. Programa descubrimiento hoy.

**Alerta de riesgo:** Si TechStart se pasa al próximo trimestre, estarás al 95% de cuota. Prioriza en consecuencia.`,

    'objection': `Aquí tienes 5 respuestas probadas para "Vamos con la competencia":

**1. El Cambio de Valor (Más efectivo)**
"Es entendible - antes de finalizar, podrías ayudarme a entender qué ofrece la competencia que nosotros no? Quiero asegurarme de que no estemos perdiendo algo importante."

**2. La Pregunta de Riesgo**
"Agradezco que me lo digas. Antes de comprometerte, podemos acordar una llamada de 15 minutos para abordar cualquier preocupación? Si no podemos superar su valor, incluso te recomendaré ellos."

**3. La Asimetría**
"Si la competencia es verdaderamente mejor, deberías ir con ellos. Pero la mayoría de las empresas se dan cuenta a los 6 meses que la opción "más barata" costó más en implementación y funciones perdidas."

**4. El Acceso Ejecutivo**
"Nuestro CEO gustaría revisar personalmente tus requisitos. A veces una perspectiva fresca revela oportunidades que otros pierden."

**5. El Timeline**
"Y si pudiera igualar su precio Y darte prioridad de soporte por 90 días? Cambiaría eso la conversación?"`,

    'email': `Aquí tienes una secuencia de 3 emails fríos para leads SaaS:

**Email 1 (Día 1) - El Gancho**
Subject: Pregunta rápida sobre [Empresa]

Hola [Nombre],

Noté que [Empresa] está creciendo rápidamente - felicitaciones por [noticia reciente].

Pregunta rápida: ¿Es [desafío específico que tu producto resuelve] una prioridad para tu equipo este trimestre?

[2 oraciones máximo sobre por qué estás escribiendo]

Saludos,
[Tu nombre]

---

**Email 2 (Día 4) - La Prueba Social**
Subject: [Conexión mutua] sugirió que te contactara

Hola [Nombre],

[Connection mutua] mencionó que podrías estar lidiando con [desafío].

Ayudamos a [empresa similar] a lograr [resultado específico] en 90 días. Feliz de compartir la historia.

¿Tienes 15 min esta semana?

---

**Email 3 (Día 8) - El Email de Ruptura**
Subject: ¿Debería mudarme?

Hola [Nombre],

He intentado contactarte algunas veces pero no he tenido respuesta.

Totalmente entiendo si ahora no es el momento adecuado. Si las cosas cambian, estoy aquí.

Saludos,
[Tu nombre]

P.D. Si alguna vez tienes curiosidad, recién publicamos un case study sobre [tema relevante].`,
};

/* ─── HELPERS ─────────────────────────────────────────────────── */

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const AICopilot = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `👋 Hola! Soy tu Copiloto IA de Ventas. Estoy aquí para ayudarte:

• Cerrar más deals dándote insights accionables
• Escribir emails, scripts y propuestas
• Responder objeciones y preguntas de coaching
• Analizar tu pipeline y priorizar tu día

¿En qué te puedo ayudar hoy?`,
            timestamp: new Date(),
            suggestions: SUGGESTED_PROMPTS.slice(0, 4).map(p => p.prompt),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setShowSuggestions(false);

        // Simulate AI response
        setTimeout(() => {
            let responseContent = SAMPLE_RESPONSES['quota'];

            // Simple keyword matching for demo
            if (input.toLowerCase().includes('objection') || input.toLowerCase().includes('competidor')) {
                responseContent = SAMPLE_RESPONSES['objection'];
            } else if (input.toLowerCase().includes('email') || input.toLowerCase().includes('frío')) {
                responseContent = SAMPLE_RESPONSES['email'];
            }

            const assistantMessage: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: responseContent,
                timestamp: new Date(),
                type: 'text',
                actions: [
                    { icon: Copy, label: 'Copiar', prompt: 'Copiar respuesta' },
                    { icon: RefreshCw, label: 'Regenerar', prompt: 'Regenerar respuesta' },
                    { icon: ThumbsUp, label: 'Útil', prompt: 'Marcar como útil' },
                ],
            };

            setMessages(prev => [...prev, assistantMessage]);
            setLoading(false);
        }, 1500);
    };

    const handleSuggestionClick = (prompt: string) => {
        setInput(prompt);
        setShowSuggestions(false);
    };

    const handleQuickAction = (action: QuickAction) => {
        setInput(action.prompt);
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div
                className="rounded-t-2xl p-4 text-white shadow-lg flex-shrink-0"
                style={{
                    background: `linear-gradient(145deg, #8b5cf6, #a855f7, #8b5cf6)`,
                    boxShadow: shadowOut(4)
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.2)' }}
                        >
                            <Brain size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold">Copiloto IA de Ventas</h2>
                            <p className="text-xs flex items-center gap-1" style={{ color: '#e9d5ff' }}>
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: '#10b981' }}
                                />
                                Potenciado por GPT-4 • Siempre aprendiendo
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                            <Sparkles size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── MESSAGES ──── */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ background: N.base }}
            >
                {messages.map(message => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center"
                                        style={{ background: `linear-gradient(145deg, #a855f7, #8b5cf6)` }}
                                    >
                                        <Brain size={12} className="text-white" />
                                    </div>
                                    <span className="text-xs" style={{ color: N.text }}>Copiloto IA • {formatTime(message.timestamp)}</span>
                                </div>
                            )}

                            <div
                                className={`rounded-2xl p-4 ${message.role === 'user'
                                    ? 'text-white rounded-br-sm'
                                    : 'rounded-bl-sm'
                                    }`}
                                style={{
                                    ...(message.role === 'user'
                                        ? { background: `linear-gradient(145deg, #8b5cf6, #a855f7)` }
                                        : {
                                            background: gradientBase,
                                            boxShadow: shadowOut(3)
                                        })
                                }}
                            >
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                </div>
                            </div>

                            {/* Suggestions for user */}
                            {message.suggestions && message.role === 'assistant' && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium" style={{ color: N.text }}>Intenta preguntar:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {message.suggestions.map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="text-xs px-3 py-1.5 rounded-full transition-shadow text-left"
                                                style={{
                                                    background: gradientBase,
                                                    color: N.text,
                                                    boxShadow: shadowOut(2)
                                                }}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {message.actions && message.role === 'assistant' && (
                                <div className="mt-3 flex gap-2">
                                    {message.actions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors"
                                            style={{
                                                background: '#f1f5f9',
                                                color: '#475569'
                                            }}
                                        >
                                            <action.icon size={12} />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {message.role === 'user' && (
                                <div className="flex items-center gap-2 mt-1 justify-end">
                                    <span className="text-xs" style={{ color: N.textSub }}>{formatTime(message.timestamp)}</span>
                                    <span className="text-xs font-medium" style={{ color: N.accent }}>Tú</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%]">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: `linear-gradient(145deg, #a855f7, #8b5cf6)` }}
                                >
                                    <Brain size={12} className="text-white" />
                                </div>
                                <span className="text-xs" style={{ color: N.text }}>Copiloto IA • Escribiendo...</span>
                            </div>
                            <div
                                className="rounded-2xl p-4 rounded-bl-sm"
                                style={{
                                    background: gradientBase,
                                    boxShadow: shadowOut(3)
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" style={{ color: N.accent }} />
                                    <span className="text-sm" style={{ color: N.text }}>Pensando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ──── INPUT ──── */}
            <div
                className="p-4 flex-shrink-0"
                style={{ background: N.base }}
            >
                <div
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{
                        background: gradientBase,
                        boxShadow: shadowIn(3)
                    }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: '#1e293b' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 rounded-xl transition-all disabled:opacity-50"
                        style={{
                            background: input.trim() ? `linear-gradient(145deg, ${N.accent}, #5a77d9)` : '#e2e8f0',
                            color: 'white'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {QUICK_ACTIONS.map((action, idx) => {
                        const ActionIcon = action.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                                style={{
                                    background: gradientBase,
                                    color: N.text,
                                    boxShadow: shadowOut(2)
                                }}
                            >
                                <ActionIcon size={14} style={{ color: N.accent }} />
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
