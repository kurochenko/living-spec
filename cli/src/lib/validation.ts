import { PRIMITIVE_TYPES, EDGE_TYPES, PREFIX_TO_TYPE, TYPE_TO_PREFIX, type PrimitiveType, type EdgeType } from './constants.js'

const KEBAB_CASE_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

export const isValidType = (type: string): type is PrimitiveType =>
  (PRIMITIVE_TYPES as readonly string[]).includes(type)

export const resolveType = (input: string): PrimitiveType | null => {
  if (isValidType(input)) return input
  const fromPrefix = PREFIX_TO_TYPE[input]
  if (fromPrefix) return fromPrefix
  return null
}

export const isValidId = (id: string): boolean =>
  KEBAB_CASE_RE.test(id)

export const validateType = (type: string): PrimitiveType => {
  const resolved = resolveType(type)
  if (!resolved) {
    const prefixes = Object.keys(PREFIX_TO_TYPE).join(', ')
    console.error(`Invalid type '${type}'. Must be one of: ${PRIMITIVE_TYPES.join(', ')} (or prefix: ${prefixes}).`)
    process.exit(1)
  }
  return resolved
}

export const validateId = (id: string): string => {
  if (!isValidId(id)) {
    console.error(`Invalid id '${id}'. Must be kebab-case (lowercase letters, numbers, hyphens).`)
    process.exit(1)
  }
  return id
}

export interface QualifiedRef {
  prefix: string
  type: PrimitiveType
  slug: string
}

export const parseQualifiedRef = (ref: string): QualifiedRef | null => {
  const colonIdx = ref.indexOf(':')
  if (colonIdx === -1) return null

  const prefix = ref.slice(0, colonIdx)
  const slug = ref.slice(colonIdx + 1)
  const type = PREFIX_TO_TYPE[prefix]

  if (!type || !slug) return null
  return { prefix, type, slug }
}

export const qualifyId = (type: PrimitiveType, slug: string): string =>
  `${TYPE_TO_PREFIX[type]}:${slug}`

export const isValidEdgeType = (edge: string): edge is EdgeType =>
  (EDGE_TYPES as readonly string[]).includes(edge)

export const validateEdgeType = (edge: string): EdgeType => {
  if (!isValidEdgeType(edge)) {
    console.error(`Invalid edge type '${edge}'. Must be one of: ${EDGE_TYPES.join(', ')}.`)
    process.exit(1)
  }
  return edge
}

export const requireQualifiedRef = (ref: string, label: string): QualifiedRef => {
  const parsed = parseQualifiedRef(ref)
  if (!parsed) {
    console.error(`${label}: Use qualified form prefix:slug. E.g., term:my-term.`)
    process.exit(1)
  }
  return parsed
}
