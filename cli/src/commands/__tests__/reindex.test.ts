import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- flow:reindex ---

describe('flow:reindex', () => {
  it('rebuilds INDEX.md', () => {
    run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
    const r = run(['reindex'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('INDEX.md rebuilt'))
    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(index.includes('term:alpha'))
  })

  it('removes stale entries after manual file deletion', () => {
    run(['add', 'term', 'stale', '-n', 'Stale', '-b', 'Will be deleted.'], dir)
    const index1 = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(index1.includes('term:stale'))

    unlinkSync(join(dir, '.spec', 'terms', 'stale.md'))
    run(['reindex'], dir)

    const index2 = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(!index2.includes('term:stale'))
  })

  it('no .spec/ exits with error', () => {
    const emptyDir = createTempDir()
    const r = run(['reindex'], emptyDir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('No .spec/ found'))
    removeTempDir(emptyDir)
  })
})
