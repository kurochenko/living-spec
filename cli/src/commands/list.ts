import { Command } from 'commander'
import { requireProjectRoot } from '../lib/require-with-migration.js'
import { getAllPrimitives } from '../lib/primitives.js'
import { validateType, qualifyId } from '../lib/validation.js'

export const listCommand = new Command('list')
  .description('List all primitives, optionally filtered by type or context')
  .option('-t, --type <type>', 'Filter by primitive type')
  .option('-c, --context <context>', 'Filter by bounded context')
  .action((opts: { type?: string, context?: string }) => {
    const projectRoot = requireProjectRoot()
    let primitives = getAllPrimitives(projectRoot)

    if (opts.type) {
      const type = validateType(opts.type)
      primitives = primitives.filter((p) => p.frontmatter.type === type)
    }

    if (opts.context) {
      primitives = primitives.filter((p) => p.frontmatter.context === opts.context)
    }

    if (primitives.length === 0) {
      console.log('(none)')
      return
    }

    for (const p of primitives) {
      const qid = qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)
      const dep = p.frontmatter.deprecated ? ' [deprecated]' : ''
      console.log(`${qid}  ${p.frontmatter.name}${dep}`)
    }
  })
