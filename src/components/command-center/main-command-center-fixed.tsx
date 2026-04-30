'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'

const mockStats = {
  consciousnessLevel: 99.8,
  uptime: 99.9,
  responseTime: 47,
  improvementsApplied: 12
}

const mockModules = [
  {
    id: 'continuous-improvement',
    name: 'Mejora Continua',
    description: 'Sistema de mejora continua automatizada con staging',
    status: 'active',
    consciousnessLevel: 99.8,
    icon: '🧠'
  },
  {
    id: 'performance',
    name: 'Optimización de Rendimiento',
    description: 'Quantum-enhanced performance optimization',
    status: 'active',
    icon: '⚡'
  },
  {
    id: 'security',
    name: 'Seguridad Pentagon++',
    description: 'Sistema de seguridad quantum-grade',
    status: 'active',
    icon: '🛡️'
  }
]

const mockAnalytics = [
  { label: 'Uptime', value: '99.9%', color: N.accent },
  { label: 'Response Time', value: '47ms', color: N.warning },
  { label: 'Mejoras Aplicadas', value: '12', color: N.success }
]

export function MainCommandCenter() {
  const router = useRouter()
  const [activeModule, setActiveModule] = useState('overview')

  const handleAccessContinuousImprovement = () => {
    router.push('/continuous-improvement')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${N.dark} 0%, ${N.dark}50 50%, ${N.dark} 100%)`,
      padding: '24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${N.accent}, ${N.dark}50, ${N.warning})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '16px'
          }}>
            ✨ SILEXAR PULSE QUANTUM ✨
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: N.textSub,
            marginBottom: '20px'
          }}>
            Control de Mando Principal - TIER 0 SUPREMACY
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '30px'
          }}>
            <div style={{
              background: `${N.accent}30`,
              border: `1px solid ${N.accent}50`,
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              color: N.text
            }}>
              🧠 Consciousness Level: 99.9%
            </div>
            <div style={{
              background: `${N.dark}50`,
              border: `1px solid ${N.dark}70`,
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              color: N.text
            }}>
              ⚡ Quantum Enhanced
            </div>
            <div style={{
              background: `${N.success}30`,
              border: `1px solid ${N.success}50`,
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              color: N.text
            }}>
              🛡️ Pentagon++ Security
            </div>
          </div>
        </div>

        {/* Alert */}
        <NeuCard style={{
          boxShadow: getShadow(),
          padding: '20px',
          marginBottom: '30px',
          background: N.base,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `${N.success}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ✅
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontWeight: '600', color: N.text }}>
              Mejora Continua Disponible
            </h3>
            <p style={{ margin: 0, color: N.textSub }}>
              Se ha generado una nueva mejora de rendimiento lista para testing
            </p>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: N.textSub,
            background: `${N.dark}30`,
            padding: '4px 12px',
            borderRadius: '20px',
            marginLeft: 'auto'
          }}>
            {new Date().toLocaleTimeString()}
          </div>
        </NeuCard>

        {/* Navigation */}
        <NeuCard style={{
          boxShadow: getShadow(),
          padding: '8px',
          marginBottom: '30px',
          background: N.base
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px'
          }}>
            {[
              { id: 'overview', label: '📊 Vista General' },
              { id: 'modules', label: '⚙️ Módulos' },
              { id: 'analytics', label: '📈 Analíticas' },
              { id: 'settings', label: '🔧 Configuración' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                style={{
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
                {tab.label}
              </button>
            ))}
          </div>
        </NeuCard>

        {/* Content */}
        {activeModule === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>

            {/* Mejora Continua Card */}
            <NeuCard style={{
              boxShadow: getShadow(),
              padding: '24px',
              background: N.base,
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${N.accent}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🧠
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: N.text }}>
                    Mejora Continua
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: N.success
                    }} />
                    <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                      active
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ color: N.textSub, fontSize: '0.875rem', marginBottom: '16px' }}>
                Sistema de mejora continua automatizada con staging
              </p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                  <span style={{ color: N.textSub }}>Consciousness Level</span>
                  <span style={{ fontWeight: '600', color: N.text }}>{mockStats.consciousnessLevel}%</span>
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
                    width: `${mockStats.consciousnessLevel}%`
                  }} />
                </div>
              </div>

              <div style={{ width: '100%' }}>
                <NeuButton
                  variant="primary"
                  onClick={handleAccessContinuousImprovement}
                >
                  🚀 Acceder al Sistema ✨
                </NeuButton>
              </div>
            </NeuCard>

            {/* Other modules */}
            <NeuCard style={{
              boxShadow: getShadow(),
              padding: '24px',
              background: N.base
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${N.warning}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ⚡
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: N.text }}>
                    Optimización de Rendimiento
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: N.success
                    }} />
                    <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                      active
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
                Quantum-enhanced performance optimization
              </p>
            </NeuCard>

            <NeuCard style={{
              boxShadow: getShadow(),
              padding: '24px',
              background: N.base
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${N.success}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🛡️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: N.text }}>
                    Seguridad Pentagon++
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: N.success
                    }} />
                    <span style={{ fontSize: '0.75rem', color: N.textSub }}>
                      active
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ color: N.textSub, fontSize: '0.875rem' }}>
                Sistema de seguridad quantum-grade
              </p>
            </NeuCard>
          </div>
        )}

        {activeModule === 'modules' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {mockModules.map(module => (
              <NeuCard key={module.id} style={{
                boxShadow: getShadow(),
                padding: '24px',
                background: N.base
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${N.accent}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {module.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold', color: N.text }}>
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
                {module.consciousnessLevel && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                      <span style={{ color: N.textSub }}>Consciousness Level</span>
                      <span style={{ fontWeight: '600', color: N.text }}>{module.consciousnessLevel}%</span>
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
                )}
                <div style={{ width: '100%' }}>
                  <NeuButton variant="secondary">
                    Acceder
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
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>
              📊 Analíticas del Sistema
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
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold', color: N.text }}>
              🔧 Configuración
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
                <span style={{ color: N.text }}>Modo de Consciencia</span>
                <span style={{ color: N.accent, fontWeight: '600' }}>Quantum Enhanced</span>
              </div>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: `${N.dark}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: N.text }}>Nivel de Seguridad</span>
                <span style={{ color: N.success, fontWeight: '600' }}>Pentagon++</span>
              </div>
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                background: `${N.dark}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: N.text }}>Auto-Mejora</span>
                <span style={{ color: N.success, fontWeight: '600' }}>Activado</span>
              </div>
            </div>
          </NeuCard>
        )}
      </div>
    </div>
  )
}
