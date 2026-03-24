import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, writeFileSync } from 'fs'
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
  run(['link', 'flow:do-stuff', 'depends-on', 'term:alpha'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- flow:rename-primitive ---

describe('flow:rename-primitive', () => {
  it('renames file, updates id, and rewrites inbound refs', () => {
    const r = run(['rename', 'term:alpha', 'omega'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Renamed term:alpha → term:omega'))
    assert.ok(r.stdout.includes('1 inbound reference'))

    // Old file gone, new file exists
    assert.ok(!existsSync(join(dir, '.spec', 'terms', 'alpha.md')))
    assert.ok(existsSync(join(dir, '.spec', 'terms', 'omega.md')))

    // New file has correct id
    const { data } = matter(readFileSync(join(dir, '.spec', 'terms', 'omega.md'), 'utf-8'))
    assert.equal(data.id, 'omega')

    // Inbound ref rewritten
    const flowFile = matter(readFileSync(join(dir, '.spec', 'flows', 'do-stuff.md'), 'utf-8'))
    const links = flowFile.data.links as Array<{ edge: string, target: string }>
    assert.ok(links.some((l) => l.target === 'term:omega'))
    assert.ok(!links.some((l) => l.target === 'term:alpha'))

    // INDEX.md updated
    const index = readFileSync(join(dir, '.spec', 'INDEX.md'), 'utf-8')
    assert.ok(index.includes('term:omega'))
    assert.ok(!index.includes('term:alpha'))
  })

  it('no inbound refs still renames cleanly', () => {
    const r = run(['rename', 'term:beta', 'gamma'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('Renamed term:beta → term:gamma'))
    assert.ok(r.stdout.includes('0 inbound reference'))
  })

  it('duplicate slug within same type is rejected', () => {
    const r = run(['rename', 'term:alpha', 'beta'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('already exists'))
  })

  it('invalid new slug is rejected', () => {
    const r = run(['rename', 'term:alpha', 'NotKebab'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('kebab-case'))
  })

  it('nonexistent primitive is rejected', () => {
    const r = run(['rename', 'term:nope', 'something'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('unqualified ref is rejected', () => {
    const r = run(['rename', 'alpha', 'omega'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
  })

  it('updates prose wrappers when renaming', () => {
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    const newContent = content.replace('A flow.', 'A flow that uses [[term:alpha]].')
    writeFileSync(flowPath, matter.stringify(newContent, data))

    const r = run(['rename', 'term:alpha', 'omega'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('prose wrapper'))

    const updated = readFileSync(flowPath, 'utf-8')
    assert.ok(updated.includes('[[term:omega]]'))
    assert.ok(!updated.includes('[[term:alpha]]'))
  })

  it('reports zero prose wrappers when none exist', () => {
    const r = run(['rename', 'term:alpha', 'omega'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(!r.stdout.includes('prose wrapper'))
  })
})
