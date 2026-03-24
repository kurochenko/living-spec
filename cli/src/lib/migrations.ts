import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { specDir } from './spec-root.js'
import { getAllPrimitives } from './primitives.js'
import { qualifyId } from './validation.js'
import {
  createPrimitiveCatalog,
  validateProseLinkConsistency,
} from './prose-links.js'

export interface Migration {
  targetVersion: string
  type: 'automatic' | 'manual'
  up: (projectRoot: string) => Promise<void>
  prepare?: (projectRoot: string) => Promise<ManualMigrationArtifact>
}

export interface ManualMigrationArtifact {
  guide: string
}

const SPEC_VERSION_FILE = 'VERSION'

export const getSpecVersion = (projectRoot: string): string | null => {
  const versionFile = join(specDir(projectRoot), SPEC_VERSION_FILE)
  if (!existsSync(versionFile)) return null
  return readFileSync(versionFile, 'utf-8').trim()
}

export const setSpecVersion = (projectRoot: string, version: string): void => {
  const versionFile = join(specDir(projectRoot), SPEC_VERSION_FILE)
  writeFileSync(versionFile, `${version}\n`)
}

const compareVersions = (left: string, right: string): number => {
  const leftParts = left.split('.').map((part) => Number.parseInt(part, 10))
  const rightParts = right.split('.').map((part) => Number.parseInt(part, 10))
  const length = Math.max(leftParts.length, rightParts.length)

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] ?? 0
    const rightPart = rightParts[index] ?? 0

    if (leftPart < rightPart) return -1
    if (leftPart > rightPart) return 1
  }

  return 0
}

export const getPendingMigrations = (
  projectRoot: string,
  migrations: Migration[]
): Migration[] => {
  const currentVersion = getSpecVersion(projectRoot)
  if (!currentVersion) {
    return migrations.filter((migration) => compareVersions(migration.targetVersion, '0.0.0') > 0)
  }

  return migrations.filter((migration) => compareVersions(migration.targetVersion, currentVersion) > 0)
}

export const checkMigrations = (projectRoot: string, migrations: Migration[]): void => {
  const pending = getPendingMigrations(projectRoot, migrations)
  if (pending.length === 0) return

  const latest = pending[pending.length - 1].targetVersion
  const current = getSpecVersion(projectRoot) ?? 'none'
  console.error(`\nerror: Spec at v${current}, but v${latest} required by migration '${pending[0].targetVersion}'.`)
  console.error(`Run 'lore migrate' to apply pending migrations.`)
  process.exit(1)
}

export const runMigrations = async (
  projectRoot: string,
  migrations: Migration[],
  confirmVersion?: string
): Promise<void> => {
  const pending = getPendingMigrations(projectRoot, migrations)
  if (pending.length === 0) {
    if (confirmVersion) {
      throw new Error(`Cannot confirm migration v${confirmVersion}; no pending manual migrations.`)
    }
    console.log('No pending migrations.')
    return
  }

  if (confirmVersion) {
    const nextPendingManual = pending.find((migration) => migration.type === 'manual')
    if (!nextPendingManual) {
      throw new Error(`Cannot confirm migration v${confirmVersion}; no pending manual migrations.`)
    }

    if (nextPendingManual.targetVersion !== confirmVersion) {
      throw new Error(
        `Cannot confirm migration v${confirmVersion}; next pending manual migration is v${nextPendingManual.targetVersion}.`
      )
    }
  }

  for (const migration of pending) {
    console.log(`\nApplying migration to v${migration.targetVersion} (${migration.type})...`)

    if (migration.type === 'automatic') {
      await migration.up(projectRoot)
      setSpecVersion(projectRoot, migration.targetVersion)
      console.log(`✓ Migrated to v${migration.targetVersion}`)
    } else {
      if (confirmVersion === migration.targetVersion) {
        console.log(
          `⚠ Confirming manual migration v${migration.targetVersion} without re-validating correctness.`
        )
        await migration.up(projectRoot)
        setSpecVersion(projectRoot, migration.targetVersion)
        console.log(`✓ Confirmed manual migration v${migration.targetVersion}`)
        continue
      }

      if (!migration.prepare) {
        throw new Error(`Manual migration '${migration.targetVersion}' is missing a guide generator.`)
      }

      const artifact = await migration.prepare(projectRoot)
      const guidePath = join(specDir(projectRoot), `.migrate-${migration.targetVersion}-guide.md`)
      writeFileSync(guidePath, artifact.guide)
      console.log(`\n⚠ Migration requires manual review.`)
      console.log(`  Guide written to: ${guidePath}`)
      console.log(`  After making required changes, run 'lore migrate --confirm ${migration.targetVersion}'.`)
      return
    }
  }

  console.log('\n✓ All migrations complete.')
}

