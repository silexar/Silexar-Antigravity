/**
 * Página de Asistente de IA Empresarial
 * TIER 0 - Centro de Inteligencia Artificial Conversacional
 * Fortune 10 Ready - Operación 24/7
 */

'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare, BarChart3, Settings, User, Headphones, BookOpen } from 'lucide-react';

const EnterpriseChatbot = dynamic(
  () => import('@/components/ai/EnterpriseChatbot'),
  { loading: () => <div className="h-96 animate-pulse bg-[#E8E5E0] rounded-2xl" />, ssr: false }
);
const ChatbotDashboard = dynamic(
  () => import('@/components/ai/ChatbotDashboard'),
  { loading: () => <div className="h-64 animate-pulse bg-[#E8E5E0] rounded-2xl" />, ssr: false }
);

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState('chat');

  const features = [
    {
      icon: Bot,
      title: 'IA Conversacional Avanzada',
      description: 'Procesamiento de lenguaje natural con 87.3% de precisión y comprensión contextual empresarial.'
    },
    {
      icon: MessageSquare,
      title: 'Multi-intención y Contexto',
      description: 'Capaz de manejar múltiples intenciones en una sola consulta con memoria conversacional.'
    },
    {
      icon: BarChart3,
      title: 'Análisis Predictivo',
      description: 'Predicción de necesidades del usuario basada en patrones históricos y comportamiento.'
    },
    {
      icon: Settings,
      title: 'Configuración Empresarial',
      description: 'Personalización completa para flujos de trabajo específicos de Fortune 10.'
    }
  ];

  const stats = [
    { label: 'Conversaciones Procesadas', value: '45,689', trend: '+12.3%' },
    { label: 'Precisión del NLP', value: '87.3%', trend: '+2.1%' },
    { label: 'Tiempo de Respuesta', value: '245ms', trend: '-8.7%' },
    { label: 'Satisfacción Usuario', value: '92.1%', trend: '+1.8%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Asistente de IA Empresarial
                </h1>
                <p className="text-gray-600 mt-1">
                  Sistema de IA Conversacional TIER 0 - Optimizado para Fortune 10
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="default" className="bg-green-500">
                <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse" />
                Sistema Activo
              </Badge>
              <Badge variant="outline">TIER 0</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className={`text-sm mt-1 ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {stat.trend} vs período anterior
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:max-w-[400px]">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Características</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Asistente Virtual</CardTitle>
                        <CardDescription>
                          IA Conversacional empresarial con procesamiento de lenguaje natural
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        NLP 87.3% Precisión
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px]">
                      <EnterpriseChatbot />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <Headphones className="h-4 w-4" />
                      <span>Acceso Rápido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Ver Reportes CPVI
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Análisis CPCN
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Estado de Facturas
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Soporte Técnico
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Capacidades del Sistema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span>Procesamiento de facturación inteligente</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span>Análisis predictivo de negocios</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span>Gestión de contratos CPVI/CPCN</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      <span>Soporte multi-idioma empresarial</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <ChatbotDashboard />
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Características del Sistema de IA</CardTitle>
                <CardDescription>
                  Tecnologías y capacidades de próxima generación implementadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Especificaciones Técnicas TIER 0
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Motor NLP:</span>
                      <span className="ml-2 text-gray-600">Procesamiento en tiempo real</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Precisión:</span>
                      <span className="ml-2 text-gray-600">87.3% promedio</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tiempo de respuesta:</span>
                      <span className="ml-2 text-gray-600">&lt; 300ms</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Idiomas:</span>
                      <span className="ml-2 text-gray-600">Español, Inglés, Portugués</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Disponibilidad:</span>
                      <span className="ml-2 text-gray-600">99.9% SLA</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Escalabilidad:</span>
                      <span className="ml-2 text-gray-600">Auto-escalado horizontal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}