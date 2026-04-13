/**
 * ML False Positive Detector
 * 
 * Sistema de aprendizaje automático para reducir falsos positivos
 * en los hallazgos de seguridad.
 * 
 * Versión: 3.0.0 - Fort Knox Edition
 */

export interface Finding {
  id: string;
  agent: string;
  category: string;
  severity: string;
  file: string;
  line: number;
  message: string;
  snippet: string;
  context?: string;
}

export interface FalsePositiveModel {
  id: string;
  findingPattern: string;
  filePattern?: string;
  codePattern?: string;
  confidence: number;
  reason: string;
  examples: number;
  lastUpdated: Date;
}

// Base de conocimiento de falsos positivos conocidos
const KNOWN_FALSE_POSITIVES: FalsePositiveModel[] = [
  {
    id: 'fp-001',
    findingPattern: 'sk-',
    filePattern: '*.test.ts',
    codePattern: 'sk-test-*|sk-mock-*|sk-fake-*',
    confidence: 0.95,
    reason: 'Mock/test keys are not real secrets',
    examples: 150,
    lastUpdated: new Date('2026-04-01'),
  },
  {
    id: 'fp-002',
    findingPattern: 'dangerouslySetInnerHTML',
    filePattern: '*-test.tsx',
    codePattern: '__html:.*test|__html:.*mock',
    confidence: 0.90,
    reason: 'Test files with mock HTML content',
    examples: 89,
    lastUpdated: new Date('2026-04-01'),
  },
  {
    id: 'fp-003',
    findingPattern: 'console.log',
    filePattern: '*.test.ts',
    codePattern: 'console\\.log\\(.*expected|actual',
    confidence: 0.92,
    reason: 'Console logs in tests for debugging',
    examples: 234,
    lastUpdated: new Date('2026-04-01'),
  },
  {
    id: 'fp-004',
    findingPattern: ': any',
    filePattern: '__mocks__/*',
    codePattern: 'mock.*: any',
    confidence: 0.88,
    reason: 'Mock files with flexible types',
    examples: 67,
    lastUpdated: new Date('2026-04-01'),
  },
  {
    id: 'fp-005',
    findingPattern: '@ts-ignore',
    filePattern: 'drizzle/*|types/*',
    codePattern: '@ts-ignore.*schema|@ts-ignore.*orm',
    confidence: 0.85,
    reason: 'TypeORM/Drizzle type complexities',
    examples: 45,
    lastUpdated: new Date('2026-04-01'),
  },
  {
    id: 'fp-006',
    findingPattern: 'password',
    filePattern: '*.type.ts|*.interface.ts',
    codePattern: 'password\\??: string',
    confidence: 0.95,
    reason: 'Type definitions, not real passwords',
    examples: 123,
    lastUpdated: new Date('2026-04-01'),
  },
  {
    id: 'fp-007',
    findingPattern: 'eval(',
    filePattern: 'webpack*|vite*|rollup*',
    codePattern: 'eval\\(source|eval\\(code',
    confidence: 0.90,
    reason: 'Build tools using eval for HMR',
    examples: 34,
    lastUpdated: new Date('2026-04-01'),
  },
];

/**
 * Analiza un hallazgo para determinar si es falso positivo
 */
