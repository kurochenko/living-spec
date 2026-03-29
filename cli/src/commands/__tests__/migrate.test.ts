import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
})
afterEach(() => { removeTempDir(dir) })

describe('lore migrate', () => {
  it('no-op when already at current version', () => {
    run(['init'], dir)
    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('already at version'))
  })

  it('migrates from 0.2.0 to 0.3.0', () => {
    // Simulate old 0.2.0 spec (without VERSION file, without contexts/)
    const specDir = join(dir, '.spec')
    mkdirSync(specDir, { recursive: true })
    mkdirSync(join(specDir, 'templates'), { recursive: true })
    mkdirSync(join(specDir, 'terms'), { recursive: true })
    mkdirSync(join(specDir, 'invariants'), { recursive: true })
    mkdirSync(join(specDir, 'rules'), { recursive: true })
    mkdirSync(join(specDir, 'events'), { recursive: true })
    mkdirSync(join(specDir, 'flows'), { recursive: true })
    mkdirSync(join(specDir, 'contracts'), { recursive: true })
    mkdirSync(join(specDir, 'decisions'), { recursive: true })
    mkdirSync(join(specDir, 'features'), { recursive: true })

    // Old SPEC.md content (simplified)
    writeFileSync(join(specDir, 'SPEC.md'), '# Old SPEC\n\nOld content.')
    writeFileSync(join(specDir, 'INDEX.md'), '# Spec Index\n')

    // Templates without context.md
    for (const type of ['term', 'invariant', 'rule', 'event', 'flow', 'contract', 'decision', 'feature']) {
      writeFileSync(join(specDir, 'templates', `${type}.md`), `---\ntype: ${type}\n---\n`)
    }

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)

    // Verify migration results
    assert.ok(existsSync(join(specDir, 'VERSION')))
    assert.ok(readFileSync(join(specDir, 'VERSION'), 'utf-8').includes('0.3.0'))
    assert.ok(existsSync(join(specDir, 'contexts')))
    assert.ok(existsSync(join(specDir, 'templates', 'context.md')))
    assert.ok(readFileSync(join(specDir, 'SPEC.md'), 'utf-8').includes('Context Overviews'))
    assert.ok(r.stdout.includes('Updated SPEC.md'))
    assert.ok(r.stdout.includes('Created contexts/'))
    assert.ok(r.stdout.includes('Added context.md template'))
  })

  it('does not duplicate existing contexts/ folder', () => {
    // Create pre-existing contexts folder
    const specDir = join(dir, '.spec')
    mkdirSync(specDir, { recursive: true })
    mkdirSync(join(specDir, 'contexts'), { recursive: true })
    writeFileSync(join(specDir, 'contexts', 'existing.md'), '# Existing')

    // No VERSION file = treated as 0.2.0
    writeFileSync(join(specDir, 'SPEC.md'), '# Old SPEC')
    writeFileSync(join(specDir, 'INDEX.md'), '# Index')
    mkdirSync(join(specDir, 'templates'), { recursive: true })
    for (const type of ['term', 'invariant', 'rule', 'event', 'flow', 'contract', 'decision', 'feature']) {
      writeFileSync(join(specDir, 'templates', `${type}.md`), `---\ntype: ${type}\n---\n`)
    }

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    // Should not say "Created contexts/" since it exists
    assert.ok(!r.stdout.includes('Created contexts/') || r.stdout.includes('context.md template'))
    // Existing file should still be there
    assert.ok(existsSync(join(specDir, 'contexts', 'existing.md')))
  })

  it('errors when spec version is newer than supported', () => {
    run(['init'], dir)
    // Manually set version to 9.9.9 (future version)
    writeFileSync(join(dir, '.spec', 'VERSION'), '9.9.9')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('newer than supported version'))
    assert.ok(r.stderr.includes('update your CLI'))
  })

  it('init creates VERSION file with current version', () => {
    run(['init'], dir)
    const versionPath = join(dir, '.spec', 'VERSION')
    assert.ok(existsSync(versionPath))
    const version = readFileSync(versionPath, 'utf-8').trim()
    assert.equal(version, '0.3.0')
  })
})
