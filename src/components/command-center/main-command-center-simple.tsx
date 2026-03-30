/**
 * @fileoverview TIER 0 Main Command Center - Versión Simple y Funcional
 */

'use client'

import React, { useState, useEffect } from 'react'
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

  const systemModules: SystemModule[] = [
    {
      id: 'continuous-improvement',
      name: 'Mejora Continua',
      description: 'Sistema de mejora continua automatizada con staging',
      status: 'active',
      icon: <Brain style={{ width: '20px', height: '20px', color: '#3b82f6' }} />,
      lastUpdate: '2025-01-08 14:30:00',
      version: '2040.5.0',
      consciousnessLevel: 99.8
    },
    {
      id: 'performance',
      name: 'Optimización de Rendimiento',
      description: 'Quantum-enhanced performance optimization',
      status: 'active',
      icon: <Zap style={{ width: '20px', height: '20px', color: '#f59e0b' }} />,
      lastUpdate: '2025-01-08 12:15:00',
      version: '2040.5.0',
      consciousnessLevel: 99.5
    },
    {
      id: 'security',
      name: 'Seguridad Pentagon++',
      description: 'Sistema de seguridad quantum-grade',
      status: 'active',
      icon: <Shield style={{ width: '20px', height: '20px', color: '#22c55e' }} />,
      lastUpdate: '2025-01-08 11:45:00',
      version: '2040.5.0',
      consciousnessLevel: 99.9
    }
  ]

  useEffect(() => {
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />
      case 'warning': return <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
      case 'error': return <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
      default: return <Bell style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
    }
  }

  const handleAccessContinuousImprovement = () => {
    window.location.href = '/continuous-improvement'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
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
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <Sparkles style={{ width: '40px', height: '40px', color: '#3b82f6' }} />
            SILEXAR PULSE QUANTUM
            <Sparkles style={{ width: '40px', height: '40px', color: '#8b5cf6' }} />
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '16px'
          }}>
            Control de Mando Principal - TIER 0 SUPREMACY
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
              <div key={alert.id} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)'
                }}>
                  {getAlertIcon(alert.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'white', fontWeight: '600', margin: '0 0 4px 0' }}>
                    {alert.title}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
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
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255, 255, 255, 0.1)',
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
              fontSize: '0.875rem'
            }}
          >
            <Settings style={{ width: '16px', height: '16px' }} />
            Configuración
          </button>
        </div>

        {/* Content */}
        {activeModule === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {systemModules.map((module) => (
              <div key={module.id} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.2)'
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
                        backgroundColor: '#22c55e'
                      }} />
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {module.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '16px' }}>
                  {module.description}
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
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
                      width: `${module.consciousnessLevel}%`
                    }} />
                  </div>
                </div>
                
                {module.id === 'continuous-improvement' && (
                  <button 
                    onClick={handleAccessContinuousImprovement}
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
                      gap: '12px'
                    }}
                  >
                    <Rocket style={{ width: '20px', height: '20px' }} />
                    Acceder al Sistema
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeModule === 'analytics' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
              Analíticas del Sistema
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>99.9%</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Uptime</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
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
      </div>
    </div>
  )
}