export function analyzeFinding(finding: Finding): {
  isFalsePositive: boolean;
  confidence: number;
  reason?: string;
  modelId?: string;
} {
  // 1. Verificar contra base de conocimiento
  const knownMatch = checkKnownFalsePositives(finding);
  if (knownMatch.isMatch && knownMatch.confidence > 0.85) {
    return {
      isFalsePositive: true,
      confidence: knownMatch.confidence,
      reason: knownMatch.reason,
      modelId: knownMatch.modelId,
    };
  }

  // 2. Análisis heurístico
  const heuristicScore = calculateHeuristicScore(finding);
  if (heuristicScore > 0.8) {
    return {
      isFalsePositive: true,
      confidence: heuristicScore,
      reason: 'Heuristic analysis suggests false positive',
    };
  }

  // 3. Análisis de contexto
  const contextScore = analyzeContext(finding);
  if (contextScore > 0.75) {
    return {
      isFalsePositive: true,
      confidence: contextScore,
      reason: 'Context analysis suggests false positive',
    };
  }

  // 4. Análisis de entropía para secrets
  if (finding.category.includes('SECRET') || finding.category.includes('API_KEY')) {
    const entropyScore = analyzeEntropy(finding);
    if (entropyScore < 0.3) {
      return {
        isFalsePositive: true,
        confidence: 0.8,
        reason: 'Low entropy suggests placeholder/test value',
      };
    }
  }

  return {
    isFalsePositive: false,
    confidence: 1 - Math.max(knownMatch.confidence, heuristicScore, contextScore),
  };
}

/**
 * Verifica contra falsos positivos conocidos
 */
function checkKnownFalsePositives(finding: Finding): {
  isMatch: boolean;
  confidence: number;
  reason?: string;
  modelId?: string;
} {
  for (const model of KNOWN_FALSE_POSITIVES) {
    // Verificar patrón de finding
    if (!finding.message.includes(model.findingPattern) && 
        !finding.category.includes(model.findingPattern)) {
      continue;
    }

    // Verificar patrón de archivo
    if (model.filePattern) {
      const fileRegex = new RegExp(model.filePattern.replace(/\*/g, '.*'));
      if (!fileRegex.test(finding.file)) {
        continue;
      }
    }

    // Verificar patrón de código
    if (model.codePattern) {
      const codeRegex = new RegExp(model.codePattern, 'i');
      if (!codeRegex.test(finding.snippet)) {
        continue;
      }
    }

    return {
      isMatch: true,
      confidence: model.confidence,
      reason: model.reason,
      modelId: model.id,
    };
  }

  return { isMatch: false, confidence: 0 };
}

/**
 * Calcula score heurístico basado en patrones
 */
function calculateHeuristicScore(finding: Finding): number {
  let score = 0;
  const indicators: string[] = [];

  // Indicadores de test/mocks
  if (finding.file.includes('.test.') || finding.file.includes('.spec.')) {
    score += 0.3;
    indicators.push('test_file');
  }
  if (finding.file.includes('__mocks__')) {
    score += 0.3;
    indicators.push('mock_file');
  }
  if (finding.file.includes('.stories.')) {
    score += 0.25;
    indicators.push('storybook');
  }

  // Indicadores en código
  if (finding.snippet.includes('test') || finding.snippet.includes('mock')) {
    score += 0.2;
    indicators.push('test_keyword');
  }
  if (finding.snippet.includes('example') || finding.snippet.includes('sample')) {
    score += 0.15;
    indicators.push('example_keyword');
  }
  if (finding.snippet.includes('TODO') || finding.snippet.includes('FIXME')) {
    score += 0.1;
    indicators.push('todo_comment');
  }

  // Indicadores de tipo
  if (finding.category.includes('SECRET')) {
    if (/^test-|mock-|fake-|example-|sample-/i.test(finding.snippet)) {
      score += 0.3;
      indicators.push('placeholder_prefix');
    }
  }

  return Math.min(score, 0.95);
}

/**
 * Analiza el contexto del hallazgo
 */
function analyzeContext(finding: Finding): number {
  let score = 0;

  // Contexto de comentarios
  if (finding.context) {
    if (finding.context.includes('// NOTE:') || 
        finding.context.includes('// SECURITY:') ||
        finding.context.includes('// WHY:')) {
      score += 0.2;
    }
    if (finding.context.includes('@deprecated') ||
        finding.context.includes('@internal')) {
      score += 0.15;
    }
  }

  // Contexto de exports
  if (finding.snippet.includes('export') && finding.file.includes('.type.ts')) {
    score += 0.25;
  }

  // Contexto de interfaces/types
  if (finding.snippet.includes('interface') || finding.snippet.includes('type ')) {
    score += 0.2;
  }

  return Math.min(score, 0.9);
}

