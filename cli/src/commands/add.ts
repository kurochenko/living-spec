import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { Command } from 'commander'
import { TYPE_TO_FOLDER, type PrimitiveType } from '../lib/constants.js'
import { requireProjectRoot, specDir } from '../lib/spec-root.js'
import { getAllPrimitives } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { validateType, validateId, qualifyId } from '../lib/validation.js'

const buildPrimitiveFile = (
  type: PrimitiveType,
  id: string,
  name: string,
  context: string,
  body: string,
): string => {
  const frontmatter: Record<string, unknown> = {
    type,
    name,
    id,
    context,
    links: [],
    tags: [],
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
  .option('-c, --context <context>', 'Bounded context name', '')
  .action((typeArg: string, slugArg: string, opts: { context: string, name: string, body?: string, bodyFile?: string }) => {
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
    const duplicate = existing.find((p) => p.frontmatter.type === type && p.frontmatter.id === slug)
    if (duplicate) {
      const qid = qualifyId(type, slug)
      console.error(`Primitive '${qid}' already exists at ${duplicate.filePath}.`)
      process.exit(1)
    }

    const folder = TYPE_TO_FOLDER[type]
    const filePath = join(spec, folder, `${slug}.md`)

    const content = buildPrimitiveFile(type, slug, opts.name, opts.context, body)
    writeFileSync(filePath, content)

    rebuildIndex(projectRoot)

    const qid = qualifyId(type, slug)
    console.log(`Created ${qid} at .spec/${folder}/${slug}.md`)
  })
