import { existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { SPEC_DIR, SPEC_MARKER } from './constants.js'

export const findProjectRoot = (startDir?: string): string | null => {
  let dir = resolve(startDir ?? process.cwd())

  while (true) {
    if (existsSync(join(dir, SPEC_MARKER))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) {
      return null
    }
    dir = parent
  }
}

export const requireProjectRoot = (startDir?: string): string => {
  const root = findProjectRoot(startDir)
  if (!root) {
    console.error('No .spec/ found. Run `lore init` first.')
    process.exit(1)
  }
  return root
}

export const specDir = (projectRoot: string): string =>
  join(projectRoot, SPEC_DIR)
