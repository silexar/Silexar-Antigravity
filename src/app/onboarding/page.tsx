/**
 * TIER 0 Onboarding Page - Quantum-Enhanced User Onboarding
 * 
 * @description Pentagon++ quantum-enhanced onboarding experience with
 * consciousness-level user guidance and transcendent system introduction.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Zap, 
  Shield, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Rocket
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Bienvenido a SILEXAR PULSE QUANTUM',
      description: 'Descubre el futuro de la inteligencia artificial empresarial',
      icon: Sparkles,
      completed: false
    },
    {
      id: 'cortex',
      title: 'Conoce CORTEX Constellation',
      description: 'Explora nuestros 20 motores de IA más avanzados',
      icon: Brain,
      completed: false
    },
    {
      id: 'security',
      title: 'Seguridad Pentagon++',
      description: 'Comprende nuestro sistema de seguridad cuántica',
      icon: Shield,
      completed: false
    },
    {
      id: 'features',
      title: 'Características TIER 0',
      description: 'Descubre las capacidades de supremacía tecnológica',
      icon: Target,
      completed: false
    },
    {
      id: 'ready',
      title: '¡Listo para la Revolución!',
      description: 'Comienza tu experiencia cuántica',
      icon: Rocket,
      completed: false
    }
  ])

  useEffect(() => {
    setProgress((currentStep / (steps.length - 1)) * 100)
  }, [currentStep, steps.length])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Mark current step as completed
      setSteps(prev => prev.map((step, index) => 
        index === currentStep ? { ...step, completed: true } : step
      ))
      setCurrentStep(prev => prev + 1)
    } else {
      // Onboarding complete, redirect to dashboard
      router.push('/dashboard')
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData?.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-quantum-950/5 to-cortex-950/5 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="quantum-background opacity-20" />
        <div className="neural-grid opacity-10" />
      </div>

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Zap className="w-8 h-8 text-quantum-400" />
            <h1 className="text-3xl font-bold font-quantum holographic-text">
              SILEXAR PULSE QUANTUM
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Configuración inicial del sistema TIER 0 SUPREMACY
          </motion.p>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-quantum-400 font-mono">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index < currentStep 
                      ? 'bg-green-400' 
                      : index === currentStep 
                        ? 'bg-quantum-400' 
                        : 'bg-muted'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-colors ${
                    index < currentStep ? 'bg-green-400/50' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="holographic-card p-8 text-center">
              {Icon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <div className="p-4 rounded-full bg-quantum-500/10 border border-quantum-500/30">
                    <Icon className="w-12 h-12 text-quantum-400" />
                  </div>
                </motion.div>
              )}

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-4"
              >
                {currentStepData?.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8 text-lg"
              >
                {currentStepData?.description}
              </motion.p>

              {/* Step-specific content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-background/50 border">
                      <Brain className="w-8 h-8 text-quantum-400 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">IA Cuántica</h3>
                      <p className="text-sm text-muted-foreground">20 motores especializados</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border">
                      <Shield className="w-8 h-8 text-cortex-400 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Seguridad Pentagon++</h3>
                      <p className="text-sm text-muted-foreground">Protección cuántica</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border">
                      <Target className="w-8 h-8 text-neural-400 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">TIER 0 Supremacy</h3>
                      <p className="text-sm text-muted-foreground">Tecnología del 2040</p>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-quantum-400 border-quantum-400/50">
                      CORTEX-PROPHET: Predicción de mercado 94.7%
                    </Badge>
                    <Badge variant="outline" className="text-cortex-400 border-cortex-400/50">
                      CORTEX-VOICE: Síntesis de voz cuántica
                    </Badge>
                    <Badge variant="outline" className="text-neural-400 border-neural-400/50">
                      CORTEX-SENSE: Análisis de audio avanzado
                    </Badge>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="text-left max-w-md mx-auto space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Encriptación cuántica end-to-end</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Autenticación biométrica avanzada</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Monitoreo de amenazas en tiempo real</span>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg bg-quantum-500/10">
                      <div className="text-2xl font-bold text-quantum-400">99.97%</div>
                      <div className="text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-cortex-500/10">
                      <div className="text-2xl font-bold text-cortex-400">2.3ms</div>
                      <div className="text-muted-foreground">Latencia</div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="text-6xl">🚀</div>
                    <p className="text-lg text-quantum-400">
                      ¡Bienvenido al futuro de la IA empresarial!
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Saltar configuración
                </Button>

                <Button
                  onClick={handleNext}
                  className="bg-quantum-600 hover:bg-quantum-700 text-white"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Comenzar
                      <Rocket className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}