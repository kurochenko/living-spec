import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { PRIMITIVE_TYPES, TYPE_TO_FOLDER, type PrimitiveType, type EdgeType } from './constants.js'
import { specDir } from './spec-root.js'
import { parseQualifiedRef } from './validation.js'

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
