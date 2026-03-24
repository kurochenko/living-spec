import { Command } from 'commander'
import { requireProjectRoot } from '../lib/require-with-migration.js'
import { findPrimitiveById, findInboundReferences, removePrimitive } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { requireQualifiedRef, qualifyId } from '../lib/validation.js'

export const rmCommand = new Command('rm')
  .description('Delete a primitive file and rebuild INDEX.md')
  .argument('<ref>', 'Qualified primitive id (prefix:slug)')
  .option('-f, --force', 'Skip dangling reference check')
  .action((refArg: string, opts: { force?: boolean }) => {
    requireQualifiedRef(refArg, 'Ref')
    const projectRoot = requireProjectRoot()

    const target = findPrimitiveById(projectRoot, refArg)
    if (!target) {
      console.error(`Primitive '${refArg}' not found.`)
      process.exit(1)
    }

    if (!opts.force) {
      const refs = findInboundReferences(projectRoot, refArg)
      if (refs.length > 0) {
        const refList = refs
          .map((p) => `  ${qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)}`)
          .join('\n')
        console.error(`Cannot remove ${refArg} — referenced by:\n${refList}\nUse --force to delete anyway.`)
        process.exit(1)
      }
    }

    removePrimitive(target)
    rebuildIndex(projectRoot)

    console.log(`Removed ${refArg}`)
  })
