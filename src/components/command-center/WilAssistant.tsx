/**
 * Wil Assistant - AI-Powered Decision Assistant
 * CEO Command Center Fortune 10 Tier 0
 * 
 * AI assistant for natural language queries, recommendations,
 * predictive analysis, and decision support.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NeuCard, NeuButton, StatusBadge } from '@/components/admin/_sdk/AdminDesignSystem';
import { getShadow, getFloatingShadow, N } from '@/components/admin/_sdk/AdminDesignSystem';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'recommendation' | 'analysis' | 'prediction' | 'info';
    confidence?: number;
}

interface Recommendation {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
    confidence: number;
    action: string;
}

interface QuickInsight {
    id: string;
    title: string;
    value: string;
    change: number;
    trend: 'up' | 'down' | 'neutral';
}

const mockInsights: QuickInsight[] = [
    { id: '1', title: 'Churn Risk', value: '3 clientes', change: -12, trend: 'down' },
    { id: '2', title: 'Upsell Potential', value: '$45M', change: 23, trend: 'up' },
    { id: '3', title: 'Efficiency Gain', value: '+18%', change: 8, trend: 'up' },
    { id: '4', title: 'Risk Alerts', value: '2', change: -5, trend: 'down' },
];

const mockRecommendations: Recommendation[] = [
    {
        id: '1',
        title: 'Renovar contrato Radio Nacional',
        description: 'El contrato vence en 45 días. Hay 87% probabilidad de renovación si se ofrece 10% descuento.',
        impact: 'high',
        category: 'Retención',
        confidence: 87,
        action: 'Contactar cliente para renovada'
    },
    {
        id: '2',
        title: 'Aumentar capacidad de API',
        description: 'Uso actual: 78%. Proyección: 95% en 14 días. Considerar upgrade del plan.',
        impact: 'high',
        category: 'Infraestructura',
        confidence: 92,
        action: 'Revisar límites y plan'
    },
    {
        id: '3',
        title: 'Campaña de upsell detectada',
        description: '5 clientes con uso >85% son candidatos ideales para upgrade a Enterprise.',
        impact: 'medium',
        category: 'Revenue',
        confidence: 78,
        action: 'Crear lista de prospectos'
    },
    {
        id: '4',
        title: 'Optimizar costo de DB',
        description: 'Queries lentas detectadas en horas no-peak. Ahorro potencial: $2.3M/mes.',
        impact: 'low',
        category: 'Optimización',
        confidence: 95,
        action: 'Revisar query logs'
    },
];

const suggestedQuestions = [
    '¿Cuál es el estado de salud del sistema?',
    '¿Hay algún cliente en riesgo de churn?',
    '¿Cuáles son las predicciones de ingresos para este mes?',
    '¿Qué campañas están bajo performando?',
    '¿Hay algún problema de infraestructura?',
    '¿Quiénes son los top 5 clientes por revenue?'
];

export default function WilAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '¡Hola! Soy Wil, tu asistente IA de Silexar Pulse. Puedo ayudarte con análisis de datos, predicciones, recomendaciones y decisiones estratégicas. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date(),
            type: 'info'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'predictions'>('chat');
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
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse = generateAIResponse(input);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse.content,
                timestamp: new Date(),
                type: aiResponse.type,
                confidence: aiResponse.confidence
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const generateAIResponse = (question: string): { content: string; type: Message['type']; confidence: number } => {
        const q = question.toLowerCase();

        if (q.includes('salud') || q.includes('sistema') || q.includes('health')) {
            return {
                content: 'El sistema está operando al 99.2% de capacidad con todas las métricas dentro de parámetros normales. Los proveedores de base de datos y cache están en verde. Solo el servicio de email muestra latencia elevada (890ms) pero no afecta operaciones críticas.',
                type: 'analysis',
                confidence: 98
            };
        }

        if (q.includes('churn') || q.includes('perder') || q.includes('riesgo')) {
            return {
                content: 'He identificado 3 clientes con riesgo moderado de churn: Emisora Andina (uso bajo, próximo vencimientos), FM Stgo Central (disputa de facturación), y Radio Patagonia (bajo uso de funcionalidades). Recomiendo acciones proactivas de retención.',
                type: 'prediction',
                confidence: 85
            };
        }

        if (q.includes('ingresos') || q.includes('revenue') || q.includes('facturación')) {
            return {
                content: 'MRR actual: $182M con crecimiento de 12% MoM. ARR proyectado: $2.18B. Facturación pendiente: $24.8M. Los clientes Enterprise representan 67% del revenue total.',
                type: 'analysis',
                confidence: 92
            };
        }

        if (q.includes('campaña') || q.includes('campanas')) {
            return {
                content: 'Hay 17 campañas activas. 3 están bajo el rendimiento esperado: "Verano 2025" (CTR 0.8% vs meta 1.2%), "Black Friday" (presupuesto excedido por 2.5%), y "Navidad Premium" (sin iniciar pese a fecha cercana).',
                type: 'recommendation',
                confidence: 88
            };
        }

        if (q.includes('top') || q.includes('mejores') || q.includes('clientes')) {
            return {
                content: 'Top 5 clientes por revenue: 1) Radio Patagonia ($62M ARR), 2) Radio Nacional Chile ($45M ARR), 3) FM Stgo Central ($28M ARR), 4) Radio Austral ($35M ARR), 5) Emisora del Valle ($18M ARR).',
                type: 'info',
                confidence: 95
            };
        }

        return {
            content: 'He analizado tu consulta. Con base en los datos actuales del sistema, te recomiendo revisar el dashboard de métricas para más detalles. Si tienes una pregunta específica sobre clientes, campañas o infraestructura, puedo ayudarte con análisis más detallados.',
            type: 'info',
            confidence: 75
        };
    };

    const getInsightIcon = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return <span style={{ color: N.success }}>↑</span>;
            case 'down': return <span style={{ color: N.danger }}>↓</span>;
            default: return <span style={{ color: N.textSub }}>→</span>;
        }
    };

    const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
        switch (impact) {
            case 'high': return <StatusBadge status="danger" label="Alto" />;
            case 'medium': return <StatusBadge status="warning" label="Medio" />;
            case 'low': return <StatusBadge status="success" label="Bajo" />;
        }
    };

    const tabs = [
        { id: 'chat', label: 'Chat', icon: '💬' },
        { id: 'insights', label: 'Recomendaciones', icon: '💡' },
        { id: 'predictions', label: 'Predicciones', icon: '🧠' },
    ] as const;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: `linear-gradient(135deg, ${N.accent}, #9333ea)`
                    }}>
                        <span style={{ fontSize: '2rem' }}>🤖</span>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>Asistente IA Wil</h2>
                        <p style={{ color: N.textSub }}>Análisis predictivo y recomendaciones automáticas</p>
                    </div>
                </div>
                <StatusBadge status="success" label="IA Activa" />
            </div>

            {/* Quick Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {mockInsights.map(insight => (
                    <NeuCard key={insight.id} style={{ boxShadow: getShadow(), padding: '1rem', background: N.base }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{insight.title}</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: N.text }}>{insight.value}</p>
                            </div>
                            {getInsightIcon(insight.trend)}
                        </div>
                        <p style={{
                            fontSize: '0.75rem',
                            marginTop: '0.5rem',
                            color: insight.change > 0 ? N.success : N.danger
                        }}>
                            {insight.change > 0 ? '+' : ''}{insight.change}% vs mes anterior
                        </p>
                    </NeuCard>
                ))}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: activeTab === tab.id ? N.accent : N.base,
                            color: activeTab === tab.id ? N.text : N.textSub,
                            transition: 'background 0.2s'
                        }}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </div>
                ))}
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
                <NeuCard style={{ boxShadow: getShadow(), padding: 0, background: N.base }}>
                    <div style={{
                        padding: '1rem 1.5rem',
                        borderBottom: `1px solid ${N.dark}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🧠</span>
                            <span style={{ fontWeight: 600, color: N.text }}>Wil AI</span>
                        </div>
                        <NeuButton variant="ghost" onClick={() => setMessages([{
                            id: '1',
                            role: 'assistant',
                            content: '¡Hola! Soy Wil, tu asistente IA. ¿En qué puedo ayudarte hoy?',
                            timestamp: new Date(),
                            type: 'info'
                        }])}>
                            Nueva conversación
                        </NeuButton>
                    </div>

                    {/* Messages */}
                    <div style={{ height: '24rem', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        borderRadius: '0.75rem',
                                        padding: '1rem',
                                        background: msg.role === 'user'
                                            ? N.accent
                                            : `${N.dark}80`,
                                        border: msg.role === 'user' ? 'none' : `1px solid ${N.dark}`,
                                        color: msg.role === 'user' ? N.text : N.text
                                    }}
                                >
                                    {msg.role === 'assistant' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span>🤖</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: N.accent }}>Wil AI</span>
                                            {msg.type && (
                                                <StatusBadge status="info" label={msg.type} />
                                            )}
                                        </div>
                                    )}
                                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6 }}>
                                        {msg.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    background: `${N.dark}80`,
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.75rem',
                                    padding: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>🤖</span>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <span style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '9999px',
                                                background: N.accent,
                                                animation: 'bounce 0.6s infinite'
                                            }} />
                                            <span style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '9999px',
                                                background: N.accent,
                                                animation: 'bounce 0.6s infinite 0.15s'
                                            }} />
                                            <span style={{
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                borderRadius: '9999px',
                                                background: N.accent,
                                                animation: 'bounce 0.6s infinite 0.3s'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    {messages.length === 1 && (
                        <div style={{ padding: '0 1rem 0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: N.textSub, marginBottom: '0.5rem' }}>Sugerencias:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {suggestedQuestions.map((q, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setInput(q)}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.75rem',
                                            background: `${N.dark}50`,
                                            color: N.text,
                                            borderRadius: '9999px',
                                            cursor: 'pointer',
                                            border: `1px solid ${N.dark}`
                                        }}
                                    >
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div style={{ padding: '1rem', borderTop: `1px solid ${N.dark}` }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pregunta en lenguaje natural..."
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: `${N.dark}50`,
                                    border: `1px solid ${N.dark}`,
                                    borderRadius: '0.5rem',
                                    color: N.text,
                                    outline: 'none'
                                }}
                            />
                            <NeuButton
                                variant="primary"
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                            >
                                <span style={{ fontSize: '1.25rem' }}>📤</span>
                            </NeuButton>
                        </div>
                    </div>
                </NeuCard>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'insights' && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>💡</span> Recomendaciones Automáticas
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>
                        Acciones sugeridas por IA basadas en análisis predictivo
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {mockRecommendations.map(rec => (
                            <div key={rec.id} style={{
                                padding: '1rem',
                                background: `${N.dark}50`,
                                borderRadius: '0.5rem',
                                border: `1px solid ${N.dark}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 500, color: N.text }}>{rec.title}</h4>
                                        <p style={{ fontSize: '0.875rem', color: N.textSub, marginTop: '0.25rem' }}>{rec.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        {getImpactBadge(rec.impact)}
                                        <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                                            Confianza: {rec.confidence}%
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: '1rem',
                                    paddingTop: '1rem',
                                    borderTop: `1px solid ${N.dark}`
                                }}>
                                    <StatusBadge status="info" label={rec.category} />
                                    <NeuButton variant="primary" onClick={() => { }}>
                                        {rec.action}
                                    </NeuButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </NeuCard>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
                <NeuCard style={{ boxShadow: getShadow(), padding: '1.5rem', background: N.base }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🧠</span> Predicciones a 30 días
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: N.textSub, marginBottom: '1.5rem' }}>
                        Proyecciones basadas en modelos predictivos
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            background: `${N.dark}50`,
                            borderRadius: '0.5rem',
                            border: `1px solid ${N.dark}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ color: N.success }}>📈</span>
                                <div>
                                    <h4 style={{ fontWeight: 500, color: N.text }}>Revenue Proyectado</h4>
                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Con 92% de confianza</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.success }}>$198M</p>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>MRR proyectado</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.accent }}>+8.7%</p>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>Crecimiento</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '0.75rem', background: `${N.dark}50`, borderRadius: '0.5rem' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c084fc' }}>$2.38B</p>
                                    <p style={{ fontSize: '0.75rem', color: N.textSub }}>ARR</p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: `${N.dark}50`,
                            borderRadius: '0.5rem',
                            border: `1px solid ${N.dark}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ color: N.warning }}>⚠️</span>
                                <div>
                                    <h4 style={{ fontWeight: 500, color: N.text }}>Riesgos Identificados</h4>
                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Con 85% de confianza</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}50`, borderRadius: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.text }}>2 contratos por vencer</span>
                                    <StatusBadge status="warning" label="Revisar" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}50`, borderRadius: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.text }}>1 cliente en riesgo churn</span>
                                    <StatusBadge status="danger" label="Urgente" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}50`, borderRadius: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.text }}>Infraestructura al 85%</span>
                                    <StatusBadge status="info" label="Monitorear" />
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1rem',
                            background: `${N.dark}50`,
                            borderRadius: '0.5rem',
                            border: `1px solid ${N.dark}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ color: N.accent }}>⚡</span>
                                <div>
                                    <h4 style={{ fontWeight: 500, color: N.text }}>Oportunidades</h4>
                                    <p style={{ fontSize: '0.875rem', color: N.textSub }}>Potencial de crecimiento identificado</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}50`, borderRadius: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.text }}>5 upsell candidates</span>
                                    <StatusBadge status="success" label="$45M potencial" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: `${N.dark}50`, borderRadius: '0.25rem' }}>
                                    <span style={{ fontSize: '0.875rem', color: N.text }}>3 nuevos mercados</span>
                                    <StatusBadge status="info" label="Expansión" />
                                </div>
                            </div>
                        </div>
                    </div>
                </NeuCard>
            )}
        </div>
    );
}
