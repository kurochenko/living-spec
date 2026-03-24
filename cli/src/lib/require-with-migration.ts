import { requireProjectRoot as _requireProjectRoot } from './spec-root.js'
import { checkMigrations, MIGRATIONS } from './migrations.js'

export const requireProjectRoot = (): string => {
  const root = _requireProjectRoot()
  checkMigrations(root, MIGRATIONS)
  return root
}

export { findProjectRoot, specDir } from './spec-root.js'