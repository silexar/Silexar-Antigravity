/**
 * @fileoverview TIER 0 Main Command Center - Versión Simple y Funcional
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'

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
  }
]

const mockAnalytics = [
  { label: 'Uptime', value: '99.9%', color: N.accent },
  { label: 'Response Time', value: '47ms', color: N.dark },
  { label: 'Mejoras Aplicadas', value: '12', color: N.success }
]

export function MainCommandCenter() {
  const router = useRouter()
  const [activeModule, setActiveModule] = useState<string>('overview')
  const [systemAlerts] = useState<SystemAlert[]>(mockAlerts)

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle style={{ width: '16px', height: '16px', color: N.success }} />
      case 'warning': return <AlertTriangle style={{ width: '16px', height: '16px', color: N.warning }} />
      case 'error': return <AlertTriangle style={{ width: '16px', height: '16px', color: N.danger }} />
      default: return <Bell style={{ width: '16px', height: '16px', color: N.accent }} />
    }
  }

  const handleAccessContinuousImprovement = () => {
    router.push('/continuous-improvement')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${N.dark} 0%, ${N.dark}50 50%, ${N.dark} 100%)`,
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${N.accent}, ${N.dark}50, ${N.warning})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <Sparkles style={{ width: '40px', height: '40px', color: N.accent }} />
            SILEXAR PULSE QUANTUM
            <Sparkles style={{ width: '40px', height: '40px', color: N.dark }} />
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: N.textSub,
            marginBottom: '16px'
          }}>
            Control de Mando Principal - TIER 0 SUPREMACY
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: `${N.accent}30`,
              border: `1px solid ${N.accent}50`,
              borderRadius: '20px',
              padding: '8px 16px',
              color: N.text,
              fontSize: '0.875rem',
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Shield style={{ width: '16px', height: '16px' }} />
              Pentagon++ Security
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
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: N.base
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '50%',
                  background: `${N.accent}30`
                }}>
                  {getAlertIcon(alert.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: N.text, fontWeight: '600', margin: '0 0 4px 0' }}>
                    {alert.title}
                  </h3>
                  <p style={{ color: N.textSub, margin: 0 }}>
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
              </NeuCard>
            ))}
          </div>
        )}

        {/* Navigation */}
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
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </NeuCard>

        {/* Content */}
        {activeModule === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {systemModules.map((module) => (
              <NeuCard key={module.id} style={{
                boxShadow: getShadow(),
                padding: '24px',
                background: N.base,
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                        backgroundColor: N.success
                      }} />
                      <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                        {module.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '16px' }}>
                  {module.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
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
                      width: `${module.consciousnessLevel}%`
                    }} />
                  </div>
                </div>

                {module.id === 'continuous-improvement' && (
                  <div style={{ width: '100%' }}>
                    <NeuButton variant="primary" onClick={handleAccessContinuousImprovement}>
                      <Rocket style={{ width: '20px', height: '20px' }} />
                      Acceder al Sistema
                      <Sparkles style={{ width: '16px', height: '16px' }} />
                    </NeuButton>
                  </div>
                )}
              </NeuCard>
            ))}
          </div>
        )}

        {activeModule === 'modules' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {systemModules.map((module) => (
              <NeuCard key={module.id} style={{
                boxShadow: getShadow(),
                padding: '24px',
                background: N.base
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                        backgroundColor: N.success
                      }} />
                      <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                        {module.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '16px' }}>
                  {module.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                  <span style={{ color: N.textSub }}>Version</span>
                  <span style={{ color: N.text, fontWeight: '600' }}>{module.version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '16px' }}>
                  <span style={{ color: N.textSub }}>Last Update</span>
                  <span style={{ color: N.text, fontWeight: '600' }}>{module.lastUpdate}</span>
                </div>

                <div style={{ width: '100%' }}>
                  <NeuButton variant="secondary">
                    Configurar
                  </NeuButton>
                </div>
              </NeuCard>
            ))}
          </div>
        )}

        {activeModule === 'analytics' && (
          <NeuCard style={{
            boxShadow: getShadow(),
            padding: '24px',
            background: N.base
          }}>
            <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
              Analíticas del Sistema
            </h2>
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
            background: N.base
          }}>
            <h2 style={{ color: N.text, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
              Configuración del Sistema
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: `${N.dark}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: N.text }}>Consciousness Level Global</span>
                <span style={{ color: N.accent, fontWeight: '600' }}>99.9%</span>
              </div>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: `${N.dark}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: N.text }}>Quantum Enhancement</span>
                <span style={{ color: N.success, fontWeight: '600' }}>Activado</span>
              </div>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: `${N.dark}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: N.text }}>Auto-Mejora Continua</span>
                <span style={{ color: N.success, fontWeight: '600' }}>Activado</span>
              </div>
            </div>
          </NeuCard>
        )}
      </div>
    </div>
  )
}