/**
 * Analiza entropía para detectar placeholders
 */
function analyzeEntropy(finding: Finding): number {
  // Extraer valor potencial del snippet
  const valueMatch = finding.snippet.match(/["\']([a-zA-Z0-9_-]+)["\']/);
  if (!valueMatch) return 0.5;

  const value = valueMatch[1];
  
  // Calcular entropía
  const entropy = calculateEntropy(value);
  
  // Normalizar score (entropía alta = probablemente real)
  // Entropía > 4.5 probablemente es real
  // Entropía < 3.0 probablemente es placeholder
  return Math.min(Math.max((entropy - 3) / 1.5, 0), 1);
}

/**
 * Calcula entropía de Shannon
 */
function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;

  const freq: Record<string, number> = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Entrena el modelo con feedback del usuario
 */
export function trainModel(
  finding: Finding,
  isFalsePositive: boolean,
  feedback?: string
): FalsePositiveModel {
  // Crear o actualizar modelo
  const pattern = generatePattern(finding);
  
  const model: FalsePositiveModel = {
    id: `fp-${Date.now()}`,
    findingPattern: pattern.finding,
    filePattern: pattern.file,
    codePattern: pattern.code,
    confidence: isFalsePositive ? 0.7 : 0.3,
    reason: feedback || 'User feedback',
    examples: 1,
    lastUpdated: new Date(),
  };

  // Guardar modelo (en implementación real, persistir a DB)
  KNOWN_FALSE_POSITIVES.push(model);

  return model;
}

/**
 * Genera patrones a partir de un hallazgo
 */
function generatePattern(finding: Finding): {
  finding: string;
  file: string;
  code: string;
} {
  return {
    finding: finding.category.split('_')[0],
    file: finding.file.replace(/.*\//, '').replace(/\./g, '\\.'),
    code: finding.snippet.substring(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  };
}

/**
 * Batch processing de múltiples hallazgos
 */
export function batchAnalyze(findings: Finding[]): {
  findings: Finding[];
  falsePositives: Finding[];
  stats: {
    total: number;
    falsePositives: number;
    confidence: number;
  };
} {
  const results = findings.map(f => ({
    finding: f,
    analysis: analyzeFinding(f),
  }));

  const validFindings = results
    .filter(r => !r.analysis.isFalsePositive)
    .map(r => r.finding);

  const falsePositives = results
    .filter(r => r.analysis.isFalsePositive)
    .map(r => r.finding);

  const avgConfidence = results.reduce((sum, r) => sum + r.analysis.confidence, 0) / results.length;

  return {
    findings: validFindings,
    falsePositives,
    stats: {
      total: findings.length,
      falsePositives: falsePositives.length,
      confidence: avgConfidence,
    },
  };
}

/**
 * Obtiene estadísticas del modelo
 */
export function getModelStats(): {
  totalModels: number;
  averageConfidence: number;
  totalExamples: number;
  topCategories: string[];
} {
  const totalModels = KNOWN_FALSE_POSITIVES.length;
  const averageConfidence = KNOWN_FALSE_POSITIVES.reduce((sum, m) => sum + m.confidence, 0) / totalModels;
  const totalExamples = KNOWN_FALSE_POSITIVES.reduce((sum, m) => sum + m.examples, 0);
  
  // Extraer categorías
  const categories = KNOWN_FALSE_POSITIVES.map(m => m.findingPattern);
  const topCategories = [...new Set(categories)].slice(0, 5);

  return {
    totalModels,
    averageConfidence,
    totalExamples,
    topCategories,
  };
}

// Exportar base de conocimiento para persistencia
export { KNOWN_FALSE_POSITIVES };
