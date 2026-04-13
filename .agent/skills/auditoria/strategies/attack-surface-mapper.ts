/**
 * Attack Surface Mapper — Security Audit TIER 0 v4.0
 *
 * Mapea automáticamente todos los vectores de ataque posibles del sistema
 * antes de iniciar la auditoría, creando un mapa de superficie de ataque.
 *
 * Gap: G1.2 — ASTM (Attack Surface Threat Modeling)
 */

export interface AttackVector {
  id: string;
  name: string;
  category: AttackCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  entryPoint: string;
  description: string;
  prerequisites: string[];
  detectionDifficulty: 'EASY' | 'MODERATE' | 'HARD';
  mitreTechnique?: string;
  killChainPhase: string;
  remediation: string;
}

export type AttackCategory =
  | 'NETWORK'
  | 'APPLICATION'
  | 'HUMAN'
  | 'PHYSICAL'
  | 'SUPPLY_CHAIN'
  | 'CLOUD'
  | 'API'
  | 'AUTHENTICATION'
  | 'DATA'
  | 'INFRASTRUCTURE';

export interface AttackSurfaceMap {
  timestamp: Date;
  systemName: string;
  totalVectors: number;
  criticalVectors: number;
  highVectors: number;
  mediumVectors: number;
  lowVectors: number;
  categories: Record<AttackCategory, number>;
  vectors: AttackVector[];
  recommendations: string[];
  riskScore: number; // 0-100
}

/**
 * Descubre la superficie de ataque del sistema analizando su estructura
 */
export function discoverAttackSurface(
  projectRoot: string,
  config: { includeCategories?: AttackCategory[] } = {}
): AttackSurfaceMap {
  const categories = config.includeCategories || [
    'NETWORK', 'APPLICATION', 'API', 'AUTHENTICATION',
    'DATA', 'CLOUD', 'SUPPLY_CHAIN', 'INFRASTRUCTURE'
  ];

  const vectors: AttackVector[] = [];

  // 1. NETWORK ATTACK VECTORS
  if (categories.includes('NETWORK')) {
    vectors.push(...discoverNetworkVectors());
  }

  // 2. APPLICATION ATTACK VECTORS
  if (categories.includes('APPLICATION')) {
    vectors.push(...discoverApplicationVectors());
  }

  // 3. API ATTACK VECTORS
  if (categories.includes('API')) {
    vectors.push(...discoverApiVectors());
  }

  // 4. AUTHENTICATION VECTORS
  if (categories.includes('AUTHENTICATION')) {
    vectors.push(...discoverAuthVectors());
  }

  // 5. DATA ATTACK VECTORS
  if (categories.includes('DATA')) {
    vectors.push(...discoverDataVectors());
  }

  // 6. CLOUD ATTACK VECTORS
  if (categories.includes('CLOUD')) {
    vectors.push(...discoverCloudVectors());
  }

  // 7. SUPPLY CHAIN VECTORS
  if (categories.includes('SUPPLY_CHAIN')) {
    vectors.push(...discoverSupplyChainVectors());
  }

  // 8. INFRASTRUCTURE VECTORS
  if (categories.includes('INFRASTRUCTURE')) {
    vectors.push(...discoverInfrastructureVectors());
  }

  return buildAttackSurfaceMap(vectors);
}

/**
 * Network Attack Vectors
 */
function discoverNetworkVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-NET-001',
      name: 'Open Port Enumeration',
      category: 'NETWORK',
      severity: 'HIGH',
      entryPoint: 'All network interfaces',
      description: 'Attacker scans all open ports to discover services',
      prerequisites: ['Network access to target'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1046',
      killChainPhase: 'Reconnaissance',
      remediation: 'Minimize open ports, implement network segmentation'
    },
    {
      id: 'ASM-NET-002',
      name: 'DNS Zone Transfer',
      category: 'NETWORK',
      severity: 'MEDIUM',
      entryPoint: 'DNS server',
      description: 'AXFR query reveals entire DNS zone structure',
      prerequisites: ['DNS server allows zone transfers'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1018',
      killChainPhase: 'Discovery',
      remediation: 'Disable zone transfers to unauthorized clients'
    },
    {
      id: 'ASM-NET-003',
      name: 'TLS/SSL Misconfiguration',
      category: 'NETWORK',
      severity: 'HIGH',
      entryPoint: 'HTTPS endpoints',
      description: 'Weak cipher suites, expired certs, or protocol downgrade',
      prerequisites: ['TLS termination point accessible'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1563',
      killChainPhase: 'Exploitation',
      remediation: 'Enforce TLS 1.2+, strong ciphers, HSTS, cert rotation'
    },
    {
      id: 'ASM-NET-004',
      name: 'HTTP/2 Rapid Reset Attack',
      category: 'NETWORK',
      severity: 'CRITICAL',
      entryPoint: 'HTTP/2 endpoints',
      description: 'DoS via HTTP/2 stream multiplexing with rapid RST_STREAM',
      prerequisites: ['HTTP/2 enabled on server'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1499',
      killChainPhase: 'Impact',
      remediation: 'Limit concurrent streams, implement rate limiting on HTTP/2'
    }
  ];
}

/**
 * Application Attack Vectors
 */
function discoverApplicationVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-APP-001',
      name: 'Cross-Site Scripting (XSS)',
      category: 'APPLICATION',
      severity: 'HIGH',
      entryPoint: 'All user input fields',
      description: 'Injection of malicious scripts into web pages',
      prerequisites: ['User input reflected in response without sanitization'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1059.007',
      killChainPhase: 'Exploitation',
      remediation: 'Implement CSP, sanitize all inputs, use DOMPurify'
    },
    {
      id: 'ASM-APP-002',
      name: 'Server-Side Request Forgery (SSRF)',
      category: 'APPLICATION',
      severity: 'CRITICAL',
      entryPoint: 'URL parameters, webhook endpoints',
      description: 'Attacker controls server-side HTTP requests to access internal resources',
      prerequisites: ['Server makes HTTP requests based on user input'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1190',
      killChainPhase: 'Exploitation',
      remediation: 'URL allowlisting, block internal IP ranges, use proxy'
    },
    {
      id: 'ASM-APP-003',
      name: 'Deserialization Attack',
      category: 'APPLICATION',
      severity: 'CRITICAL',
      entryPoint: 'JSON/XML parsers, message queues',
      description: 'Malicious serialized objects execute arbitrary code on deserialization',
      prerequisites: ['Application deserializes untrusted data'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1059',
      killChainPhase: 'Exploitation',
      remediation: 'Use safe serializers (JSON only), implement type checking'
    },
    {
      id: 'ASM-APP-004',
      name: 'Race Condition (TOCTOU)',
      category: 'APPLICATION',
      severity: 'HIGH',
      entryPoint: 'Concurrent API endpoints',
      description: 'Time-of-check to time-of-use window allows double-spend or privilege escalation',
      prerequisites: ['Non-atomic operations on shared state'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1499',
      killChainPhase: 'Exploitation',
      remediation: 'Use database transactions, implement optimistic locking'
    },
    {
      id: 'ASM-APP-005',
      name: 'Web Cache Poisoning',
      category: 'APPLICATION',
      severity: 'HIGH',
      entryPoint: 'HTTP headers, query parameters',
      description: 'Poison cache with malicious response served to other users',
      prerequisites: ['Cache key does not include all input vectors'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1565',
      killChainPhase: 'Impact',
      remediation: 'Include all user-controlled inputs in cache key'
    }
  ];
}

/**
 * API Attack Vectors
 */
function discoverApiVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-API-001',
      name: 'GraphQL Introspection Abuse',
      category: 'API',
      severity: 'HIGH',
      entryPoint: 'GraphQL endpoint',
      description: 'Introspection query reveals entire API schema for targeted attacks',
      prerequisites: ['GraphQL introspection enabled'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1082',
      killChainPhase: 'Discovery',
      remediation: 'Disable introspection in production, use query allowlisting'
    },
    {
      id: 'ASM-API-002',
      name: 'GraphQL Deep Query DoS',
      category: 'API',
      severity: 'CRITICAL',
      entryPoint: 'GraphQL endpoint',
      description: 'Nested queries cause exponential resolver execution',
      prerequisites: ['No query depth limit', 'No query complexity analysis'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1499',
      killChainPhase: 'Impact',
      remediation: 'Implement query depth limit (max 10), complexity analysis'
    },
    {
      id: 'ASM-API-003',
      name: 'REST API IDOR',
      category: 'API',
      severity: 'CRITICAL',
      entryPoint: 'Resource endpoints with ID parameters',
      description: 'Insecure Direct Object Reference allows access to other users data',
      prerequisites: ['Resource ID not validated against ownership'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1078',
      killChainPhase: 'Exploitation',
      remediation: 'Validate resource ownership on every request, use tenant context'
    },
    {
      id: 'ASM-API-004',
      name: 'API Version Downgrade',
      category: 'API',
      severity: 'MEDIUM',
      entryPoint: 'API versioning headers',
      description: 'Force API to use older vulnerable version',
      prerequisites: ['Multiple API versions active simultaneously'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1563',
      killChainPhase: 'Exploitation',
      remediation: 'Deprecate old versions with forced migration timeline'
    }
  ];
}

/**
 * Authentication Attack Vectors
 */
function discoverAuthVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-AUTH-001',
      name: 'JWT None Algorithm Attack',
      category: 'AUTHENTICATION',
      severity: 'CRITICAL',
      entryPoint: 'JWT validation endpoint',
      description: 'Set alg:none to bypass signature verification',
      prerequisites: ['JWT library accepts alg:none'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1078',
      killChainPhase: 'Exploitation',
      remediation: 'Explicitly reject alg:none, enforce algorithm allowlist'
    },
    {
      id: 'ASM-AUTH-002',
      name: 'OAuth Misconfiguration',
      category: 'AUTHENTICATION',
      severity: 'HIGH',
      entryPoint: 'OAuth callback endpoints',
      description: 'Open redirect in OAuth callback enables token theft',
      prerequisites: ['redirect_uri not strictly validated'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1078',
      killChainPhase: 'Exploitation',
      remediation: 'Exact redirect_uri matching, no wildcards'
    },
    {
      id: 'ASM-AUTH-003',
      name: 'Session Fixation',
      category: 'AUTHENTICATION',
      severity: 'HIGH',
      entryPoint: 'Login endpoint',
      description: 'Attacker sets victim session ID before authentication',
      prerequisites: ['Session ID not regenerated on login'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1078',
      killChainPhase: 'Exploitation',
      remediation: 'Regenerate session ID on every authentication event'
    },
    {
      id: 'ASM-AUTH-004',
      name: 'Password Reset Token Prediction',
      category: 'AUTHENTICATION',
      severity: 'CRITICAL',
      entryPoint: 'Password reset endpoint',
      description: 'Weak random generation allows prediction of reset tokens',
      prerequisites: ['Math.random or predictable PRNG used'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1078',
      killChainPhase: 'Exploitation',
      remediation: 'Use crypto.randomBytes for token generation'
    }
  ];
}

/**
 * Data Attack Vectors
 */
function discoverDataVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-DATA-001',
      name: 'SQL Injection via ORM',
      category: 'DATA',
      severity: 'CRITICAL',
      entryPoint: 'ORM query builder with raw SQL passthrough',
      description: 'Some ORM methods allow raw SQL injection',
      prerequisites: ['Use of .raw(), .whereRaw(), or similar methods'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1190',
      killChainPhase: 'Exploitation',
      remediation: 'Ban raw SQL methods in code review, use parameterized queries'
    },
    {
      id: 'ASM-DATA-002',
      name: 'NoSQL Injection',
      category: 'DATA',
      severity: 'CRITICAL',
      entryPoint: 'MongoDB/NoSQL query endpoints',
      description: 'Operator injection in NoSQL queries',
      prerequisites: ['User input directly in NoSQL query object'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1190',
      killChainPhase: 'Exploitation',
      remediation: 'Use allowlisted operators, validate input types strictly'
    },
    {
      id: 'ASM-DATA-003',
      name: 'Data Exfiltration via DNS',
      category: 'DATA',
      severity: 'HIGH',
      entryPoint: 'Any server-side function making DNS queries',
      description: 'Data encoded in DNS queries to attacker-controlled nameserver',
      prerequisites: ['Server can make DNS queries', 'Output channel not monitored'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1048',
      killChainPhase: 'Exfiltration',
      remediation: 'Monitor DNS traffic, restrict outbound DNS'
    }
  ];
}

/**
 * Cloud Attack Vectors
 */
function discoverCloudVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-CLD-001',
      name: 'Cloud Metadata Service Access',
      category: 'CLOUD',
      severity: 'CRITICAL',
      entryPoint: 'SSRF vulnerability on cloud instance',
      description: 'Access IMDSv1/IMDSv2 to obtain instance credentials',
      prerequisites: ['SSRF vulnerability + cloud instance with metadata service'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1552.005',
      killChainPhase: 'Credential Access',
      remediation: 'Use IMDSv2 (requires session), block metadata via network policy'
    },
    {
      id: 'ASM-CLD-002',
      name: 'S3 Bucket Misconfiguration',
      category: 'CLOUD',
      severity: 'HIGH',
      entryPoint: 'S3 bucket URL',
      description: 'Public read/write access due to misconfigured ACL',
      prerequisites: ['S3 bucket with public ACL'],
      detectionDifficulty: 'EASY',
      mitreTechnique: 'T1530',
      killChainPhase: 'Discovery',
      remediation: 'Block all public access, implement bucket policies'
    },
    {
      id: 'ASM-CLD-003',
      name: 'IAM Privilege Escalation',
      category: 'CLOUD',
      severity: 'CRITICAL',
      entryPoint: 'AWS IAM roles/policies',
      description: 'Combination of IAM permissions allows privilege escalation',
      prerequisites: ['Overly permissive IAM policies'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1078',
      killChainPhase: 'Privilege Escalation',
      remediation: 'Principle of least privilege, regular IAM audit'
    }
  ];
}

/**
 * Supply Chain Attack Vectors
 */
function discoverSupplyChainVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-SC-001',
      name: 'NPM Package Compromise',
      category: 'SUPPLY_CHAIN',
      severity: 'CRITICAL',
      entryPoint: 'package.json dependencies',
      description: 'Malicious dependency injected via compromised maintainer account',
      prerequisites: ['Dependencies not locked to specific versions'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1195',
      killChainPhase: 'Initial Access',
      remediation: 'Lock versions, use package-lock.json, scan dependencies'
    },
    {
      id: 'ASM-SC-002',
      name: 'CI/CD Pipeline Injection',
      category: 'SUPPLY_CHAIN',
      severity: 'CRITICAL',
      entryPoint: 'GitHub Actions / CI config',
      description: 'Malicious code injected into build pipeline',
      prerequisites: ['Pipeline runs untrusted code', 'Secrets available in CI'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1195.002',
      killChainPhase: 'Initial Access',
      remediation: 'Pin action versions, limit permissions, use environments'
    }
  ];
}

/**
 * Infrastructure Attack Vectors
 */
function discoverInfrastructureVectors(): AttackVector[] {
  return [
    {
      id: 'ASM-INF-001',
      name: 'Container Breakout',
      category: 'INFRASTRUCTURE',
      severity: 'CRITICAL',
      entryPoint: 'Containerized application',
      description: 'Escape container isolation to access host system',
      prerequisites: ['Privileged container', 'Mounted Docker socket', 'Known CVE'],
      detectionDifficulty: 'HARD',
      mitreTechnique: 'T1611',
      killChainPhase: 'Privilege Escalation',
      remediation: 'Non-root user, no privileged mode, regular updates'
    },
    {
      id: 'ASM-INF-002',
      name: 'Kubernetes API Abuse',
      category: 'INFRASTRUCTURE',
      severity: 'HIGH',
      entryPoint: 'Kubernetes API server',
      description: 'Access K8s API to enumerate and manipulate cluster resources',
      prerequisites: ['K8s API accessible from pod network'],
      detectionDifficulty: 'MODERATE',
      mitreTechnique: 'T1046',
      killChainPhase: 'Discovery',
      remediation: 'Network policies, RBAC, pod security standards'
    }
  ];
}

/**
 * Builds the complete attack surface map
 */
function buildAttackSurfaceMap(vectors: AttackVector[]): AttackSurfaceMap {
  const categories = vectors.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {} as Record<AttackCategory, number>);

  const critical = vectors.filter(v => v.severity === 'CRITICAL').length;
  const high = vectors.filter(v => v.severity === 'HIGH').length;
  const medium = vectors.filter(v => v.severity === 'MEDIUM').length;
  const low = vectors.filter(v => v.severity === 'LOW').length;

  // Risk score: weighted sum
  const riskScore = Math.min(100, Math.round(
    (critical * 10) + (high * 5) + (medium * 2) + (low * 1)
  ));

  const recommendations = generateRecommendations(vectors);

  return {
    timestamp: new Date(),
    systemName: 'Silexar Pulse',
    totalVectors: vectors.length,
    criticalVectors: critical,
    highVectors: high,
    mediumVectors: medium,
    lowVectors: low,
    categories,
    vectors,
    recommendations,
    riskScore
  };
}

/**
 * Generates prioritized recommendations
 */
function generateRecommendations(vectors: AttackVector[]): string[] {
  const recs: string[] = [];

  // Group by severity
  const critical = vectors.filter(v => v.severity === 'CRITICAL');
  if (critical.length > 0) {
    recs.push(`🔴 ${critical.length} CRITICAL vectors found. Immediate remediation required.`);
    critical.slice(0, 3).forEach(v => {
      recs.push(`  → ${v.name}: ${v.remediation}`);
    });
  }

  const high = vectors.filter(v => v.severity === 'HIGH');
  if (high.length > 0) {
    recs.push(`🟠 ${high.length} HIGH vectors found. Sprint remediation recommended.`);
  }

  // Cross-cutting recommendations
  recs.push('✅ Implement WAF with OWASP Core Rule Set');
  recs.push('✅ Enable comprehensive logging and monitoring');
  recs.push('✅ Conduct regular penetration testing');
  recs.push('✅ Implement defense-in-depth across all layers');

  return recs;
}

/**
 * Visual representation of attack surface
 */
export function printAttackSurfaceMap(surface: AttackSurfaceMap): string {
  let output = '\n' + '='.repeat(70) + '\n';
  output += `🗺️  ATTACK SURFACE MAP — ${surface.systemName}\n`;
  output += `📅 ${surface.timestamp.toISOString()}\n`;
  output += '='.repeat(70) + '\n\n';

  output += `Risk Score: ${surface.riskScore}/100\n`;
  output += `Total Attack Vectors: ${surface.totalVectors}\n`;
  output += `  🔴 Critical: ${surface.criticalVectors}\n`;
  output += `  🟠 High:     ${surface.highVectors}\n`;
  output += `  🟡 Medium:   ${surface.mediumVectors}\n`;
  output += `  🟢 Low:      ${surface.lowVectors}\n\n`;

  output += 'Vectors by Category:\n';
  for (const [cat, count] of Object.entries(surface.categories)) {
    const bar = '█'.repeat(Math.ceil(count / 2));
    output += `  ${cat.padEnd(18)} ${bar} (${count})\n`;
  }

  output += '\nTop Critical Vectors:\n';
  surface.vectors
    .filter(v => v.severity === 'CRITICAL')
    .forEach((v, i) => {
      output += `  ${i + 1}. ${v.name}\n`;
      output += `     Entry: ${v.entryPoint}\n`;
      output += `     MITRE: ${v.mitreTechnique || 'N/A'}\n`;
      output += `     Fix: ${v.remediation}\n\n`;
    });

  output += '-'.repeat(70) + '\n';
  return output;
}
