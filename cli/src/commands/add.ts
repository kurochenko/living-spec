import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { Command } from 'commander'
import { TYPE_TO_FOLDER, type PrimitiveType } from '../lib/constants.js'
import { requireProjectRoot, specDir } from '../lib/spec-root.js'
import { getAllPrimitives } from '../lib/primitives.js'
import { rebuildIndex } from '../lib/index-builder.js'
import { validateType, validateId, qualifyId } from '../lib/validation.js'

const toTitleCase = (kebab: string): string =>
  kebab
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const buildPrimitiveFile = (
  type: PrimitiveType,
  id: string,
  name: string,
  context: string,
  body: string,
  templatePath: string,
): string => {
  const frontmatter: Record<string, unknown> = {
    type,
    name,
    id,
    context,
    links: [],
    tags: [],
  }

  if (existsSync(templatePath)) {
    const template = readFileSync(templatePath, 'utf-8')
    const { content: templateBody } = matter(template)
    const finalBody = body || templateBody.trim()
    return matter.stringify(finalBody ? `\n${finalBody}\n` : '\n', frontmatter)
  }

  return matter.stringify(body ? `\n${body}\n` : '\n', frontmatter)
}

export const addCommand = new Command('add')
  .description('Create a new primitive from its template')
  .argument('<type>', 'Primitive type')
  .argument('<id>', 'Unique kebab-case identifier')
  .option('-c, --context <context>', 'Bounded context name', '')
  .option('-n, --name <name>', 'Human-readable name (defaults to title-cased id)')
  .option('-b, --body <body>', 'Prose body text')
  .action((typeArg: string, idArg: string, opts: { context: string, name: string, body: string }) => {
    const type = validateType(typeArg)
    const id = validateId(idArg)
    const projectRoot = requireProjectRoot()
    const spec = specDir(projectRoot)

    const existing = getAllPrimitives(projectRoot)
    const duplicate = existing.find((p) => p.frontmatter.type === type && p.frontmatter.id === id)
    if (duplicate) {
      const qid = qualifyId(type, id)
      console.error(`Primitive '${qid}' already exists at ${duplicate.filePath}.`)
      process.exit(1)
    }

    const folder = TYPE_TO_FOLDER[type]
    const filePath = join(spec, folder, `${id}.md`)
    const templatePath = join(spec, 'templates', `${type}.md`)
    const name = opts.name || toTitleCase(id)

    const content = buildPrimitiveFile(type, id, name, opts.context, opts.body, templatePath)
    writeFileSync(filePath, content)

    rebuildIndex(projectRoot)

    const qid = qualifyId(type, id)
    console.log(`Created ${qid} at .spec/${folder}/${id}.md`)
  })
