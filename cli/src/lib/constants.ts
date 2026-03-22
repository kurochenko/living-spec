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

/**
 * Allowed source→target type pairs per edge type.
 * '*' means any primitive type is allowed in that position.
 */
export const EDGE_CONSTRAINTS: Record<EdgeType, Array<{ source: PrimitiveType | '*', target: PrimitiveType | '*' }>> = {
  'depends-on': [{ source: '*', target: '*' }],
  'constrains': [
    { source: 'invariant', target: 'term' },
    { source: 'invariant', target: 'flow' },
    { source: 'rule', target: 'term' },
    { source: 'rule', target: 'flow' },
  ],
  'includes': [
    { source: 'feature', target: '*' },
    { source: 'term', target: 'term' },
  ],
  'maps-to': [
    { source: 'term', target: 'term' },
    { source: 'contract', target: 'term' },
  ],
  'emits': [{ source: 'flow', target: 'event' }],
  'triggers': [
    { source: 'event', target: 'flow' },
    { source: 'event', target: 'event' },
  ],
}

export const isValidEdge = (edge: EdgeType, sourceType: PrimitiveType, targetType: PrimitiveType): boolean =>
  EDGE_CONSTRAINTS[edge].some(
    (c) => (c.source === '*' || c.source === sourceType) && (c.target === '*' || c.target === targetType)
  )

export const SPEC_DIR = '.spec'
export const SPEC_MARKER = '.spec/SPEC.md'
