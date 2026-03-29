import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "quantum" | "cortex" | "neural" | "default"
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const variantClasses = {
  default: "border-primary border-t-transparent",
  quantum: "border-quantum-500 border-t-transparent",
  cortex: "border-cortex-500 border-t-transparent", 
  neural: "border-neural-500 border-t-transparent"
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "quantum",
  className 
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div 
        className={cn(
          "animate-spin rounded-full border-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
    </div>
  )
}

export function QuantumSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="quantum-spinner" />
      <div className="absolute inset-0 quantum-spinner opacity-50" style={{ animationDelay: "0.5s" }} />
      <div className="absolute inset-0 quantum-spinner opacity-25" style={{ animationDelay: "1s" }} />
    </div>
  )
}

export function CortexSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-12 h-12", className)}>
      <div className="absolute inset-0 border-4 border-cortex-500/30 rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-cortex-500 rounded-full animate-spin" style={{ animationIterationCount: "3" }} />
      <div className="absolute inset-2 border-2 border-cortex-400/50 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s", animationIterationCount: "3" }} />
      <div className="absolute inset-4 w-4 h-4 bg-cortex-500 rounded-full animate-pulse" style={{ animationIterationCount: "3" }} />
    </div>
  )
}

export function NeuralSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-8 bg-neural-500 rounded-full animate-pulse"
          style={{ 
            animationIterationCount: "3",
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s"
          }}
        />
      ))}
    </div>
  )
}