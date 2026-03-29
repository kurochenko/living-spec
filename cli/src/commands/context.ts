import { existsSync } from 'fs'
import { Command } from 'commander'
import { CONTEXTS_DIR, PRIMITIVE_TYPES, type PrimitiveType } from '../lib/constants.js'
import {
  contextOverviewPath,
  getPrimitivesInContext,
  readContextOverview,
  readContextTemplate,
  writeContextOverview,
} from '../lib/contexts.js'
import { type Primitive, getAllPrimitives } from '../lib/primitives.js'
import { contextTemplateContent } from '../lib/seed/templates.js'
import { requireProjectRoot } from '../lib/spec-root.js'
import { parseQualifiedRef, qualifyId, validateId } from '../lib/validation.js'

const WRAPPED_REF_RE = /\[\[((?:[a-z][a-z0-9-]*\.)?[a-z]+:[a-z][a-z0-9-]*(?:-[a-z0-9]+)*)\]\]/g

const TYPE_LABELS: Record<PrimitiveType, string> = {
  term: 'Terms',
  invariant: 'Invariants',
  rule: 'Rules',
  event: 'Events',
  flow: 'Flows',
  contract: 'Contracts',
  decision: 'Decisions',
  feature: 'Features',
}

const printDerivedMembership = (primitives: Primitive[]): void => {
  console.log('\nDerived membership:')

  if (primitives.length === 0) {
    console.log('(none)')
    return
  }

  for (const type of PRIMITIVE_TYPES) {
    const matches = primitives.filter((primitive) => primitive.frontmatter.type === type)
    if (matches.length === 0) continue

    console.log(`\n${TYPE_LABELS[type]}:`)
    for (const primitive of matches) {
      const qid = qualifyId(primitive.frontmatter.type, primitive.frontmatter.id, primitive.frontmatter.context)
      const deprecated = primitive.frontmatter.deprecated ? ' [deprecated]' : ''
      console.log(`${qid}  ${primitive.frontmatter.name}${deprecated}`)
    }
  }
}

const extractWrappedRefs = (body: string): string[] => {
  const refs: string[] = []
  let match: RegExpExecArray | null

  while ((match = WRAPPED_REF_RE.exec(body)) !== null) {
    refs.push(match[1])
  }

  WRAPPED_REF_RE.lastIndex = 0
  return refs
}

const resolveWrappedRef = (ref: string, primitives: Primitive[]): 'resolved' | 'ambiguous' | 'missing' | 'invalid' => {
  const parsed = parseQualifiedRef(ref)
  if (!parsed) return 'invalid'

  const candidates = primitives.filter(
    (primitive) => primitive.frontmatter.type === parsed.type && primitive.frontmatter.id === parsed.slug
  )

  if (parsed.context) {
    return candidates.some((primitive) => primitive.frontmatter.context === parsed.context) ? 'resolved' : 'missing'
  }

  const sharedCandidates = candidates.filter((primitive) => !primitive.frontmatter.context)
  if (sharedCandidates.length === 0) return 'missing'
  if (sharedCandidates.length > 1) return 'ambiguous'
  return 'resolved'
}

const validateWrappedRefs = (context: string, body: string, primitives: Primitive[]): void => {
  for (const ref of new Set(extractWrappedRefs(body))) {
    const resolution = resolveWrappedRef(ref, primitives)
    if (resolution === 'resolved') continue

    if (resolution === 'ambiguous') {
      console.error(`Ambiguous wrapped ref '[[${ref}]]' in context '${context}'. Use context-qualified form.`)
    } else {
      console.error(`Invalid wrapped ref '[[${ref}]]' in context '${context}'. No such primitive.`)
    }
    process.exit(1)
  }
}

const showContextCommand = new Command('show')
  .description('Display a context overview and its derived primitive membership')
  .argument('<name>', 'Bounded context name')
  .action((contextArg: string) => {
    const context = validateId(contextArg)
    const projectRoot = requireProjectRoot()
    const overview = readContextOverview(projectRoot, context)

    if (!overview) {
      console.error(`Context overview '${context}' not found at .spec/${CONTEXTS_DIR}/${context}.md.`)
      process.exit(1)
    }

    const allPrimitives = getAllPrimitives(projectRoot)
    validateWrappedRefs(context, overview.body, allPrimitives)

    console.log(`context: ${overview.frontmatter.name} [${context}]`)
    if ((overview.frontmatter.tags ?? []).length > 0) {
      console.log(`tags: ${overview.frontmatter.tags!.join(', ')}`)
    }
    if (overview.body) {
      console.log(`\n${overview.body}`)
    }

    printDerivedMembership(getPrimitivesInContext(projectRoot, context))
  })

const initContextCommand = new Command('init')
  .description('Create a context overview file')
  .argument('<name>', 'Bounded context name')
  .requiredOption('-n, --name <displayName>', 'Human-readable context name')
  .action((contextArg: string, opts: { name: string }) => {
    const context = validateId(contextArg)
    const projectRoot = requireProjectRoot()
    const filePath = contextOverviewPath(projectRoot, context)

    if (existsSync(filePath)) {
      console.error(`Context overview '${context}' already exists at .spec/${CONTEXTS_DIR}/${context}.md.`)
      process.exit(1)
    }

    const template = readContextTemplate(projectRoot, contextTemplateContent)
    writeContextOverview(projectRoot, context, opts.name, template)
    console.log(`Created context overview '${context}' at .spec/${CONTEXTS_DIR}/${context}.md`)
  })

export const contextCommand = new Command('context')
  .description('Manage bounded context overview files')
  .addCommand(showContextCommand)
  .addCommand(initContextCommand)
