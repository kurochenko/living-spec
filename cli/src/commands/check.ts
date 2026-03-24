import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { getAllPrimitives, type Primitive } from '../lib/primitives.js'
import { requireQualifiedRef, qualifyId } from '../lib/validation.js'

interface DeadRef {
  ref: string
  referencedBy: string
  edge: string
}

interface DeprecatedRef {
  ref: string
  referencedBy: string
  edge: string
}

const walkGraph = (
  startRef: string,
  primitivesByQid: Map<string, Primitive>,
): { visited: Set<string>, dead: DeadRef[], deprecated: DeprecatedRef[] } => {
  const visited = new Set<string>()
  const dead: DeadRef[] = []
  const deprecated: DeprecatedRef[] = []
  const queue = [{ ref: startRef, referencedBy: '', edge: '' }]

  while (queue.length > 0) {
    const { ref, referencedBy, edge } = queue.shift()!
    if (visited.has(ref)) continue
    visited.add(ref)

    const primitive = primitivesByQid.get(ref)
    if (!primitive) {
      if (referencedBy) {
        dead.push({ ref, referencedBy, edge })
      }
      continue
    }

    if (primitive.frontmatter.deprecated && referencedBy) {
      deprecated.push({ ref, referencedBy, edge })
    }

    for (const link of primitive.frontmatter.links) {
      if (!visited.has(link.target)) {
        queue.push({ ref: link.target, referencedBy: ref, edge: link.edge })
      }
    }
  }

  return { visited, dead, deprecated }
}

export const checkCommand = new Command('check')
  .description('Check completeness of a primitive\'s dependency graph')
  .argument('<ref>', 'Qualified primitive id (prefix:slug or context.prefix:slug)')
  .action((refArg: string) => {
    const qualified = requireQualifiedRef(refArg, 'Ref')
    const projectRoot = requireProjectRoot()
    const all = getAllPrimitives(projectRoot)

    const primitivesByQid = new Map<string, Primitive>()
    for (const p of all) {
      const key = qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)
      primitivesByQid.set(key, p)
    }

    const candidates = all.filter(
      (p) => p.frontmatter.type === qualified.type && p.frontmatter.id === qualified.slug
    )

    let startRef: string
    if (qualified.context) {
      const match = candidates.find((p) => p.frontmatter.context === qualified.context)
      if (!match) {
        console.error(`Primitive '${refArg}' not found.`)
        process.exit(1)
      }
      startRef = qualifyId(qualified.type, qualified.slug, qualified.context)
    } else {
      if (candidates.length === 0) {
        console.error(`Primitive '${refArg}' not found.`)
        process.exit(1)
      }
      if (candidates.length > 1) {
        const contexts = candidates.map((p) => p.frontmatter.context).filter(Boolean).join(', ')
        console.error(`Ambiguous ref '${refArg}' — multiple matches exist: ${contexts}. Use full form context.prefix:slug.`)
        process.exit(1)
      }
      startRef = qualifyId(qualified.type, qualified.slug, candidates[0].frontmatter.context)
    }

    const { visited, dead, deprecated } = walkGraph(startRef, primitivesByQid)

    for (const d of dead) {
      console.log(`✗ missing: ${d.ref} (referenced by ${d.referencedBy} via ${d.edge})`)
    }

    for (const d of deprecated) {
      console.log(`⚠ deprecated: ${d.ref} (referenced by ${d.referencedBy} via ${d.edge})`)
    }

    if (dead.length === 0 && deprecated.length === 0) {
      console.log(`✓ ${refArg} is complete. ${visited.size} primitives in scope.`)
    } else if (dead.length === 0) {
      console.log(`\n✓ ${refArg} has no missing refs. ${visited.size} primitives in scope. ${deprecated.length} deprecated.`)
    } else {
      console.log(`\n✗ ${refArg} has ${dead.length} missing ref(s). ${visited.size} primitives visited.`)
    }

    if (dead.length > 0) {
      process.exit(1)
    }
  })
