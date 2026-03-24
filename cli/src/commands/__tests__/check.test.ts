import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { createTempDir, removeTempDir, run } from '../../lib/test-helpers.js'

let dir: string

beforeEach(() => {
  dir = createTempDir()
  run(['init'], dir)
  run(['add', 'term', 'alpha', '-n', 'Alpha', '-b', 'A term.'], dir)
  run(['add', 'term', 'beta', '-n', 'Beta', '-b', 'Second term.'], dir)
  run(['add', 'flow', 'do-stuff', '-n', 'Do Stuff', '-b', 'A flow.'], dir)
  run(['add', 'feature', 'my-feat', '-n', 'My Feature', '-b', 'A feature.'], dir)
  // wire up: feat:my-feat --includes--> flow:do-stuff --depends-on--> term:alpha
  run(['link', 'feat:my-feat', 'includes', 'flow:do-stuff'], dir)
  run(['link', 'flow:do-stuff', 'depends-on', 'term:alpha'], dir)

  const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
  const featurePath = join(dir, '.spec', 'features', 'my-feat.md')
  const flow = matter(readFileSync(flowPath, 'utf-8'))
  const feature = matter(readFileSync(featurePath, 'utf-8'))

  writeFileSync(
    flowPath,
    matter.stringify('A flow that uses [[term:alpha]].', flow.data)
  )
  writeFileSync(
    featurePath,
    matter.stringify('A feature that includes [[flow:do-stuff]].', feature.data)
  )
})
afterEach(() => { removeTempDir(dir) })

// --- flow:check-feature ---

describe('flow:check-feature', { concurrency: false }, () => {
  it('complete graph exits 0 with count', () => {
    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('✓'))
    assert.ok(r.stdout.includes('primitives'))
  })

  it('dead ref exits 1 and reports missing', () => {
    // Add a link to a nonexistent primitive via gray-matter
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    data.links.push({ edge: 'depends-on', target: 'term:ghost' })
    writeFileSync(flowPath, matter.stringify(content, data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('✗ missing: term:ghost'))
    assert.ok(r.stdout.includes('flow:do-stuff'))
  })

  it('deprecated ref exits 0 with warning', () => {
    run(['deprecate', 'term:alpha'], dir)
    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('⚠ deprecated: term:alpha'))
    assert.ok(r.stdout.includes('flow:do-stuff'))
  })

  it('dead + deprecated exits 1', () => {
    run(['deprecate', 'term:alpha'], dir)
    const flowPath = join(dir, '.spec', 'flows', 'do-stuff.md')
    const { data, content } = matter(readFileSync(flowPath, 'utf-8'))
    data.links.push({ edge: 'depends-on', target: 'term:ghost' })
    writeFileSync(flowPath, matter.stringify(content, data))

    const r = run(['check', 'feat:my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stdout.includes('✗ missing: term:ghost'))
    assert.ok(r.stdout.includes('⚠ deprecated: term:alpha'))
  })

  it('works on non-feature primitives', () => {
    const r = run(['check', 'flow:do-stuff'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('✓'))
    assert.ok(r.stdout.includes('2 primitives'))
  })

  it('nonexistent primitive exits with error', () => {
    const r = run(['check', 'feat:nope'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })

  it('unqualified ref exits with error', () => {
    const r = run(['check', 'my-feat'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('qualified form'))
  })

  it('context-qualified ref works with check', () => {
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'Billing status.'], dir)
    run(['add', 'flow', 'check', '-n', 'Check Status', '-c', 'billing', '-b', 'A flow.'], dir)
    run(['link', 'billing.flow:check', 'depends-on', 'billing.term:status'], dir)

    const flowPath = join(dir, '.spec', 'flows', 'billing.check.md')
    const flow = matter(readFileSync(flowPath, 'utf-8'))
    writeFileSync(
      flowPath,
      matter.stringify('A flow that uses [[billing.term:status]].', flow.data)
    )

    const r = run(['check', 'billing.flow:check'], dir)
    assert.equal(r.exitCode, 0)
    assert.ok(r.stdout.includes('✓'))
  })

  it('shared short ref does not resolve to contextual primitive', () => {
    run(['add', 'term', 'status', '-n', 'Billing Status', '-c', 'billing', '-b', 'Billing status.'], dir)
    run(['add', 'term', 'status', '-n', 'Recipe Status', '-c', 'recipe', '-b', 'Recipe status.'], dir)

    const r = run(['check', 'term:status'], dir)
    assert.equal(r.exitCode, 1)
    assert.ok(r.stderr.includes('not found'))
  })
})
