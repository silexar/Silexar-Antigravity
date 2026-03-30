import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { createHash } from 'crypto'
import { join } from 'path'

const BASE = '.audit/campanas'

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}

function hash(data: string) {
  return createHash('sha256').update(data).digest('hex')
}

export function appendAudit(campaniaId: string, event: Record<string, unknown>) {
  const dir = join(process.cwd(), BASE)
  ensureDir(dir)
  const file = join(dir, `${campaniaId}.log`)
  let chain: Array<Record<string, unknown>> = []
  if (existsSync(file)) chain = JSON.parse(readFileSync(file, 'utf-8'))
  const prevHash = chain.length ? chain[chain.length - 1].hash : 'GENESIS'
  const payload = { ...event, ts: Date.now(), prevHash }
  const entry = { ...payload, hash: hash(JSON.stringify(payload)) }
  chain.push(entry)
  writeFileSync(file, JSON.stringify(chain, null, 2))
  return entry
}

export function readAudit(campaniaId: string) {
  const file = join(process.cwd(), BASE, `${campaniaId}.log`)
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, 'utf-8'))
}

export function verifyAudit(campaniaId: string) {
  const chain = readAudit(campaniaId)
  for (let i = 0; i < chain.length; i++) {
    const { hash: currentHash, ts, prevHash, ...rest } = chain[i]
    const recompute = hash(JSON.stringify({ ...rest, ts, prevHash }))
    if (recompute !== currentHash) return false
    if (i > 0 && chain[i - 1].hash !== prevHash) return false
  }
  return true
}

