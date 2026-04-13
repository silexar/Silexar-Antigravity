/**
 * Batch Strategy - División de trabajo para sistemas grandes
 * 
 * Este módulo implementa estrategias de división de trabajo cuando
 * el sistema es demasiado grande para analizarlo de una vez.
 */

export interface BatchConfig {
  thresholds: {
    maxFilesPerBatch: number;
    maxLinesPerBatch: number;
    maxModulesPerAgent: number;
  };
  strategy: 'by-module' | 'by-directory' | 'by-file-size' | 'incremental';
  priorityOrder: string[];
  cache: {
    enabled: boolean;
    ttl: string;
    store: string;
  };
}

export interface Batch {
  id: string;
  name: string;
  files: string[];
  estimatedLines: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedAgent?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  findings?: any[];
  startTime?: Date;
  endTime?: Date;
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  thresholds: {
    maxFilesPerBatch: 500,
    maxLinesPerBatch: 50000,
    maxModulesPerAgent: 3,
  },
  strategy: 'by-module',
  priorityOrder: [
    'src/lib/security/**',
    'src/lib/auth/**',
    'src/lib/ai/**',
    'src/lib/cortex/**',
    'src/app/api/**',
    'src/modules/**',
    'src/app/**',
    'src/components/**',
  ],
  cache: {
    enabled: true,
    ttl: '24h',
    store: '.security-audit-cache/',
  },
};

/**
 * Determina si el sistema necesita división en batches
 */
export function needsBatching(
  totalFiles: number,
  totalLines: number,
  config: BatchConfig = DEFAULT_BATCH_CONFIG
): boolean {
  return (
    totalFiles > config.thresholds.maxFilesPerBatch ||
    totalLines > config.thresholds.maxLinesPerBatch
  );
}

/**
 * Divide archivos en batches por módulo DDD
 */
export function createBatchesByModule(
  files: string[],
  config: BatchConfig = DEFAULT_BATCH_CONFIG
): Batch[] {
  const moduleMap: Record<string, string[]> = {};
  
  // Agrupar por módulo
  for (const file of files) {
    const moduleMatch = file.match(/src\/modules\/([^/]+)/);
    if (moduleMatch) {
      const module = moduleMatch[1];
      moduleMap[module] = moduleMap[module] || [];
      moduleMap[module].push(file);
    } else {
      // Archivos fuera de modules
      moduleMap['_core'] = moduleMap['_core'] || [];
      moduleMap['_core'].push(file);
    }
  }
  
  // Crear batches
  const batches: Batch[] = [];
  let batchId = 1;
  
  for (const [module, moduleFiles] of Object.entries(moduleMap)) {
    // Si un módulo tiene muchos archivos, dividirlo
    if (moduleFiles.length > config.thresholds.maxFilesPerBatch) {
      const chunks = chunkArray(moduleFiles, config.thresholds.maxFilesPerBatch);
      for (let i = 0; i < chunks.length; i++) {
        batches.push({
          id: `batch-${batchId++}`,
          name: `${module}-part-${i + 1}`,
          files: chunks[i],
          estimatedLines: estimateLines(chunks[i]),
          priority: getPriorityForModule(module, config),
          status: 'PENDING',
        });
      }
    } else {
      batches.push({
        id: `batch-${batchId++}`,
        name: module,
        files: moduleFiles,
        estimatedLines: estimateLines(moduleFiles),
        priority: getPriorityForModule(module, config),
        status: 'PENDING',
      });
    }
  }
  
  // Ordenar por prioridad
  return sortBatchesByPriority(batches, config);
}

/**
 * Divide archivos en batches por directorio
 */
