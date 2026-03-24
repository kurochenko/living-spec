import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { Command } from 'commander'
import { TYPE_TO_FOLDER, type PrimitiveType } from '../lib/constants.js'
import { specDir } from '../lib/spec-root.js'
import { requireProjectRoot } from '../lib/require-with-migration.js'
import { getAllPrimitives } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { validateType, validateId, qualifyId } from '../lib/validation.js'

const buildPrimitiveFile = (
  type: PrimitiveType,
  id: string,
  name: string,
  body: string,
  context?: string,
): string => {
  const frontmatter: Record<string, unknown> = {
    type,
    name,
    id,
    links: [],
    tags: [],
  }

  if (context) {
    frontmatter.context = context
  }

  return matter.stringify(`\n${body}\n`, frontmatter)
}

export const addCommand = new Command('add')
  .description('Create a new primitive')
  .argument('<type>', 'Primitive type')
  .argument('<slug>', 'Unique kebab-case identifier within this type')
  .requiredOption('-n, --name <name>', 'Human-readable name')
  .option('-b, --body <body>', 'Prose body text (inline)')
  .option('--body-file <path>', 'Path to file containing body text')
  .option('-c, --context <context>', 'Bounded context for this primitive')
  .action((typeArg: string, slugArg: string, opts: { name: string, body?: string, bodyFile?: string, context?: string }) => {
    const type = validateType(typeArg)
    const slug = validateId(slugArg)
    const projectRoot = requireProjectRoot()
    const spec = specDir(projectRoot)

    if (!opts.body && !opts.bodyFile) {
      console.error("Body is required. Use -b for inline or --body-file for multi-line.")
      process.exit(1)
    }

    if (opts.body && opts.bodyFile) {
      console.error("Use either -b or --body-file, not both.")
      process.exit(1)
    }

    let body = opts.body ?? ''
    if (opts.bodyFile) {
      if (!existsSync(opts.bodyFile)) {
        console.error(`Body file not found: ${opts.bodyFile}`)
        process.exit(1)
      }
      body = readFileSync(opts.bodyFile, 'utf-8').trim()
    }

    const existing = getAllPrimitives(projectRoot)
    const duplicate = existing.find(
      (p) => p.frontmatter.type === type && p.frontmatter.id === slug && p.frontmatter.context === opts.context
    )
    if (duplicate) {
      const qid = qualifyId(type, slug, opts.context)
      console.error(`Primitive '${qid}' already exists at ${duplicate.filePath}.`)
      process.exit(1)
    }

    const folder = TYPE_TO_FOLDER[type]
    const filename = opts.context ? `${opts.context}.${slug}.md` : `${slug}.md`
    const filePath = join(spec, folder, filename)

    const content = buildPrimitiveFile(type, slug, opts.name, body, opts.context)
    writeFileSync(filePath, content)

    rebuildIndex(projectRoot)

    const qid = qualifyId(type, slug, opts.context)
    console.log(`Created ${qid} at .spec/${folder}/${filename}`)
  })
