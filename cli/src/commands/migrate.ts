import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { Command } from 'commander'
import { CONTEXTS_DIR, CONTEXT_TEMPLATE } from '../lib/constants.js'
import { specContent } from '../lib/seed/spec.js'
import { contextTemplateContent } from '../lib/seed/templates.js'
import { CURRENT_SPEC_VERSION } from '../lib/seed/version.js'
import { requireProjectRoot, specDir } from '../lib/spec-root.js'

const VERSION_FILE = 'VERSION'

const readCurrentVersion = (projectRoot: string): string => {
  const versionPath = join(specDir(projectRoot), VERSION_FILE)
  if (!existsSync(versionPath)) {
    // Pre-migration specs didn't have VERSION file, assume 0.2.0
    return '0.2.0'
  }
  return readFileSync(versionPath, 'utf-8').trim()
}

const writeVersion = (projectRoot: string, version: string): void => {
  writeFileSync(join(specDir(projectRoot), VERSION_FILE), version + '\n')
}

const isVersionLessThan = (v1: string, v2: string): boolean => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] ?? 0
    const p2 = parts2[i] ?? 0
    if (p1 < p2) return true
    if (p1 > p2) return false
  }
  return false
}

export const migrateCommand = new Command('migrate')
  .description('Migrate spec to current format version')
  .action(() => {
    const projectRoot = requireProjectRoot()
    const currentVersion = readCurrentVersion(projectRoot)

    if (currentVersion === CURRENT_SPEC_VERSION) {
      console.log(`Spec is already at version ${CURRENT_SPEC_VERSION}. No migration needed.`)
      return
    }

    if (!isVersionLessThan(currentVersion, CURRENT_SPEC_VERSION)) {
      console.error(`Error: Spec version ${currentVersion} is newer than supported version ${CURRENT_SPEC_VERSION}.`)
      console.error('Please update your CLI to match the spec version.')
      process.exit(1)
    }

    console.log(`Migrating spec from ${currentVersion} to ${CURRENT_SPEC_VERSION}...`)

    // Migration to 0.3.0: Add context overview support
    if (isVersionLessThan(currentVersion, '0.3.0')) {
      // Update SPEC.md with new content
      writeFileSync(join(specDir(projectRoot), 'SPEC.md'), specContent)
      console.log('✓ Updated SPEC.md with context overview documentation')

      // Create contexts/ folder if missing
      const contextsPath = join(specDir(projectRoot), CONTEXTS_DIR)
      if (!existsSync(contextsPath)) {
        mkdirSync(contextsPath, { recursive: true })
        writeFileSync(join(contextsPath, '.gitkeep'), '')
        console.log('✓ Created contexts/ folder')
      }

      // Add context template
      const contextTemplatePath = join(specDir(projectRoot), 'templates', CONTEXT_TEMPLATE)
      if (!existsSync(contextTemplatePath)) {
        writeFileSync(contextTemplatePath, contextTemplateContent)
        console.log('✓ Added context.md template')
      }
    }

    // Update VERSION file
    writeVersion(projectRoot, CURRENT_SPEC_VERSION)
    console.log(`✓ Spec migrated to version ${CURRENT_SPEC_VERSION}`)
    console.log('')
    console.log('Note: Review the updated SPEC.md for new context overview features.')
    console.log('New commands available:')
    console.log('  lore context init <name> -n "Title"  - Create a context overview')
    console.log('  lore context show <name>             - Display context overview and membership')
  })
