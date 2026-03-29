import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { CONTEXTS_DIR, CONTEXT_TEMPLATE } from './constants.js'
import { type Primitive, getAllPrimitives } from './primitives.js'
import { specDir } from './spec-root.js'

export interface ContextOverviewFrontmatter {
  name: string
  tags?: string[]
}

export interface ContextOverview {
  frontmatter: ContextOverviewFrontmatter
  body: string
  filePath: string
}

export const contextOverviewPath = (projectRoot: string, context: string): string =>
  join(specDir(projectRoot), CONTEXTS_DIR, `${context}.md`)

export const contextTemplatePath = (projectRoot: string): string =>
  join(specDir(projectRoot), 'templates', CONTEXT_TEMPLATE)

export const ensureContextsDir = (projectRoot: string): void => {
  mkdirSync(join(specDir(projectRoot), CONTEXTS_DIR), { recursive: true })
}

export const readContextOverview = (projectRoot: string, context: string): ContextOverview | null => {
  const filePath = contextOverviewPath(projectRoot, context)
  if (!existsSync(filePath)) return null

  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    frontmatter: data as ContextOverviewFrontmatter,
    body: content.trim(),
    filePath,
  }
}

export const renderContextOverview = (template: string, name: string): string => {
  const { data, content } = matter(template)
  const frontmatter: ContextOverviewFrontmatter = {
    ...data as ContextOverviewFrontmatter,
    name,
    tags: Array.isArray(data.tags) ? data.tags : [],
  }

  return matter.stringify(`\n${content.trim()}\n`, frontmatter)
}

export const writeContextOverview = (
  projectRoot: string,
  context: string,
  name: string,
  template: string,
): string => {
  ensureContextsDir(projectRoot)
  const filePath = contextOverviewPath(projectRoot, context)
  writeFileSync(filePath, renderContextOverview(template, name))
  return filePath
}

export const readContextTemplate = (projectRoot: string, fallback: string): string => {
  const filePath = contextTemplatePath(projectRoot)
  if (!existsSync(filePath)) return fallback
  return readFileSync(filePath, 'utf-8')
}

export const getPrimitivesInContext = (projectRoot: string, context: string): Primitive[] =>
  getAllPrimitives(projectRoot).filter((primitive) => primitive.frontmatter.context === context)
