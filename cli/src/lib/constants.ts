export const PRIMITIVE_TYPES = [
  'term',
  'invariant',
  'rule',
  'event',
  'flow',
  'contract',
  'decision',
  'feature',
] as const

export type PrimitiveType = (typeof PRIMITIVE_TYPES)[number]

export const EDGE_TYPES = [
  'depends-on',
  'constrains',
  'includes',
  'maps-to',
  'emits',
  'triggers',
] as const

export type EdgeType = (typeof EDGE_TYPES)[number]

export const TYPE_TO_FOLDER: Record<PrimitiveType, string> = {
  term: 'terms',
  invariant: 'invariants',
  rule: 'rules',
  event: 'events',
  flow: 'flows',
  contract: 'contracts',
  decision: 'decisions',
  feature: 'features',
}

export const TYPE_TO_PREFIX: Record<PrimitiveType, string> = {
  term: 'term',
  invariant: 'inv',
  rule: 'rule',
  event: 'evt',
  flow: 'flow',
  contract: 'con',
  decision: 'dec',
  feature: 'feat',
}

export const PREFIX_TO_TYPE: Record<string, PrimitiveType> = Object.fromEntries(
  Object.entries(TYPE_TO_PREFIX).map(([type, prefix]) => [prefix, type as PrimitiveType])
) as Record<string, PrimitiveType>

export const SPEC_DIR = '.spec'
export const SPEC_MARKER = '.spec/SPEC.md'
