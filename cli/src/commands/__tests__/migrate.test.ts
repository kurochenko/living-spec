import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
})
afterEach(() => { removeTempDir(dir) })

describe('lore migrate', () => {
  it('no pending migrations when VERSION matches', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.2.0\n')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('No pending migrations'))
  })

  it('manual migration generates guide and leaves version unchanged', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Migration requires manual review'))
    assert.ok(r.stdout.includes('.migrate-0.2.0-guide.md'))
    assert.ok(r.stdout.includes("lore migrate --confirm 0.2.0"))
    assert.equal(readFileSync(join(dir, '.spec', 'VERSION'), 'utf-8').trim(), '0.1.0')
  })

  it('manual migration guide includes consistency blockers', () => {
    run(['init'], dir)
    run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
    run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)
    run(['link', 'flow:do-stuff', 'depends-on', 'term:alpha'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Migration requires manual review'))
    const guide = readFileSync(join(dir, '.spec', '.migrate-0.2.0-guide.md'), 'utf-8')
    assert.ok(guide.includes('linked in frontmatter but not wrapped in prose'))
    assert.equal(readFileSync(join(dir, '.spec', 'VERSION'), 'utf-8').trim(), '0.1.0')
  })

  it('manual migration guide reports unresolved frontmatter links', () => {
    run(['init'], dir)
    run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)

    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const raw = readFileSync(flowPath, 'utf-8')
    writeFileSync(
      flowPath,
      raw.replace('links: []', "links:\n  - edge: depends-on\n    target: term:ghost")
    )
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    const guide = readFileSync(join(dir, '.spec', '.migrate-0.2.0-guide.md'), 'utf-8')
    assert.ok(guide.includes('frontmatter link does not resolve to a primitive: term:ghost'))
  })

  it('manual migration confirm advances version even after guide generation', () => {
    run(['init'], dir)
    run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
    run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)
    run(['link', 'flow:do-stuff', 'depends-on', 'term:alpha'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const first = run(['migrate'], dir)
    assert.equal(first.exitCode, 0)
    assert.ok(first.stdout.includes('manual review'))

    const second = run(['migrate', '--confirm', '0.2.0'], dir)
    assert.equal(second.exitCode, 0)
    assert.ok(second.stdout.includes('Confirming manual migration v0.2.0'))
    assert.ok(second.stdout.includes('Confirmed manual migration v0.2.0'))
    assert.equal(readFileSync(join(dir, '.spec', 'VERSION'), 'utf-8').trim(), '0.2.0')
  })

  it('manual migration guide includes bare ref warnings', () => {
    run(['init'], dir)
    run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
    run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow with [[term:alpha]] and term:alpha for review.'], dir)
    run(['link', 'flow:do-stuff', 'depends-on', 'term:alpha'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
    const guide = readFileSync(join(dir, '.spec', '.migrate-0.2.0-guide.md'), 'utf-8')
    assert.ok(guide.includes('## Bare Ref Warnings'))
    assert.ok(guide.includes('term:alpha'))
  })

  it('confirm errors when the next pending manual migration version does not match', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['migrate', '--confirm', '0.3.0'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('next pending manual migration is v0.2.0'))
  })

  it('confirm errors when there are no pending manual migrations', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.2.0\n')

    const r = run(['migrate', '--confirm', '0.2.0'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('no pending manual migrations'))
  })

  it('lore check blocked when migration pending', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['list'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('migrate'))
    assert.ok(r.stderr.includes('0.1.0'))
    assert.ok(r.stderr.includes('0.2.0'))
  })

  it('lore add blocked when migration pending', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['add', 'term', 'test', '-n', 'Test', '-b', 'A test.'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('migrate'))
  })

  it('lore migrate itself works when migration pending', () => {
    run(['init'], dir)
    writeFileSync(join(dir, '.spec', 'VERSION'), '0.1.0\n')

    const r = run(['migrate'], dir)
    assert.equal(r.exitCode, 0)
  })
})
