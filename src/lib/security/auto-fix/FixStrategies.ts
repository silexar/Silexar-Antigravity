/**
 * Estrategias de corrección para el sistema de auto-fix de seguridad
 * @module SecurityAutoFix/FixStrategies
 * 
 * Categorías de fixes:
 * - HIGH: Errores críticos de seguridad (auto-fix inmediato)
 * - MEDIUM: Code smells y problemas potenciales (sugerir fix)
 * - LOW: Estilo y optimizaciones (auto-fix opcional)
 */

import type {
  SecurityIssue,
  FixStrategy,
  IssueType,
  SeverityLevel,
  FixContext,
} from './types';

/** Genera ID único para issues */
const generateIssueId = (): string => 
  `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/** Estrategias de corrección organizadas por categoría */
export const FixStrategies: Record<SeverityLevel, FixStrategy[]> = {
  HIGH: [
    // Console.log con datos sensibles
    {
      name: 'console-sensitive-data',
      description: 'Detecta console.log con datos potencialmente sensibles',
      severity: 'HIGH',
      autoFixable: true,
      requiresConfirmation: false,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        // Patrones de datos sensibles
        const sensitivePatterns = [
          /console\.(log|debug|info)\s*\(\s*(password|token|secret|key|credential|auth|session|cookie)/i,
          /console\.(log|debug|info)\s*\(\s*.*\b(user|pass|pwd|ssn|credit|card|cvv|api[_-]?key)/i,
          /console\.(log|debug|info)\s*\(\s*.*[\`\'\"].*(password|secret|token).*[\`\'\"]/i,
        ];
        
        lines.forEach((line, index) => {
          sensitivePatterns.forEach(pattern => {
            if (pattern.test(line)) {
              const match = line.match(/console\.(log|debug|info)/);
              if (match) {
                issues.push({
                  id: generateIssueId(),
                  type: 'console_sensitive_data',
                  severity: 'HIGH',
                  filePath,
                  line: index + 1,
                  column: line.indexOf(match[0]) + 1,
                  originalCode: line.trim(),
                  message: 'Console.log detectado con posibles datos sensibles',
                  suggestedFix: '// TODO: Reemplazar con logger seguro auditado',
                  confidence: 0.95,
                  metadata: {
                    matchedPattern: pattern.source,
                    consoleMethod: match[1],
                  },
                });
              }
            }
          });
        });
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        const lines = content.split('\n');
        const lineIndex = issue.line - 1;
        
        if (lineIndex < 0 || lineIndex >= lines.length) return null;
        
        const originalLine = lines[lineIndex];
        
        // Reemplazar console.log con logger seguro
        const fixedLine = originalLine.replace(
          /console\.(log|debug|info)\s*\(/,
          'auditLogger.security("Datos sensibles detectados en log", { context: "$1", data: "[REDACTED]" }); // '
        );
        
        lines[lineIndex] = fixedLine;
        return lines.join('\n');
      },
    },
    
    // Hardcoded secrets
    {
      name: 'hardcoded-secret',
      description: 'Detecta secretos hardcodeados en el código',
      severity: 'HIGH',
      autoFixable: true,
      requiresConfirmation: true,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const secretPatterns = [
          /['"`]([a-zA-Z0-9_-]*(?:password|secret|key|token|api[_-]?key)[a-zA-Z0-9_-]*)['"`]\s*[:=]\s*['"`]([^'"`]{8,})['"`]/i,
          /(?:password|pwd|secret|api[_-]?key)\s*[:=]\s*['"`]([^'"`]{8,})['"`]/i,
          /process\.env\.([A-Z_]*(?:PASSWORD|SECRET|KEY|TOKEN)[A-Z_]*)\s*[=:]\s*['"`]([^'"`]+)['"`]/i,
        ];
        
        lines.forEach((line, index) => {
          secretPatterns.forEach(pattern => {
            if (pattern.test(line) && !line.includes('//')) {
              const match = line.match(pattern);
              if (match) {
                issues.push({
                  id: generateIssueId(),
                  type: 'hardcoded_secret',
                  severity: 'HIGH',
                  filePath,
                  line: index + 1,
                  column: line.indexOf(match[0]) + 1,
                  originalCode: line.trim(),
                  message: 'Secreto hardcodeado detectado',
                  suggestedFix: `process.env.${match[1]?.toUpperCase() || 'SECRET_KEY'}`,
                  confidence: 0.85,
                  metadata: {
                    secretType: match[1],
                    redactedValue: '[REDACTED]',
                  },
                });
              }
            }
          });
        });
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        const lines = content.split('\n');
        const lineIndex = issue.line - 1;

        if (!issue.metadata?.secretType) return null;

        const secretType = issue.metadata.secretType as string;
        const envVarName = secretType.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        const fixedLine = lines[lineIndex].replace(
          /['"`][^'"`]+['"`]\s*$/,
          `process.env.${envVarName}`
        );

        lines[lineIndex] = fixedLine;
        return lines.join('\n');
      },
    },
    
    // SQL Injection risk
    {
      name: 'sql-injection-risk',
      description: 'Detecta posibles vulnerabilidades de SQL injection',
      severity: 'HIGH',
      autoFixable: false,
      requiresConfirmation: true,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const sqlPatterns = [
          /(?:query|execute|raw)\s*\(\s*[`'"].*\$\{[^}]+\}/,
          /(?:query|execute|raw)\s*\(\s*[`'"].*\+\s*\w+/,
          /SELECT.*FROM.*WHERE.*['"]\s*\+\s*/i,
          /INSERT\s+INTO.*VALUES\s*\([^)]*['"]\s*\+\s*/i,
        ];
        
        lines.forEach((line, index) => {
          sqlPatterns.forEach(pattern => {
            if (pattern.test(line)) {
              issues.push({
                id: generateIssueId(),
                type: 'sql_injection_risk',
                severity: 'HIGH',
                filePath,
                line: index + 1,
                column: 1,
                originalCode: line.trim(),
                message: 'Posible vulnerabilidad de SQL injection',
                suggestedFix: 'Usar consultas parametrizadas',
                confidence: 0.8,
              });
            }
          });
        });
        
        return issues;
      },
      fix: () => null, // Requiere revisión manual
    },
    
    // XSS Vulnerability
    {
      name: 'xss-vulnerability',
      description: 'Detecta posibles vulnerabilidades XSS',
      severity: 'HIGH',
      autoFixable: false,
      requiresConfirmation: true,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const xssPatterns = [
          /innerHTML\s*=\s*[^;]+/,
          /dangerouslySetInnerHTML\s*:\s*\{\s*__html\s*:/,
          /document\.write\s*\(/,
          /eval\s*\(/,
        ];
        
        lines.forEach((line, index) => {
          xssPatterns.forEach(pattern => {
            if (pattern.test(line) && !line.includes('sanitize') && !line.includes('DOMPurify')) {
              issues.push({
                id: generateIssueId(),
                type: 'xss_vulnerability',
                severity: 'HIGH',
                filePath,
                line: index + 1,
                column: 1,
                originalCode: line.trim(),
                message: 'Posible vulnerabilidad XSS detectada',
                suggestedFix: 'Usar DOMPurify o sanitización',
                confidence: 0.75,
              });
            }
          });
        });
        
        return issues;
      },
      fix: () => null, // Requiere revisión manual
    },
  ],
  
  MEDIUM: [
    // Uso de `as unknown`
    {
      name: 'as-any-cast',
      description: 'Detecta casts con `as unknown` y sugiere alternativas',
      severity: 'MEDIUM',
      autoFixable: true,
      requiresConfirmation: false,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const anyPatterns = [
          /as\s+any\s*[;),\]]?/,
          /<any>/,
        ];
        
        lines.forEach((line, index) => {
          anyPatterns.forEach(pattern => {
            if (pattern.test(line)) {
              issues.push({
                id: generateIssueId(),
                type: 'as_any_cast',
                severity: 'MEDIUM',
                filePath,
                line: index + 1,
                column: line.search(pattern) + 1,
                originalCode: line.trim(),
                message: 'Uso de `as unknown` detectado - pierde type safety',
                suggestedFix: '@ts-expect-error // TODO: Definir tipo correcto',
                confidence: 0.9,
              });
            }
          });
        });
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        const lines = content.split('\n');
        const lineIndex = issue.line - 1;
        
        const originalLine = lines[lineIndex];
        
        // Reemplazar `as unknown` con @ts-expect-error
        const fixedLine = originalLine.replace(
          /\s*as\s+any\s*([;,)\]])?/g,
          ' /* @ts-expect-error: tipo temporal */ $1'
        );
        
        lines[lineIndex] = fixedLine;
        return lines.join('\n');
      },
    },
    
    // Insecure random
    {
      name: 'insecure-random',
      description: 'Detecta uso de Math.random() para propósitos criptográficos',
      severity: 'MEDIUM',
      autoFixable: true,
      requiresConfirmation: false,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (/Math\.random\s*\(\)/.test(line)) {
            // Verificar si está en contexto criptográfico
            const contextCheck = /(token|secret|key|password|salt|nonce|iv)/i;
            const nearbyLines = lines.slice(Math.max(0, index - 3), index + 4).join(' ');
            
            if (contextCheck.test(nearbyLines)) {
              issues.push({
                id: generateIssueId(),
                type: 'insecure_random',
                severity: 'MEDIUM',
                filePath,
                line: index + 1,
                column: line.indexOf('Math.random') + 1,
                originalCode: line.trim(),
                message: 'Math.random() usado en contexto criptográfico',
                suggestedFix: 'crypto.getRandomValues() o crypto.randomBytes()',
                confidence: 0.85,
              });
            }
          }
        });
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        const lines = content.split('\n');
        const lineIndex = issue.line - 1;
        
        const originalLine = lines[lineIndex];
        const fixedLine = originalLine.replace(
          /Math\.random\s*\(\)/g,
          '(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32)'
        );
        
        lines[lineIndex] = fixedLine;
        return lines.join('\n');
      },
    },
    
    // Missing validation
    {
      name: 'missing-validation',
      description: 'Detecta entradas de usuario sin validación',
      severity: 'MEDIUM',
      autoFixable: false,
      requiresConfirmation: true,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const inputPatterns = [
          /req\.body\.(\w+)/g,
          /req\.query\.(\w+)/g,
          /req\.params\.(\w+)/g,
          /formData\.get\s*\(\s*['"`]([^'"`]+)/g,
        ];
        
        lines.forEach((line, index) => {
          inputPatterns.forEach(pattern => {
            let match;
            const regex = new RegExp(pattern.source, 'g');
            while ((match = regex.exec(line)) !== null) {
              // Verificar si hay validación cercana
              const nearbyLines = lines.slice(Math.max(0, index - 5), index + 6).join(' ');
              const hasValidation = /(zod|joi|yup|validate|sanitize|isValid|parse\()/.test(nearbyLines);
              
              if (!hasValidation) {
                issues.push({
                  id: generateIssueId(),
                  type: 'missing_validation',
                  severity: 'MEDIUM',
                  filePath,
                  line: index + 1,
                  column: match.index + 1,
                  originalCode: line.trim(),
                  message: `Entrada '${match[1]}' sin validación detectada`,
                  suggestedFix: 'Agregar validación con zod o schema',
                  confidence: 0.7,
                  metadata: {
                    inputName: match[1],
                    inputSource: pattern.source.includes('body') ? 'body' : 
                                  pattern.source.includes('query') ? 'query' : 'params',
                  },
                });
              }
            }
          });
        });
        
        return issues;
      },
      fix: () => null, // Requiere revisión manual para crear schema apropiado
    },
    
    // Unsafe regex
    {
      name: 'unsafe-regex',
      description: 'Detecta expresiones regulares potencialmente peligrosas',
      severity: 'MEDIUM',
      autoFixable: false,
      requiresConfirmation: true,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        // Patrones de regex potencialmente peligrosos (ReDoS)
        const dangerousPatterns = [
          /\([^)]*\+\+?\)/, // Cuantificadores anidados
          /\([^)]*\*\*?\)/,
          /\([^)]*\{\d+,\d*\}\)/,
        ];
        
        lines.forEach((line, index) => {
          const regexMatch = line.match(/new\s+RegExp\s*\(\s*['"`]([^'"`]+)/) || 
                            line.match(/\/([^/]+)\/[gimuy]*/);
          
          if (regexMatch) {
            const regexPattern = regexMatch[1];
            const isDangerous = dangerousPatterns.some(p => p.test(regexPattern));
            
            if (isDangerous) {
              issues.push({
                id: generateIssueId(),
                type: 'unsafe_regex',
                severity: 'MEDIUM',
                filePath,
                line: index + 1,
                column: line.indexOf(regexMatch[0]) + 1,
                originalCode: line.trim(),
                message: 'Regex potencialmente vulnerable a ReDoS',
                suggestedFix: 'Simplificar regex o usar validador alternativo',
                confidence: 0.75,
              });
            }
          }
        });
        
        return issues;
      },
      fix: () => null,
    },
  ],
  
  LOW: [
    // Imports no usados
    {
      name: 'unused-imports',
      description: 'Detecta y elimina imports no utilizados',
      severity: 'LOW',
      autoFixable: true,
      requiresConfirmation: false,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];

        // Match imports
        const importRegex = /import\s+(?:(\{[^}]+\})|(\w+)|\*\s+as\s+(\w+))\s+from\s+['"`]([^'"`]+)['"`];?/g;
        let match: RegExpExecArray | null;

        while ((match = importRegex.exec(content)) !== null) {
          const importedNames = (match[1] || match[2] || match[3] || '').trim();
          const importSource = match[4];
          
          // Extraer nombres individuales
          const names = importedNames
            .replace(/[{}]/g, '')
            .split(',')
            .map(n => n.trim())
            .filter(Boolean);
          
          names.forEach(name => {
            const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
            const usages = content.match(usageRegex) || [];

            // Si solo aparece en el import, no se usa
            if (usages.length <= 1 && match) {
              const lines = content.substring(0, match.index).split('\n');
              issues.push({
                id: generateIssueId(),
                type: 'unused_import',
                severity: 'LOW',
                filePath,
                line: lines.length,
                column: 1,
                originalCode: match[0],
                message: `Import no utilizado: '${name}'`,
                suggestedFix: `Eliminar import de '${name}'`,
                confidence: 0.95,
                metadata: {
                  importName: name,
                  importSource,
                },
              });
            }
          });
        }
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        if (!issue.metadata?.importName) return null;

        const importName = issue.metadata.importName as string;
        const importRegex = new RegExp(
          `import\\s+\\{([^}]*${importName}[^}]*)\\}\\s+from\\s+['"\`][^'"\`]+['"\`];?`,
          'g'
        );

        let fixed = content;
        const match = importRegex.exec(content);
        
        if (match) {
          const otherImports = match[1]
            .split(',')
            .map(s => s.trim())
            .filter(s => s && !s.includes(importName));
          
          if (otherImports.length === 0) {
            // Eliminar todo el import
            fixed = content.replace(match[0], '');
          } else {
            // Mantener otros imports
            const newImport = match[0].replace(match[1], ` { ${otherImports.join(', ')} } `);
            fixed = content.replace(match[0], newImport);
          }
        }
        
        return fixed;
      },
    },
    
    // Variables no usadas
    {
      name: 'unused-variables',
      description: 'Detecta variables declaradas pero no utilizadas',
      severity: 'LOW',
      autoFixable: true,
      requiresConfirmation: false,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        // Pattern para declaraciones
        const patterns = [
          /(?:const|let|var)\s+(\w+)\s*=/,
          /function\s+(\w+)\s*\(/,
          /(?:const|let|var)\s+\{([^}]+)\}\s*=/,
        ];
        
        lines.forEach((line, index) => {
          patterns.forEach(pattern => {
            const match = line.match(pattern);
            if (match) {
              const names = match[1].split(',').map(n => n.trim().split(':')[0].trim());
              
              names.forEach(name => {
                if (!name || name.startsWith('_')) return;
                
                const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
                const usages = content.match(usageRegex) || [];
                
                if (usages.length <= 1) {
                  issues.push({
                    id: generateIssueId(),
                    type: 'unused_variable',
                    severity: 'LOW',
                    filePath,
                    line: index + 1,
                    column: line.indexOf(name) + 1,
                    originalCode: line.trim(),
                    message: `Variable no utilizada: '${name}'`,
                    suggestedFix: `Prefijar con _ o eliminar: _${name}`,
                    confidence: 0.9,
                    metadata: {
                      variableName: name,
                    },
                  });
                }
              });
            }
          });
        });
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        if (!issue.metadata?.variableName) return null;
        
        const varName = issue.metadata.variableName;
        const lines = content.split('\n');
        const lineIndex = issue.line - 1;
        
        // Prefijar con underscore
        const originalLine = lines[lineIndex];
        lines[lineIndex] = originalLine.replace(
          new RegExp(`\\b${varName}\\b`),
          `_${varName}`
        );
        
        return lines.join('\n');
      },
    },
    
    // Weak crypto
    {
      name: 'weak-crypto',
      description: 'Detecta uso de algoritmos criptográficos débiles',
      severity: 'LOW',
      autoFixable: true,
      requiresConfirmation: false,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const weakAlgorithms = [
          { pattern: /md5/i, algo: 'MD5', replacement: 'SHA-256' },
          { pattern: /sha1/i, algo: 'SHA-1', replacement: 'SHA-256' },
          { pattern: /des\b/i, algo: 'DES', replacement: 'AES-256-GCM' },
          { pattern: /rc4/i, algo: 'RC4', replacement: 'AES-256-GCM' },
        ];
        
        lines.forEach((line, index) => {
          weakAlgorithms.forEach(({ pattern, algo, replacement }) => {
            if (pattern.test(line)) {
              issues.push({
                id: generateIssueId(),
                type: 'weak_crypto',
                severity: 'LOW',
                filePath,
                line: index + 1,
                column: line.search(pattern) + 1,
                originalCode: line.trim(),
                message: `Algoritmo criptográfico débil: ${algo}`,
                suggestedFix: `Usar ${replacement}`,
                confidence: 0.9,
                metadata: {
                  weakAlgorithm: algo,
                  replacement,
                },
              });
            }
          });
        });
        
        return issues;
      },
      fix: (issue: SecurityIssue, content: string): string | null => {
        if (!issue.metadata?.weakAlgorithm) return null;

        const weakAlgo = issue.metadata.weakAlgorithm as string;
        const replacement = issue.metadata.replacement as string;

        const regex = new RegExp(weakAlgo.replace(/-/g, '\\-?'), 'gi');
        return content.replace(regex, replacement);
      },
    },
    
    // Prototype pollution
    {
      name: 'prototype-pollution',
      description: 'Detecta operaciones que podrían causar prototype pollution',
      severity: 'LOW',
      autoFixable: true,
      requiresConfirmation: true,
      detect: (filePath: string, content: string): SecurityIssue[] => {
        const issues: SecurityIssue[] = [];
        const lines = content.split('\n');
        
        const pollutionPatterns = [
          /obj\s*\[\s*key\s*\]\s*=/,
          /target\s*\[\s*prop\s*\]\s*=/,
          /Object\.assign\s*\(\s*[^,]+,\s*req\./,
          /\.{3}obj\s*\}/,
        ];
        
        lines.forEach((line, index) => {
          pollutionPatterns.forEach(pattern => {
            if (pattern.test(line)) {
              issues.push({
                id: generateIssueId(),
                type: 'prototype_pollution',
                severity: 'LOW',
                filePath,
                line: index + 1,
                column: line.search(pattern) + 1,
                originalCode: line.trim(),
                message: 'Posible prototype pollution',
                suggestedFix: 'Validar key contra __proto__, constructor, prototype',
                confidence: 0.7,
              });
            }
          });
        });
        
        return issues;
      },
      fix: () => null, // Requiere contexto específico
    },
  ],
};