export function createBatchesByDirectory(
  files: string[],
  config: BatchConfig = DEFAULT_BATCH_CONFIG
): Batch[] {
  const dirMap: Record<string, string[]> = {};
  
  // Agrupar por directorio
  for (const file of files) {
    const dir = file.split('/').slice(0, 3).join('/');
    dirMap[dir] = dirMap[dir] || [];
    dirMap[dir].push(file);
  }
  
  const batches: Batch[] = [];
  let batchId = 1;
  
  for (const [dir, dirFiles] of Object.entries(dirMap)) {
    batches.push({
      id: `batch-${batchId++}`,
      name: dir.replace(/\//g, '-'),
      files: dirFiles,
      estimatedLines: estimateLines(dirFiles),
      priority: getPriorityForPath(dir, config),
      status: 'PENDING',
    });
  }
  
  return sortBatchesByPriority(batches, config);
}

/**
 * Crea batches incrementales (solo archivos modificados)
 */
export function createIncrementalBatches(
  allFiles: string[],
  lastAuditTime: Date,
  config: BatchConfig = DEFAULT_BATCH_CONFIG
): Batch[] {
  // Filtrar archivos modificados después de lastAuditTime
  // Esto requeriría información del filesystem (mtime)
  // Aquí es un placeholder
  
  const modifiedFiles = allFiles; // TODO: Filtrar por mtime
  
  return createBatchesByModule(modifiedFiles, config);
}

/**
 * Divide un array en chunks
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Estima líneas de código
 */
function estimateLines(files: string[]): number {
  // Estimación aproximada: 200 líneas por archivo .ts/.tsx
  return files.length * 200;
}

/**
 * Obtiene prioridad para un módulo
 */
function getPriorityForModule(
  module: string,
  config: BatchConfig
): Batch['priority'] {
  const criticalModules = ['security', 'auth', 'ai', 'cortex'];
  const highModules = ['api', 'modules'];
  
  if (criticalModules.includes(module)) return 'CRITICAL';
  if (highModules.some(m => module.includes(m))) return 'HIGH';
  return 'MEDIUM';
}

/**
 * Obtiene prioridad para una ruta
 */
function getPriorityForPath(
  path: string,
  config: BatchConfig
): Batch['priority'] {
  if (path.includes('security')) return 'CRITICAL';
  if (path.includes('auth')) return 'CRITICAL';
  if (path.includes('api')) return 'HIGH';
  return 'MEDIUM';
}

/**
 * Ordena batches por prioridad
 */
function sortBatchesByPriority(
  batches: Batch[],
  config: BatchConfig
): Batch[] {
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  
  return batches.sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Asigna batches a agentes
 */
export function assignBatchesToAgents(
  batches: Batch[],
  agentTypes: string[]
): Map<string, Batch[]> {
  const assignments = new Map<string, Batch[]>();
  
  for (const agentType of agentTypes) {
    assignments.set(agentType, []);
  }
  
  // Asignar batches según tipo de agente y contenido
  for (const batch of batches) {
    let assigned = false;
    
    // Batches de security/auth van al agente de secrets y static
    if (batch.name.includes('security') || batch.name.includes('auth')) {
      assignments.get('ASE')?.push(batch);
      assignments.get('AS')?.push(batch);
      assigned = true;
    }
    
    // Batches de AI van al agente static (capas AI)
    if (batch.name.includes('ai') || batch.name.includes('cortex')) {
      assignments.get('AS')?.push(batch);
      assigned = true;
    }
    
    // Batches de API van a todos los agentes
    if (batch.name.includes('api')) {
      assignments.get('AS')?.push(batch);
      assignments.get('ASAST')?.push(batch);
      assigned = true;
    }
    
    // Resto se distribuye equitativamente
    if (!assigned) {
      const agentIndex = batches.indexOf(batch) % agentTypes.length;
      assignments.get(agentTypes[agentIndex])?.push(batch);
    }
  }
  
  return assignments;
}

/**
 * Calcula métricas de batches
 */
export function calculateBatchMetrics(batches: Batch[]) {
  const totalFiles = batches.reduce((sum, b) => sum + b.files.length, 0);
  const totalLines = batches.reduce((sum, b) => sum + b.estimatedLines, 0);
  const avgFilesPerBatch = totalFiles / batches.length;
  const byPriority = {
    CRITICAL: batches.filter(b => b.priority === 'CRITICAL').length,
    HIGH: batches.filter(b => b.priority === 'HIGH').length,
    MEDIUM: batches.filter(b => b.priority === 'MEDIUM').length,
    LOW: batches.filter(b => b.priority === 'LOW').length,
  };
  
  return {
    totalBatches: batches.length,
    totalFiles,
    totalLines,
    avgFilesPerBatch,
    byPriority,
  };
}
