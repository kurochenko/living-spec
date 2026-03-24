import { Command } from 'commander'
import { requireProjectRoot } from '../lib/require-with-migration.js'
import { findPrimitiveById, getAllPrimitives, type Primitive } from '../lib/primitives.js'
import { requireQualifiedRef, qualifyId } from '../lib/validation.js'
import {
  createPrimitiveCatalog,
  resolvePrimitiveRef,
  validateProseLinkConsistency,
} from '../lib/prose-links.js'

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
  allPrimitives: Primitive[],
): { visited: Set<string>, dead: DeadRef[], deprecated: DeprecatedRef[] } => {
  const visited = new Set<string>()
  const dead: DeadRef[] = []
  const deprecated: DeprecatedRef[] = []
  const queue = [{ ref: startRef, referencedBy: '', edge: '' }]
  const catalog = createPrimitiveCatalog(allPrimitives)

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
      const resolution = resolvePrimitiveRef(link.target, catalog)
      const nextRef = resolution.status === 'resolved' ? resolution.qid : link.target

      if (!visited.has(nextRef)) {
        queue.push({ ref: nextRef, referencedBy: ref, edge: link.edge })
      }
    }
  }

  return { visited, dead, deprecated }
}

export const checkCommand = new Command('check')
  .description('Check completeness of a primitive\'s dependency graph')
  .argument('<ref>', 'Qualified primitive id (prefix:slug or context.prefix:slug)')
  .action((refArg: string) => {
    requireQualifiedRef(refArg, 'Ref')
    const projectRoot = requireProjectRoot()
    const all = getAllPrimitives(projectRoot)
    const catalog = createPrimitiveCatalog(all)
    const target = findPrimitiveById(projectRoot, refArg)

    if (!target) {
      console.error(`Primitive '${refArg}' not found.`)
      process.exit(1)
    }

    const primitivesByQid = new Map<string, Primitive>()
    for (const p of all) {
      const key = qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)
      primitivesByQid.set(key, p)
    }
    const startRef = qualifyId(target.frontmatter.type, target.frontmatter.id, target.frontmatter.context)

    const { visited, dead, deprecated } = walkGraph(startRef, primitivesByQid, all)

    const visitedPrimitives = [...visited]
      .map((qid) => primitivesByQid.get(qid))
      .filter((primitive): primitive is Primitive => primitive !== undefined)

    const proseValidation = validateProseLinkConsistency(visitedPrimitives, catalog)

    for (const d of dead) {
      console.log(`✗ missing: ${d.ref} (referenced by ${d.referencedBy} via ${d.edge})`)
    }

    for (const d of deprecated) {
      console.log(`⚠ deprecated: ${d.ref} (referenced by ${d.referencedBy} via ${d.edge})`)
    }

    for (const issue of proseValidation.errors) {
      if (issue.type === 'invalid-wrapped-ref') {
        console.log(`✗ invalid ref: \`[[${issue.ref}]]\` in ${issue.primitive} (no such primitive)`)
      } else if (issue.type === 'ambiguous-wrapped-ref') {
        console.log(`✗ ambiguous ref: \`[[${issue.ref}]]\` in ${issue.primitive} (use context-qualified form)`)
      } else if (issue.type === 'invalid-frontmatter-ref') {
        const suffix = issue.resolution === 'ambiguous'
          ? 'use context-qualified form'
          : 'no such primitive'
        console.log(`✗ invalid link target: '${issue.ref}' in ${issue.primitive} (${suffix})`)
      } else if (issue.type === 'missing-in-prose') {
        console.log(`✗ linked but not wrapped: '${issue.ref}' in ${issue.primitive} (add \`[[${issue.ref}]]\` to prose)`)
      } else if (issue.type === 'missing-in-frontmatter') {
        console.log(`✗ not linked: \`[[${issue.ref}]]\` in ${issue.primitive} (add to frontmatter links)`)
      }
    }

    for (const issue of proseValidation.warnings) {
      if (issue.type === 'bare-ref' && issue.line) {
        console.log(`⚠ probable bare ref: ${issue.ref} in ${issue.filePath}:${issue.line}`)
      }
    }

    const warningCount = deprecated.length + proseValidation.warnings.length

    if (dead.length === 0 && proseValidation.errors.length === 0 && warningCount === 0) {
      console.log(`✓ ${refArg} is complete. ${visited.size} primitives in scope.`)
    } else if (dead.length === 0 && proseValidation.errors.length === 0) {
      const suffix = warningCount > 0 ? ` ${warningCount} warning(s).` : ''
      console.log(`\n✓ ${refArg} has no blocking issues. ${visited.size} primitives in scope.${suffix}`)
    } else {
      console.log(`\n✗ ${refArg} has ${dead.length} missing ref(s). ${proseValidation.errors.length} prose/frontmatter error(s). ${visited.size} primitives visited.`)
    }

    if (dead.length > 0 || proseValidation.errors.length > 0) {
      process.exit(1)
    }
  })
