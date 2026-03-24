import { qualifyId, parseQualifiedRef } from './validation.js'
import type { Primitive } from './primitives.js'

export interface PrimitiveCatalog {
  all: Primitive[]
  byQid: Map<string, Primitive>
}

export type RefResolution =
  | { status: 'resolved', qid: string }
  | { status: 'missing' }
  | { status: 'ambiguous' }
  | { status: 'invalid' }

export interface BareRefOccurrence {
  ref: string
  line: number
}

export type ProseLinkErrorType =
  | 'missing-in-prose'
  | 'missing-in-frontmatter'
  | 'invalid-wrapped-ref'
  | 'ambiguous-wrapped-ref'
  | 'invalid-frontmatter-ref'

export interface ProseLinkIssue {
  type: ProseLinkErrorType | 'bare-ref'
  primitive: string
  ref: string
  filePath: string
  line?: number
  resolution?: Exclude<RefResolution['status'], 'resolved'>
}

export interface ProseLinkValidationResult {
  errors: ProseLinkIssue[]
  warnings: ProseLinkIssue[]
}

const REF_PATTERN = '(?:[a-z][a-z0-9-]*\\.)?[a-z]+:[a-z][a-z0-9-]*(?:-[a-z0-9]+)*'
const WRAPPED_REF_RE = new RegExp(`\\[\\[(${REF_PATTERN})\\]\\]`, 'g')
const BARE_REF_RE = new RegExp(`(${REF_PATTERN})`, 'g')

export const createPrimitiveCatalog = (primitives: Primitive[]): PrimitiveCatalog => {
  const byQid = new Map<string, Primitive>()
  for (const primitive of primitives) {
    const qid = qualifyId(
      primitive.frontmatter.type,
      primitive.frontmatter.id,
      primitive.frontmatter.context
    )
    byQid.set(qid, primitive)
  }

  return { all: primitives, byQid }
}

export const resolvePrimitiveRef = (ref: string, catalog: PrimitiveCatalog): RefResolution => {
  const parsed = parseQualifiedRef(ref)
  if (!parsed) {
    return { status: 'invalid' }
  }

  const candidates = catalog.all.filter(
    (primitive) =>
      primitive.frontmatter.type === parsed.type &&
      primitive.frontmatter.id === parsed.slug
  )

  if (parsed.context) {
    const match = candidates.find((primitive) => primitive.frontmatter.context === parsed.context)
    if (!match) {
      return { status: 'missing' }
    }

    return {
      status: 'resolved',
      qid: qualifyId(match.frontmatter.type, match.frontmatter.id, match.frontmatter.context),
    }
  }

  const sharedMatches = candidates.filter((primitive) => !primitive.frontmatter.context)

  if (sharedMatches.length === 0) {
    return { status: 'missing' }
  }

  if (sharedMatches.length > 1) {
    return { status: 'ambiguous' }
  }

  const [match] = sharedMatches
  return {
    status: 'resolved',
    qid: qualifyId(match.frontmatter.type, match.frontmatter.id, match.frontmatter.context),
  }
}

export const extractWrappedRefs = (body: string): string[] => {
  const refs: string[] = []
  let match: RegExpExecArray | null

  while ((match = WRAPPED_REF_RE.exec(body)) !== null) {
    refs.push(match[1])
  }

  WRAPPED_REF_RE.lastIndex = 0
  return refs
}

export const findBareRefOccurrences = (body: string): BareRefOccurrence[] => {
  const occurrences: BareRefOccurrence[] = []
  const lines = body.split('\n')

  for (const [index, rawLine] of lines.entries()) {
    const maskedLine = rawLine
      .replace(/\[\[[^\]]+\]\]/g, ' ')
      .replace(/`[^`]*`/g, ' ')

    let match: RegExpExecArray | null
    while ((match = BARE_REF_RE.exec(maskedLine)) !== null) {
      if (parseQualifiedRef(match[1])) {
        occurrences.push({ ref: match[1], line: index + 1 })
      }
    }

    BARE_REF_RE.lastIndex = 0
  }

  return occurrences
}

export const validateProseLinkConsistency = (
  primitives: Primitive[],
  catalog: PrimitiveCatalog
): ProseLinkValidationResult => {
  const errors: ProseLinkIssue[] = []
  const warnings: ProseLinkIssue[] = []

  for (const primitive of primitives) {
    const primitiveQid = qualifyId(
      primitive.frontmatter.type,
      primitive.frontmatter.id,
      primitive.frontmatter.context
    )

    const wrappedRefs = extractWrappedRefs(primitive.body)
    const wrappedResolved = new Set<string>()

    for (const ref of new Set(wrappedRefs)) {
      const resolution = resolvePrimitiveRef(ref, catalog)
      if (resolution.status === 'resolved') {
        wrappedResolved.add(resolution.qid)
        continue
      }

      errors.push({
        type: resolution.status === 'ambiguous' ? 'ambiguous-wrapped-ref' : 'invalid-wrapped-ref',
        primitive: primitiveQid,
        ref,
        filePath: primitive.filePath,
      })
    }

    const frontmatterResolved = new Map<string, string>()
    for (const link of primitive.frontmatter.links) {
      const resolution = resolvePrimitiveRef(link.target, catalog)
      if (resolution.status === 'resolved') {
        frontmatterResolved.set(resolution.qid, link.target)
        continue
      }

      errors.push({
        type: 'invalid-frontmatter-ref',
        primitive: primitiveQid,
        ref: link.target,
        filePath: primitive.filePath,
        resolution: resolution.status,
      })
    }

    for (const [qid, originalRef] of frontmatterResolved) {
      if (!wrappedResolved.has(qid)) {
        errors.push({
          type: 'missing-in-prose',
          primitive: primitiveQid,
          ref: originalRef,
          filePath: primitive.filePath,
        })
      }
    }

    for (const qid of wrappedResolved) {
      if (!frontmatterResolved.has(qid)) {
        errors.push({
          type: 'missing-in-frontmatter',
          primitive: primitiveQid,
          ref: qid,
          filePath: primitive.filePath,
        })
      }
    }

    for (const occurrence of findBareRefOccurrences(primitive.body)) {
      warnings.push({
        type: 'bare-ref',
        primitive: primitiveQid,
        ref: occurrence.ref,
        filePath: primitive.filePath,
        line: occurrence.line,
      })
    }
  }

  return { errors, warnings }
}