const formatMigrationIssue = (
  issueType: 'missing-in-prose' | 'missing-in-frontmatter' | 'invalid-wrapped-ref' | 'ambiguous-wrapped-ref' | 'invalid-frontmatter-ref',
  ref: string,
  resolution?: 'missing' | 'ambiguous' | 'invalid'
): string => {
  if (issueType === 'missing-in-prose') {
    return `- linked in frontmatter but not wrapped in prose: ${ref}`
  }

  if (issueType === 'missing-in-frontmatter') {
    return `- wrapped in prose but not linked in frontmatter: ${ref}`
  }

  if (issueType === 'ambiguous-wrapped-ref') {
    return `- wrapped ref is ambiguous and needs a context-qualified form: ${ref}`
  }

  if (issueType === 'invalid-frontmatter-ref') {
    if (resolution === 'ambiguous') {
      return `- frontmatter link requires a context-qualified ref: ${ref}`
    }
    return `- frontmatter link does not resolve to a primitive: ${ref}`
  }

  return `- wrapped ref does not resolve to a primitive: ${ref}`
}

const buildWrapperMigrationGuide = (projectRoot: string): ManualMigrationArtifact => {
  const all = getAllPrimitives(projectRoot)
  const catalog = createPrimitiveCatalog(all)
  const validation = validateProseLinkConsistency(all, catalog)

  const primitivesList = all
    .map((primitive) => {
      const qid = qualifyId(
        primitive.frontmatter.type,
        primitive.frontmatter.id,
        primitive.frontmatter.context
      )

      return `- ${qid}: ${primitive.frontmatter.name}`
    })
    .sort()
    .join('\n')

  const findingsByPrimitive = new Map<string, string[]>()
  for (const issue of validation.errors) {
    if (issue.type === 'bare-ref') continue
    const findings = findingsByPrimitive.get(issue.primitive) ?? []
    findings.push(formatMigrationIssue(issue.type, issue.ref, issue.resolution))
    findingsByPrimitive.set(issue.primitive, findings)
  }

  for (const issue of validation.warnings) {
    if (issue.type !== 'bare-ref' || !issue.line) continue
    const findings = findingsByPrimitive.get(issue.primitive) ?? []
    findings.push(`- probable bare ref to review: ${issue.ref} at ${issue.filePath}:${issue.line}`)
    findingsByPrimitive.set(issue.primitive, findings)
  }

  const findings = [...findingsByPrimitive.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([primitive, issues]) => `### ${primitive}\n\n${issues.join('\n')}`)
    .join('\n\n')

  return {
    guide: `# Migration Guide v0.2.0

This guide helps complete the prose/frontmatter consistency migration.

## All Primitives in This Spec

${primitivesList}

## Review Findings

${findings || 'No blocking inconsistencies were detected by the CLI.'}

## How to Make Changes

1. Open each listed file
2. Add missing \`[[...]]\` wrappers or frontmatter links
3. Replace ambiguous wrapped refs with context-qualified forms
4. Remove or fix wrapped refs that do not resolve
5. Review bare primitive-ref occurrences listed below
6. After accepting the migration, run \`lore migrate --confirm 0.2.0\`

## Bare Ref Warnings

${validation.warnings
      .filter((issue) => issue.type === 'bare-ref' && issue.line)
      .map((issue) => `- ${issue.ref} at ${issue.filePath}:${issue.line}`)
      .join('\n') || 'None detected.'}
`,
  }
}

export const MIGRATIONS: Migration[] = [
  {
    targetVersion: '0.2.0',
    type: 'manual',
    async up() {},
    async prepare(projectRoot) {
      return buildWrapperMigrationGuide(projectRoot)
    },
  },
]
