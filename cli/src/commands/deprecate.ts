import { Command } from 'commander'
import { requireProjectRoot } from '../lib/require-with-migration.js'
import { findPrimitiveById, setDeprecated } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { requireQualifiedRef } from '../lib/validation.js'

export const deprecateCommand = new Command('deprecate')
  .description('Mark a primitive as deprecated')
  .argument('<ref>', 'Qualified primitive id (prefix:slug)')
  .action((refArg: string) => {
    requireQualifiedRef(refArg, 'Ref')
    const projectRoot = requireProjectRoot()

    const target = findPrimitiveById(projectRoot, refArg)
    if (!target) {
      console.error(`Primitive '${refArg}' not found.`)
      process.exit(1)
    }

    if (target.frontmatter.deprecated) {
      console.log(`${refArg} is already deprecated.`)
      return
    }

    setDeprecated(target)
    rebuildIndex(projectRoot)

    console.log(`Deprecated ${refArg}`)
  })
