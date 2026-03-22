import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'First.'], dir)
  run(['add', 'term', 'beta', '-n', 'Beta', '-b', 'Second.'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- flow:rm-primitive ---

describe('flow:rm-primitive', () => {
  it('happy path deletes file and rebuilds INDEX.md', () => {
    const r = run(['rm', 'term:beta'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Removed term:beta'))
    assert.ok(!existsSync(join(dir, '.spec', 'terms', 'beta.md')))

    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(!index.includes('term:beta'))
    assert.ok(index.includes('term:alpha'))
  })

  it('rejects when inbound references exist', () => {
    run(['link', 'term:alpha', 'depends-on', 'term:beta'], dir)
    const r = run(['rm', 'term:beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('Cannot remove'))
    assert.ok(r.stderr.includes('term:alpha'))
    assert.ok(existsSync(join(dir, '.spec', 'terms', 'beta.md')))
  })

  it('--force deletes despite inbound references', () => {
    run(['link', 'term:alpha', 'depends-on', 'term:beta'], dir)
    const r = run(['rm', 'term:beta', '--force'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Removed term:beta'))
    assert.ok(!existsSync(join(dir, '.spec', 'terms', 'beta.md')))
  })

  it('nonexistent primitive exits with error', () => {
    const r = run(['rm', 'term:nope'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('unqualified ref exits with error', () => {
    const r = run(['rm', 'alpha'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
  })
})