/** Obtiene todas las estrategias en orden de severidad */
export const getAllStrategies = (): FixStrategy[] => [
  ...FixStrategies.HIGH,
  ...FixStrategies.MEDIUM,
  ...FixStrategies.LOW,
];

/** Obtiene estrategias por severidad */
export const getStrategiesBySeverity = (severity: SeverityLevel): FixStrategy[] =>
  FixStrategies[severity];

/** Obtiene una estrategia por nombre */
export const getStrategyByName = (name: string): FixStrategy | undefined =>
  getAllStrategies().find(s => s.name === name);

/** Verifica si un tipo de issue es auto-fixeable */
export const isAutoFixable = (issueType: IssueType): boolean => {
  const strategies = getAllStrategies();
  const strategy = strategies.find(s => {
    // Mapeo de issue types a strategy names
    const typeMap: Record<string, string> = {
      console_sensitive_data: 'console-sensitive-data',
      as_any_cast: 'as-any-cast',
      unused_import: 'unused-imports',
      unused_variable: 'unused-variables',
      hardcoded_secret: 'hardcoded-secret',
      insecure_random: 'insecure-random',
      missing_validation: 'missing-validation',
      unsafe_regex: 'unsafe-regex',
      weak_crypto: 'weak-crypto',
      prototype_pollution: 'prototype-pollution',
      sql_injection_risk: 'sql-injection-risk',
      xss_vulnerability: 'xss-vulnerability',
    };
    return s.name === typeMap[issueType];
  });
  
  return strategy?.autoFixable ?? false;
};

export default FixStrategies;
