'use client'

/**
 * CampanaWizardProgress — Step indicator for the campaign creation wizard
 *
 * Shows current step, completed steps, and upcoming steps.
 * Neumorphic raised pills for completed, inset for current, flat for pending.
 * Mobile-responsive (horizontal scroll on small screens).
 */

import { Check } from 'lucide-react'

interface WizardStep {
  id: string
  label: string
  shortLabel?: string
  description?: string
}

interface CampanaWizardProgressProps {
  steps: WizardStep[]
  currentStepIndex: number
  completedSteps?: Set<number>
  onStepClick?: (index: number) => void
  className?: string
}

export function CampanaWizardProgress({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
  className = '',
}: CampanaWizardProgressProps) {
  return (
    <nav
      aria-label="Pasos del wizard de campaña"
      className={`overflow-x-auto pb-1 ${className}`}
    >
      <ol className="flex items-center min-w-max gap-0">
        {steps.map((step, index) => {
          const isCompleted = completedSteps
            ? completedSteps.has(index)
            : index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex
          const isClickable = onStepClick && (isCompleted || isCurrent)

          return (
            <li key={step.id} className="flex items-center">
              {/* Step node */}
              <button
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Paso ${index + 1}: ${step.label}${isCompleted ? ' (completado)' : isCurrent ? ' (actual)' : ''}`}
                className={`flex flex-col items-center px-3 group focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[#1D5AE8] rounded-xl
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Circle indicator */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
                    transition-all duration-200
                    ${isCompleted
                      ? 'bg-[#1D5AE8] text-white shadow-[3px_3px_7px_#D4D1CC,-3px_-3px_7px_#FFFFFF]'
                      : isCurrent
                        ? 'bg-[#F0EDE8] text-[#1D5AE8] shadow-[inset_2px_2px_5px_#D4D1CC,inset_-2px_-2px_5px_#FFFFFF] ring-2 ring-[#1D5AE8]'
                        : 'bg-[#F0EDE8] text-[#888780] shadow-[3px_3px_7px_#D4D1CC,-3px_-3px_7px_#FFFFFF]'}`}
                >
                  {isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}
                </div>

                {/* Label */}
                <span
                  className={`mt-1.5 text-center text-[10px] font-medium leading-tight max-w-[60px]
                    ${isCurrent ? 'text-[#1D5AE8]' : isCompleted ? 'text-[#5F5E5A]' : 'text-[#888780]'}`}
                >
                  {step.shortLabel ?? step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 flex-shrink-0 rounded-full transition-colors duration-300
                    ${isCompleted ? 'bg-[#1D5AE8]' : 'bg-[#D4D1CC]'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── Preset steps for the campaign wizard ────────────────────────────────────

export const CAMPANA_WIZARD_STEPS: WizardStep[] = [
  { id: 'basicos',       label: 'Datos básicos',      shortLabel: 'Básicos' },
  { id: 'anunciante',    label: 'Anunciante',          shortLabel: 'Cliente' },
  { id: 'fechas',        label: 'Fechas y horario',    shortLabel: 'Fechas' },
  { id: 'emisoras',      label: 'Emisoras y bloques',  shortLabel: 'Emisoras' },
  { id: 'cunas',         label: 'Cuñas y materiales',  shortLabel: 'Cuñas' },
  { id: 'facturacion',   label: 'Facturación',         shortLabel: 'Factura' },
  { id: 'revision',      label: 'Revisión y envío',    shortLabel: 'Revisar' },
]
