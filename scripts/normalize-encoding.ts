/**
 * Normalize encoding issues (mojibake) in selected files.
 * Safe replacements for common Spanish diacritics corrupted sequences.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const REPLACEMENTS: Record<string, string> = {
  'campa��a': 'campaña',
  'Campa��a': 'Campaña',
  'programaci��n': 'programación',
  'Programaci��n': 'Programación',
  'validaci��n': 'validación',
  'Validaci��n': 'Validación',
  'integraci��n': 'integración',
  'Integraci��n': 'Integración',
  'observaci��n': 'observación',
  'Observaci��n': 'Observación',
  'confirmaci��n': 'confirmación',
  'Confirmaci��n': 'Confirmación',
  'gesti��n': 'gestión',
  'Gesti��n': 'Gestión',
  'm��vil': 'móvil',
  'd��a': 'día',
  'a��o': 'año',
  'n��mero': 'número',
  'N��mero': 'Número',
  'l��neas': 'líneas',
  'L��neas': 'Líneas',
  'exportaci��n': 'exportación',
  'acci��n': 'acción',
  'Acci��n': 'Acción',
  't��cnico': 'técnico',
  't��cnicas': 'técnicas',
  'm��tricas': 'métricas',
  'M��tricas': 'Métricas',
}

function normalizeContent(content: string): string {
  let out = content
  for (const [bad, good] of Object.entries(REPLACEMENTS)) {
    out = out.replace(new RegExp(bad, 'g'), good)
  }
  return out
}

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, files)
    else if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.md')) files.push(p)
  }
  return files
}

const targets = [
  'MODULO_CAMPANAS_TASKS_TIER0.md',
  'src/modules/campanas',
  'src/app/campanas',
]

let changed = 0
for (const target of targets) {
  const list = statSync(target, { throwIfNoEntry: false })?.isDirectory()
    ? walk(target)
    : existsSync(target) ? [target] : []
  for (const file of list) {
    const before = readFileSync(file, 'utf-8')
    const after = normalizeContent(before)
    if (after !== before) {
      writeFileSync(file, after, 'utf-8')
      changed++
    }
  }
}

console.log(`Normalized encoding in ${changed} file(s).`)

