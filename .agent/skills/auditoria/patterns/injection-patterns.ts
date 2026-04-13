/**
 * Security Patterns - Injection Detection
 * OWASP A03: Injection
 * 
 * Este archivo define patrones para detectar vulnerabilidades de inyección
 * en código TypeScript/JavaScript/React
 */

export interface InjectionPattern {
  id: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'SQL_INJECTION' | 'XSS' | 'COMMAND_INJECTION' | 'PATH_TRAVERSAL' | 'CODE_INJECTION';
  regex: RegExp;
  safeAlternative?: string;
  remediation: string;
  falsePositivePatterns?: RegExp[];
}

export const INJECTION_PATTERNS: InjectionPattern[] = [
  // CODE INJECTION - CRITICAL
  {
    id: 'INJ-001',
    name: 'eval() with user input',
    description: 'Uso de eval() puede ejecutar código arbitrario',
    severity: 'CRITICAL',
    category: 'CODE_INJECTION',
    regex: /eval\s*\([^)]*(req\.|request\.|params|query|body|input)/i,
    remediation: 'Usar JSON.parse() con validación o evitar eval() completamente',
  },
  {
    id: 'INJ-002',
    name: 'new Function() with user input',
    description: 'new Function() puede ejecutar código arbitrario',
    severity: 'CRITICAL',
    category: 'CODE_INJECTION',
    regex: /new\s+Function\s*\([^)]*(req\.|request\.|params|query|body|input)/i,
    remediation: 'Evitar new Function() con input del usuario',
  },
  {
    id: 'INJ-003',
    name: 'setTimeout with string',
    description: 'setTimeout con string ejecuta código como eval()',
    severity: 'CRITICAL',
    category: 'CODE_INJECTION',
    regex: /setTimeout\s*\(\s*['"`][^'"`]*\$\{?/,
    remediation: 'Usar función en lugar de string: setTimeout(() => {...}, delay)',
  },

  // XSS - CRITICAL
  {
    id: 'INJ-004',
    name: 'dangerouslySetInnerHTML without sanitization',
    description: 'XSS via dangerouslySetInnerHTML',
    severity: 'CRITICAL',
    category: 'XSS',
    regex: /dangerouslySetInnerHTML\s*=\s*\{\{?\s*__html:\s*([^}]+)\}?/,
    remediation: 'Usar DOMPurify.sanitize() antes de dangerouslySetInnerHTML',
    falsePositivePatterns: [
      /DOMPurify\.sanitize/,
      /sanitize\(/,
    ],
  },
  {
    id: 'INJ-005',
    name: 'innerHTML with user input',
    description: 'innerHTML puede ejecutar scripts maliciosos',
    severity: 'CRITICAL',
    category: 'XSS',
    regex: /\.innerHTML\s*=\s*[^;]*(req\.|request\.|params|query|body|input|user)/i,
    remediation: 'Usar textContent o DOMPurify.sanitize()',
  },
  {
    id: 'INJ-006',
    name: 'document.write with user input',
    description: 'document.write puede ejecutar scripts',
    severity: 'CRITICAL',
    category: 'XSS',
    regex: /document\.write\s*\([^)]*(req\.|request\.|params|query|body|input|user)/i,
    remediation: 'Evitar document.write() completamente',
  },

  // SQL INJECTION - CRITICAL
  {
    id: 'INJ-007',
    name: 'Raw SQL query with interpolation',
    description: 'SQL injection via string interpolation',
    severity: 'CRITICAL',
    category: 'SQL_INJECTION',
    regex: /(query|execute|exec)\s*\(\s*[`'"][^`'"]*\$\{[^}]+\}/i,
    remediation: 'Usar ORM (Drizzle) o parametrized queries',
    falsePositivePatterns: [
      /drizzle/,
      /\.where\(/,
      /eq\(/,
    ],
  },
  {
    id: 'INJ-008',
    name: 'Raw SQL concatenation',
    description: 'SQL injection via string concatenation',
    severity: 'CRITICAL',
    category: 'SQL_INJECTION',
    regex: /(query|execute|exec)\s*\(\s*["'][^"']*\+\s*(req\.|request\.|params|query|body)/i,
    remediation: 'Usar ORM (Drizzle) o parametrized queries',
  },

  // COMMAND INJECTION - CRITICAL
  {
    id: 'INJ-009',
    name: 'exec with user input',
    description: 'Command injection via exec()',
    severity: 'CRITICAL',
    category: 'COMMAND_INJECTION',
    regex: /(exec|execSync|spawn)\s*\([^)]*(req\.|request\.|params|query|body|input|user)/i,
    remediation: 'Evitar exec() con input del usuario o validar estrictamente',
  },

  // PATH TRAVERSAL - HIGH
  {
    id: 'INJ-010',
    name: 'Path traversal with user input',
    description: 'Path traversal via ../ or '..\\'',
    severity: 'HIGH',
    category: 'PATH_TRAVERSAL',
    regex: /(readFile|readFileSync|sendFile|res\.sendFile)\s*\([^)]*(req\.|request\.|params|query|body|input)/i,
    remediation: 'Validar path contra whitelist y usar path.resolve()',
  },
  {
    id: 'INJ-011',
    name: '../ in path parameter',
    description: 'Posible path traversal',
    severity: 'HIGH',
    category: 'PATH_TRAVERSAL',
    regex: /['"]\.\.\/['"]|\.\.\\/,
    remediation: 'Validar y sanitizar paths',
  },

  // MEDIUM SEVERITY
  {
    id: 'INJ-012',
    name: 'href with user input',
    description: 'XSS via javascript: protocol in href',
    severity: 'MEDIUM',
    category: 'XSS',
    regex: /href\s*=\s*['"`][^'"`]*(req\.|request\.|params|query|body|input)/i,
    remediation: 'Validar URL con URL constructor o regex estricto',
  },
  {
    id: 'INJ-013',
    name: 'location with user input',
    description: 'Open redirect o XSS via location',
    severity: 'MEDIUM',
    category: 'XSS',
    regex: /(window\.)?location\s*=\s*[^;]*(req\.|request\.|params|query|body|input)/i,
    remediation: 'Validar URL contra whitelist de dominios permitidos',
  },
];

/**
 * Verifica si un match es falso positivo
 */
export function isFalsePositive(
  pattern: InjectionPattern,
  context: string
): boolean {
  if (!pattern.falsePositivePatterns) return false;
  
  return pattern.falsePositivePatterns.some(fp => fp.test(context));
}

/**
 * Obtiene patrones por severidad
 */
export function getPatternsBySeverity(
  severity: InjectionPattern['severity']
): InjectionPattern[] {
  return INJECTION_PATTERNS.filter(p => p.severity === severity);
}

/**
 * Obtiene patrones por categoría
 */
export function getPatternsByCategory(
  category: InjectionPattern['category']
): InjectionPattern[] {
  return INJECTION_PATTERNS.filter(p => p.category === category);
}
