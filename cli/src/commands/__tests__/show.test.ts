import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'First term.'], dir)
  run(['add', 'term', 'beta', '-n', 'Beta', '-b', 'Second term.'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- flow:show-primitive ---

describe('flow:show-primitive', () => {
  it('qualified lookup prints type, name, qualified id, links, body', () => {
    const r = run(['show', 'term:alpha'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('term: Alpha [term:alpha]'))
    assert.ok(r.stdout.includes('First term.'))
    assert.ok(r.stdout.includes('links:'))
  })

  it('unqualified slug exits with error', () => {
    const r = run(['show', 'alpha'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
    assert.ok(r.stderr.includes('prefix:slug'))
  })

  it('--related returns connected subgraph', () => {
    run(['add', 'flow', 'use-alpha', '-n', 'Use Alpha', '-b', 'A flow.'], dir)
    run(['link', 'flow:use-alpha', 'depends-on', 'term:alpha'], dir)

    const r = run(['show', 'term:alpha', '--related'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('term:alpha'))
    assert.ok(r.stdout.includes('flow:use-alpha'))
    assert.ok(r.stdout.includes('---'))
  })

  it('unknown qualified id exits with not found', () => {
    const r = run(['show', 'term:nonexistent'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('no .spec/ exits with error', () => {
    const emptyDir = createTempDir()
    const r = run(['show', 'term:anything'], emptyDir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('No .spec/ found'))
    removeTempDir(emptyDir)
  })
})
