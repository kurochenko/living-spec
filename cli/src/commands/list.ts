import { Command } from 'commander'
import { requireProjectRoot } from '../lib/spec-root.js'
import { getAllPrimitives } from '../lib/primitives.js'
import { validateType, qualifyId } from '../lib/validation.js'

export const listCommand = new Command('list')
  .description('List all primitives, optionally filtered by type')
  .option('-t, --type <type>', 'Filter by primitive type')
  .action((opts: { type?: string }) => {
    const projectRoot = requireProjectRoot()
    let primitives = getAllPrimitives(projectRoot)

    if (opts.type) {
      const type = validateType(opts.type)
      primitives = primitives.filter((p) => p.frontmatter.type === type)
    }

    if (primitives.length === 0) {
      console.log('(none)')
      return
    }

    for (const p of primitives) {
      const qid = qualifyId(p.frontmatter.type, p.frontmatter.id)
      const dep = p.frontmatter.deprecated ? ' [deprecated]' : ''
      console.log(`${qid}  ${p.frontmatter.name}${dep}`)
    }
  })
