import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
  run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)
})
afterEach(() => { removeTempDir(dir) })

// --- flow:list-primitives ---

describe('flow:list-primitives', () => {
  it('lists all primitives', () => {
    const r = run(['list'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('term:alpha'))
    assert.ok(r.stdout.includes('Alpha'))
    assert.ok(r.stdout.includes('flow:do-stuff'))
    assert.ok(r.stdout.includes('Do Stuff'))
  })

  it('filters by --type', () => {
    const r = run(['list', '--type', 'term'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('term:alpha'))
    assert.ok(!r.stdout.includes('flow:do-stuff'))
  })

  it('invalid type exits with error', () => {
    const r = run(['list', '--type', 'bogus'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('Invalid type'))
  })

  it('empty result prints (none)', () => {
    const r = run(['list', '--type', 'event'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('(none)'))
  })

  it('shows deprecated tag', () => {
    run(['deprecate', 'term:alpha'], dir)
    const r = run(['list'], dir)
    assert.ok(r.stdout.includes('[deprecated]'))
  })

  it('filters by --context', () => {
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'A status.'], dir)
    run(['add', 'term', 'status', '-n', 'Recipe Status', '-c', 'recipe', '-b', 'A status.'], dir)
    run(['add', 'term', 'shared', '-n', 'Shared Term', '-b', 'A shared term.'], dir)

    const r = run(['list', '--context', 'billing'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('billing.term:status'))
    assert.ok(!r.stdout.includes('recipe.term:status'))
    assert.ok(!r.stdout.includes('term:shared'))
  })

  it('context filter shows only matching context', () => {
    run(['add', 'term', 'item', '-c', 'billing', '-n', 'Billing Item', '-b', 'A item.'], dir)
    run(['add', 'term', 'item', '-c', 'recipe', '-n', 'Recipe Item', '-b', 'A item.'], dir)

    const r = run(['list', '--context', 'recipe'], dir)
    assert.ok(r.stdout.includes('recipe.term:item'))
    assert.ok(!r.stdout.includes('billing.term:item'))
  })
})
