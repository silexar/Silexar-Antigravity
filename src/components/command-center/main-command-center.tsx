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

import React, { useState } from 'react'
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
  AlertTriangle
} from 'lucide-react'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
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

const systemModules: SystemModule[] = [
  {
    id: 'continuous-improvement',
    name: 'Mejora Continua',
    description: 'Sistema de mejora continua automatizada con staging',
    status: 'active',
    icon: <Brain style={{ width: '20px', height: '20px', color: N.accent }} />,
    lastUpdate: '2025-01-08 14:30:00',
    version: '2040.5.0',
    consciousnessLevel: 99.8
  },
  {
    id: 'performance',
    name: 'Optimización de Rendimiento',
    description: 'Quantum-enhanced performance optimization',
    status: 'active',
    icon: <Zap style={{ width: '20px', height: '20px', color: N.warning }} />,
    lastUpdate: '2025-01-08 12:15:00',
    version: '2040.5.0',
    consciousnessLevel: 99.5
  },
  {
    id: 'security',
    name: 'Seguridad Pentagon++',
    description: 'Sistema de seguridad quantum-grade',
    status: 'active',
    icon: <Shield style={{ width: '20px', height: '20px', color: N.success }} />,
    lastUpdate: '2025-01-08 11:45:00',
    version: '2040.5.0',
    consciousnessLevel: 99.9
  },
  {
    id: 'monitoring',
    name: 'Monitoreo en Tiempo Real',
    description: 'Consciousness-level system monitoring',
    status: 'active',
    icon: <Activity style={{ width: '20px', height: '20px', color: N.accent }} />,
    lastUpdate: '2025-01-08 13:20:00',
    version: '2040.5.0',
    consciousnessLevel: 99.7
  },
  {
    id: 'database',
    name: 'Base de Datos Quantum',
    description: 'Quantum-enhanced database operations',
    status: 'active',
    icon: <Database style={{ width: '20px', height: '20px', color: N.dark }} />,
    lastUpdate: '2025-01-08 10:30:00',
    version: '2040.5.0',
    consciousnessLevel: 99.6
  },
  {
    id: 'users',
    name: 'Gestión de Usuarios',
    description: 'Advanced user management system',
    status: 'active',
    icon: <Users style={{ width: '20px', height: '20px', color: N.text }} />,
    lastUpdate: '2025-01-08 09:15:00',
    version: '2040.5.0',
    consciousnessLevel: 99.4
  }
]

const mockAnalytics = [
  { label: 'Uptime', value: '99.9%', color: N.dark },
  { label: 'Response Time', value: '47ms', color: N.accent },
  { label: 'Mejoras Aplicadas', value: '12', color: N.success }
]

