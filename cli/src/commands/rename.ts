import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { getAllPrimitives, findPrimitiveById, renamePrimitive, rewriteLinkTargets } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { requireQualifiedRef, validateId, qualifyId } from '../lib/validation.js'

export const renameCommand = new Command('rename')
  .description('Rename a primitive (change its slug, update all inbound refs)')
  .argument('<old-ref>', 'Qualified ref of the primitive to rename (prefix:slug or context.prefix:slug)')
  .argument('<new-slug>', 'New kebab-case slug')
  .action((oldRefArg: string, newSlugArg: string) => {
    const oldRef = requireQualifiedRef(oldRefArg, 'Old ref')
    const newSlug = validateId(newSlugArg)
    const projectRoot = requireProjectRoot()

    const primitive = findPrimitiveById(projectRoot, oldRefArg)
    if (!primitive) {
      console.error(`Primitive '${oldRefArg}' not found.`)
      process.exit(1)
    }

    const context = primitive.frontmatter.context
    const newQid = qualifyId(oldRef.type, newSlug, context)

    const existing = getAllPrimitives(projectRoot)
    const duplicate = existing.find(
      (p) => p.frontmatter.type === oldRef.type && p.frontmatter.id === newSlug && p.frontmatter.context === context
    )
    if (duplicate) {
      console.error(`Primitive '${newQid}' already exists.`)
      process.exit(1)
    }

    renamePrimitive(primitive, newSlug)
    const rewritten = rewriteLinkTargets(projectRoot, oldRefArg, newQid)
    rebuildIndex(projectRoot)

    console.log(`Renamed ${oldRefArg} → ${newQid}. Updated ${rewritten} inbound reference(s).`)
  })
