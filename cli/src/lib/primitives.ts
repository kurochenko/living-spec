import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import matter from 'gray-matter'
import { PRIMITIVE_TYPES, TYPE_TO_FOLDER, type PrimitiveType, type EdgeType } from './constants.js'
import { specDir } from './spec-root.js'
import { parseQualifiedRef, qualifyId } from './validation.js'

export interface Link {
  edge: EdgeType
  target: string
}

export interface PrimitiveFrontmatter {
  type: PrimitiveType
  name: string
  id: string
  context: string
  deprecated?: boolean
  links: Link[]
  tags: string[]
}

export interface Primitive {
  frontmatter: PrimitiveFrontmatter
  body: string
  filePath: string
}

export const readPrimitive = (filePath: string): Primitive => {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    frontmatter: data as PrimitiveFrontmatter,
    body: content.trim(),
    filePath,
  }
}

export const getAllPrimitives = (projectRoot: string): Primitive[] => {
  const spec = specDir(projectRoot)
  const primitives: Primitive[] = []

  for (const type of PRIMITIVE_TYPES) {
    const folder = join(spec, TYPE_TO_FOLDER[type])
    if (!existsSync(folder)) continue

    const files = readdirSync(folder).filter((f) => f.endsWith('.md'))
    for (const file of files) {
      const filePath = join(folder, file)
      try {
        primitives.push(readPrimitive(filePath))
      } catch {
        // skip malformed files
      }
    }
  }

  return primitives
}

export const findPrimitiveById = (projectRoot: string, ref: string): Primitive | null => {
  const all = getAllPrimitives(projectRoot)
  const qualified = parseQualifiedRef(ref)

  if (!qualified) return null

  const candidates = all.filter(
    (p) => p.frontmatter.type === qualified.type && p.frontmatter.id === qualified.slug
  )

  if (candidates.length === 0) return null

  if (qualified.context) {
    return candidates.find((p) => p.frontmatter.context === qualified.context) ?? null
  }

  if (candidates.length > 1) {
    const contexts = candidates.map((p) => p.frontmatter.context).filter(Boolean).join(', ')
    console.error(`Ambiguous ref '${ref}' — multiple matches exist: ${contexts}. Use full form context.prefix:slug.`)
    process.exit(1)
  }

  return candidates[0]
}

export const addLink = (primitive: Primitive, edge: EdgeType, target: string): void => {
  const raw = readFileSync(primitive.filePath, 'utf-8')
  const { data, content } = matter(raw)
  const links: Link[] = data.links ?? []
  links.push({ edge, target })
  data.links = links
  writeFileSync(primitive.filePath, matter.stringify(content, data))
}

export const removeLink = (primitive: Primitive, edge: EdgeType, target: string): boolean => {
  const raw = readFileSync(primitive.filePath, 'utf-8')
  const { data, content } = matter(raw)
  const links: Link[] = data.links ?? []
  const idx = links.findIndex((l) => l.edge === edge && l.target === target)
  if (idx === -1) return false
  links.splice(idx, 1)
  data.links = links
  writeFileSync(primitive.filePath, matter.stringify(content, data))
  return true
}

export const findInboundReferences = (projectRoot: string, ref: string): Primitive[] => {
  const all = getAllPrimitives(projectRoot)
  const qualified = parseQualifiedRef(ref)

  if (!qualified) return []

  const targets = all.filter(
    (p) => p.frontmatter.type === qualified.type && p.frontmatter.id === qualified.slug
  )

  if (targets.length === 0) return []

  const targetKeys = new Set(
    targets.map((t) => qualifyId(t.frontmatter.type, t.frontmatter.id, t.frontmatter.context))
  )

  return all.filter((p) => {
    const selfKey = qualifyId(p.frontmatter.type, p.frontmatter.id, p.frontmatter.context)
    if (targetKeys.has(selfKey)) return false
    return p.frontmatter.links.some((l) => {
      const linkTarget = parseQualifiedRef(l.target)
      if (!linkTarget) return l.target === ref
      const linkKey = qualifyId(linkTarget.type, linkTarget.slug, linkTarget.context)
      return targetKeys.has(linkKey)
    })
  })
}

export const removePrimitive = (primitive: Primitive): void => {
  unlinkSync(primitive.filePath)
}

export const setDeprecated = (primitive: Primitive): void => {
  const raw = readFileSync(primitive.filePath, 'utf-8')
  const { data, content } = matter(raw)
  data.deprecated = true
  writeFileSync(primitive.filePath, matter.stringify(content, data))
}

export const renamePrimitive = (primitive: Primitive, newSlug: string): string => {
  const raw = readFileSync(primitive.filePath, 'utf-8')
  const { data, content } = matter(raw)
  data.id = newSlug
  const filename = data.context ? `${data.context}.${newSlug}.md` : `${newSlug}.md`
  const newPath = join(dirname(primitive.filePath), filename)
  writeFileSync(newPath, matter.stringify(content, data))
  unlinkSync(primitive.filePath)
  return newPath
}

export const rewriteLinkTargets = (projectRoot: string, oldRef: string, newRef: string): number => {
  const all = getAllPrimitives(projectRoot)
  let count = 0
  for (const p of all) {
    const matches = p.frontmatter.links.filter((l) => l.target === oldRef)
    if (matches.length === 0) continue
    const raw = readFileSync(p.filePath, 'utf-8')
    const { data, content } = matter(raw)
    for (const link of data.links as { edge: string, target: string }[]) {
      if (link.target === oldRef) {
        link.target = newRef
        count++
      }
    }
    writeFileSync(p.filePath, matter.stringify(content, data))
  }
  return count
}