export function MainCommandCenter() {
  const [activeModule, setActiveModule] = useState<string>('overview')
  const [systemAlerts] = useState<SystemAlert[]>(mockAlerts)
  const [showContinuousImprovement, setShowContinuousImprovement] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return N.success
      case 'inactive': return N.textSub
      case 'maintenance': return N.warning
      case 'updating': return N.accent
      default: return N.textSub
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle style={{ width: '16px', height: '16px', color: N.success }} />
      case 'warning': return <AlertTriangle style={{ width: '16px', height: '16px', color: N.warning }} />
      case 'error': return <AlertTriangle style={{ width: '16px', height: '16px', color: N.danger }} />
      default: return <Bell style={{ width: '16px', height: '16px', color: N.accent }} />
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
      background: `linear-gradient(135deg, ${N.dark} 0%, ${N.dark}50 50%, ${N.dark} 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 20% 20%, ${N.accent}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${N.dark}50 0%, transparent 50%)`
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
              background: `linear-gradient(45deg, ${N.accent}, ${N.dark}50, ${N.warning})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              letterSpacing: '0.1em'
            }}>
              <Sparkles style={{ width: '48px', height: '48px', color: N.accent }} />
              SILEXAR PULSE QUANTUM
              <Sparkles style={{ width: '48px', height: '48px', color: N.dark }} />
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{
              fontSize: '1.5rem',
              color: N.textSub,
              fontWeight: '500',
              letterSpacing: '0.05em'
            }}>
              Control de Mando Principal - TIER 0 SUPREMACY
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
              <div style={{
                background: `${N.accent}30`,
                border: `1px solid ${N.accent}50`,
                borderRadius: '20px',
                padding: '8px 16px',
                color: N.text,
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Brain style={{ width: '16px', height: '16px' }} />
                Consciousness Level: 99.9%
              </div>
              <div style={{
                background: `${N.dark}50`,
                border: `1px solid ${N.dark}70`,
                borderRadius: '20px',
                padding: '8px 16px',
                color: N.text,
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Zap style={{ width: '16px', height: '16px' }} />
                Quantum Enhanced
              </div>
              <div style={{
                background: `${N.success}30`,
                border: `1px solid ${N.success}50`,
                borderRadius: '20px',
                padding: '8px 16px',
                color: N.text,
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
              <NeuCard key={alert.id} style={{
                boxShadow: getShadow(),
                padding: '20px',
                background: N.base
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    background: `${N.accent}30`
                  }}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: N.text, fontWeight: '600', fontSize: '1.125rem', margin: 0 }}>
                      {alert.title}
                    </h3>
                    <p style={{ color: N.textSub, marginTop: '4px', fontSize: '1rem', margin: '4px 0 0 0' }}>
                      {alert.message}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: N.textSub,
                    background: `${N.dark}30`,
                    padding: '4px 12px',
                    borderRadius: '20px'
                  }}>
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </NeuCard>
            ))}
          </div>
        )}

        <div style={{ width: '100%' }}>
          <NeuCard style={{
            boxShadow: getShadow(),
            padding: '8px',
            background: N.base
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px'
            }}>
              {[
                { id: 'overview', label: 'Vista General', icon: <BarChart3 style={{ width: '16px', height: '16px' }} /> },
                { id: 'modules', label: 'Módulos', icon: <Settings style={{ width: '16px', height: '16px' }} /> },
                { id: 'analytics', label: 'Analíticas', icon: <Activity style={{ width: '16px', height: '16px' }} /> },
                { id: 'settings', label: 'Configuración', icon: <Settings style={{ width: '16px', height: '16px' }} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: activeModule === tab.id ? '#fff' : N.text,
                    fontWeight: '600',
                    background: activeModule === tab.id
                      ? `linear-gradient(135deg, ${N.accent}, ${N.dark}50)`
                      : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </NeuCard>

          {activeModule === 'overview' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '32px',
              marginTop: '32px'
            }}>
              {systemModules.map((module) => (
                <NeuCard key={module.id} style={{
                  boxShadow: getShadow(),
                  padding: '24px',
                  background: N.base,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          padding: '12px',
                          borderRadius: '12px',
                          background: `${N.accent}30`
                        }}>
                          {module.icon}
                        </div>
                        <div>
                          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
                            {module.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: module.status === 'active' ? N.success : N.textSub
                            }} />
                            <span style={{ fontSize: '0.75rem', color: N.textSub, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {module.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ color: N.textSub, fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
                      {module.description}
                    </p>

                    {/* Consciousness Level */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: N.textSub }}>Consciousness Level</span>
                        <span style={{ color: N.text, fontWeight: '600' }}>{module.consciousnessLevel}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: `${N.dark}30`,
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${N.accent}, ${N.dark}50)`,
                          borderRadius: '4px',
                          width: `${module.consciousnessLevel}%`,
                          transition: 'width 1s ease-out'
                        }} />
                      </div>
                    </div>

                    {/* Module Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: N.textSub }}>Versión</span>
                        <div style={{
                          color: N.text,
                          fontFamily: 'monospace',
                          background: `${N.dark}30`,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          {module.version}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: N.textSub }}>Actualizado</span>
                        <div style={{ color: N.text, fontSize: '0.75rem' }}>
                          {new Date(module.lastUpdate).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {module.id === 'continuous-improvement' && (
                      <div style={{ width: '100%', marginTop: '16px' }}>
                        <NeuButton
                          variant="primary"
                          onClick={() => setShowContinuousImprovement(true)}
                        >
                          <Rocket style={{ width: '20px', height: '20px' }} />
                          Acceder al Sistema
                          <Sparkles style={{ width: '16px', height: '16px' }} />
                        </NeuButton>
                      </div>
                    )}
                  </div>
                </NeuCard>
              ))}
            </div>
          )}

          {activeModule === 'modules' && (
            <NeuCard style={{
              boxShadow: getShadow(),
              padding: '24px',
              background: N.base,
              marginTop: '32px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Módulos del Sistema
                </h2>
                <p style={{ color: N.textSub, margin: 0 }}>
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
                    background: `${N.dark}20`,
                    border: `1px solid ${N.dark}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {module.icon}
                      <div>
                        <h3 style={{ color: N.text, fontWeight: '500', margin: 0 }}>{module.name}</h3>
                        <p style={{ color: N.textSub, fontSize: '0.875rem', margin: '4px 0 0 0' }}>
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        color: N.text,
                        border: `1px solid ${N.dark}50`,
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.75rem'
                      }}>
                        {module.status}
                      </div>
                      {module.id === 'continuous-improvement' && (
                        <div>
                          <NeuButton
                            variant="secondary"
                            onClick={() => setShowContinuousImprovement(true)}
                          >
                            Abrir
                          </NeuButton>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>
          )}

          {activeModule === 'analytics' && (
            <NeuCard style={{
              boxShadow: getShadow(),
              padding: '24px',
              background: N.base,
              marginTop: '32px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 style={{ width: '20px', height: '20px' }} />
                  Analíticas del Sistema
                </h2>
                <p style={{ color: N.textSub, margin: 0 }}>
                  Métricas y estadísticas en tiempo real
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {mockAnalytics.map((item, idx) => (
                  <div key={idx} style={{
                    textAlign: 'center',
                    padding: '24px',
                    borderRadius: '12px',
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}30`
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: N.text }}>{item.value}</div>
                    <div style={{ color: N.textSub, fontSize: '0.875rem' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </NeuCard>
          )}

          {activeModule === 'settings' && (
            <NeuCard style={{
              boxShadow: getShadow(),
              padding: '24px',
              background: N.base,
              marginTop: '32px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings style={{ width: '20px', height: '20px' }} />
                  Configuración del Sistema
                </h2>
                <p style={{ color: N.textSub, margin: 0 }}>
                  Configuración avanzada TIER 0
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: N.text }}>Quantum Enhancement</span>
                  <div style={{
                    background: N.success,
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Activado
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: N.text }}>Consciousness Level</span>
                  <div style={{
                    background: N.dark,
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    99.9%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: N.text }}>Pentagon++ Security</span>
                  <div style={{
                    background: N.success,
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Activado
                  </div>
                </div>
              </div>
            </NeuCard>
          )}
        </div>
      </div>
    </div>
  )
}
