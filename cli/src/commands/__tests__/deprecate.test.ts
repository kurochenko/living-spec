import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- flow:deprecate-primitive ---

describe('flow:deprecate-primitive', () => {
  it('sets deprecated: true in frontmatter', () => {
    const r = run(['deprecate', 'term:alpha'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Deprecated term:alpha'))

    const filePath = join(dir, '.spec', 'terms', 'alpha.md')
    const { data } = matter(readFileSync(filePath, 'utf-8'))
    assert.equal(data.deprecated, true)
  })

  it('already deprecated is noop', () => {
    run(['deprecate', 'term:alpha'], dir)
    const r = run(['deprecate', 'term:alpha'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('already deprecated'))
  })

  it('nonexistent primitive exits with error', () => {
    const r = run(['deprecate', 'term:nope'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('unqualified ref exits with error', () => {
    const r = run(['deprecate', 'alpha'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
  })
})
