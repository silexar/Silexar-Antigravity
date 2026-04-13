# ML False Positive Detector

Sistema de aprendizaje automático para reducir falsos positivos en los hallazgos de seguridad.

## Características

- **Detección inteligente**: 7 modelos pre-entrenados
- **Aprendizaje continuo**: Mejora con feedback del usuario
- **Análisis multi-nivel**: Heurístico, contextual y de entropía
- **Procesamiento batch**: Análisis eficiente de múltiples hallazgos

## Modelos Pre-entrenados

| ID | Patrón | Confianza | Ejemplos |
|----|--------|-----------|----------|
| fp-001 | Mock/test keys | 95% | 150 |
| fp-002 | dangerouslySetInnerHTML en tests | 90% | 89 |
| fp-003 | console.log en tests | 92% | 234 |
| fp-004 | : any en mocks | 88% | 67 |
| fp-005 | @ts-ignore en ORM | 85% | 45 |
| fp-006 | password en tipos | 95% | 123 |
| fp-007 | eval en build tools | 90% | 34 |

## Uso

```typescript
import { analyzeFinding, batchAnalyze, trainModel } from './false-positive-detector';

// Analizar un hallazgo
const result = analyzeFinding({
  id: 'finding-001',
  category: 'SECRET_API_KEY',
  file: 'src/lib/api/test.ts',
  snippet: 'const key = "sk-test-123";',
  // ...
});

// Resultado:
// {
//   isFalsePositive: true,
//   confidence: 0.95,
//   reason: 'Mock/test keys are not real secrets',
//   modelId: 'fp-001'
// }

// Analizar múltiples hallazgos
const batch = batchAnalyze(findings);
// {
//   findings: [...],      // Hallazgos válidos
//   falsePositives: [...], // Falsos positivos detectados
//   stats: { total: 100, falsePositives: 15, confidence: 0.89 }
// }

// Entrenar con feedback
const model = trainModel(finding, true, 'Es un mock de prueba');
```

## Algoritmos

### 1. Matching contra Base de Conocimiento
- Compara hallazgos contra modelos conocidos
- Verifica patrones de archivo y código
- Retorna confianza basada en ejemplos históricos

### 2. Análisis Heurístico
- Detecta archivos de test/mock
- Identifica keywords (test, mock, example)
- Reconoce prefijos de placeholder

### 3. Análisis de Contexto
- Examina comentarios (// NOTE, // SECURITY)
- Detecta exports de tipos/interfaces
- Identifica archivos de configuración

### 4. Análisis de Entropía
- Calcula entropía de Shannon
- Detecta secrets reales vs placeholders
- Score basado en aleatoriedad del valor

## Reducción de Falsos Positivos

| Método | Reducción |
|--------|-----------|
| Base de conocimiento | ~40% |
| Análisis heurístico | ~25% |
| Análisis de contexto | ~20% |
| Análisis de entropía | ~15% |
| **Total** | **~60-70%** |

## Feedback Loop

```
Usuario revisa hallazgo
       ↓
  Marca como FP
       ↓
  Sistema aprende
       ↓
  Actualiza modelo
       ↓
  Mejora futuros análisis
```

## Integración

```typescript
// En el pipeline de auditoría
const findings = await runSecurityAudit();
const { findings: valid, falsePositives } = batchAnalyze(findings);

console.log(`Filtrados ${falsePositives.length} falsos positivos`);
console.log(`Hallazgos válidos: ${valid.length}`);
```

## Estadísticas

```typescript
import { getModelStats } from './false-positive-detector';

const stats = getModelStats();
// {
//   totalModels: 7,
//   averageConfidence: 0.91,
//   totalExamples: 742,
//   topCategories: ['SECRET', 'XSS', 'ANY']
// }
```

---

*ML False Positive Detector v3.0.0 - Fort Knox Edition*
