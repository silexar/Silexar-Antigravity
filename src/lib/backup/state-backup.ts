/**
 * State backup utilities for campaign/entity data.
 * TODO: Implement persistent storage when the persistence layer is complete.
 * Currently uses an in-memory store as a development stub.
 */

interface BackupEntry {
  version: string
  entityId: string
  state: unknown
  createdAt: Date
}

// In-memory store keyed by entityId, then version
const store = new Map<string, Map<string, BackupEntry>>()

/**
 * Create a versioned backup of an entity's state.
 * Returns the generated version string.
 */
export function createBackup(entityId: string, state: unknown): { version: string } {
  const version = `v${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const entry: BackupEntry = { version, entityId, state, createdAt: new Date() }

  if (!store.has(entityId)) {
    store.set(entityId, new Map())
  }
  store.get(entityId)!.set(version, entry)

  return { version }
}

/**
 * List all backup versions for an entity, newest first.
 */
export function listBackups(entityId: string): Array<{ version: string; createdAt: Date }> {
  const versions = store.get(entityId)
  if (!versions) return []

  return Array.from(versions.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(({ version, createdAt }) => ({ version, createdAt }))
}

/**
 * Load a specific backup version for an entity.
 * Returns null if not found.
 */
export function loadBackup(
  entityId: string,
  version: string
): { version: string; state: unknown } | null {
  const entry = store.get(entityId)?.get(version)
  if (!entry) return null
  return { version: entry.version, state: entry.state }
}
