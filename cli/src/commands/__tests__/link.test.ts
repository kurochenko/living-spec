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
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'First term.'], dir)
  run(['add', 'term', 'beta', '-n', 'Beta', '-b', 'Second term.'], dir)
  run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)
  run(['add', 'event', 'stuff-done', '-n', 'Stuff Done', '-b', 'An event.'], dir)
  run(['add', 'feature', 'my-feat', '-n', 'My Feature', '-b', 'A feature.'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- inv:valid-edge-types ---

describe('inv:valid-edge-types', () => {
  it('allowed edge succeeds', () => {
    const r = run(['link', 'flow:do-stuff', 'emits', 'evt:stuff-done'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Linked'))
  })

  it('disallowed edge is rejected', () => {
    const r = run(['link', 'term:alpha', 'emits', 'evt:stuff-done'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not allowed'))
    assert.ok(r.stderr.includes('term'))
    assert.ok(r.stderr.includes('event'))
  })
})

// --- flow:link-primitives ---

describe('flow:link-primitives', () => {
  it('happy path creates link in frontmatter and INDEX.md', () => {
    const r = run(['link', 'term:alpha', 'depends-on', 'term:beta'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Linked term:alpha → depends-on → term:beta'))

    const filePath = join(dir, '.spec', 'terms', 'alpha.md')
    const { data } = matter(readFileSync(filePath, 'utf-8'))
    const links = data.links as Array<{ edge: string, target: string }>
    assert.ok(links.some((l) => l.edge === 'depends-on' && l.target === 'term:beta'))

    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(index.includes('term:alpha'))
    assert.ok(index.includes('depends-on: term:beta'))
  })

  it('duplicate link is rejected', () => {
    run(['link', 'term:alpha', 'depends-on', 'term:beta'], dir)
    const r = run(['link', 'term:alpha', 'depends-on', 'term:beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('already exists'))
  })

  it('nonexistent source is rejected', () => {
    const r = run(['link', 'term:nope', 'depends-on', 'term:beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('nonexistent target is rejected', () => {
    const r = run(['link', 'term:alpha', 'depends-on', 'term:nope'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('invalid edge type is rejected', () => {
    const r = run(['link', 'term:alpha', 'breaks', 'term:beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('Invalid edge type'))
  })

  it('unqualified ref is rejected', () => {
    const r = run(['link', 'alpha', 'depends-on', 'term:beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
  })
})

// --- flow:unlink-primitives ---

describe('flow:unlink-primitives', () => {
  it('happy path removes link from frontmatter and INDEX.md', () => {
    run(['link', 'term:alpha', 'depends-on', 'term:beta'], dir)

    const r = run(['unlink', 'term:alpha', 'depends-on', 'term:beta'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Unlinked term:alpha → depends-on → term:beta'))

    const filePath = join(dir, '.spec', 'terms', 'alpha.md')
    const { data } = matter(readFileSync(filePath, 'utf-8'))
    const links = data.links as Array<{ edge: string, target: string }>
    assert.ok(!links.some((l) => l.edge === 'depends-on' && l.target === 'term:beta'))

    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(index.includes('term:alpha'))
    assert.ok(!index.includes('depends-on: term:beta'))
  })

  it('link not found exits with error', () => {
    const r = run(['unlink', 'term:alpha', 'depends-on', 'term:beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('No link found'))
  })

  it('unqualified ref is rejected', () => {
    const r = run(['unlink', 'alpha', 'depends-on', 'beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
  })
})
