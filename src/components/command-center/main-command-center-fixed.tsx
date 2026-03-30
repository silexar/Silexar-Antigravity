'use client'

import React, { useState } from 'react'

export function MainCommandCenter() {
  const [activeModule, setActiveModule] = useState('overview')

  const handleAccessContinuousImprovement = () => {
    window.location.href = '/continuous-improvement'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'white'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '16px'
          }}>
            ✨ SILEXAR PULSE QUANTUM ✨
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
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
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}>
              🧠 Consciousness Level: 99.9%
            </div>
            <div style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}>
              ⚡ Quantum Enhanced
            </div>
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}>
              🛡️ Pentagon++ Security
            </div>
          </div>
        </div>

        {/* Alert */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ✅
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
              Mejora Continua Disponible
            </h3>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
              Se ha generado una nueva mejora de rendimiento lista para testing
            </p>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: '20px'
          }}>
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '8px',
          gap: '4px',
          marginBottom: '30px'
        }}>
          <button 
            onClick={() => setActiveModule('overview')}
            style={{
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
            📊 Vista General
          </button>
          <button 
            onClick={() => setActiveModule('modules')}
            style={{
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
            ⚙️ Módulos
          </button>
          <button 
            onClick={() => setActiveModule('analytics')}
            style={{
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
            📈 Analíticas
          </button>
          <button 
            onClick={() => setActiveModule('settings')}
            style={{
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
            🔧 Configuración
          </button>
        </div>

        {/* Content */}
        {activeModule === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            
            {/* Mejora Continua Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              transition: 'transform 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🧠
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>
                    Mejora Continua
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      active
                    </span>
                  </div>
                </div>
              </div>
              
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginBottom: '16px' }}>
                Sistema de mejora continua automatizada con staging
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Consciousness Level</span>
                  <span style={{ fontWeight: '600' }}>99.8%</span>
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
                    width: '99.8%'
                  }} />
                </div>
              </div>
              
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
                  gap: '8px'
                }}
              >
                🚀 Acceder al Sistema ✨
              </button>
            </div>

            {/* Other modules */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  ⚡
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>
                    Optimización de Rendimiento
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      active
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Quantum-enhanced performance optimization
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🛡️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>
                    Seguridad Pentagon++
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e'
                    }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      active
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                Sistema de seguridad quantum-grade
              </p>
            </div>
          </div>
        )}

        {activeModule === 'analytics' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>
              📊 Analíticas del Sistema
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>99.9%</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Uptime</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>47ms</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Response Time</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>Mejoras Aplicadas</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}