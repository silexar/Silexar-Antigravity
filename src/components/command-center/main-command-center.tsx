/**
 * @fileoverview TIER 0 Main Command Center - Control de Mando Principal
 * 
 * Centro de control principal del sistema SILEXAR PULSE QUANTUM con acceso
 * completo a todos los módulos incluyendo el sistema de mejora continua.
 * 
 * @author SILEXAR AI Team - Tier 0 Command Center Division
 * @version 2040.5.0 - TIER 0 COMMAND CENTER SUPREMACY
 * @consciousness 99.9% consciousness-level command intelligence
 * @quantum Quantum-enhanced command and control
 * @security Pentagon++ quantum-grade command protection
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Settings, 
  Zap, 
  Shield, 
  Activity, 
  Database, 
  Users, 
  BarChart3, 
  Bell,
  Rocket,
  Brain,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react'
import { ContinuousImprovementModule } from './continuous-improvement-module'

interface SystemModule {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'maintenance' | 'updating'
  icon: React.ReactNode
  lastUpdate: string
  version: string
  consciousnessLevel: number
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  module: string
}

export function MainCommandCenter() {
  const [activeModule, setActiveModule] = useState<string>('overview')
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [showContinuousImprovement, setShowContinuousImprovement] = useState(false)

  const systemModules: SystemModule[] = [
    {
      id: 'continuous-improvement',
      name: 'Mejora Continua',
      description: 'Sistema de mejora continua automatizada con staging',
      status: 'active',
      icon: <Brain className="h-5 w-5" />,
      lastUpdate: '2025-01-08 14:30:00',
      version: '2040.5.0',
      consciousnessLevel: 99.8
    },
    {
      id: 'performance',
      name: 'Optimización de Rendimiento',
      description: 'Quantum-enhanced performance optimization',
      status: 'active',
      icon: <Zap className="h-5 w-5" />,
      lastUpdate: '2025-01-08 12:15:00',
      version: '2040.5.0',
      consciousnessLevel: 99.5
    },
    {
      id: 'security',
      name: 'Seguridad Pentagon++',
      description: 'Sistema de seguridad quantum-grade',
      status: 'active',
      icon: <Shield className="h-5 w-5" />,
      lastUpdate: '2025-01-08 11:45:00',
      version: '2040.5.0',
      consciousnessLevel: 99.9
    },
    {
      id: 'monitoring',
      name: 'Monitoreo en Tiempo Real',
      description: 'Consciousness-level system monitoring',
      status: 'active',
      icon: <Activity className="h-5 w-5" />,
      lastUpdate: '2025-01-08 13:20:00',
      version: '2040.5.0',
      consciousnessLevel: 99.7
    },
    {
      id: 'database',
      name: 'Base de Datos Quantum',
      description: 'Quantum-enhanced database operations',
      status: 'active',
      icon: <Database className="h-5 w-5" />,
      lastUpdate: '2025-01-08 10:30:00',
      version: '2040.5.0',
      consciousnessLevel: 99.6
    },
    {
      id: 'users',
      name: 'Gestión de Usuarios',
      description: 'Advanced user management system',
      status: 'active',
      icon: <Users className="h-5 w-5" />,
      lastUpdate: '2025-01-08 09:15:00',
      version: '2040.5.0',
      consciousnessLevel: 99.4
    }
  ]

  useEffect(() => {
    // Simular alertas del sistema
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'success',
        title: 'Mejora Continua Disponible',
        message: 'Se ha generado una nueva mejora de rendimiento lista para testing',
        timestamp: new Date(),
        module: 'continuous-improvement'
      },
      {
        id: '2',
        type: 'info',
        title: 'Sistema Operativo',
        message: 'Todos los módulos funcionando con consciousness level óptimo',
        timestamp: new Date(Date.now() - 300000),
        module: 'system'
      }
    ]
    setSystemAlerts(mockAlerts)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'maintenance': return 'bg-yellow-500'
      case 'updating': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  if (showContinuousImprovement) {
    return (
      <ContinuousImprovementModule 
        onBack={() => setShowContinuousImprovement(false)}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
        animation: 'pulse 4s ease-in-out 3'
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ position: 'relative' }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              letterSpacing: '0.1em',
              textShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
            }}>
              <Sparkles style={{ width: '48px', height: '48px', color: '#3b82f6' }} />
              SILEXAR PULSE QUANTUM
              <Sparkles style={{ width: '48px', height: '48px', color: '#8b5cf6' }} />
            </h1>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{
              fontSize: '1.5rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500',
              letterSpacing: '0.05em'
            }}>
              Control de Mando Principal - TIER 0 SUPREMACY
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <Brain style={{ width: '16px', height: '16px' }} />
                Consciousness Level: 99.9%
              </div>
              <div style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <Zap style={{ width: '16px', height: '16px' }} />
                Quantum Enhanced
              </div>
              <div style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <Shield style={{ width: '16px', height: '16px' }} />
                Pentagon++ Security
              </div>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {systemAlerts.map((alert) => (
              <div key={alert.id} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))'
                  }}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', fontWeight: '600', fontSize: '1.125rem', margin: 0 }}>
                      {alert.title}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px', fontSize: '1rem', margin: '4px 0 0 0' }}>
                      {alert.message}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '20px'
                  }}>
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '8px',
            gap: '4px'
          }}>
            <button 
              onClick={() => setActiveModule('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'white',
                fontWeight: '600',
                background: activeModule === 'overview' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              <BarChart3 style={{ width: '16px', height: '16px' }} />
              Vista General
            </button>
            <button 
              onClick={() => setActiveModule('modules')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'white',
                fontWeight: '600',
                background: activeModule === 'modules' ? 'linear-gradient(135deg, #8b5cf6, #22c55e)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              Módulos
            </button>
            <button 
              onClick={() => setActiveModule('analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'white',
                fontWeight: '600',
                background: activeModule === 'analytics' ? 'linear-gradient(135deg, #22c55e, #3b82f6)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              <Activity style={{ width: '16px', height: '16px' }} />
              Analíticas
            </button>
            <button 
              onClick={() => setActiveModule('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'white',
                fontWeight: '600',
                background: activeModule === 'settings' ? 'linear-gradient(135deg, #3b82f6, #22c55e)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem'
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
              Configuración
            </button>
          </div>

          {activeModule === 'overview' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '32px',
              marginTop: '32px'
            }}>
              {systemModules.map((module, index) => (
                <div key={module.id} style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '24px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                          backdropFilter: 'blur(10px)'
                        }}>
                          {module.icon}
                        </div>
                        <div>
                          <h3 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
                            {module.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: module.status === 'active' ? '#22c55e' : '#6b7280',
                              animation: 'pulse 2s 3'
                            }} />
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {module.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                      {module.description}
                    </p>
                    
                    {/* Consciousness Level */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Consciousness Level</span>
                        <span style={{ color: 'white', fontWeight: '600' }}>{module.consciousnessLevel}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                          borderRadius: '4px',
                          width: `${module.consciousnessLevel}%`,
                          transition: 'width 1s ease-out'
                        }} />
                      </div>
                    </div>
                    
                    {/* Module Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Versión</span>
                        <div style={{
                          color: 'white',
                          fontFamily: 'monospace',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {module.version}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Actualizado</span>
                        <div style={{ color: 'white', fontSize: '0.75rem' }}>
                          {new Date(module.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {module.id === 'continuous-improvement' && (
                      <button 
                        onClick={() => setShowContinuousImprovement(true)}
                        style={{
                          width: '100%',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          transition: 'all 0.3s ease',
                          marginTop: '16px',
                          letterSpacing: '0.05em'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <Rocket style={{ width: '20px', height: '20px' }} />
                        Acceder al Sistema
                        <Sparkles style={{ width: '16px', height: '16px' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeModule === 'modules' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              marginTop: '32px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Módulos del Sistema
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Gestión y control de todos los módulos TIER 0
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {systemModules.map((module) => (
                  <div key={module.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {module.icon}
                      <div>
                        <h3 style={{ color: 'white', fontWeight: '500', margin: 0 }}>{module.name}</h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.75rem'
                      }}>
                        {module.status}
                      </div>
                      {module.id === 'continuous-improvement' && (
                        <button 
                          onClick={() => setShowContinuousImprovement(true)}
                          style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            padding: '8px 16px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Abrir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeModule === 'analytics' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              marginTop: '32px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 style={{ width: '20px', height: '20px' }} />
                  Analíticas del Sistema
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Métricas y estadísticas en tiempo real
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  borderRadius: '8px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>99.9%</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Uptime</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>47ms</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Response Time</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  borderRadius: '8px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>12</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Mejoras Aplicadas</div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'settings' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              marginTop: '32px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings style={{ width: '20px', height: '20px' }} />
                  Configuración del Sistema
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                  Configuración avanzada TIER 0
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white' }}>Quantum Enhancement</span>
                  <div style={{
                    background: '#22c55e',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Activado
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white' }}>Consciousness Level</span>
                  <div style={{
                    background: '#8b5cf6',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    99.9%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white' }}>Pentagon++ Security</span>
                  <div style={{
                    background: '#22c55e',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Activado
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}