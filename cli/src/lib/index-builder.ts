import { writeFileSync } from 'fs'
import { join } from 'path'
import { PRIMITIVE_TYPES } from './constants.js'
import { getAllPrimitives, type Primitive } from './primitives.js'
import { specDir } from './spec-root.js'
import { qualifyId } from './validation.js'

const SECTION_LABELS: Record<string, string> = {
  term: 'Terms',
  invariant: 'Invariants',
  rule: 'Rules',
  event: 'Events',
  flow: 'Flows',
  contract: 'Contracts',
  decision: 'Decisions',
  feature: 'Features',
}

const formatPrimitive = (p: Primitive): string => {
  const { type, id, context, links } = p.frontmatter
  const qid = qualifyId(type, id, context)
  const ctx = context ? ` (${context})` : ''

  if (!links || links.length === 0) {
    return `- ${qid}${ctx} → no links`
  }

  const grouped = new Map<string, string[]>()
  for (const link of links) {
    const targets = grouped.get(link.edge) ?? []
    targets.push(link.target)
    grouped.set(link.edge, targets)
  }

  const parts: string[] = []
  for (const [edge, targets] of grouped) {
    parts.push(`${edge}: ${targets.join(', ')}`)
  }

  return `- ${qid}${ctx} → ${parts.join('; ')}`
}

export const rebuildIndex = (projectRoot: string): void => {
  const allPrimitives = getAllPrimitives(projectRoot)
  const byType = new Map<string, Primitive[]>()

  for (const p of allPrimitives) {
    const list = byType.get(p.frontmatter.type) ?? []
    list.push(p)
    byType.set(p.frontmatter.type, list)
  }

  const lines: string[] = [
    '# Spec Index',
    '',
    'Auto-maintained graph topology. One line per primitive, showing all outgoing links.',
    'Rebuilt automatically by the lore CLI on every write command.',
    '',
    '<!-- Format: - prefix:id (context) → edge: prefix:target, prefix:target; edge: prefix:target -->',
  ]

  for (const type of PRIMITIVE_TYPES) {
    const label = SECTION_LABELS[type]
    lines.push('', `## ${label}`, '')

    const primitives = byType.get(type) ?? []
    if (primitives.length === 0) {
      lines.push(`<!-- No ${label.toLowerCase()} defined yet. -->`)
    } else {
      for (const p of primitives) {
        lines.push(formatPrimitive(p))
      }
    }
  }

  lines.push('')
  writeFileSync(join(specDir(projectRoot), 'INDEX.md'), lines.join('\n'))
}
