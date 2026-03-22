import { PRIMITIVE_TYPES, PREFIX_TO_TYPE, TYPE_TO_PREFIX, type PrimitiveType } from './constants.js'

const KEBAB_CASE_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

export const isValidType = (type: string): type is PrimitiveType =>
  (PRIMITIVE_TYPES as readonly string[]).includes(type)

export const isValidId = (id: string): boolean =>
  KEBAB_CASE_RE.test(id)

export const validateType = (type: string): PrimitiveType => {
  if (!isValidType(type)) {
    console.error(`Invalid type '${type}'. Must be one of: ${PRIMITIVE_TYPES.join(', ')}.`)
    process.exit(1)
  }
  return type
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
