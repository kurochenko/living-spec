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

  return all.find((p) => p.frontmatter.type === qualified.type && p.frontmatter.id === qualified.slug) ?? null
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
  return all.filter((p) => {
    const qid = qualifyId(p.frontmatter.type, p.frontmatter.id)
    if (qid === ref) return false
    return p.frontmatter.links.some((l) => l.target === ref)
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
  const newPath = join(dirname(primitive.filePath), `${newSlug}.md`)
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
