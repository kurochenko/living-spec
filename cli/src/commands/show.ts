import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { getAllPrimitives, findPrimitiveById, type Primitive } from '../lib/primitives.js'
import { qualifyId, parseQualifiedRef } from '../lib/validation.js'
import { type PrimitiveType } from '../lib/constants.js'

const formatLinks = (links: Primitive['frontmatter']['links']): string => {
  if (!links || links.length === 0) return '  (none)'
  return links.map((l) => `  ${l.edge} → ${l.target}`).join('\n')
}

const printPrimitive = (p: Primitive): void => {
  const fm = p.frontmatter
  const qid = qualifyId(fm.type, fm.id, fm.context)
  console.log(`${fm.type}: ${fm.name} [${qid}]`)
  if (fm.context) console.log(`context: ${fm.context}`)
  if (fm.deprecated) console.log('⚠ deprecated')
  if (fm.tags.length > 0) console.log(`tags: ${fm.tags.join(', ')}`)
  console.log(`links:\n${formatLinks(fm.links)}`)
  if (p.body) console.log(`\n${p.body}`)
}

const collectRelated = (startType: PrimitiveType, startSlug: string, startContext: string | undefined, primitives: Primitive[]): Set<string> => {
  const visited = new Set<string>()
  const startKey = qualifyId(startType, startSlug, startContext)
  const queue = [startKey]

  const keyOf = (p: Primitive) => qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)

  const primitivesByKey = new Map(primitives.map((p) => [keyOf(p), p]))

  const resolveTarget = (targetRef: string): string | null => {
    const parsed = parseQualifiedRef(targetRef)
    if (!parsed) return null
    if (parsed.context) {
      const key = qualifyId(parsed.type, parsed.slug, parsed.context)
      return primitivesByKey.has(key) ? key : null
    }
    const matches = primitives.filter((p) => p.frontmatter.type === parsed.type && p.frontmatter.id === parsed.slug)
    if (matches.length === 1) return keyOf(matches[0])
    if (matches.length === 0) return null
    return null
  }

  while (queue.length > 0) {
    const key = queue.shift()!
    if (visited.has(key)) continue
    visited.add(key)

    const prim = primitivesByKey.get(key)
    if (!prim) continue

    for (const link of prim.frontmatter.links) {
      const resolved = resolveTarget(link.target)
      if (resolved && !visited.has(resolved)) queue.push(resolved)
    }

    for (const other of primitives) {
      const otherKey = keyOf(other)
      if (visited.has(otherKey)) continue
      const pointsHere = other.frontmatter.links.some((l) => {
        const resolved = resolveTarget(l.target)
        return resolved === key
      })
      if (pointsHere) queue.push(otherKey)
    }
  }

  return visited
}

export const showCommand = new Command('show')
  .description('Display a primitive and optionally its related subgraph')
  .argument('<ref>', 'Qualified primitive id (prefix:slug)')
  .option('-r, --related', 'Show the full related subgraph')
  .action((refArg: string, opts: { related?: boolean }) => {
    const qualified = parseQualifiedRef(refArg)
    if (!qualified) {
      console.error("Use qualified form prefix:slug. E.g., term:my-term.")
      process.exit(1)
    }

    const projectRoot = requireProjectRoot()
    const target = findPrimitiveById(projectRoot, refArg)

    if (!target) {
      console.error(`Primitive '${refArg}' not found.`)
      process.exit(1)
    }

    if (!opts.related) {
      printPrimitive(target)
      return
    }

    // subgraph mode
    const all = getAllPrimitives(projectRoot)
    const relatedKeys = collectRelated(qualified.type, qualified.slug, qualified.context, all)
    const relatedPrimitives = all.filter((p) => relatedKeys.has(qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)))

    for (const p of relatedPrimitives) {
      printPrimitive(p)
      console.log('---')
    }
  })
