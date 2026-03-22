import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { getAllPrimitives, findAllPrimitivesById, type Primitive } from '../lib/primitives.js'
import { qualifyId } from '../lib/validation.js'
import { type PrimitiveType } from '../lib/constants.js'

const formatLinks = (links: Primitive['frontmatter']['links']): string => {
  if (!links || links.length === 0) return '  (none)'
  return links.map((l) => `  ${l.edge} → ${l.target}`).join('\n')
}

const printPrimitive = (p: Primitive): void => {
  const fm = p.frontmatter
  const qid = qualifyId(fm.type, fm.id)
  console.log(`${fm.type}: ${fm.name} [${qid}]`)
  if (fm.context) console.log(`context: ${fm.context}`)
  if (fm.deprecated) console.log('⚠ deprecated')
  if (fm.tags.length > 0) console.log(`tags: ${fm.tags.join(', ')}`)
  console.log(`links:\n${formatLinks(fm.links)}`)
  if (p.body) console.log(`\n${p.body}`)
}

const collectRelated = (startType: PrimitiveType, startSlug: string, primitives: Primitive[]): Set<string> => {
  const visited = new Set<string>()
  const startKey = qualifyId(startType, startSlug)
  const queue = [startKey]

  const keyOf = (p: Primitive) => qualifyId(p.frontmatter.type, p.frontmatter.id)

  while (queue.length > 0) {
    const key = queue.shift()!
    if (visited.has(key)) continue
    visited.add(key)

    const prim = primitives.find((p) => keyOf(p) === key)
    if (!prim) continue

    // outgoing links — targets are already qualified in frontmatter
    for (const link of prim.frontmatter.links) {
      if (!visited.has(link.target)) queue.push(link.target)
    }

    // incoming links (anything that points to this key)
    for (const other of primitives) {
      const otherKey = keyOf(other)
      if (visited.has(otherKey)) continue
      const pointsHere = other.frontmatter.links.some((l) => l.target === key)
      if (pointsHere) queue.push(otherKey)
    }
  }

  return visited
}

export const showCommand = new Command('show')
  .description('Display a primitive and optionally its related subgraph')
  .argument('<id>', 'Primitive id (prefix:slug or just slug)')
  .option('-r, --related', 'Show the full related subgraph')
  .action((idArg: string, opts: { related?: boolean }) => {
    const projectRoot = requireProjectRoot()
    const matches = findAllPrimitivesById(projectRoot, idArg)

    if (matches.length === 0) {
      console.error(`Primitive '${idArg}' not found.`)
      process.exit(1)
    }

    if (matches.length > 1) {
      console.error(`Ambiguous id '${idArg}'. Did you mean one of:`)
      for (const m of matches) {
        console.error(`  ${qualifyId(m.frontmatter.type, m.frontmatter.id)}`)
      }
      process.exit(1)
    }

    const target = matches[0]

    if (!opts.related) {
      printPrimitive(target)
      return
    }

    // subgraph mode
    const all = getAllPrimitives(projectRoot)
    const relatedKeys = collectRelated(target.frontmatter.type, target.frontmatter.id, all)
    const relatedPrimitives = all.filter((p) => relatedKeys.has(qualifyId(p.frontmatter.type, p.frontmatter.id)))

    for (const p of relatedPrimitives) {
      printPrimitive(p)
      console.log('---')
    }
  })
